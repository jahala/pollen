# Coordinating across repositories

Status: proposal, September 2026. Extends `sharing-at-scale-2026-09.md`, which scoped
sharing by repository and so did nothing for work that spans several.

## First, a correction

The first draft of this document derived the cross-repo relationship from `.petalsrc` and
made a shared umbrella repository the transport. Both are specific to one family of repos
that happens to exist on the author's machine. That is overfitting: a mechanism unavailable
to almost everyone, presented as a general design.

This version keeps what survives contact with thousands of unrelated users. What survives
is smaller, and its honest core is an admission.

## The admission: this relationship cannot be derived

Same-repo is derivable — the git remote is a globally agreed identifier requiring no
registry. **There is no equivalent for "these repositories are worked on together."**

| Candidate | Why it does not generalise |
|---|---|
| remote owner (`github.com/acme/*`) | right for a small account, absurd for an org with 4,000 repos, wrong for a personal account of unrelated projects |
| a shared parent directory | a local layout accident; two machines disagree, and CI has neither |
| an ecosystem manifest (workspace root, `.gitmodules`, a brand file) | real where it exists, absent for most projects, different in every ecosystem |
| repos touched together in one session | inferring intent from history; wrong often enough to distrust, and needs history first |

No universal derivation exists, and pretending otherwise produces a design that fits only
whoever it was modelled on. So the design must be **excellent with the repo scope alone, and
accept one optional line for anything wider.**

## Shape

**Repo scope — always on, never configured.** Derived from the git remote. The workhorse,
and it covers the common case: several agents, one repository, no setup.

**Wider scope — one optional environment variable.**

```
POLLEN_SCOPE=acme-platform
```

Two agents in different repositories that set the same label share a conversation. That is
the whole mechanism: no file invented, no registry, no hub, no membership, nothing to
maintain and nothing to go stale. A user who never sets it loses nothing they had.

Ecosystems that *do* declare a family — a workspace root, a superproject, a brand manifest —
can supply that value automatically. That is an **integration, not the design.** The tool
must never require one to exist.

**Transport is what is already there.** The filesystem on one machine; the relay across
machines, which pollen already has. A shared repository can carry a board for those who have
one, and git being durable and serverless is a genuinely nice property — but it is an
option, not the mechanism.

## What survives from the overfitted draft

**The time property, which is the real argument for any of this.** Cross-repository
coordination is mostly asynchronous in *time*, not merely in space: the agent that needs the
fact does not exist yet.

When pollen was renamed, six sibling pages needed a change, and not one of those agents was
running. There was no recipient to address. A direct message had nowhere to go, so the fact
travelled in a human's head. **A post is addressed to a place in the work rather than to a
process, so it is still there when the next agent arrives** — and 1:1 cannot do that at any
scale, for any user, in any topology.

An agent starting tomorrow calls `pollen_read()` and pays a dozen lines for what it would
otherwise have been told by a human or never learned:

```
scope · acme-platform · 2 new
  billing-svc   contract v3 shipped — clients must send idempotency-key
  web           moved auth to /v2/session; /v1 removed after the 14th
repo · web · nothing new
```

**Names come from the project.** Paths, refs, issue numbers. `pollen_claim("src/auth.ts")`
needs no vocabulary negotiation in any project, because the path is already the name.

**Digest at a boundary.** Subjects only, since a cursor, pulled when the agent chooses.

## What does not survive

**"Work allocation belongs to the hub."** That came from a family that happens to have an
orchestrator. Most users have no conductor at all, so allocation cannot depend on one —
which makes **peer claims more important, not less.** An atomic claim on an identifier the
project already has is the general answer; a conductor is an optimisation for the few who
have one.

**A shared umbrella repository as the bus.** Elegant where it exists. Unavailable to almost
everyone.

## Honest gaps

**A label is a namespace, and namespaces collide.** Two unrelated teams both choosing
`platform` would share a board. Locally that is unlikely and visible; across a shared relay
it is a real hazard, and argues for keeping wide scopes local until identity across the
relay is solved.

**Opt-in means mostly unused** — a fair criticism of interests that applies here too. The
difference is that the repo scope needs no opt-in and carries the common case alone, so the
feature is not dead when nobody sets a label.

**Still no interrupt.** A pulled digest is stale by construction. Right for *contract v3
shipped*, wrong for anything that cannot wait, and that remains a separate design.

## Kill criteria

- **The label fails** if users set it once, forget it, and it drifts — visible as scopes
  with one participant.
- **The repo scope fails** if the common case turns out not to be several agents in one
  repository, in which case the workhorse carries nothing.
- **The whole thing fails** if agents read the digest and act on none of it.
