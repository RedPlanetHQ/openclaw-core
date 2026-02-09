import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import type { CoreConfig } from "../config.ts";
import { log } from "../logger.ts";
import { CoreClient } from "@redplanethq/sdk";

export function registerExecuteIntegrationActionTool(
  api: OpenClawPluginApi,
  client: CoreClient,
  _cfg: CoreConfig,
): void {
  api.registerTool(
    {
      name: "corebrain_execute_integration_action",
      label: "Execute Integration Action",
      description:
        "Execute an action on an integration account (fetch GitHub PR, create Linear issue, send Slack message, etc.). USE THIS TOOL: After using get_integration_actions to see available actions. HOW TO USE: 1) Set accountId (from get_integrations) to specify which account to use, 2) Set action name (like 'get_pr'), 3) Set parameters object with required parameters from the action's inputSchema. Returns: Result of the action execution.",
      parameters: Type.Object({
        accountId: Type.String({
          description:
            "Account ID from get_integrations. This identifies the specific integration account to use.",
        }),
        action: Type.String({
          description:
            "Action name from get_integration_actions. Examples: 'get_pr', 'get_issues', 'create_issue'",
        }),
        parameters: Type.Object(
          Type.Any({
            description:
              "Parameters for the action. Check the action's inputSchema from get_integration_actions to see what's required.",
          }),
        ),
      }),
      async execute(
        _toolCallId: string,
        params: { accountId: string; action: string; parameters?: unknown },
      ) {
        log.debug(
          `execute_integration_action tool: accountId="${params.accountId}" action="${params.action}"`,
        );

        const result = await client.executeIntegrationAction({
          accountId: params.accountId,
          action: params.action,
          parameters: params.parameters as any,
        });

        if (!result) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Action executed but returned no data.",
              },
            ],
          };
        }

        // Format the result as JSON string for readability
        const resultText =
          typeof result === "string" ? result : JSON.stringify(result, null, 2);

        return {
          content: [
            {
              type: "text" as const,
              text: `Action executed successfully:\n\n${resultText}`,
            },
          ],
        };
      },
    },
    { name: "corebrain_execute_integration_action" },
  );
}
