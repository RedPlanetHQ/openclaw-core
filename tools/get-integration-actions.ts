import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import type { CoreConfig } from "../config.ts";
import { log } from "../logger.ts";
import { CoreClient } from "@redplanethq/sdk";

export function registerGetIntegrationActionsTool(
  api: OpenClawPluginApi,
  client: CoreClient,
  _cfg: CoreConfig,
): void {
  api.registerTool(
    {
      name: "corebrain_get_integration_actions",
      label: "Get Integration Actions",
      description:
        "Get ONLY the most relevant action names for a specific integration account based on user's intent. USE THIS TOOL: Before execute_integration_action to discover which actions can fulfill the user's request. The LLM intelligently filters available actions to return ONLY the most relevant ones (typically 1-3 actions), preventing context bloat. For example: query='get latest issues' returns ['get_issues'], NOT ['get_issues', 'get_issue', 'get_comments']. HOW TO USE: Provide accountId (from get_integrations) and a clear query describing what you want to accomplish. Returns: Array of 1-3 relevant action names (strings only, not full schemas). Use these action names with execute_integration_action.",
      parameters: Type.Object({
        accountId: Type.String({
          description:
            "Account ID from get_integrations. This identifies the specific integration account to use.",
        }),
        query: Type.String({
          description:
            "Clear description of what you want to accomplish. Examples: 'get the latest issues', 'create a new pull request', 'send a message to #general'. Be specific - the LLM uses this to filter down to 1-3 most relevant actions.",
        }),
      }),
      async execute(
        _toolCallId: string,
        params: { accountId: string; query: string },
      ) {
        log.debug(
          `get_integration_actions tool: accountId="${params.accountId}" query="${params.query}"`,
        );

        const results = await client.getIntegrationActions({
          accountId: params.accountId,
          query: params.query,
        });

        return results;
      },
    },
    { name: "corebrain_get_integration_actions" },
  );
}
