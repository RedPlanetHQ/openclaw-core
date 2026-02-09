import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import type { CoreConfig } from "../config.ts";
import { log } from "../logger.ts";
import { CoreClient } from "@redplanethq/sdk";

export function registerSearchTool(
  api: OpenClawPluginApi,
  client: CoreClient,
  _cfg: CoreConfig,
): void {
  api.registerTool(
    {
      name: "corebrain_search",
      label: "Memory Search",
      description:
        "Intelligent memory search agent that analyzes user intent and performs multiple parallel searches when needed to gather comprehensive context. USE THIS TOOL: When you need deep contextual understanding that might require multiple search angles, or when the query is complex and multifaceted. The agent will automatically decompose your intent into optimal search queries, execute them in parallel, and synthesize the results. BENEFITS: Handles complex multi-faceted queries, automatically determines best query patterns (entity-centric, temporal, relationship-based, semantic). HOW TO USE: Provide a natural language description of what context you need. Examples: 'What do we know about the authentication implementation and related bugs?', 'Recent work on MCP integrations and configuration', 'User preferences for code style and project setup'. Returns: Synthesized response with relevant context from multiple search angles.",
      parameters: Type.Object({
        query: Type.String({ description: "Search intent" }),
        limit: Type.Optional(
          Type.Number({ description: "Max results (default: 5)" }),
        ),
      }),
      async execute(
        _toolCallId: string,
        params: { query: string; limit?: number },
      ) {
        const limit = params.limit ?? 5;
        log.debug(`search tool: query="${params.query}" limit=${limit}`);

        const results = await client.search({
          query: params.query,
          limit,
          structured: false,
        });

        if (!results) {
          return {
            content: [
              { type: "text" as const, text: "No relevant memories found." },
            ],
          };
        }

        return {
          content: [{ type: "text" as const, text: results }],
        };
      },
    },
    { name: "corebrain_search" },
  );
}
