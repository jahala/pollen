#!/usr/bin/env node
// walkie-clawkie — push-to-talk between agents. zero deps.
//
//   node walkie.mjs             MCP server (agent-side)
//   node walkie.mjs --relay     HTTP relay (cross-machine radio tower)
//   node walkie.mjs --watch ID  tail an agent's journal — one line per new message
//
// Agent mode env:
//   WALKIE_ID       required — agent name
//   WALKIE_RELAY    optional — relay URL for cross-machine
//   WALKIE_ALLOW    optional — comma-separated trusted agent IDs
//   WALKIE_DIR      optional — mailbox root (default /tmp/walkie)
//
// Relay mode env:
//   WALKIE_PORT     optional — listen port (default 4747)
//
// Watch mode env:
//   WALKIE_DIR      optional — mailbox root (default /tmp/walkie)
//
import {
  watch, mkdirSync, readdirSync, readFileSync, appendFileSync,
  renameSync, unlinkSync, writeFileSync, existsSync,
} from "fs";
import { createInterface } from "readline";
import { join } from "path";
import http from "http";

const DIR = process.env.WALKIE_DIR ?? "/tmp/walkie";

if (process.argv.includes("--relay")) {
  startRelay();
} else if (process.argv.includes("--watch")) {
  startWatch(process.argv[process.argv.indexOf("--watch") + 1]);
} else {
  startAgent();
}

// =============================================================================
// RELAY MODE
// =============================================================================

function startRelay() {
  const PORT = parseInt(process.env.WALKIE_PORT ?? "4747");
  const listeners = new Map(); // id → (from, message) => void
  const queues = new Map();    // id → [{ from, message }]

  function body(req) {
    return new Promise((r) => {
      let d = "";
      req.on("data", (c) => (d += c));
      req.on("end", () => r(d));
    });
  }

  const server = http.createServer(async (req, res) => {
    const [, action, id] = req.url.split("/");

    // GET /agents
    if (action === "agents") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify([...listeners.keys()]));
    }

    // GET /listen/:id — SSE
    if (action === "listen" && id) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(": connected\n\n");

      const push = (from, message) => {
        res.write(`data: ${JSON.stringify({ from, message })}\n\n`);
      };
      listeners.set(id, push);

      for (const msg of queues.get(id) ?? []) push(msg.from, msg.message);
      queues.delete(id);

      req.on("close", () => listeners.delete(id));
      return;
    }

    // POST /send — { from, to, message }
    if (action === "send" && req.method === "POST") {
      const { from, to, message } = JSON.parse(await body(req));
      const push = listeners.get(to);
      if (push) {
        push(from, message);
      } else {
        const q = queues.get(to) ?? [];
        q.push({ from, message });
        queues.set(to, q);
      }
      res.writeHead(200);
      return res.end("ok");
    }

    res.writeHead(404);
    res.end("not found");
  });

  // Report the port actually bound, so WALKIE_PORT=0 is usable.
  server.listen(PORT, () => {
    process.stderr.write(`walkie relay on :${server.address().port}\n`);
  });
}

// =============================================================================
// JOURNAL — append-only arrival log, shared by agent and watch modes
// =============================================================================
//
// Mailbox files are transient: the server consumes and unlinks each one within
// milliseconds of it landing, so nothing outside the process can reliably see
// them. The journal is the durable record instead — every arrival is appended
// as one JSON line and never removed. That makes it both the inbox (messages
// survive a server restart) and the one file a watcher can tail.
//
// `seq` counts from 1 with no gaps, so entry N is line N. `cursor` holds the
// seq of the last message the agent actually read.

function journalPath(id) { return join(DIR, id, "journal.jsonl"); }
function cursorPath(id) { return join(DIR, id, "cursor"); }

function readJournal(id) {
  let raw = "";
  try { raw = readFileSync(journalPath(id), "utf-8"); } catch {}
  return raw.split("\n").flatMap((line) => {
    // Blank tail, or a line caught mid-append — the next read gets it whole.
    try { return JSON.parse(line); } catch { return []; }
  });
}

function readCursor(id) {
  try { return parseInt(readFileSync(cursorPath(id), "utf-8"), 10) || 0; } catch { return 0; }
}

function unread(id) {
  const cursor = readCursor(id);
  return readJournal(id).filter((e) => e.seq > cursor && e.status === "delivered");
}

// =============================================================================
// AGENT MODE
// =============================================================================

function startAgent() {
  const RELAY = process.env.WALKIE_RELAY;
  const ID = process.env.WALKIE_ID;
  if (!ID) { process.stderr.write("WALKIE_ID is required\n"); process.exit(1); }

  const trusted = new Set(
    (process.env.WALKIE_ALLOW ?? "").split(",").filter(Boolean)
  );
  const pending = new Map(); // agent → { from, message }

  mkdirSync(join(DIR, ID), { recursive: true });
  let seq = readJournal(ID).pop()?.seq ?? 0;

  function record(from, message, status) {
    const entry = { seq: ++seq, ts: new Date().toISOString(), from, message, status };
    appendFileSync(journalPath(ID), JSON.stringify(entry) + "\n");
  }

  // --- mcp protocol ---------------------------------------------------------

  createInterface({ input: process.stdin, terminal: false }).on("line", (line) => {
    if (line.trim()) handle(JSON.parse(line));
  });

  function send(msg) {
    process.stdout.write(JSON.stringify(msg) + "\n");
  }

  function reply(id, result) {
    send({ jsonrpc: "2.0", id, result });
  }

  function notify(content, meta) {
    send({
      jsonrpc: "2.0",
      method: "notifications/claude/channel",
      params: { content, meta },
    });
  }

  async function handle(msg) {
    if (msg.id === undefined) return; // notifications — ignore

    if (msg.method === "initialize") {
      return reply(msg.id, {
        protocolVersion: "2025-03-26",
        capabilities: {
          tools: {},
          experimental: { "claude/channel": {} },
        },
        serverInfo: { name: `walkie-${ID}`, version: "0.1.0" },
        instructions: [
          `You are agent "${ID}". You have a walkie-talkie.`,
          `Incoming messages appear as <channel> tags with a "from" attribute.`,
          `Use walkie_send to talk to other agents. Use walkie_agents to see who's around.`,
          `Use walkie_inbox to check for replies. If an unknown agent tries to contact you, ask the user before calling walkie_allow or walkie_deny.`,
          `Do not poll for messages. Run "node walkie.mjs --watch ${ID}" as a background task in your harness — it prints one line the moment anything lands, then you call walkie_inbox to read it.`,
          `To reach agents on other machines: run "node walkie.mjs --relay" then expose it with "cloudflared tunnel --url http://localhost:4747" (free, no account needed).`,
          `Give the resulting URL to the user so they can pass it to the remote agent as WALKIE_RELAY.`,
        ].join(" "),
      });
    }

    if (msg.method === "tools/list") {
      return reply(msg.id, { tools: TOOLS });
    }

    if (msg.method === "tools/call") {
      const { name, arguments: args } = msg.params;
      const fn = toolHandlers[name];
      if (!fn) return reply(msg.id, text(`Unknown tool: ${name}`));
      return reply(msg.id, await fn(args));
    }
  }

  // --- tools ----------------------------------------------------------------

  const TOOLS = [
    {
      name: "walkie_send",
      description: "Send a message to another agent",
      inputSchema: {
        type: "object",
        properties: {
          to: { type: "string", description: "Target agent ID" },
          message: { type: "string", description: "The message" },
        },
        required: ["to", "message"],
      },
    },
    {
      name: "walkie_agents",
      description: "List all agents on the walkie-talkie",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "walkie_allow",
      description: "Allow a pending agent to talk to you",
      inputSchema: {
        type: "object",
        properties: {
          agent: { type: "string", description: "Agent ID to allow" },
        },
        required: ["agent"],
      },
    },
    {
      name: "walkie_deny",
      description: "Deny a pending agent's message",
      inputSchema: {
        type: "object",
        properties: {
          agent: { type: "string", description: "Agent ID to deny" },
        },
        required: ["agent"],
      },
    },
    {
      name: "walkie_inbox",
      description: "Check for received messages",
      inputSchema: { type: "object", properties: {} },
    },
  ];

  function text(t) {
    return { content: [{ type: "text", text: t }] };
  }

  const toolHandlers = {
    async walkie_send({ to, message }) {
      const ok = await tx.send(to, message);
      return text(ok ? `Sent to ${to}.` : `Agent "${to}" not found.`);
    },
    async walkie_agents() {
      const list = await tx.agents();
      return text(list.join(", ") || "Nobody here.");
    },
    async walkie_allow({ agent }) {
      trusted.add(agent);
      const held = pending.get(agent);
      if (held) {
        pending.delete(agent);
        record(held.from, held.message, "delivered");
        notify(held.message, { from: held.from });
        return text(`Allowed ${agent}. Their message has been delivered.`);
      }
      return text(`Allowed ${agent}.`);
    },
    async walkie_deny({ agent }) {
      const held = pending.get(agent);
      pending.delete(agent);
      return text(held ? `Denied and dropped message from ${agent}.` : `Nothing pending from ${agent}.`);
    },
    async walkie_inbox() {
      const msgs = unread(ID);
      if (!msgs.length) return text("No new messages.");
      writeFileSync(cursorPath(ID), String(msgs.at(-1).seq));
      return text(msgs.map((m) => `[${m.from}]: ${m.message}`).join("\n"));
    },
  };

  // --- trust gate -----------------------------------------------------------

  function onMessage(from, message) {
    if (trusted.has(from)) {
      record(from, message, "delivered");
      notify(message, { from });
    } else {
      record(from, message, "pending");
      pending.set(from, { from, message });
      notify(
        `Agent "${from}" wants to send you a message. Use walkie_allow or walkie_deny.`,
        { from, status: "pending" }
      );
    }
  }

  // --- transport ------------------------------------------------------------

  function localTransport() {
    const inbox = join(DIR, ID, "inbox");
    mkdirSync(inbox, { recursive: true });

    // Reading the file is what claims it — fs.watch fires twice for one file
    // and the second pass finds it gone. The unlink comes after the callback
    // has journalled the message, so a crash mid-handover retries rather than
    // loses it.
    function consume(filepath, filename, cb) {
      try {
        const message = readFileSync(filepath, "utf-8");
        const from = filename.match(/from_(.+)\.msg$/)?.[1] ?? "unknown";
        cb(from, message);
        unlinkSync(filepath);
      } catch (e) {
        if (e.code === "ENOENT") return; // already taken
        process.stderr.write(`walkie: kept ${filename}, could not deliver it: ${e.message}\n`);
      }
    }

    return {
      async send(to, message) {
        const target = join(DIR, to, "inbox");
        if (!existsSync(target)) return false;
        const name = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}_from_${ID}`;
        // Write beside the mailbox, then rename in. The receiver is watching
        // this directory, and rename is the only way to put a whole file in
        // front of it — writeFileSync creates the file before filling it.
        const part = join(target, `.${name}.part`);
        writeFileSync(part, message);
        renameSync(part, join(target, `${name}.msg`));
        return true;
      },
      async agents() {
        return readdirSync(DIR).filter(
          (d) => d !== ID && existsSync(join(DIR, d, "inbox"))
        );
      },
      listen(cb) {
        watch(inbox, (_, f) => {
          if (f?.endsWith(".msg")) consume(join(inbox, f), f, cb);
        });
      },
      drain(cb) {
        for (const f of readdirSync(inbox).filter((f) => f.endsWith(".msg"))) {
          consume(join(inbox, f), f, cb);
        }
      },
    };
  }

  function relayTransport(relay) {
    return {
      async send(to, message) {
        const res = await fetch(`${relay}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from: ID, to, message }),
        });
        return res.ok;
      },
      async agents() {
        const res = await fetch(`${relay}/agents`);
        return res.json();
      },
      listen(cb) {
        function connect() {
          http.get(`${relay}/listen/${ID}`, (res) => {
            createInterface({ input: res }).on("line", (line) => {
              if (!line.startsWith("data: ")) return; // comments and frame breaks
              try {
                const { from, message } = JSON.parse(line.slice(6));
                cb(from, message);
              } catch {}
            });
            res.on("end", () => setTimeout(connect, 1000));
            res.on("error", (e) => {
              process.stderr.write(`walkie relay error: ${e.message}\n`);
              setTimeout(connect, 1000);
            });
          });
        }
        connect();
      },
      drain() {}, // relay drains on SSE connect
    };
  }

  const tx = RELAY ? relayTransport(RELAY) : localTransport();

  // --- go -------------------------------------------------------------------

  // Anything that arrived last session but was never read is still in the
  // journal. Say so, or it sits there until the agent happens to check.
  const carried = unread(ID).length;
  if (carried) {
    notify(
      `${carried} unread message${carried === 1 ? "" : "s"} from a previous session. Use walkie_inbox to read.`,
      { status: "unread" }
    );
  }

  tx.drain(onMessage);
  tx.listen(onMessage);
}

// =============================================================================
// WATCH MODE
// =============================================================================
//
// One line per message on stdout, forever. Point a harness background task at
// it (Claude Code's Monitor, `&`, systemd — anything that reads lines) and the
// agent gets woken instead of polling.

function startWatch(id) {
  if (!id) {
    process.stderr.write("usage: node walkie.mjs --watch <agent-id>\n");
    process.exit(1);
  }

  const journal = journalPath(id);
  mkdirSync(join(DIR, id), { recursive: true });
  appendFileSync(journal, ""); // create it if the agent hasn't started yet

  const last = readJournal(id).pop();
  let lastSeq = last?.seq ?? 0;
  let lastTs = last?.ts;

  function line(e) {
    if (e.status === "pending") {
      // The message itself stays behind the trust gate until it is allowed.
      return `[walkie] ${e.from} wants to send you a message — walkie_allow or walkie_deny`;
    }
    const preview = e.message.replace(/\s+/g, " ").trim();
    const short = preview.length > 120 ? preview.slice(0, 119) + "…" : preview;
    return `[walkie] message from ${e.from} — walkie_inbox to read: ${short}`;
  }

  function pump() {
    const entries = readJournal(id);
    // A cleared /tmp restarts the journal at seq 1. If the entry we stopped at
    // is no longer where we left it, start over — going quietly deaf is the one
    // thing a watcher must never do.
    if (entries[lastSeq - 1]?.ts !== lastTs) {
      lastSeq = 0;
      lastTs = undefined;
    }
    for (const e of entries) {
      if (e.seq <= lastSeq) continue;
      lastSeq = e.seq;
      lastTs = e.ts;
      process.stdout.write(line(e) + "\n");
    }
  }

  // Ring once for whatever is already waiting, so arming the watcher never
  // starts deaf — a count, not a transcript, however long the agent was away.
  const waiting = unread(id).length;
  if (waiting) {
    process.stdout.write(`[walkie] ${waiting} message${waiting === 1 ? "" : "s"} waiting — walkie_inbox to read\n`);
  }

  watch(journal, pump);
  setInterval(pump, 1000); // safety net — fs.watch misses appends on some filesystems
  process.stderr.write(`walkie watching ${id}\n`);
}
