# Brand Colors — plotplot

The palette is a living garden on warm, sunlit paper: deep-brown ink, vibrant
growth green, deep forest, and sunlight gold — with a smattering of blooms.
Vibrant, but always legible. Every text pair below is measured; sunlight, leaf,
petal, and muted are display/decorative colors — never body text on paper.

## Primary Palette

| Role | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary — growth green | #357E2C | rgb(53,126,44) | Primary actions, links, buttons, selected states. Vibrant growth green, legible as text on paper (4.6:1). |
| Primary (deep) | #2C6B2A | rgb(44,107,42) | Hover / pressed — one step deeper into the leaf. |
| Forest green | #214A2C | rgb(33,74,44) | Depth: dark sections, secondary buttons, footer. Cream reads on it (9.3:1). |
| Sunlight | #E89227 | rgb(232,146,39) | The warm accent — CTA fills (ink text), highlights, underlines, marks. Display/fill only; never body text on paper (2.3:1). |
| Leaf (vibrant) | #4A9E3F | rgb(74,158,63) | Decorative only — marks and illustration fills. Never text (3.1:1). |

## Paper & Ink

| Role | Hex | RGB | Usage |
|------|-----|-----|-------|
| Ink — deep brown | #3A2718 | rgb(58,39,24) | Headings and body — warm deep brown (13:1 on paper). |
| Text (soft) | #786148 | rgb(120,97,72) | Secondary prose, captions, annotations (5.4:1). |
| Amber-ink | #A86518 | rgb(168,101,24) | Sunlight as a word — amber kickers and labels where text must read (4.3:1, labels). |
| Paper | #FAF5E9 | rgb(250,245,233) | Page background — warm sunlit cream. |
| Band | #F2EAD6 | rgb(242,234,214) | Alternating section band for vertical rhythm. |
| Surface | #F5EEDD | rgb(245,238,221) | Cards, panels, grouped content. |
| Artifact paper | #FCFAF2 | rgb(252,250,242) | Lighter long-read paper for document / polyglot surfaces (e.g. tend) — higher luminance for extended reading. |
| Border | #E2D8C0 | rgb(226,216,192) | Dividers, card and input borders, hairline rules. |

## Semantic Roles

| Role | Hex | Usage |
|------|-----|-------|
| Healthy / verified | #46913C | Confirmed actions, healthy status, successful checks. |
| Caution / in progress | #B0741C | Caution, incomplete setup, review-needed signals. |
| Error / failed | #BC4126 | Destructive actions, validation errors, failed checks. |
| Info / neutral | #3F7186 | Informational notices, source notes, system guidance. |
| Muted / disabled | #9A8C72 | Placeholder, disabled, not-yet-defined. Decorative on paper (3.0:1) — readable secondary copy uses Text (soft). |

## Product Accents

Each tool in the garden claims one accent; the primary palette is shared across all of them. `/petals check` warns when one product's accent appears in another's UI.

| Product | Accent Hex | Role |
|---------|-----------|------|
| tilth | #4E88A6 | code intelligence — sky |
| tend | #D6502F | feature mapping & narration — poppy |
| petals | #E588A0 | brand intelligence for agents — petal |
| pleach | #97539B | the conductor — plum |
| umbel | #E89227 | fan out agent CLIs — sunlight |
| copeca | #1F8A7B | cost-per-correct benchmarking — juniper |
| pollen | #C8B330 | agent-to-agent messaging — anther gold |

pollen's bloom is **display/fill only** on paper (1.9:1) — the same class as sunlight and
petal. Where the gold must read as a *word* on paper, use **pollen-ink `#7E6A08`** (4.9:1),
exactly as sunlight uses amber-ink. On soil-night the bloom brightens to `#D9C44A`.

## Contrast Pairings

Color is only on-brand when it is legible. Classes: **reading** ≥ 4.5:1 (body, captions) · **labels & display** ≥ 3.0:1 (kickers, tags, type ≥ 24px) · **decorative** exempt (marks, washes, fills — never words). Measured WCAG 2.x; regenerate with `scripts/palette_contrast.py`.

| Foreground on background | Ratio | Class |
|---|---|---|
| Ink #3A2718 on Paper #FAF5E9 | 13.0 | reading |
| Ink #3A2718 on Surface #F5EEDD | 12.2 | reading |
| Ink #3A2718 on Band #F2EAD6 | 11.8 | reading |
| Text-soft #786148 on Paper #FAF5E9 | 5.4 | reading |
| Growth #357E2C on Paper #FAF5E9 | 4.6 | reading |
| Paper #FAF5E9 on Growth #357E2C | 4.6 | reading |
| Growth-deep #2C6B2A on Paper #FAF5E9 | 6.0 | reading |
| Forest #214A2C on Paper #FAF5E9 | 9.3 | reading |
| Paper #FAF5E9 on Forest #214A2C | 9.3 | reading |
| Ink #3A2718 on Sunlight #E89227 | 5.8 | reading |
| Sunlight #E89227 on Paper #FAF5E9 | 2.3 | decorative |
| Amber-ink #A86518 on Paper #FAF5E9 | 4.3 | labels |
| Leaf #4A9E3F on Paper #FAF5E9 | 3.1 | decorative |
| Healthy #46913C on Surface #F5EEDD | 3.4 | labels |
| Caution #B0741C on Paper #FAF5E9 | 3.6 | labels |
| Error #BC4126 on Paper #FAF5E9 | 4.9 | reading |
| Info #3F7186 on Paper #FAF5E9 | 4.9 | labels |
| Muted #9A8C72 on Paper #FAF5E9 | 3.0 | decorative |
| Poppy #D6502F on Paper #FAF5E9 | 3.8 | labels |
| Sky #4E88A6 on Paper #FAF5E9 | 3.6 | labels |
| Plum #97539B on Paper #FAF5E9 | 4.8 | labels |
| Petal #E588A0 on Paper #FAF5E9 | 2.3 | decorative |
| Juniper #1F8A7B on Paper #FAF5E9 | 3.9 | labels |
| Pollen #C8B330 on Paper #FAF5E9 | 1.9 | decorative |
| Ink #3A2718 on Pollen #C8B330 | 6.7 | reading |
| Pollen-ink #7E6A08 on Paper #FAF5E9 | 4.9 | reading |
| Night-text #F3ECD9 on Night #1C1610 | 15.2 | reading |
| Night-soft #C9BBA0 on Night #1C1610 | 9.5 | reading |
| Night-green #84C56A on Night #1C1610 | 8.7 | reading |
| Night-sun #F2A93B on Night #1C1610 | 9.0 | reading |
| Night-leaf #9FD08A on Night #1C1610 | 10.1 | reading |
| Night-pollen #D9C44A on Night #1C1610 | 10.2 | reading |

Pairs that fail their class are off-brand even though both colors are in the palette. Decorative-only traps: Sunlight, Leaf, Petal, Pollen, and Muted as words on paper.

## Data Visualization

Charts draw from the family — never library defaults.

- Categorical, in order: Growth #357E2C · Sunlight #E89227 · Sky #4E88A6 · Poppy #D6502F · Plum #97539B · Forest #214A2C
- Sequential ramp (leaf family): #214A2C → #357E2C → #84C56A
- Diverging: Growth #357E2C ↔ Poppy #D6502F through Border #E2D8C0
- Gridlines: Border #E2D8C0 · axis labels: Text (soft) #786148

## Light / Dark Mode Variants

| Role | Light | Dark |
|------|-------|------|
| Primary | #357E2C | #84C56A |
| Accent (sunlight) | #E89227 | #F2A93B |
| Background | #FAF5E9 | #1C1610 |
| Band | #F2EAD6 | #211A12 |
| Text | #3A2718 | #F3ECD9 |
| Text (soft) | #786148 | #C9BBA0 |
| Surface | #F5EEDD | #262019 |
| Border | #E2D8C0 | #403628 |
| Leaf | #4A9E3F | #9FD08A |
| Pollen (bloom) | #C8B330 | #D9C44A |

## Soil-Night Surfaces

Dark mode is "soil at night," not a harsh developer theme. Embedded terminal panes (the landing-page demos) run the deepest soil so the warm paper reads above them.

| Role | Hex | Usage |
|------|-----|-------|
| Terminal background | #1C1610 | Deep soil behind terminal text (15:1 for text). |
| Terminal surface | #262019 | Titlebar / chrome inside the pane. |
| Terminal border | #403628 | Pane and titlebar dividers. |
| Terminal green | #84C56A | Command / OK lines (8.7:1). |
| Terminal sunlight | #F2A93B | In-pane highlights (9.0:1). |
| Terminal text | #F3ECD9 | Default terminal text (15:1). |

## CSS Custom Properties

```css
:root {
  /* shared family palette */
  --pp-primary:      #357E2C;  /* vibrant growth green */
  --pp-primary-deep: #2C6B2A;  /* hover / pressed */
  --pp-leaf:         #4A9E3F;  /* decorative vibrant leaf — marks only */
  --pp-forest:       #214A2C;  /* deep green — depth, sections */
  --pp-accent:       #E89227;  /* sunlight — fills, highlights (ink text) */
  --pp-amber-ink:    #A86518;  /* amber as a word — labels */

  --pp-text:      #3A2718;     /* deep-brown ink — headings + body */
  --pp-text-soft: #786148;
  --pp-bg:        #FAF5E9;     /* warm sunlit paper */
  --pp-bg-band:   #F2EAD6;
  --pp-bg-artifact:#FCFAF2;
  --pp-surface:   #F5EEDD;
  --pp-border:    #E2D8C0;

  /* semantic */
  --pp-healthy: #46913C;
  --pp-caution: #B0741C;
  --pp-error:   #BC4126;
  --pp-info:    #3F7186;
  --pp-muted:   #9A8C72;

  /* product accents / blooms */
  --pp-tilth:  #4E88A6;
  --pp-tend:   #D6502F;
  --pp-petals: #E588A0;
  --pp-pleach: #97539B;
  --pp-umbel:  #E89227;
  --pp-copeca: #1F8A7B;
  --pp-pollen: #C8B330;

  /* the bloom as a word — pollen's amber-ink */
  --pp-pollen-ink: #7E6A08;

  /* soil-night terminal */
  --pp-term-bg:      #1C1610;
  --pp-term-surface: #262019;
  --pp-term-border:  #403628;
  --pp-term-green:   #84C56A;
  --pp-term-sun:     #F2A93B;
  --pp-term-text:    #F3ECD9;
}

[data-theme="dark"] {
  --pp-primary:   #84C56A;
  --pp-accent:    #F2A93B;
  --pp-leaf:      #9FD08A;
  --pp-text:      #F3ECD9;
  --pp-text-soft: #C9BBA0;
  --pp-bg:        #1C1610;
  --pp-surface:   #262019;
  --pp-border:    #403628;
  --pp-pollen:     #D9C44A;
  --pp-pollen-ink: #D9C44A;
}
```
