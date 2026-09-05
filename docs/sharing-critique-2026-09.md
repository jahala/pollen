# Attacking the sharing design

Status: critique of `channels-design-2026-09.md` and `sharing-implementation-2026-09.md`,
written against my own proposals. September 2026.

> **Correction, added after review.** Section 0 below leads on there being eight messages
> on this machine and treats that as near-disqualifying. That reasoning is circular: the
> volume is eight *because no mechanism exists* and because multi-agent work is only now
> being wired up. Demand for a bridge is not measured by counting swimmers. Worse, the
> re-read of the roleplay in section 1 inherits the same bias — every past event was handled
> 1:1 because 1:1 was the only thing available, so "only one of five needed something new"
> was never a finding about the design.
>
> The specific defects in sections 2 to 10 stand; the verdict does not. Local volume is the
> wrong instrument entirely, and the interesting case — many agents, several machines, more
> than one vendor — is addressed in `sharing-at-scale-2026-09.md`.

## 0. The fact I should have checked first

Every journal on this machine, across the entire life of this tool:

```
4  /tmp/walkie/cape-town/journal.jsonl
4  /tmp/walkie/tend2/journal.jsonl
```

**Eight messages. Two agents. One unread file.** Several of those eight were my own tests.

I designed a broadcast medium, an interest-matching system and a distributed claim protocol
for a system with eight lifetime messages. I wrote "instrument first" into the kill criteria
of both documents and then did not instrument, because designing was more interesting than
measuring. Everything below is secondary to this.

## 1. The roleplay was rigged

I presented a replay of "a real week" as evidence the design fits. It is not evidence. I
chose the five events *after* designing the mechanisms, and described each one in the
vocabulary of the mechanism it was meant to justify. That is a demonstration wearing the
clothes of a test.

Re-read honestly, here is what those events actually needed:

| Event | What I claimed | What it actually needed |
|---|---|---|
| brand merged | board post + interest | **1:1** — plotplot wrote pollen's brand layer; it knew pollen existed |
| pollen waiting on it | standing interest | **1:1** — I was actively waiting on a known sender |
| garden row, six repos | board post | **group send**, and those six agents are rarely alive together |
| umbrella page, two takers | claim | **claim** — genuinely new |
| stale install | 1:1 | 1:1 |

One of five needed something that does not exist, and it is the claim — **not the board**.
My own roleplay, read against itself, argues for the thing I put in phase two and against
the thing I put in phase one.

## 2. "Posted. 2 peers have a matching interest" cannot be implemented

That line appears three times in the transcript and it is theatre. `POLLEN_INTEREST` lives
in another process's environment. Nothing on disk knows it. To make that sentence true,
every agent would have to publish its interests to a shared file, which means new state,
staleness, and dead agents still listed as listening — machinery I never costed while
writing output that implied it already existed.

It is the exact failure mode I have been criticising elsewhere all week: text that sounds
like a system knows something it cannot know.

## 3. Interests move the prediction problem; they do not solve it

I rejected "relevant to X% of peers" because the sender cannot predict what receivers care
about. Interests ask the **receiver** to predict what it will need to know — and they are
set at spawn, the moment it has the least context about the work. An agent starting on
pollen does not know that "garden row" will matter to it; it learns that mid-task.

Static interests are sender-side estimation with the blindfold moved, not removed. Making
them dynamic needs another tool and more state, which is how a small design stops being one.

## 4. "Unset means silence" is a defect I dressed as a virtue

I wrote that opt-in is "the opposite of a channel, where joining is cheap and leaving is
what you forget". True, and it also means the steady state of the board is **posts that
reach nobody**. A poster gets told zero peers matched and falls back to 1:1. The medium's
default condition is being unused. Opt-in notification systems fail this way reliably, and
I presented it as a design win.

## 5. Substring matching contradicts the product's own doctrine

Sender writes `garden row now lists seven`. Receiver set interest `footer`. Both were
reasonable. The message is lost, silently.

pollen exists because silent failure is unacceptable — the honest-delivery status was built
precisely so a sender is never left believing something arrived when it did not. The board
would reintroduce exactly that, inside the same tool, and answer it with "0 peers matched",
which is not the same as "nobody will ever see this".

That is an internal contradiction, not a rough edge. Two LLMs free-texting keywords at each
other with no agreed vocabulary is a coordination problem *inside the coordination tool*.

## 6. Claims: probably right, wrongly placed, under-specified

Claims survive the critique better than anything else, but three problems went unstated:

**The key is the same vocabulary problem.** `plotplot-public-index` versus
`umbrella-index`: two agents naming the same work differently both get a claim, and the
atomicity buys nothing.

**One-hour TTL versus a three-hour task.** The claim lapses mid-work and another agent
takes it. Renewal is needed, which is more machinery.

**It may be pleach's job.** pleach conducts plans through gates; allocating work is its
domain. Putting claims in pollen is plausibly a land grab into a sibling bed and a violation
of one-idea-one-home. That is a conversation with pleach, not a decision pollen makes alone.

## 7. The cost hierarchy optimises one variable and looks total

The six-row table ranks mechanisms by cost to agents who did not need the information. It
reads authoritatively and it is incomplete in a way that flatters my conclusion.

**"Stigmergy — zero cost" is false.** Discovering that a fact changed by reading artifacts
costs a tool call, a diff, and judgment — frequently *more* context than a one-line message
saying "schema is frozen". I ranked bystander cost and silently ignored the cost to the
agent that actually needs the information. A mechanism that is free for four agents and
expensive for the fifth may well be worse overall.

## 8. Latency was never mentioned

Pull has an unbounded staleness window. If plotplot posts "schema is frozen" and pollen
reads twenty minutes later, pollen spent twenty minutes working against a false assumption.
For safety-relevant facts, an interrupt is *correct* and pull is a race. I optimised context
so hard that I dropped timeliness as a dimension, and never said which facts deserve to
interrupt.

## 9. The mechanism may manufacture the need

Conway's law, pointed inward: the tool shapes the coordination that happens through it.
There is no observed broadcast traffic. Building a board may not serve latent demand so much
as create the habit — and then the kill criteria measure a behaviour the feature invented.

## 10. Kill criteria nobody can run

"Measure the ratio of rings to reads." There is no instrumentation, no owner, no threshold
and no schedule. A kill criterion that cannot be executed is the same species of theatre as
the rest — it converts an untested assumption into something that *looks* falsifiable.

## What survives

- **The context argument.** Agents do not skim; broadcast is O(N) cost for O(1) information.
  This is the real idea and it holds.
- **Send pointers, not payloads.** Measured, needs no code, saves more than any filter.
- **Surprisal over audience fraction.** A better norm than a percentage, and free.
- **Do not build channels.** Strengthened: if the board cannot clear the bar, rooms cannot.
- **Claims**, conditionally — after a conversation with pleach about whose job this is.

## The design that falls out of the critique

Drop interests. Drop the ring. Keep a board nobody is pushed from, and read it as a
**digest at a boundary**:

`pollen_read()` returns subjects only, grouped by sender, since your cursor. An agent calls
it when it chooses — before starting a task, after finishing one — and pays a bounded cost
at a moment it picked. Then it reads bodies only for what it wants.

That removes the unimplementable peer count, the prediction problem, the vocabulary problem,
the silent loss, and one env var. It is strictly smaller than what I proposed and strictly
better, which is a fair indication of how much of the original was decoration.

It still should not be built yet.

## What to actually do

Instrument. Log every message with sender, recipient, size and time — pollen already writes
a journal, so this is nearly free. Run it for a fortnight of ordinary work. Then look at:
how many messages, between how many agents, how many concurrent, how many would have had
more than one useful recipient, and how often two agents touched the same work.

If that shows what today's eight messages show, the answer is that 1:1 plus a claim is the
whole product, and the right amount of code to write for sharing is none.
