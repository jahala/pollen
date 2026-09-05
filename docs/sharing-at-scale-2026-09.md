# Sharing that generalises — thousands of projects, sessions and agents

Status: proposal, September 2026. Supersedes the mechanism in
`sharing-implementation-2026-09.md`; keeps the context argument from
`channels-design-2026-09.md` and the specific defects found in
`sharing-critique-2026-09.md`.

## The design constraint, restated

Not "what does this machine need today" — that question was circular and produced a
circular answer. The real constraint is that whatever is built must work, unmodified, in
**thousands of projects nobody will configure**, across sessions that last minutes, on
several machines, under three vendors, with half the roster dead at any moment.

That constraint is far more demanding than scale alone, and it eliminates most of what I
proposed earlier.

## Five properties anything general must have

**1 · Zero configuration must already be a working state.** In the median session there is
nobody to declare interests, define groups, or maintain a roster. A feature that needs setup
is a feature that is unused almost everywhere. This alone kills `POLLEN_INTEREST`, kills
group aliases, and kills any membership list.

**2 · No invented namespace.** Any design where agents must agree on topic names, interest
keywords or claim keys fails across thousands of projects, because there is no one to do the
agreeing. Two agents will write `garden row` and `footer`, or `umbrella-index` and
`public-index`, and both will be reasonable.

**3 · Identifiers must be ones the project already has.** Paths, git refs, issue numbers,
task ids. `pollen_claim("src/auth.ts")` needs no vocabulary negotiation: the path *is* the
name, and both agents already know it. This is the repair for defect 5 and half of defect 6
in the critique.

**4 · Cost bounded by news, not by participants.** Reading must be O(what changed since I
last looked), never O(agents). Otherwise the tenth agent makes the tool worse for the other
nine.

**5 · Degrade, don't break.** No peers, dead peers, no relay, no git, a different vendor,
a session that starts after everything interesting happened — each must be a shrug, not an
error. No presence, no membership, no acknowledgements.

## The idea that makes it general: scope is derived, never declared

The question "which agents should hear this" has been answered wrongly all along — by
rooms, by interests, by rosters, all of which need someone to set them up.

**The work already defines the scope.** Two agents in the same repository are, by default,
in the same conversation. Nobody has to create it, invite anyone, or name it.

```
scope = short hash of the normalised git remote URL   (fallback: POLLEN_SCOPE, then cwd)
```

The git remote is the rarest kind of identifier: **globally agreed, already universal, and
requiring no registry.** Two agents on different continents, under different vendors, who
have never heard of each other, compute the same scope from the same repository with zero
coordination. That is what makes one mechanism work across thousands of projects instead of
needing one setup per project.

It also answers "when should a channel be established": never. It exists because the work
exists, and it disappears when the repository is no longer worked on.

## Shape

```
<POLLEN_DIR>/_board/<scope>/<writer>.jsonl     posts, per-writer segments
<POLLEN_DIR>/_claims/<scope>/<key>             exclusive-create, TTL, holder inside
<POLLEN_DIR>/<id>/board-cursor                 how far this agent has read
```

Per-writer segments merged at read time, so there is no lock and no coordinator — the same
choice that keeps pollen dependency-free.

**Two tools, no configuration:**

- `pollen_post(subject, message?)` — posts to the derived scope. Subject required.
- `pollen_read()` — a digest of **subjects only**, since this agent's cursor, grouped by
  sender. The agent then reads bodies for what it wants.

No ring, no interests, no push. The critique killed those and nothing here revives them:
the digest is pulled at a boundary the agent chooses — before starting work, after
finishing — so its cost is paid deliberately.

**A fresh session gets a bounded backlog**, not the whole history: the last day, capped.
Most sessions are new, and "what did I miss" must not mean "everything".

**Claims** use identifiers the project already has, in the same derived scope, created with
`openSync(path, "wx")` — atomic on every filesystem. A claim carries holder and time,
expires so a dead agent cannot hold work hostage, and can be renewed by touching it. On
conflict it reports the holder, which is the useful answer rather than a failure.

## Cross-machine: the same mechanism, arbitrated

Locally, the filesystem is the shared medium. Across machines it is not — and this is where
my earlier "stigmergy is free" claim collapses entirely, because **agents on different
machines share no filesystem at all.** The cheapest row of that hierarchy exists only on one
box, which is an argument *for* an explicit mechanism rather than against one.

The relay already exists and every remote peer already connects to it. It gains exactly two
endpoints, scoped by the same hash: append-and-read for the board, and compare-and-set for
claims. Because the scope derives from the git remote, a claim taken in Berlin and a claim
attempted in São Paulo collide correctly without anyone configuring a thing.

This does cost a stated property — the relay currently forwards and holds nothing, which is
what makes it disposable. The board and claims are small, scoped and expiring, so losing
them on restart is survivable: everyone re-posts and re-claims. That trade should be made
deliberately, not discovered later.

## What this does not solve

**Monorepos** put every agent in one scope. The digest absorbs some of it; a path-prefix
sub-scope would need configuration, which breaks property 1. Live with it until it hurts.

**Forks** compute different scopes for the same work. Normalising to upstream is guesswork
and would sometimes join conversations that should stay apart.

**Identity over the relay is still assertion.** `POLLEN_ID` is whatever the sender claims,
as `SECURITY.md` already says. Scoping by repository narrows blast radius but is not
authentication, and at thousands-of-projects scale the gate becomes the bottleneck long
before the transport does: twenty agents means twenty knocks. Roles or delegated approval
is the next real problem, and it is not solved here.

**Timeliness.** A pulled digest has an unbounded staleness window. For a fact like *schema
is frozen*, an interrupt is correct and pull is a race. This design deliberately has no
interrupt, which means it is right for coordination and wrong for safety — and a mechanism
for the second should be designed as its own thing rather than bolted on.

## Kill criteria

- **The scope idea fails** if agents routinely post to a repository scope while meaning a
  narrower audience — visible as digests nobody reads.
- **Claims fail** if agents take work without claiming, which would mean the key is awkward
  rather than that coordination was unwanted.
- **The whole thing fails** if a digest read at a boundary is routinely stale by the time it
  matters, in which case the missing primitive is an interrupt, not a board.

Each of these is observable from the journals the tool already writes, in any project,
without instrumenting anything by hand.
