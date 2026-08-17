# walkie-clawkie

Push-to-talk between AI agents. One file, zero dependencies.

## What it does

Agents talk to each other through walkie-talkie style messaging. Works with any MCP-compatible agent (Claude Code, Codex CLI, Gemini CLI, etc.).

- **Same machine**: messages go through file mailboxes at `/tmp/walkie/`
- **Different machines**: messages route through an HTTP relay
- **Trust model**: unknown agents need human approval before their messages get through

## Install

Tell your agent:

> Install walkie-clawkie from https://github.com/jahala/walkie-clawkie

Or do it manually:

```bash
curl -O https://raw.githubusercontent.com/jahala/walkie-clawkie/main/walkie.mjs
```

Then add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "walkie": {
      "command": "node",
      "args": ["./walkie.mjs"],
      "env": { "WALKIE_ID": "my-agent" }
    }
  }
}
```

That's it. The agent now has five tools: `walkie_send`, `walkie_agents`, `walkie_inbox`, `walkie_allow`, `walkie_deny`.

## Getting woken

An agent that has to remember to check its inbox will miss things. Run the watcher as a background task instead:

```
node walkie.mjs --watch my-agent
```

It prints one line per message and keeps running, so any harness that reads lines can rouse the agent — Claude Code's `Monitor`, a `&` in a shell, `systemd`, a tmux pane:

```
[walkie] message from tend2 — walkie_inbox to read: the Q4 answers are in /tmp/drop
[walkie] stranger wants to send you a message — walkie_allow or walkie_deny
```

The line is a doorbell, not the message: `walkie_inbox` is still what hands the text over. Messages held at the trust gate ring without quoting what they said.

Don't watch `/tmp/walkie/<id>/inbox` directly. Those files are consumed within milliseconds of landing, so a poll almost always finds an empty directory. Watch the journal — it is append-only and nothing is ever removed from it.

## Cross-machine

Start the relay on one machine:

```
node walkie.mjs --relay
```

Expose it (free, no account):

```
cloudflared tunnel --url http://localhost:4747
```

Point remote agents at the URL:

```json
"env": {
  "WALKIE_ID": "remote-agent",
  "WALKIE_RELAY": "https://verb-noun-thing.trycloudflare.com"
}
```

Any tunnel or VPN works. Walkie just speaks HTTP to a URL.

## Trust

By default, unknown agents are held at the gate. The human gets asked to approve or deny.

Pre-approve agents you trust:

```json
"env": {
  "WALKIE_ID": "my-agent",
  "WALKIE_ALLOW": "trusted-agent-1,trusted-agent-2"
}
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `WALKIE_ID` | yes | Agent name |
| `WALKIE_RELAY` | no | Relay URL for cross-machine |
| `WALKIE_ALLOW` | no | Comma-separated trusted agent IDs |
| `WALKIE_DIR` | no | Mailbox root (default `/tmp/walkie`) |
| `WALKIE_PORT` | no | Relay port (default `4747`) |

## How it works

~500 lines of JavaScript. Raw MCP protocol over stdio (no SDK). Three modes:

- `node walkie.mjs` — MCP server that Claude Code (or any MCP host) spawns as a subprocess
- `node walkie.mjs --relay` — HTTP relay with SSE streams for real-time delivery
- `node walkie.mjs --watch ID` — tails an agent's journal, one line per new message

Local transport uses the filesystem. Remote transport uses HTTP + SSE. The agent doesn't know or care which one it's using.

Every arrival is appended to `/tmp/walkie/<id>/journal.jsonl` before the mailbox file is removed, and `/tmp/walkie/<id>/cursor` records how far the agent has read. That journal is the inbox: a message that arrived but was never read is still there after the MCP server restarts, and on startup the agent is told how many are waiting. Both transports write it, so a relayed message is as durable as a local one.

## Notes

- `walkie_inbox` lets any agent check for received messages. Claude Code agents also get automatic push via [channels](https://modelcontextprotocol.io/specification/2025-03-26/server/utilities/notifications#channels) (research preview), but `walkie_inbox` works everywhere.
- The journal is append-only and never rotated. It lives under `/tmp`, which the OS clears on reboot.
- A message held at the trust gate is session-scoped: if the server stops before you allow it, the arrival stays in the journal but the message is not delivered. The sender can resend.
- Tests: `node --test`. They drive real MCP servers over stdio against a real mailbox — nothing is mocked.
- Requires Node.js 18+. Nothing else.

## Support

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/jahala)
