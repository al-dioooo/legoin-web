# Design System: Legoin

Legoin uses the [ballers-addict](https://github.com/al-dioooo/ballers-addict) style in LEGO colors: warm paper, ink outlines, hard comic shadows, die-cut stickers, film grain and marquee tape. LEGO Red marks actions and LEGO Yellow marks highlights. The user's own bricks are the only other color on screen.

- Live reference: `/en/desain` (`src/app/[lang]/desain/page.tsx`)
- Tokens: `src/app/tokens.css`, the only file with literal colors
- Decision record: [ADR-0003](https://github.com/al-dioooo/legoin-docs/blob/main/decisions/0003-ballers-style-lego-colors.md)
- The 8 options compared (4 font pairings × 2 palettes) were rendered as previews; this is option C with LEGO colors.

## Color

Tokens come in three layers: primitive scales, semantic roles, and a Tailwind bridge. Tailwind's default palette is removed, so only role utilities exist. The scales are OKLCH ramps built around exact LEGO colors (Rebrickable values): `red-600` is LEGO Red, `yellow-300` LEGO Yellow, `green-700` LEGO Green, `neutral-400` Light Bluish Gray and `neutral-950` LEGO Black. `--paper` (#fbf8f1) comes from ballers-addict.

| Role | Utilities | Use |
| --- | --- | --- |
| primary (LEGO Red) | `bg-primary`, `text-primary-foreground` | The main action. One per screen. |
| highlight (LEGO Yellow) | `bg-highlight`, `text-highlight-foreground` | Stickers, step numbers, active items, difficulty. Text on it is always ink. |
| ink (LEGO Black) | `text-ink`, `border-ink` | Text, every outline, hard shadows, focus ring |
| ink-secondary | `text-ink-secondary` | Supporting text, at least 6:1 on paper and white |
| page, card | `bg-page`, `bg-card` | Paper page; white panels and cards |
| success, warning, danger | `bg-success-subtle`, `bg-warning-subtle`, `bg-danger-subtle` | Badge fills, always with ink text and outline |
| overlay | `border-overlay`, `bg-overlay`, `outline-overlay-halo` | Detection boxes and labels on photos |

### Rules

- **Brick colors are data.** `--brick-*` paints a real brick only (`BrickGlyph`, `BrickSwatch`, `InventoryList`), and the color name is always nearby.
- **Red means act.** Use it for primary actions only. Destructive actions use the outlined `danger` button plus a confirmation, never a red fill. Detection boxes are ink, never red, because red is also a brick color.
- **Yellow is never text.** Put ink on yellow.
- **Status is a dot plus a label**, never color alone.
- **No grain on photos or inventories.** People judge brick colors there. Grain belongs on marketing surfaces such as the home hero.
- **Stay clear of LEGO's own branding.** The logo is a yellow 2×2 brick in ink line art with no red, so red and yellow never meet in the logo.
- Every text pair meets WCAG AA (4.5:1). White on LEGO Red is 5.8:1 and ink on LEGO Yellow is 12.1:1.

## Type

- **Dela Gothic One** for display: page titles, card titles, the wordmark and marquee tape. It has one weight, so never add `font-bold` to it. Use `font-display text-display` for heroes, `font-display text-3xl` for page titles and `font-display text-xl` for card titles.
- **DM Sans** for everything readable: body text at 16px, `font-semibold` for buttons and labels.
- **JetBrains Mono** for counts (`2×`), part ids (`3001`), confidence (`0.94`) and small uppercase labels with wide tracking.

## Language

- English is the default (`/en`); Indonesian ships too (`/id`). Paths without a language redirect to `/en`.
- All copy lives in `src/i18n/dictionaries`. `en.ts` defines the shape and `id.ts` is typed against it, so a missing key fails the typecheck. Never hard-code copy in a component.
- Dictionaries are plain data: placeholders like `{count}` are filled with `fill()`, and counts use `{ one, other }` with `plural()`, so they can be passed to Client Components.
- Brick color names and numbers follow the language: pass `locale` to `BrickSwatch`, `InventoryList`, `PartCallout`, `formatConfidence` and `describePart` (0.94 in English, 0,94 in Indonesian).
- Part names (Brick 2×4, Plate 1×2) stay in the hobby's English in both languages.
- Keep copy short and plain in both languages, and use sentence case.

## Shape and depth

- **Outlines:** cards, buttons, inputs and part boxes use 2.5px ink; badges and tiles use 2px. Missing parts get a dashed 2px frame.
- **Hard shadows** are solid ink, offset down and right, with no blur: `shadow-sticker` (3px), `shadow-button` (4px), `shadow-card` (5px), `shadow-raised` (8px).
- **Radius:** cards `rounded-card` (22px), boxes and inputs `rounded-callout` / `rounded-control` (14px), buttons and badges fully round.
- **Tap targets** are at least 48px (`Button` size `md`).

## Motion

- **Easing:** `ease-spring` and `ease-out-expo` from ballers-addict.
- **Buttons** tilt slightly on hover; filled buttons press into their shadow on click.
- **Marquee tape** slides at 40s per loop.
- **Grain** boils in steps.
- **Reduced motion:** under `prefers-reduced-motion` the marquee and grain stop, and transitions become instant.

## Components

UI primitives live in `src/components/ui`, the logo in `src/components/brand`.

| Component | Use |
| --- | --- |
| `Button`, `buttonStyles` | `primary`, `secondary`, `highlight`, `ghost`, `danger`; sizes `md` (48px) and `sm`. Use `buttonStyles` on a `Link`. |
| `Badge` | Status with a dot: `neutral`, `success`, `warning`, `danger`, `highlight` |
| `Card` | Die-cut panel with an ink outline and hard shadow |
| `Sticker` | Highlights one word inline: `highlight`, `primary`, `paper` |
| `Marquee` | Scrolling tape band: `ink`, `primary`, `highlight`; the looping copy is hidden from screen readers |
| `Grain` | Film grain over its `relative` parent, for marketing surfaces only |
| `Select` | Native select inside its label, for label correction |
| `BrickGlyph` | A part drawn from above. Decorative, so label it nearby. |
| `BrickSwatch` | Brick color chip with its name |
| `InventoryList` | Inventory tiles: color chip, count, part and color name |
| `PartCallout` | Parts box with counts; `missing` gives a dashed frame, `detailed` adds names |
| `StepNumber` | Numbered step as a yellow sticker |
| `DetectionBox`, `DetectedPhoto` | Detected pieces over a scan photo, in 0–1 fractions of the image |
| `Logo`, `LogoMark` | Wordmark with mark, or the mark alone with a `title` |
| `LanguageSwitcher` | EN/ID pill in the header that keeps the current page (`src/components`) |

The brick catalogue lives in `src/lib/bricks.ts`. To add a color, add `--brick-<id>` to `tokens.css` and an entry to `BRICK_COLORS`; a test checks that the two match.

The sample scan in `src/lib/sample-scan.ts` and `public/contoh/kepingan.jpg` feeds the home page and `/desain` until the CV pipeline exists. The photo was generated with Codex image generation; replace it with a real scan when one is available.

## Accessibility

- WCAG 2.2 AA, with an ink focus ring on every control and reduced motion respected.
- Glyphs, swatches and decorative SVGs are `aria-hidden`, with text beside them or in `sr-only`. A part callout announces each line as "2× Brick 2×4 red".
- Layouts work from 360px wide with no horizontal scroll.

## Extending the system

New components go in `src/components/ui`, read roles only (never scales or hex), and get a section on `/desain`. A new role goes in all three token layers, and needs an ADR if it changes what a color means.
