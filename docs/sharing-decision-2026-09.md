# The decision: notes left at places in the work

Status: **decision**, September 2026. Supersedes the mechanisms in
`channels-design`, `sharing-implementation`, `sharing-at-scale` and `sharing-across-repos`.
Those remain as the reasoning trail; this is what to build.

## Why four documents produced no decision

Each round found a real defect and proposed a new mechanism, which the next round attacked.
Rooms became groups, groups became a board with interests, interests became a digest,
digests became scopes, scopes became labels. The critiques were sound and the convergence
was absent, because I kept redesigning *delivery* while the findings that survived were all
about *content and timing*.

Here is what never moved across every round:

1. **Broadcast is O(N) context cost for O(1) information.** Agents do not skim; a message
   read is context spent permanently.
2. **Information is surprise.** A message confirming what a peer already assumes carries no
   bits and costs full price. Progress is not news.
3. **Shared context is a shared codebook.** Peers in one repository share an enormous
   dictionary, so their messages can be terse. Remote peers share less and need more.
4. **Send the pointer, not the payload.** Measured on this repo: the README pasted costs
   5,940 bytes of a peer's context; `README.md` costs eleven.
5. **The recipient usually does not exist yet.** This is the only thing 1:1 structurally
   cannot do, at any scale, in any topology.

Every mechanism I proposed was an attempt to serve (5) while respecting (1). Every one of
them failed on the same two rocks: an invented vocabulary, or a prediction someone had to
make in advance.

## The reconciliation

Both rocks disappear if a note is addressed to **a place in the work** rather than to an
agent, a room, or a topic.

```
pollen_note(about: "src/auth.ts", subject: "moved to /v2/session; /v1 gone after the 14th")
```

An agent about to work on `src/auth.ts` asks what is known about it and finds the note. That
single change resolves every objection raised in the previous four documents:

| Objection | Why it disappears |
|---|---|
| agents must agree a vocabulary | paths, refs and issue ids are **already agreed** — the project named them |
| the sender must predict who cares | it does not address anyone; it addresses a location |
| the receiver must predict what it will need | relevance is determined by **what it actually touches**, at the moment it touches it |
| broadcast costs N agents | nobody who does not touch the location pays anything |
| opt-in means unused | there is nothing to opt into |
| configuration | none: the location comes from the work |
| the recipient does not exist yet | the note waits at the location for whoever arrives |

This is stigmergy made explicit and durable — the mechanism I called free and then had to
admit was local-only, rebuilt so it survives across machines and across time.

## What to build

Three tools. Total goes from five to eight, under the nine-tool ceiling.

```
pollen_note(about, subject, body?)     leave a note at a location
pollen_notes(about?)                   notes that apply here, newest first
pollen_note_clear(id)                  it is no longer true
```

- **`about`** is any identifier the project already has: a path, a glob, a ref, an issue
  number. It defaults to the repository root, which is where facts like *brand v2 merged*
  belong.
- **Prefix matching.** A note on `src/` surfaces for `src/auth.ts`. No config, no
  hierarchy to declare.
- **Scope** stays as decided: derived from the git remote, with `POLLEN_SCOPE` as the one
  optional label for work that spans repositories.
- **Storage** is per-writer segments merged on read, as with the journal — no lock, no
  coordinator, no dependency.
- **Notes expire.** A stale note is worse than no note, because it is confidently wrong.
  Default TTL, explicit clear, and every note carries its age when shown.

`pollen_notes` is cheap by construction: subjects only, filtered to the location, so cost is
bounded by what the agent is touching rather than by how many peers are talking.

## What this does not replace

**1:1 stays exactly as it is, and the human naming the peer stays fine.** *"Ask umbel about
the tmux thing"* is cheap, precise, immediate and needs no mechanism. For a live exchange
between two agents that both exist right now, it is the correct tool and nothing here
improves on it.

The new mode earns its place on one axis only: **the across-time case**, where there is no
peer to name because the agent who needs the fact has not started yet. That is the whole
justification, and if it turns out not to matter, the feature should be removed rather than
defended.

**There is still no interrupt.** A note is found by an agent that goes looking. For a fact
that cannot wait — a frozen schema, a broken main — the correct mechanism is a message to a
named peer, today, or an interrupt designed separately. Notes are for what should be known
on arrival, not for what must be known now.

## The content discipline is where the leverage is

The mechanism is small on purpose. Findings 2, 3 and 4 are norms, not code, and they carry
more of the value than the tools do. They go in the MCP instructions, where every agent
reads them:

- **Note what would surprise.** If a peer would have assumed it, it is not a note.
- **Note the pointer, not the payload.** Peers can read the file; give them its path.
- **Note what you learned, not what you did.** Your progress is not news; a constraint you
  discovered is.
- **Clear your note when it stops being true.** A confidently wrong note costs more than
  silence.

Two of those are enforceable rather than exhorted: a note over a size threshold gets told to
send a path instead, and every note displays its age so a reader can discount it.

## Kill criteria

- **Notes fail** if agents write them and no agent ever reads one at the location — that
  would mean the retrieval habit did not form, and no amount of mechanism fixes it.
- **They fail** if the notes an agent finds are mostly stale, meaning nobody clears them and
  the TTL is wrong.
- **They fail** if what agents actually write is progress rather than surprise, in which
  case the norms did not hold and the feature is a status feed with extra steps.

All three are visible from the notes files themselves, in any project, with no separate
instrumentation.

## The decision

Build the three tools. Keep 1:1 unchanged. Do not build rooms, groups, interests or
subscriptions — the reasoning against each is in the four documents this one supersedes.
