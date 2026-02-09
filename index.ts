import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { CoreClient } from "@redplanethq/sdk";

import { registerCli } from "./commands/cli.ts";
import { registerCommands } from "./commands/slash.ts";
import { parseConfig, coreConfigSchema } from "./config.ts";
import { buildCaptureHandler } from "./hooks/capture.ts";
import { buildRecallHandler } from "./hooks/recall.ts";
import { initLogger } from "./logger.ts";
import { registerSearchTool } from "./tools/search.ts";
import { registerGetIntegrationActionsTool } from "./tools/get-integration-actions.ts";
import { registerExecuteIntegrationActionTool } from "./tools/execute-integration-action.ts";

export default {
  id: "openclaw-corebrain",
  name: "Core",
  description: "OpenClaw powered by Core brain plugin",
  kind: "memory" as const,
  configSchema: coreConfigSchema,

  register(api: OpenClawPluginApi) {
    const cfg = parseConfig(api.pluginConfig);

    initLogger(api.logger, cfg.debug);

    const client = new CoreClient({
      baseUrl: " https://app.getcore.me",
      token: cfg.apiKey,
    });

    let sessionKey: string | undefined;
    const getSessionKey = () => sessionKey;

    registerSearchTool(api, client, cfg);
    registerGetIntegrationActionsTool(api, client, cfg);
    registerExecuteIntegrationActionTool(api, client, cfg);

    if (cfg.autoRecall) {
      const recallHandler = buildRecallHandler(client, cfg);
      api.on(
        "before_agent_start",
        (event: Record<string, unknown>, ctx: Record<string, unknown>) => {
          if (ctx.sessionKey) sessionKey = ctx.sessionKey as string;
          return recallHandler(event);
        },
      );
    }

    if (cfg.autoCapture) {
      api.on("agent_end", buildCaptureHandler(client, cfg, getSessionKey));
    }

    registerCommands(api, client, cfg, getSessionKey);
    registerCli(api, client, cfg);

    api.registerService({
      id: "openclaw-corebrain",
      start: () => {
        api.logger.info("corebrain: connected");
      },
      stop: () => {
        api.logger.info("corebrain: stopped");
      },
    });
  },
};
