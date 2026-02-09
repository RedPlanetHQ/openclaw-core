# Core Plugin for OpenClaw (previously Clawdbot)

<img width="200px" alt="CORE logo" src="https://github.com/user-attachments/assets/bd4e5e79-05b8-4d40-9aff-f1cf9e5d70de" />

Long-term memory for OpenClaw. Automatically remembers conversations, recalls relevant context, and builds a persistent user profile — all powered by [Core](https://getcore.me) cloud. No local infrastructure required.

## Install

```bash
openclaw plugins install @redplanethq/openclaw-corebrain
```

Restart OpenClaw after installing.

## Configuration

The only required value is your Core API key. Get one at [app.getcore.me](https://app.getcore.me).

Set it as an environment variable:

```bash
export CORE_API_KEY="rc_pat_..."
```

Or configure it directly in `openclaw.json`:

```json5
{
  plugins: {
    entries: {
      "openclaw-corebrain": {
        enabled: true,
        config: {
          apiKey: "${CORE_API_KEY}",
        },
      },
    },
  },
}
```

### Advanced options

| Key            | Type      | Default               | Description                                                                             |
| -------------- | --------- | --------------------- | --------------------------------------------------------------------------------------- |
| `containerTag` | `string`  | `openclaw_{hostname}` | Memory namespace. All channels share this tag.                                          |
| `autoRecall`   | `boolean` | `true`                | Inject relevant memories before every AI turn.                                          |
| `autoCapture`  | `boolean` | `true`                | Automatically store conversation content after every turn.                              |
| `captureMode`  | `string`  | `"all"`               | `"all"` filters short texts and injected context. `"everything"` captures all messages. |
| `debug`        | `boolean` | `false`               | Verbose debug logs for API calls and responses.                                         |

## How it works

Once installed, the plugin works automatically with zero interaction:

- **Auto-Recall** — Before every AI turn, the plugin queries Core for relevant memories and injects them as context. The AI sees your user profile (preferences, facts) and semantically similar past conversations.
- **Auto-Capture** — After every AI turn, the last user/assistant exchange is sent to Core for extraction and long-term storage.

Everything runs in the cloud. Core handles extraction, deduplication, and profile building on its end.

## Integrations

Connect external services (GitHub, Linear, Slack, etc.) through Core to enable AI-powered workflows:

- **Query Integration Actions** — AI can discover available actions for connected integrations (e.g., "get latest issues", "create pull request").
- **Execute Actions** — AI can perform actions on your behalf (fetch GitHub PRs, create Linear issues, send Slack messages, etc.).

Integrations are managed through your [Core dashboard](https://app.getcore.me). Once connected, AI tools can interact with them autonomously during conversations.

## Slash Commands

| Command           | Description                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| `/search <query>` | Search memories with detailed episode information, labels, and invalidated facts. |
| `/me`             | Show your user information (ID, name, email, timezone).                           |
| `/integrations`   | List all connected integrations (GitHub, Linear, Slack, etc.).                    |

## AI Tools

The AI can use these tools autonomously during conversations:

| Tool                                   | Description                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `corebrain_search`                     | Intelligent memory search with multi-faceted query decomposition and parallel search execution. |
| `corebrain_get_integration_actions`    | Get relevant actions for a specific integration account (GitHub, Linear, Slack, etc.).          |
| `corebrain_execute_integration_action` | Execute actions on integrations (fetch GitHub PRs, create Linear issues, send Slack messages).  |

## CLI Commands

```bash
corebrain search <query> [--limit <n>]  # Search memories with detailed episodes and invalidated facts (default limit: 5)
corebrain profile [--query <q>]         # View user profile with optional query focus
corebrain me                            # Show your user information (ID, name, email, timezone)
corebrain integrations                  # List all connected integrations (GitHub, Linear, Slack, etc.)
```
