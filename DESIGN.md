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

## Motion & interaction

Legoin works like a building-instructions booklet laid on a baseplate: screens assemble step by step, and every piece clicks into place. One motion carries it, defined once as tokens and reused for entrances, presses and selection. Live reference: `/en/desain/gerak` (`src/app/[lang]/desain/gerak/page.tsx`), with a switch that previews reduced motion. Decision record: [ADR-0006](https://github.com/al-dioooo/legoin-docs/blob/main/decisions/0006-motion-and-interaction-language.md).

### Baseplate layout

- **One baseplate under every page.** The `[lang]` root layout draws `.baseplate` and the pointer glow once, around everything but the footer; pages, layouts and showcases never draw their own (a test checks). `global-error.tsx` replaces the root layout, so it draws the grid itself, without the glow.
- **The stud is the module.** `--stud` is 16px on phones and 24px from 640px; `p-stud`, `gap-stud`, `mt-stud` and `-ml-stud` use it. The app column is 49 studs wide (`max-w-(--plate-width)`), and `.baseplate` starts its grid at the column's left edge, so plates sit between studs.
- **Booklet pages, not stacked cards.** Each step is asymmetric: the title and main plate on the left, supporting plates down the right, overlapping by a stud or two. Overlaps cover a plate's padding, never a photo.
- **Sticker headings** sit a couple of degrees off-axis (`<Sticker className="-rotate-2">`), alternating direction down a page.
- **Step numerals:** the current step's number, outlined and filled with studs, hangs off the right edge (`StepNumeral`). It's decorative; the step progress names the step.

### The click-in

A piece drops onto the studs, squashes a little on impact and settles.

| Token | Value | Use |
| --- | --- | --- |
| `--duration-click` | 420ms | Click-in entrance |
| `--duration-press` / `--duration-release` | 80ms / 280ms | Button press and spring back |
| `--duration-lift` | 260ms | Selection lift |
| `--duration-exit` | 200ms | Pop-off; exits are faster than entrances |
| `--duration-morph` | 440ms | Shared photo and step marker between steps |
| `--duration-tick` | 900ms | Odometer roll |
| `--stagger-step` | 55ms | Between siblings, 8 steps at most |
| `--click-drop`, `--click-squash-x/-y` | 0.75rem, 1.04 / 0.92 | Drop distance and impact squash |
| `--lift-x`, `--lift-y`, `--lift-tilt` | 0.25rem, 0.375rem, -1.5deg | Selected pieces |
| `--ease-drop`, `--ease-settle`, `--ease-press` | curves | Fall, settle with a small overshoot, press |

- **Entrances:** `.click-in` on one element (set `--i` to stagger it), or `.assemble` on a parent so its children click in one after another.
- **Presses:** every `Button` uses `.press`. Filled buttons sink exactly into their 4px hard shadow; outlined ones nudge 1px. The ADR-0003 hover tilt stays, for mice and full motion only.
- **Selection:** a selected detection box lifts and tilts, leaving a dotted stud footprint; its inventory tile turns yellow and slides out like a part callout; the selected-piece panel clicks in fresh.
- **Removal and undo:** a removed piece pops off (`.pop-off`) while the change saves; undo clicks it back.
- **Counts** roll like an odometer (`Count`, `Odometer`), up from 0 when they appear and to the new value when they change.

### The scan

- **Scanner:** a beam sweeps the photo and lights the studs in its wake (`ScannerSweep`). Two layers move by transforms in opposite directions, so nothing repaints per frame.
- **Results:** boxes and inventory tiles click in one by one while the piece count rolls up.
- **Failure:** a small build wobbles and tumbles apart (`PiecesApart`).
- **Between steps:** the photo is one shared element (`SharedPhoto`, React `<ViewTransition>`), morphing from the preview to the scanner to the results, and the yellow step marker slides to the next step. The page itself only fades.
- Replay any of it with `?mockDelay=3000` (slower stages) or `?mock=fail-too_dark` (and the other failure reasons) on `/scan`.

### Pointer and touch

- **Stud glow:** with a mouse, studs near the pointer light up (`StudGlow`): a lens ten studs across follows the pointer by transform, once per frame, under the plates. Off on touch screens and under reduced motion.
- **Magnetic button:** one primary action per screen at most leans toward a nearby pointer (`useMagnetic`); today that's **Scan pieces**.
- **Haptics:** on phones, selecting a piece and undoing a removal give an 8ms vibration where the browser supports it.

### Rules

- Animate `transform` and `opacity`, plus `clip-path` and `filter` where cheap. Never animate layout, and never block input: view transitions let clicks through.
- Loops stop when they aren't needed: the scanner runs only during a scan, and demo loops only while on screen.
- **Reduced motion** keeps every fade and state change and drops the travel: the tokens set distances, tilts and stagger to zero, so click-ins become short fades; selection still shows its footprint; counts change at once; the scanner beam, pointer glow, magnet and haptics are off; view transitions swap instantly. Preview it on a subtree with `data-motion="reduce"` and `MotionPreview`.
- Motion primitives live in `src/components/motion`, the helpers in `src/lib/motion.ts`, the tokens in `tokens.css` and the keyframes in `globals.css`.

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
| `EmptyState`, `EmptyStateIcon` | Nothing to show, not found, or an error: the scanner frame on a sticker tile (`highlight` or `danger`), a title, a short body and the way forward. `as="h1"` when it is the whole page, as on the not-found and error pages. |
| `DetectionBox`, `DetectedPhoto` | Detected pieces over a scan photo, in 0–1 fractions of the image |
| `Logo`, `LogoMark` | Wordmark with mark, or the mark alone with a `title` |
| `LanguageSwitcher` | EN/ID pill in the header that keeps the current page (`src/components`) |
| `SiteFooter` | Footer on every page: team, the CC BY 4.0 dataset credit, the AI-photo and LEGO trademark notes (`src/components`, credits in `src/lib/credits.ts`) |
| `ThemePicker` | Theme radio group of native radios: `cards` for the first choice, `compact` pills to switch theme in place (`src/components/ideas`) |
| `IdeaCard` | One build idea in a list: difficulty, pieces used and missing (or "Uses only your pieces"), and a link to its steps (`src/components/ideas`) |
| `IdeaDetail` | One idea in full, laid out as a booklet page: parts used, a "What you're missing" summary whose counts add up, numbered steps that click in, and links to the ideas beside it (`src/components/ideas`) |
| `ScanRow` | One past scan in history: photo, date, piece count and last theme; the card opens the scan (`src/components/history`) |
| `ConfirmDelete` | `danger` button that asks in place before deleting, with focus on "Keep it"; Escape backs out (`src/components/history`) |

The brick catalogue lives in `src/lib/bricks.ts`. To add a color, add `--brick-<id>` to `tokens.css` and an entry to `BRICK_COLORS`; a test checks that the two match.

The sample scan in `src/lib/sample-scan.ts` and `public/contoh/kepingan.jpg` feeds the home page and `/desain` until the CV pipeline exists. The photo was generated with Codex image generation; replace it with a real scan when one is available.

## Accessibility

- WCAG 2.2 AA, with an ink focus ring on every control and reduced motion respected.
- Glyphs, swatches and decorative SVGs are `aria-hidden`, with text beside them or in `sr-only`. A part callout announces each line as "2× Brick 2×4 red".
- Layouts work from 360px wide with no horizontal scroll.

## Extending the system

New components go in `src/components/ui`, read roles only (never scales or hex), and get a section on `/desain`. A new role goes in all three token layers, and needs an ADR if it changes what a color means.
