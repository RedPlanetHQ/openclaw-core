import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

import type { CoreConfig } from "../config.ts";
import { log } from "../logger.ts";
import { CoreClient } from "@redplanethq/sdk";

export function registerCli(
  api: OpenClawPluginApi,
  client: CoreClient,
  _cfg: CoreConfig,
): void {
  api.registerCli(
    // biome-ignore lint/suspicious/noExplicitAny: openclaw SDK does not ship types
    ({ program }: { program: any }) => {
      const cmd = program
        .command("corebrain")
        .description("corebrain commands");

      cmd
        .command("search")
        .argument("<query>", "Search query")
        .option("--limit <n>", "Max results", "5")
        .action(async (query: string, opts: { limit: string }) => {
          const limit = Number.parseInt(opts.limit, 10) || 5;
          log.debug(`cli search: query="${query}" limit=${limit}`);

          const results = (await client.search({
            query,
            limit,
          })) as any;

          if (!results.episodes || results.episodes.length === 0) {
            console.log("No memories found.");
            return;
          }

          console.log("\n📚 Episodes:");
          for (const episode of results.episodes) {
            const relevance = episode.relevanceScore
              ? ` (relevance: ${(episode.relevanceScore * 100).toFixed(1)}%)`
              : "";
            const labels = episode.labelIds?.length
              ? ` [labels: ${episode.labelIds.join(", ")}]`
              : "";
            const type = episode.isDocument
              ? " [document]"
              : episode.isCompact
                ? " [compact]"
                : "";
            console.log(`\n- ${episode.content}${relevance}${labels}${type}`);
            console.log(`  Created: ${episode.createdAt}`);
          }

          if (results.invalidatedFacts && results.invalidatedFacts.length > 0) {
            console.log("\n❌ Invalidated Facts:");
            for (const fact of results.invalidatedFacts) {
              const relevance = fact.relevantScore
                ? ` (relevance: ${(fact.relevantScore * 100).toFixed(1)}%)`
                : "";
              console.log(`\n- ${fact.fact}${relevance}`);
              console.log(
                `  Valid: ${fact.validAt} → Invalid: ${fact.invalidAt || "ongoing"}`,
              );
            }
          }
        });

      cmd.command("me").action(async () => {
        log.debug("cli me: fetching user info");

        const user = await client.me();

        console.log("\n👤 User Information:");
        console.log(`  ID: ${user.id}`);
        if (user.name) console.log(`  Name: ${user.name}`);
        if (user.email) console.log(`  Email: ${user.email}`);
        if (user.timezone) console.log(`  Timezone: ${user.timezone}`);
      });

      cmd.command("integrations").action(async () => {
        log.debug("cli integrations: fetching connected integrations");

        const integrations = await client.getIntegrationsConnected();

        if (!integrations.accounts || integrations.accounts.length === 0) {
          console.log("No integrations connected.");
          return;
        }

        console.log("\n🔌 Connected Integrations:");
        for (const account of integrations.accounts) {
          const name = account.name ? ` (${account.name})` : "";
          const slug = account.slug ? ` [${account.slug}]` : "";
          console.log(`  - ${account.id}${name}${slug}`);
        }
      });
    },
    { commands: ["corebrain"] },
  );
}
