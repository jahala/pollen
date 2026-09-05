# Coordinating a family of repos — tend2, umbel, pleach, pollen, and the umbrella

Status: proposal, September 2026. Extends `sharing-at-scale-2026-09.md`, which scoped
sharing by repository and therefore did nothing for the case that actually motivated it.

## The case the repo scope misses

Scoping by git remote answers "two agents in one repository". The plotplot garden is seven
repositories with an umbrella above them, and the coordination that actually happens crosses
those boundaries in both directions:

| What happens | Direction |
|---|---|
| the umbrella merges a brand version | hub → all beds |
| a bed is renamed, so six sibling pages need a new footer line | bed → siblings |
| a bed notices the umbrella's reference footer is missing copeca | bed → hub |
| a bed needs to know the current brand version | bed pulls a fact |

None of that is same-repo, so none of it is served by the previous design.

## The relationship is already written down

The temptation is to invent a family: a config file listing members, or a room they all
join. That fails the generality test — nobody maintains it.

But it already exists. Every bed carries a `.petalsrc`, for brand reasons, and it names the
umbrella:

```
source: https://github.com/jahala/plotplot-ai.git
product: pollen
```

So the family scope is still **derived, never declared**:

```
family scope = normalised `source` from .petalsrc
               fallback: the remote's owner (github.com/<owner>/*)
               fallback: none — repo scope only
```

The owner fallback matters for generality: most ecosystems have no `.petalsrc`, but every
repository has an owner, and `jahala/umbel` and `jahala/pollen` share one without anybody
configuring anything. Other ecosystems supply the same shape for free — a workspace root in
pnpm or Cargo, `.gitmodules` in a superproject, a `go.work`. The rule generalises even
though the file differs: **read the family from whatever the project already uses to say
these things belong together.**

Verified on this machine: pleach and pollen both declare the umbrella; the umbrella's
`colors.md` already holds the roster of all seven. Umbel does not have a `.petalsrc` yet,
which is exactly the case the owner fallback covers.

## The property that actually decides the design

Cross-repo coordination is not mainly about reaching other agents. **It is about reaching
agents that do not exist yet.**

When pollen was renamed, the six sibling pages needed a new footer line. Not one of those
sibling agents was running. There was no recipient to address — a direct message had nobody
to go to, which is why the fact travelled by Jan carrying it in his head.

This is the thing 1:1 structurally cannot do, and it is a stronger argument for a board than
any context accounting: **a post is addressed to a place in the work, not to a process, so
it is still there when the next agent arrives.** Coordination across a family is
asynchronous in *time*, not merely in space.

An agent starting in umbel tomorrow calls `pollen_read()` and gets:

```
family · plotplot · 2 new
  pollen   garden row now lists seven — add pollen (.brand/components.md:143)
  plotplot brand v2.0.0 merged — re-fetch with /petals update
repo · umbel · nothing new
```

Twelve lines of context, at a boundary it chose, carrying two facts it would otherwise have
had to be told by a human or never learn at all.

## Transport: the umbrella repository is the bus

Locally the filesystem works. Across machines the earlier design reached for the relay — but
for a family there is a better answer that needs no server at all.

**The family already shares a git repository.** Posts are files in the umbrella:

```
plotplot-ai/.pollen/board/<bed>.jsonl
```

Git is then the transport, and it brings properties a relay would have to reinvent: durable,
distributed, authenticated by whatever already guards the repo, auditable, reviewable, and
survives every machine being off. It is stigmergy done properly across machines — which
repairs the claim in the first design that stigmergy was free but local-only.

It also composes with what already happens. A bed agent already fetches from the umbrella
when it runs `/petals update`. Reading the board is the same fetch.

For live peers on one machine, the local `_board` still applies. The two are the same shape
at different latencies: seconds locally, a pull cycle across the family.

## What the hub is for

The umbrella agent is not just another peer, and the split is worth stating.

**Facts broadcast.** *Brand v2.0.0 is merged.* Anyone may post; the digest keeps it cheap;
no one needs to know who is listening.

**Work allocation belongs to the hub.** *Six sibling pages need a footer line* is not a fact
to broadcast but work to assign, and the umbrella is the only party holding the roster —
`colors.md` already lists all seven beds. A bed does not know its siblings exist; the
umbrella does.

That is the same conclusion reached earlier about claims and pleach, arrived at from a
different direction: **the conductor allocates, the peers talk.** pollen should not grow a
work queue; it should make it cheap for the conductor's decisions to reach beds that are not
running yet.

## Honest gaps

**Umbel has no `.petalsrc`**, so today it would fall back to the owner scope and see a
slightly broader digest. Fine, but it shows the derivation is only as good as what projects
happen to declare.

**Git latency.** A post is visible after a push and a fetch. For *brand merged* that is
correct. For anything urgent it is not, and this design still has no interrupt.

**Commit noise.** Coordination becomes commits in the umbrella. Low volume is fine;
high volume would need a separate branch or an orphan ref, which is more machinery than the
idea deserves until it hurts.

**Write access.** Posting to the family means write access to the umbrella. That is a real
permission boundary and probably the right one — but it means a bed cannot announce anything
to its siblings without being trusted by the hub. Whether that is a feature or a bottleneck
depends on the family, and for a garden of one owner's tools it is a feature.

**The umbrella becomes a dependency.** Beds are currently independent; this couples them to
the hub for coordination. Acceptable when they already depend on it for brand, worth
refusing in a family where they do not.

## Kill criteria

- **The family scope fails** if beds post family-wide what only concerned themselves —
  visible as digests nobody acts on.
- **The git transport fails** if the push-fetch cycle means facts arrive after they mattered,
  in which case the missing thing is an interrupt and not a board.
- **The hub split fails** if the umbrella ends up relaying facts by hand anyway, which would
  mean the roster is not enough and beds genuinely need to address each other directly.
