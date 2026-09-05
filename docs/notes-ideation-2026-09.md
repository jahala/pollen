# What notes are actually for

Status: ideation on `sharing-decision-2026-09.md`, September 2026.

## The question that reframes it

*Why would agents initiate a multi-party conversation at all, rather than talking 1:1?*

Working through it: they would not. There is no compelling case for N-way turn-taking
dialogue between agents. Every candidate dissolves on inspection.

- *"Who takes this?"* is not a conversation, it is a **claim**.
- *"zod or yup?"* is not a conversation, it is a **decision** belonging to a human or a
  conductor.
- *"Your approach is wrong because X"* is a **1:1 review**.

So the honest conclusion is that **notes are not a conversation mechanism, and calling them
one was the error running through all five previous documents.** A conversation implies
participants and turn-taking. What actually happens is one agent externalising something it
learned so the knowledge outlives its session.

**Sessions are amnesiac.** An agent finishes and everything it discovered — the trap, the
constraint, the approach that failed — dies with it. The next agent rediscovers it at full
cost. That is the real problem, and it is not a communication problem at all. It is a
**memory problem, and the memory belongs to the work rather than to any agent.**

That is why 1:1 stays exactly as it is. Real conversations are genuinely bilateral: *I need
something from you, now, and I know who you are.* Nothing here improves on that.

## When you deposit instead of sending

1:1 requires the sender to know three things. Deposit when any one of them is missing:

| Missing | Example |
|---|---|
| **who needs it** | you found that the API rate-limits at 100/min; you have no idea who will call it next |
| **whether they exist** | the six sibling pages needed a footer line and not one of those agents was running |
| **that there is a "they" at all** | everyone who ever touches this file, forever, including next year |

The reason to leave a note is never that you want an audience. **It is that you have no
addressee.** That single sentence is the whole justification for the feature, and it is also
the test: if you know who needs it and they exist, send them a message.

## Things that do not exist yet

An address is **a name, not a pointer.** Nothing requires the thing to exist.

`pollen_note(about: "hedge", ...)` is valid before `hedge` has a repository, a file or a
line of code. The note waits under that name; the first agent that starts work on hedge asks
what is known and finds it. This is how names work everywhere else — people discussed
"pollen" for weeks before `pollen.mjs` existed.

The address space is therefore any identifier the work already uses:

- a path or glob — `src/auth.ts`, `migrations/**`
- a ref, tag or release — `v0.2.0`
- an issue or ticket — `#142`
- a dependency — `postgres`, `stripe`
- an activity — `deploy`, `release`
- **a name for something not yet built** — `hedge`, `the billing rewrite`
- the repository root, for facts about the whole project

Paths and refs carry the strongest guarantee, because the project already agreed them.
Conceptual names are weaker — two agents may write `billing rewrite` and `billing-v2` — and
that residual vocabulary risk is real. It is bounded by prefix matching and by the fact that
most notes attach to files, but it does not vanish.

## What actually gets deposited

Eight kinds, each with an example that really happened or really would:

1. **A constraint discovered.** *The relay is unauthenticated; never expose the port.*
2. **A decision taken.** *Accent is `#C8B330` and it is measured — do not re-pick it.*
3. **A trap.** *`node --test` here spawns real MCP servers; a failing test leaves them
   running and the runner never exits.*
4. **A deprecation with a date.** */v1 removed after the 14th.*
5. **A non-obvious dependency.** *Renaming this repo breaks the curl URL in the README and
   the six sibling garden rows.*
6. **An approach that failed, and why.** *Tried olive-golds for the accent; mechanically
   safer, looked muddy beside the vivid siblings.*
7. **An environmental fact with a shelf life.** *Staging DB is restoring; do not trust it
   today.*
8. **Work in flight.** *Refactoring this module, expect churn* — the weakest of the eight,
   and usually better as a claim.

Six of those eight are **negative or cautionary** — things that will not work, must not be
done, or will bite. That is not a coincidence. Positive knowledge tends to be visible in the
artifact; **the thing that dies with a session is what the agent learned by failing.**

## Roleplay: a bed that does not exist

The garden's direction memo ranks `hedge` — the boundary tool — first among candidates, and
records a kill criterion for it. Today that memo is a file one agent happened to read.

**Month one.** The plotplot agent, writing the memo, deposits under the name:

```
pollen_note about: "hedge"
  subject: "kill criterion: dies if Gemini/Codex hooks cannot express deny-with-reason"
```

Nothing exists. No repo, no code, no agent to send it to.

**Month two.** Jan starts a session to build hedge. Empty directory. The agent's first move:

```
$ pollen_notes "hedge"
  [4w ago · plotplot] kill criterion: dies if Gemini/Codex hooks cannot
                      express deny-with-reason
```

It now knows to test that first, rather than building for a fortnight and discovering the
premise was dead. **Without the note, that fact existed only in a memo nobody told it to
read.**

**Month two, later.** It finds out:

```
pollen_note about: "hedge"
  subject: "Codex hooks can deny but carry no reason string — criterion half-met"
```

**Month three.** A different agent, different session, picks hedge up. It asks, and gets
both notes with their ages. It does not repeat the experiment.

That is the entire product: **three sessions, no overlap in time, no message ever addressed
to anyone.**

## A case from this conversation

Twice in this session Jan had to tell me the pollen brand was decided and not to re-pick the
accent. There was nowhere to leave that fact, so a human carried it — twice, to the same
agent, across two sessions. A note under `.brand/` or `pollen` would have carried it once:

```
[2d ago · plotplot] accent #C8B330 is measured and settled — do not re-pick;
                    gold is fill-only on paper, words use #7E6A08
```

The measure of this feature is how often a human repeats themselves to an agent. That is
observable today, without building anything.

## What this changes about the product

pollen is described as peer messaging with a human at the gate. If notes are built, it
becomes two things, and they should be named honestly rather than blurred:

- **messages** — bilateral, live, gated, for when you know who you are talking to
- **notes** — un-addressed, durable, located, for what the work should remember

The second is closer to memory than to messaging, and the trust model differs accordingly:
a message enters your context because someone chose you and you let them in; a note enters
because *you went looking at a location you were already working on*. That is a weaker
imposition, and it is why notes do not need a gate — but it should be a deliberate
statement, not an omission.

## The honest risks

**The retrieval habit may not form.** Everything depends on agents asking before they work.
That belongs in the MCP instructions as a default first move, and it is the most likely
failure.

**Stale notes are worse than none.** A confidently wrong note costs more than silence, which
is why ages are always shown and why clearing must be as easy as writing.

**It could become a status feed.** Kind 8 is the thin end: *working on this* is not
knowledge. If most notes look like kind 8, the norms failed.
