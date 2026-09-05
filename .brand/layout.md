# Layout — plotplot

How elements relate: the spacing scale, containers, breakpoints, and density.
Surface (`components.md`) governs the finish of one element; layout governs the
space between elements. Type-only concerns stay in `typography.md`.

## Spacing Scale

All spacing — padding, margin, gap — comes from multiples of 4px:

| Token | Value | Usage |
|-------|-------|-------|
| 4xs | 4px | Tight icon padding |
| 3xs | 8px | Inline spacing |
| 2xs | 12px | Component inner |
| xs | 16px | Compact section |
| sm | 24px | Standard section |
| md | 32px | Major section |
| lg | 48px | Page sections |
| xl | 64px | Hero spacing |
| 2xl | 96px | Layout breaks |
| 3xl | 128px | Marketing breathing room |

Off-scale values are flagged with the closest valid step.

## Containers & Measure

| Token | Value | Usage |
|-------|-------|-------|
| container | 1200px max-width, centered | The one content container |
| gutter | 32px (md) | Container horizontal padding |
| measure-lede | 60–68ch | Section heads, ledes |
| measure-body | 44–54ch | Body prose columns |

## Breakpoints

| Breakpoint | What changes |
|------------|--------------|
| 880px | Multi-column grids stack to one column; base font 17px |
| 520px | Dense strips stack; base font 16px |

New breakpoints are off-brand — adapt within these two.

## Density & Rhythm

- Marketing sections breathe at the 96–128px end of the scale.
- Within-section gaps stay smaller than section-to-section spacing — a head
  belongs to its content (head → body ≤ 64px when sections sit 96px apart).
- Hierarchy lives in the spacing itself: tight kicker → title (one thought),
  medium title → lede, generous lede → actions.
- Avoid crowded dashboards, dense panels, and arbitrary one-off gaps.
