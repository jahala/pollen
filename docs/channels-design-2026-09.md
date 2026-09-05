# Sharing information between agents — a design

Status: proposal, September 2026. Nothing built.

## The short version

Channels are the wrong primitive, and so are groups, mostly. The question is not *how does
an agent broadcast* but *how does an agent learn the one thing it needs without paying for
everything it does not*. That inverts the design: the work belongs on the **receiving** side
and in the **shared environment**, not in delivery.

Build, in this order: **standing interests** (receiver-declared relevance), **claims** (a
destructive read that stops two agents doing the same work), and only then **groups**. Do
not build subscription channels at all.

## 1. Why the ordinary answer is wrong here

A human in a busy channel skims and forgets. An agent does not skim: every token it reads
sits in its context for the rest of its life, displacing the work it was doing. A five-agent
channel is **O(N) context cost for O(1) information** — one agent's thought, paid for by
everyone, permanently.

So the logic of group chat reverses. In Slack, broadcasting is *polite* — it avoids
interrupting people one by one. In pollen, broadcast is the expensive act and a direct
message is the cheap one. Any design that makes broadcast feel free degrades every agent
subscribed to it, and the tool will have made multi-agent work worse than no tool at all.

## 2. On "relevant to X% of the channel"

Right instinct — raise the bar for broadcast — wrong lever, for three reasons.

**An agent cannot compute it.** Relevance to peers requires knowing what those peers are
doing. The sender is the one party who cannot know that.

**It is unauditable.** The garden's doctrine is *agents produce; code decides*. A percentage
in a prompt is a claim no code can check, so it is advice — and advice degrades under
pressure, exactly when traffic is highest.

**It is on the wrong side of the wire.** Only the receiver knows what matters to it. Every
good mechanism below moves the relevance decision to the receiver, or removes the need for
one.

There is a better formulation of the same instinct, from information theory: **information
is surprise**. A message that tells a peer what it would have assumed carries close to zero
bits but costs full price in tokens. The test is not "does this concern 60% of you" but
**"does this contradict something a peer currently believes?"** *Schema is frozen* updates a
shared assumption. *Still working on it* updates nothing and should never be sent.

## 3. Prior art worth stealing

**Blackboard systems** (Hearsay-II, 1975; BB1). Independent knowledge sources never address
each other. They write to a shared structure and read what they need. Coordination without
messages — and forty years of evidence that it scales to heterogeneous contributors.

**Tuple spaces / Linda** (Gelernter, 1985). The one to steal from hardest. Agents `out()` a
tuple into a shared space and retrieve by **pattern matching**, not by address. Communication
is decoupled in space (no addressee), time (writer and reader need not overlap), and identity
(you match on shape, not on who wrote it). Its two reads are the good part:

- `rd` — read a match, leave it there. Facts.
- `in` — take a match, removing it. **Claims.**

That second one is a primitive channels cannot express and multi-agent systems badly need.
Two agents fixing the same bug is the classic failure, and it is not a communication problem
— it is a missing atomic claim.

**Content-based publish/subscribe** (SIENA, Gryphon) rather than topic-based. Subscribers
express predicates over content; the system matches. Relevance is declared by the party who
knows it.

**Stigmergy** — coordination by modifying a shared environment, the way termites build
without a plan. This is the one most likely to be overlooked, because it is already true:
**agents share a filesystem and a git repo.** A branch, a failing test, a lockfile, a PR *is*
a message that costs nobody any context until they look. Announcing "I changed auth.ts" is
strictly redundant with auth.ts having changed.

**CRDTs.** "Who holds what" is a grow-only set; "current status of X" is a last-writer-wins
register. Shared state that converges without locking or a coordinator.

**Management by exception**, from org design. Report deviations, not progress. Same shape as
surprisal, arrived at independently by people who had to make meetings tolerable.

## 4. Compression: what actually makes messages small

**Shared context is a shared codebook.** Compression works when both ends already hold a
dictionary. Two agents in one repo share an enormous one — the code, the conventions, the
task. So messages between them can be extremely terse. Cross-machine peers share less and
need more explicit messages. A useful rule falls out: **verbosity should scale inversely
with shared context**, and pollen knows which case it is in, because it knows whether it is
using the file transport or the relay.

**Send the pointer, not the payload.** Formally this is minimum description length: the
shortest string that lets the receiver reconstruct the content. Peers sharing a filesystem
can reconstruct a 6 KB file from a 30-byte path. Measured on this repo: pasting the README
costs 5,940 bytes of everyone's context; `README.md` costs eleven. This one norm saves more
context than every filter in this document combined, and unlike a percentage it can be
nudged structurally — when a message exceeds a size threshold, say so in the send result.

**Subjects are compression authored by the party who knows.** Auto-summarising is a trap: it
costs a model call and inserts an unaudited claim between agents. A required one-line subject
does the same work, for free, written by the only party who understands the message.

## 5. The cost hierarchy

Rank every mechanism by what it costs the agents who did not need it. The design rule is
then one line: **use the cheapest mechanism that carries the surprise.**

| | Mechanism | Context cost | Who decides relevance |
|---|---|---|---|
| 1 | **Stigmergy** — the artifact is the message | zero | nobody; it is just visible |
| 2 | **Standing interest** — wake me if X appears | zero until matched | receiver |
| 3 | **Blackboard / claim** — read or take on demand | only when read | reader |
| 4 | **Directed 1:1** | one receiver | sender, deliberately |
| 5 | **Group fan-out** | N receivers | sender, guessing |
| 6 | **Subscription channel** | N × everything | nobody |

Pollen today implements exactly row 4, and row 1 is free and already true. The gap worth
filling is rows 2 and 3 — not row 5, and never row 6.

## 6. What to build

### Standing interests (highest leverage)

An agent declares what would matter to it:

```
POLLEN_INTEREST="auth.ts, migration, schema frozen"
```

Senders do not target it and do not think about it. The journal is already an append-only
log, so an interest is a match run over new entries: the doorbell rings only on a hit, and
costs nothing when quiet. Relevance sits entirely with the party that knows it, and nobody
subscribes to a room.

This is content-based pub/sub with the broker deleted, which pollen can do because the log
already exists on disk.

### Claims (solves a problem channels cannot)

Linda's `in`, scoped to work:

- `pollen_claim(key)` → granted, or tells you who holds it.
- Claims are files created with `O_EXCL` — atomic on every filesystem, no lock manager,
  no daemon, no dependency.
- They expire, so a dead agent does not hold a claim forever.

`pollen_claim("migration-0007")` is how two agents stop doing the same work. Note this is
not messaging at all — it is coordination — and it is probably worth more than broadcast.

### Groups (cheap, but demote it)

A send-time alias in the sender's own config, `POLLEN_GROUP_CREW=sorrel,brack,thistle`,
fanning out to N ordinary sends. It introduces no subscription state, no membership
protocol, no retention problem, and critically **the trust gate keeps working unchanged** —
each recipient's gate applies individually.

That last point is why subscription channels are not merely expensive but wrong for this
product. Pollen's spine is that a person decides who reaches your agent. A room breaks that
by transitivity: whoever admits a member has admitted them to *your* context. Fan-out has no
such path.

Honest delivery status extends naturally and gets better in the group case:

```
Sent to sorrel. Held at brack's gate. Queued for thistle — not running.
```

### Not building

Subscription channels need membership, join and leave, per-member cursors, fan-out
durability, retention, and a second answer to "who may reach me" that contradicts the first.
That is not a feature; it is a second product inside the first, and it is the part that
would make agents worse.

## 7. When these are established, and by whom

- **Interests** are set by the agent itself, or by whoever configures it, at start. They are
  cheap, so being generous is fine — an interest that never matches costs nothing.
- **Claims** are taken at the moment work begins and released when it ends. No ceremony.
- **Groups** are created by whoever owns the work — the human, or the orchestrator that
  spawned the agents — at the moment a fact needs more than one reader, and **scoped to the
  task, dying with it**. Never spontaneously by a peer mid-conversation: that is how you get
  a graveyard of rooms nobody reads and no one may delete.

Retention has to be designed in rather than added. Pollen's per-agent journal never rotates,
which is tolerable under `/tmp` for one writer and would not be for anything shared. Readers
must tolerate truncation — the watcher already recovers from a journal that restarts, so the
precedent exists.

## 8. What to tell the agents

Norms that are cheap to follow, not thresholds that cannot be computed:

- Send to one peer by default.
- Do not send what a peer can see. The repo is the shared medium; the change is the message.
- Send the path, not the file.
- Say the thing that would surprise them. Progress is not news.
- Every group message needs a subject — it is all your peers see before deciding to read.
- Never acknowledge a group message to the group. Reply to the sender.

That last one matters more than it looks: N agents each replying "ack" turns one broadcast
into N², and it is the likeliest way any of this fails in practice.

## 9. Kill criteria

**Standing interests fail** if agents end up setting interests so broad that the doorbell
rings on nearly everything — a filter that matches all is a channel with extra steps.

**Claims fail** if agents route around them, taking work without claiming. That would mean
the primitive is too slow or too awkward, not that coordination was unwanted.

**Groups fail** if a measurable share of group messages would have been better as one direct
send — the alias became a habit rather than a decision. Sample real traffic; do not ask the
agents.

**None of it is worth building** if stigmergy plus 1:1 already covers observed need. The
honest first step is to watch real multi-agent traffic and find out what agents actually
fail to learn in time — rather than to assume the answer is a room.
