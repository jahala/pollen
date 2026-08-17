// walkie-clawkie tests — node --test. Zero dependencies, like the thing it tests.
//
// Every test drives a real MCP server over stdio and a real mailbox on disk.
// Nothing is mocked: if these pass, two agents can actually talk.

import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { createInterface } from "node:readline";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const WALKIE = join(dirname(fileURLToPath(import.meta.url)), "walkie.mjs");

// One mailbox root per run, left in place afterwards — it lives under the
// system temp dir, which the OS clears.
const DIR = mkdtempSync(join(tmpdir(), "walkie-test-"));

// --- harness -----------------------------------------------------------------

// Everything spawned gets torn down even when a test fails — otherwise a live
// child's open pipes keep the runner from ever exiting.
const running = [];
afterEach(() => Promise.all(running.splice(0).map((p) => {
  if (p.exitCode !== null || p.signalCode !== null) return; // already gone
  p.kill();
  return once(p, "exit");
})));

function agent(id, env = {}) {
  const proc = spawn(process.execPath, [WALKIE], {
    env: { ...process.env, WALKIE_DIR: DIR, WALKIE_ID: id, ...env },
    stdio: ["pipe", "pipe", "pipe"],
  });
  running.push(proc);

  const waiting = new Map(); // request id → resolve
  createInterface({ input: proc.stdout }).on("line", (line) => {
    const msg = JSON.parse(line);
    const resolve = waiting.get(msg.id); // notifications have no id
    if (resolve) { waiting.delete(msg.id); resolve(msg.result); }
  });

  // A server that never answers fails the test rather than hanging the runner.
  let n = 0;
  const call = (method, params) => {
    const id = ++n;
    proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    return Promise.race([
      new Promise((resolve) => waiting.set(id, resolve)),
      sleep(5000, null, { ref: false }).then(() => assert.fail(`${id} got no reply to ${method}`)),
    ]);
  };

  return {
    ready: () => call("initialize", {}),
    tool: (name, args = {}) =>
      call("tools/call", { name, arguments: args }).then((r) => r.content[0].text),
    stop: () => { proc.kill(); return once(proc, "exit"); },
  };
}

function watcher(id) {
  const proc = spawn(process.execPath, [WALKIE, "--watch", id], {
    env: { ...process.env, WALKIE_DIR: DIR },
    stdio: ["ignore", "pipe", "pipe"],
  });
  running.push(proc);

  const lines = [];
  createInterface({ input: proc.stdout }).on("line", (line) => lines.push(line));

  let attached = false;
  proc.stderr.setEncoding("utf-8");
  proc.stderr.on("data", (chunk) => { if (chunk.includes("walkie watching")) attached = true; });

  return { lines, ready: () => waitFor("the watcher to attach", () => attached) };
}

function journal(id) {
  try {
    return readFileSync(join(DIR, id, "journal.jsonl"), "utf-8")
      .split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch { return []; }
}

// The mailbox file is gone once the server has taken the message off disk.
// Waiting on that — rather than on the journal — keeps these tests honest:
// they describe delivery, not the mechanism that happens to implement it.
function taken(id) {
  try { return readdirSync(join(DIR, id, "inbox")).every((f) => !f.endsWith(".msg")); }
  catch { return false; }
}

async function waitFor(what, predicate, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await sleep(25);
  }
  assert.fail(`timed out waiting for ${what}`);
}

// --- tests -------------------------------------------------------------------

test("an unread message survives a server restart", async () => {
  const alpha = agent("alpha", { WALKIE_ALLOW: "beta" });
  const beta = agent("beta", { WALKIE_ALLOW: "alpha" });
  await Promise.all([alpha.ready(), beta.ready()]);

  assert.equal(await beta.tool("walkie_send", { to: "alpha", message: "the Q4 files are in /tmp/drop" }), "Sent to alpha.");
  await waitFor("alpha to take the message off disk", () => taken("alpha"));

  // alpha never read it — this is where the old in-memory buffer lost it.
  await alpha.stop();

  const revived = agent("alpha", { WALKIE_ALLOW: "beta" });
  await revived.ready();
  assert.equal(await revived.tool("walkie_inbox"), "[beta]: the Q4 files are in /tmp/drop");
});

test("a message is handed over once, not on every check", async () => {
  const carla = agent("carla", { WALKIE_ALLOW: "dan" });
  const dan = agent("dan", { WALKIE_ALLOW: "carla" });
  await Promise.all([carla.ready(), dan.ready()]);

  await dan.tool("walkie_send", { to: "carla", message: "first" });
  await dan.tool("walkie_send", { to: "carla", message: "second" });
  await waitFor("both messages to land", () => taken("carla"));

  assert.equal(await carla.tool("walkie_inbox"), "[dan]: first\n[dan]: second");
  assert.equal(await carla.tool("walkie_inbox"), "No new messages.");
});

test("the trust gate holds a stranger's message out of the inbox", async () => {
  const erin = agent("erin");            // trusts nobody
  const frank = agent("frank");
  await Promise.all([erin.ready(), frank.ready()]);

  await frank.tool("walkie_send", { to: "erin", message: "let me in" });
  await waitFor("erin to take the message off disk", () => taken("erin"));

  assert.equal(journal("erin")[0].status, "pending");
  assert.equal(await erin.tool("walkie_inbox"), "No new messages.");

  assert.match(await erin.tool("walkie_allow", { agent: "frank" }), /has been delivered/);
  assert.equal(await erin.tool("walkie_inbox"), "[frank]: let me in");
});

test("--watch prints a line the moment a message lands", async () => {
  const gina = agent("gina", { WALKIE_ALLOW: "hugo" });
  const hugo = agent("hugo", { WALKIE_ALLOW: "gina" });
  await Promise.all([gina.ready(), hugo.ready()]);

  const eyes = watcher("gina");
  await eyes.ready();

  await hugo.tool("walkie_send", { to: "gina", message: "radio check" });
  await waitFor("a watch line", () => eyes.lines.length === 1);
  assert.equal(eyes.lines[0], "[walkie] message from hugo — walkie_inbox to read: radio check");

  // A stranger's knock rouses the agent without leaking what they said.
  const ivan = agent("ivan");
  await ivan.ready();
  await ivan.tool("walkie_send", { to: "gina", message: "secret payload" });
  await waitFor("a second watch line", () => eyes.lines.length === 2);
  assert.equal(eyes.lines[1], "[walkie] ivan wants to send you a message — walkie_allow or walkie_deny");
});

test("--watch rings for messages that are already waiting", async () => {
  const jo = agent("jo", { WALKIE_ALLOW: "kim" });
  const kim = agent("kim", { WALKIE_ALLOW: "jo" });
  await Promise.all([jo.ready(), kim.ready()]);

  await kim.tool("walkie_send", { to: "jo", message: "you were out" });
  await waitFor("the message to land", () => taken("jo"));

  const eyes = watcher("jo");           // armed after the fact — must not start deaf
  await waitFor("a watch line", () => eyes.lines.length === 1);
  assert.equal(eyes.lines[0], "[walkie] 1 message waiting — walkie_inbox to read");
});

test("messages route through the relay, journal and all", async () => {
  const relay = spawn(process.execPath, [WALKIE, "--relay"], {
    env: { ...process.env, WALKIE_PORT: "0" },   // any free port
    stdio: ["ignore", "ignore", "pipe"],
  });
  running.push(relay);

  let port;
  relay.stderr.setEncoding("utf-8");
  relay.stderr.on("data", (chunk) => { port ??= chunk.match(/on :(\d+)/)?.[1]; });
  await waitFor("the relay to bind", () => port);

  const url = `http://127.0.0.1:${port}`;
  const nia = agent("nia", { WALKIE_ALLOW: "otto", WALKIE_RELAY: url });
  const otto = agent("otto", { WALKIE_ALLOW: "nia", WALKIE_RELAY: url });
  await Promise.all([nia.ready(), otto.ready()]);

  await otto.tool("walkie_send", { to: "nia", message: "over the air" });
  await waitFor("nia to journal it", () => journal("nia").length === 1);
  assert.equal(await nia.tool("walkie_inbox"), "[otto]: over the air");
});

test("--watch survives the journal being wiped under it", async () => {
  const lena = agent("lena", { WALKIE_ALLOW: "milo" });
  const milo = agent("milo", { WALKIE_ALLOW: "lena" });
  await Promise.all([lena.ready(), milo.ready()]);

  const eyes = watcher("lena");
  await eyes.ready();

  await milo.tool("walkie_send", { to: "lena", message: "before" });
  await waitFor("the first line", () => eyes.lines.length === 1);

  // /tmp gets cleared and the agent starts a fresh journal from seq 1. The
  // watcher must notice the sequence restarted rather than ignore everything.
  writeFileSync(
    join(DIR, "lena", "journal.jsonl"),
    JSON.stringify({ seq: 1, ts: "2026-01-01T00:00:00.000Z", from: "milo", message: "after", status: "delivered" }) + "\n"
  );
  await waitFor("the line after the wipe", () => eyes.lines.length === 2);
  assert.match(eyes.lines[1], /message from milo — walkie_inbox to read: after/);
});
