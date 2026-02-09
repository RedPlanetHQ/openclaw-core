import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { CoreClient } from "@redplanethq/sdk";
import type { CoreConfig } from "../config.ts";
import { log } from "../logger.ts";

export function registerCommands(
  api: OpenClawPluginApi,
  client: CoreClient,
  _cfg: CoreConfig,
  getSessionKey: () => string | undefined,
): void {
  api.registerCommand({
    name: "search",
    description: "Search memories with detailed episode information",
    acceptsArgs: true,
    requireAuth: true,
    handler: async (ctx: { args?: string }) => {
      const query = ctx.args?.trim();
      if (!query) {
        return { text: "Usage: /search <search query>" };
      }

      log.debug(`/search command: "${query}"`);

      try {
        const results = (await client.search({
          query,
          limit: 5,
        })) as any;

        if (!results.episodes || results.episodes.length === 0) {
          return { text: `No memories found for: "${query}"` };
        }

        let output = `**📚 Episodes (${results.episodes.length}):**\n\n`;

        for (const episode of results.episodes) {
          const relevance = episode.relevanceScore
            ? ` *(relevance: ${(episode.relevanceScore * 100).toFixed(1)}%)*`
            : "";
          const labels = episode.labelIds?.length
            ? ` [labels: ${episode.labelIds.join(", ")}]`
            : "";
          const type = episode.isDocument
            ? " `[document]`"
            : episode.isCompact
              ? " `[compact]`"
              : "";
          output += `- ${episode.content}${relevance}${labels}${type}\n`;
          output += `  *Created: ${episode.createdAt}*\n\n`;
        }

        if (results.invalidatedFacts && results.invalidatedFacts.length > 0) {
          output += `\n**❌ Invalidated Facts (${results.invalidatedFacts.length}):**\n\n`;
          for (const fact of results.invalidatedFacts) {
            const relevance = fact.relevantScore
              ? ` *(relevance: ${(fact.relevantScore * 100).toFixed(1)}%)*`
              : "";
            output += `- ${fact.fact}${relevance}\n`;
            output += `  *Valid: ${fact.validAt} → Invalid: ${fact.invalidAt || "ongoing"}*\n\n`;
          }
        }

        return { text: output };
      } catch (err) {
        log.error("/search failed", err);
        return { text: "Failed to search memories. Check logs for details." };
      }
    },
  });

  api.registerCommand({
    name: "me",
    description: "Show your user information",
    acceptsArgs: false,
    requireAuth: true,
    handler: async () => {
      log.debug("/me command");

      try {
        const user = await client.me();

        let output = "**👤 User Information:**\n\n";
        output += `- **ID:** ${user.id}\n`;
        if (user.name) output += `- **Name:** ${user.name}\n`;
        if (user.email) output += `- **Email:** ${user.email}\n`;
        if (user.timezone) output += `- **Timezone:** ${user.timezone}\n`;

        return { text: output };
      } catch (err) {
        log.error("/me failed", err);
        return {
          text: "Failed to fetch user information. Check logs for details.",
        };
      }
    },
  });

  api.registerCommand({
    name: "integrations",
    description: "List connected integrations",
    acceptsArgs: false,
    requireAuth: true,
    handler: async () => {
      log.debug("/integrations command");

      try {
        const integrations = await client.getIntegrationsConnected();

        if (!integrations.accounts || integrations.accounts.length === 0) {
          return { text: "No integrations connected." };
        }

        let output = `**🔌 Connected Integrations (${integrations.accounts.length}):**\n\n`;
        for (const account of integrations.accounts) {
          const name = account.name ? ` *(${account.name})*` : "";
          const slug = account.slug ? ` \`[${account.slug}]\`` : "";
          output += `- **${account.id}**${name}${slug}\n`;
        }

        return { text: output };
      } catch (err) {
        log.error("/integrations failed", err);
        return {
          text: "Failed to fetch integrations. Check logs for details.",
        };
      }
    },
  });
}
