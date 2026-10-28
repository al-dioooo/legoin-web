# Design System: Legoin

Direction **"Buku instruksi"**: the app reads like a LEGO building-instruction booklet. White pages on a pale cool-gray table, parts drawn from above in callout boxes with their counts, and numbered steps. The user's own bricks bring the color; the interface stays ink, gray and white with two LEGO accents.

- Live reference: `/desain` (`src/app/desain/page.tsx`)
- Tokens: `src/app/tokens.css`, the only file with literal colors
- Decision record: [ADR-0002](https://github.com/al-dioooo/legoin-docs/blob/main/decisions/0002-visual-direction.md)

## Color

Tokens come in three layers: primitive scales, semantic roles, and a Tailwind bridge. Tailwind's default palette is removed, so only role utilities exist. The scales are OKLCH ramps built around exact LEGO colors (Rebrickable values): `red-600` is LEGO Red, `yellow-300` LEGO Yellow, `green-700` LEGO Green, `neutral-400` Light Bluish Gray and `neutral-950` LEGO Black.

| Role | Utilities | Use |
| --- | --- | --- |
| primary (LEGO Red) | `bg-primary`, `text-primary-foreground`, `hover:bg-primary-hover` | The main action. One per screen. |
| highlight (LEGO Yellow) | `bg-highlight`, `text-highlight-foreground` | Difficulty, selected or active items. Text on it is always ink. |
| ink (LEGO Black) | `text-ink`, `border-ink` | Text, line art, step numbers, focus ring |
| ink-secondary | `text-ink-secondary` | Supporting text, at least 6:1 on every surface |
| page, card, callout | `bg-page`, `bg-card`, `bg-callout` | Table, booklet page, parts box |
| line, line-strong | `border-line`, `border-line-strong` | Dividers; inputs and missing-part frames (3:1 or more) |
| success, warning, danger | `bg-success-subtle`, `text-warning-subtle-foreground`, ... | Status badges |
| overlay | `border-overlay`, `bg-overlay`, `outline-overlay-halo` | Detection boxes and labels on photos |

### Rules

- **Brick colors are data.** `--brick-*` paints a real brick only (`BrickGlyph`, `BrickSwatch`), and the color name is always nearby.
- **Red means act.** Use it for primary actions only. Destructive actions use the outlined `danger` button plus a confirmation, never a red fill. Detection boxes are ink, never red, because red is also a brick color.
- **Yellow is never text.** Put ink on yellow, or use the 800 or 900 steps on a yellow tint.
- **Status is a dot plus a label**, never color alone.
- **Stay clear of LEGO's own branding.** Never put red and yellow together in the logo or large brand areas, and never use a red square with white lettering. The logo is a yellow 2×2 brick in ink line art.
- Every text pair meets WCAG AA (4.5:1); the values were checked when the scales were generated.

## Type

- **Plus Jakarta Sans** for everything. Headings are 800 with tight tracking: `text-display` for heroes, `text-3xl font-extrabold tracking-tight` for page titles, `text-xl font-bold` for sections. Body is 16px.
- **JetBrains Mono** for counts (`2×`), part ids (`3001`) and confidence scores (`0,94`).
- UI copy is Bahasa Indonesia: short and plain, with decimal commas.

## Shape

- Radius: cards `rounded-card` (16px), parts boxes `rounded-callout` (12px), inputs `rounded-control` (12px), buttons and badges fully round.
- Borders are 1px `line`; secondary buttons use 1.5px ink; missing parts use a 2px dashed `line-strong` frame.
- Almost no shadow: `shadow-card` at most.
- Tap targets are at least 48px (`Button` size `md`).

## Components

UI primitives live in `src/components/ui`, the logo in `src/components/brand`.

| Component | Use |
| --- | --- |
| `Button`, `buttonStyles` | `primary`, `secondary`, `highlight`, `ghost`, `danger`; sizes `md` (48px) and `sm`. Use `buttonStyles` on a `Link`. |
| `Badge` | Status with a dot: `neutral`, `success`, `warning`, `danger`, `highlight` |
| `Card` | Booklet page surface |
| `Select` | Native select inside its label, for label correction |
| `BrickGlyph` | A part drawn from above. Decorative, so label it nearby. |
| `BrickSwatch` | Brick color chip with its name |
| `PartCallout` | Parts box with counts; `missing` gives a dashed frame, `detailed` adds names |
| `StepNumber` | Numbered step |
| `DetectionBox` | A detected piece over a photo, in 0–1 fractions of the image |
| `Logo`, `LogoMark` | Wordmark with mark, or the mark alone with a `title` |

The brick catalogue lives in `src/lib/bricks.ts`. To add a color, add `--brick-<id>` to `tokens.css` and an entry to `BRICK_COLORS`; a test checks that the two match.

## Accessibility

- WCAG 2.2 AA, with an ink focus ring on every control and reduced motion respected.
- Glyphs and icons are `aria-hidden`, with text beside them or in `sr-only`. A part callout announces each line as "2× Brick 2×4 merah".
- Layouts work from 360px wide with no horizontal scroll.

## Extending the system

New components go in `src/components/ui`, read roles only (never scales or hex), and get a section on `/desain`. A new role goes in all three token layers, and needs an ADR if it changes what a color means.
