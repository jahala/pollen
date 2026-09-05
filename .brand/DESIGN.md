# plotplot Design System

## 1. Brand Foundation

| Field | Value |
|-------|-------|
| Name | plotplot |
| Tagline | Grow what matters. |
| Mission | Give the people building with AI a garden of small, sharp, well-made tools — and the good soil they grow in. |
| Vision | Building with AI that feels less like a gold rush and more like tending a garden: calm, crafted, and cumulative. |
| Category | Tools for building with AI — a garden of agent-era tools |
| Positioning | plotplot is a garden of small, sharp, composable tools for building with AI — code intelligence, orchestration, brand, and planning — that agents and humans share. |

plotplot is built around one belief: good work is grown, not rushed. The brand should feel like a well-kept garden — alive, warm, and legible — not a gold-rush dashboard.

## 2. Visual Principles

| Principle | Description |
|-----------|-------------|
| Alive, not sterile | The garden is in colour — vital greens, warm sunlight, a smattering of blooms. Vibrant, but always legible. |
| Playful, not childish | Character through Fraunces, botanical marks, and a little wit. Never cartoon, never hype, never meme. |
| A garden of beds | Show the family as a cultivated plot — each tool a bed with its own bloom. Composition and relationship over flat lists. |
| Honest about craft | The tools are files, skills, and terminals. Show real commands and real output; never a fake dashboard. |
| Calm motion | Things unfold and settle like leaves. Alive, not restless. |
| Make AI accountable | AI-generated output exposes its sources, confidence, and reasoning, with clear points for human review. |

## 3. Color System

The palette is a living garden on warm, sunlit paper: deep-brown ink (#3A2718) on warm paper (#FAF5E9), vibrant growth green (#357E2C) as primary, deep forest (#214A2C) for depth, and sunlight gold (#E89227) as the warm accent. A smattering of blooms — poppy, sky, plum, petal — gives each tool its own face. Sunlight, leaf, petal, and muted are display/decorative only — never body text on paper. Dark mode is "soil at night" (#1C1610), not a harsh developer theme. Full values and measured contrast live in `colors.md`.

## 4. Typography System

plotplot uses Google Fonts only. Headings and display use Fraunces — a warm, characterful serif with optical sizing and soft/wonk axes and lively italics; playful and elegant at once, the reason the brand reads as a garden rather than a dashboard. Body and interface use Hanken Grotesk for warm, friendly, legible precision. Code, kickers, and labels use JetBrains Mono — the builder/terminal voice.

The scale is editorial and confident: html base 18px; h1 is a fluid clamp(3.4rem, 6vw, 4.6rem); h2 2.4rem; h3 1.6rem; h4 1.25rem; body 1.0625rem at 1.65 line-height; display numerals 3.75rem. Full weights, line heights, and import URLs live in `typography.md`.

## 5. Spacing & Layout

All spacing uses a 4px grid: 4xs 4px, 3xs 8px, 2xs 12px, xs 16px, sm 24px, md 32px, lg 48px, xl 64px, 2xl 96px, 3xl 128px. Marketing sections breathe at the 96–128px end for vertical rhythm.

Layouts feel calm and readable: generous whitespace, quiet grids, clear section boundaries, one centered 1200px container. Avoid crowded dashboards, dense panels, decorative cards, and arbitrary spacing. Full values live in `layout.md`.

## 6. Component Foundations

Machine-readable surface tokens — radius scale, border strokes, shadow recipes, motion — live in `components.md`; this section carries the principles.

Buttons are restrained, direct, and legible. Primary buttons use growth green (#357E2C) with cream text. Sunlight (#E89227) with ink text is reserved for high-momentum actions such as install or launch. Forest (#214A2C) carries depth on paper and is the primary action inside dark sections. Destructive actions use error (#BC4126).

Inputs feel like warm archive fields: surface backgrounds, subtle borders, growth-green focus rings, plain labels. Cards group context rather than decorate it: surface backgrounds, hairline borders, a small product-accent marker, clear headings. Navigation uses product accents sparingly as section markers; labels stay lowercase: tilth, tend, petals, pleach, umbel, copeca.

Every page closes with the **garden footer**: a fixed forest band whose **garden row** links to every tool in the garden — one pill per product, each marked with its bloom, the current tool highlighted. Product pages add a **plotplot band** on top (mark + wordmark + a plotplot.ai link) so each one points back to the umbrella, not just its siblings. Structure and values live in `components.md`.

## 7. Iconography

Icons feel like botanical diagrams with character — sprouts, leaves, plots, nodes, roots, stems, coordinate marks — drawn in thin, lively linework. A plotplot sprout mark is welcome as the family motif. Avoid generic Material Design icons, sparkle/"AI" clichés, and heavy filled shapes. Icons clarify function first, then express the garden.

## 8. Illustration

Illustration is a playful garden: characterful botanical line-art, plotted beds, blooms, small growth scenes, and field notes. The feel is warm, witty, and a little hand-drawn; a recurring sprout/mascot motif is allowed. Keep it useful and literate — it can be playful without becoming precious. Avoid glossy gradients, stock 3D, and generic futuristic AI visuals.

## 9. Agent Prompt Guide

When generating UI or design output, follow these constraints:

1. **Colors:** use only the palette in `colors.md`, referenced by semantic role, not raw hex. Sunlight, leaf, petal, and muted are display/decorative — never body text.
2. **Typography:** apply the hierarchy in `typography.md`. Never introduce fonts outside Fraunces / Hanken Grotesk / JetBrains Mono.
3. **Components:** follow `components.md`. Reuse patterns before inventing new ones.
4. **Spacing:** adhere to the 4px scale in `layout.md`. Never use arbitrary pixel values.
5. **Elevation:** use the ink-tinted shadow recipes by level. Never pure-black shadows.
6. **Motion:** entrances unfold with `ease-petal`; honour `prefers-reduced-motion`; never bounce or confetti.
7. **Assets:** source marks and images from `.brand/assets/`. Never invent placeholder logos.
8. **Voice:** consult `voice.md` — calm, precise, literate, with a little wit — and never the forbidden words.
