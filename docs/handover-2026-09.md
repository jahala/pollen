# pollen — conversion handover, September 2026

walkie-clawkie is now pollen on branch `pollen`, cut from `origin/main`. Nothing is
pushed, renamed, published or enabled on GitHub. Four commits:

| Commit | What |
|---|---|
| `a45ee07` | rename walkie-clawkie to pollen |
| `4b480cf` | add the pollen brand layer, fetched from the plotplot umbrella |
| `cca284c` | add the pollen landing page |
| `cf39a9e` | bring the repo to the garden's release standard |

## Verified

- `node --test` → **14 pass, 0 fail**, before and after. Still real MCP servers over
  stdio against a real mailbox; nothing mocked, nothing skipped.
- `check.sh index.html` → **PASS, 0 errors, 0 warnings**. Confirmed the check actually
  reads this file by injecting umbel's `#E89227` and watching it warn
  (*"product accents mark products, not pollen UI"*), then restoring.
- Zero hits for `walkie`, `clawkie`, `WALKIE` in the tree.
- `node pollen.mjs --version` → `pollen 0.1.0`; the same constant is reported through
  the MCP `initialize` response.
- Runtime check, not just tests: server registers as `pollen-<id>`, tools are
  `pollen_send · pollen_agents · pollen_inbox · pollen_allow · pollen_deny`, mailbox
  root is `/tmp/pollen/<id>/`.
- History scan for keys, tokens and home paths: **clean**. The only matches are a test
  fixture whose message text is the words "secret payload".

## Feature inventory, corrected against the code

The brief's inventory was accurate except for the file size: `pollen.mjs` is **579
lines**, not 575, and the README now says ~580 rather than ~500. Everything else —
five tools, three modes, journal durability, the trust gate, honest delivery status,
relay resilience — matches the code as written.

## Decisions waiting for the owner

1. **Licence.** MIT added on the branch, copied from umbel. Both the README and the
   page footer already claimed MIT, so this makes the claim true — but it is yours to
   confirm.
2. **Repo rename** `jahala/walkie-clawkie` → `jahala/pollen`. GitHub redirects old
   URLs. **The README and the page both already point at the new name**, so the curl
   install 404s until this happens. This is the one item that blocks the others.
3. **GitHub Pages** from `main:/`, matching tilth and umbel.
4. **Repo metadata.** Suggested description: *peer messaging between AI agents, with a
   human at the gate — one file, zero dependencies.* Topics: `mcp`, `ai-agents`,
   `agent-to-agent`, `claude-code`, `nodejs`, `zero-dependencies`. Homepage:
   `https://jahala.github.io/pollen/`.
5. **Tag `v0.1.0`** once the rename lands.
6. **Delete the two merged remote branches** `fix/gate-survives-restart` and
   `fix/relay-failure-kills-server`.
7. **npm.** `pollen` is squatted at 0.0.5; `@plotplot/pollen` is free. The file installs
   by curl today, so this is a choice, not a need.
8. **Journal location.** State stays under `/tmp`: cleared on reboot, never rotated.
   The trade-off is durability against unbounded growth and disclosure — message text
   persists for the life of the directory rather than being consumed on read. Not
   changed; stated so you can decide.

## The garden row for sibling pages

Each sibling product page needs pollen added to its footer garden row. Exact line:

```html
<a href="https://github.com/jahala/pollen" style="--bloom:var(--pp-pollen)"><span class="gf-dot"></span>pollen</a>
```

It goes last, after copeca. Pages needing it: tilth, umbel, copeca, pleach, petals,
tend2. Those repos were not edited.

## Not done, and why

- **The kill criterion run** (two peers exchanging something umbel cannot carry) and
  the **cross-harness proof** (Codex or Gemini as a non-Claude host). `umbel`, `codex`
  and `gemini` are all installed, but I have not verified they are authenticated. The
  README still claims Codex CLI and Gemini CLI work; that claim is inherited from
  walkie-clawkie and remains unproven here.
- **Whether MCP channels are still a research preview.** The README says they are. Not
  re-checked against the current spec.
- **The umbrella's page half** — `public/index.html` and `README.md` in plotplot-ai
  still need the bed card, the `--pp-pollen` var, the footer row and the "six tools,
  one garden" heading. The `.brand/` half is already merged upstream.
