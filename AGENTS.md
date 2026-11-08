<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Rules for anyone changing this repository, people and coding agents alike. They summarize the team guidelines in [legoin-docs/guidelines](https://github.com/al-dioooo/legoin-docs/tree/main/guidelines); when the two disagree, the guidelines win.

## Stack and commands

Next.js 16 App Router under `src/app`, TypeScript, Tailwind CSS 4, with Cache Components and the React Compiler enabled. Biome lints and formats; Vitest with Testing Library runs the tests, and Playwright runs a smoke suite end to end. Use pnpm only.

- `pnpm dev` starts the dev server.
- `pnpm lint` runs Biome; `pnpm format` writes formatting fixes.
- `pnpm typecheck` generates route types, then runs `tsc --noEmit`.
- `pnpm test` runs Vitest once; `pnpm test:watch` keeps it running.
- `pnpm test:e2e` builds, serves on port 3100 and runs the Playwright specs in `e2e/`.
- `pnpm build` makes a production build.

Vitest cannot render `async` Server Components, so test them end to end or test the logic they call.

**End-to-end tests** ([ADR-0007](https://github.com/al-dioooo/legoin-docs/blob/main/decisions/0007-end-to-end-smoke-tests.md)) are a smoke suite on Chromium, at 360px and 1280px, against a production build. Vitest stays the main safety net: add a spec only for what needs a real browser and build, such as several pages, storage across navigations, layouts or status codes. Find elements by role, name and label, with names from the dictionaries (`e2e/support.ts`), never by CSS or test id; if an element has no usable role and name, fix the markup. Open pages with `?mockDelay=0`, and wait with assertions, never fixed timeouts. Each test starts from empty storage. In CI a test that passes only on its retry fails the run, so fix a flaky test or mark it `test.fixme()` with an issue.

## UI

Follow [DESIGN.md](DESIGN.md) and check `/en/desain` before building a screen. The style is ballers-addict in LEGO colors: ink outlines, hard shadows, stickers, Dela Gothic One headings (one weight, never bold) and DM Sans text. Use the role utilities (`bg-primary`, `text-ink`, `border-ink`, `shadow-card`, ...); Tailwind's default palette is disabled, and literal colors belong only in `src/app/tokens.css`. Brick colors (`--brick-*`) paint real bricks only, always with the color name. Use one red primary button per screen; destructive actions use the `danger` outline. Status is a dot plus a label. Keep grain off photos and inventories.

**Language.** English is the default (`/en`) and Indonesian ships too (`/id`). Every page lives under `src/app/[lang]`. All copy goes in `src/i18n/dictionaries`, in both `en.ts` and `id.ts`; never hard-code UI text in a component. Pages read copy with `getDictionary()` and the language with `currentLocale()`, and pass `locale` to components that show brick colors or numbers. Each page sets `alternates: languageAlternates("/its/path")` in its metadata, so `hreflang` points at the same page in the other language; a test checks this. On a route with an id, such as `scan/[id]/...`, `generateMetadata` awaits `params` to build that path and the page also renders `<UrlMetadataMarker />` from `src/i18n/url-metadata.tsx`: it tells Next the metadata waits for the request on purpose while the body stays a static shell. Without it, dev reports "URL data in `generateMetadata()`"; a test checks this too. Dictionaries hold plain strings only: write counts as `{ one, other }` templates and fill them with `plural()` and `fill()` from `src/i18n/format.ts`, so any part of a dictionary can be passed to a Client Component.

## Data

Screens read and write data only through the data layer, `@/lib/api`, typed by `src/lib/domain.ts`. Those types follow the API contract in [legoin-docs#7](https://github.com/al-dioooo/legoin-docs/issues/7), so swapping in the real API changes only `src/lib/api`. Nothing under `src/app` or `src/components` may import `@/lib/mock`; a test checks this.

- **Backend:** `NEXT_PUBLIC_API_URL` picks it in `src/lib/api/backend.ts`. Unset, it's the mock in `src/lib/mock`. There is no HTTP client yet, so setting it stops the app with an error.
- **Storage:** the mock keeps scans in `localStorage`, so it's browser only. Call the data layer from Client Components.
- **Demo conditions:** add `?mock=fail-<reason>` (`no_pieces`, `too_dark`, `too_blurry`, `network`) or `?mockDelay=0` to a URL. The data layer reads them for scanning and ideas; screens never handle them.
- **Inventory logic:** grouping, corrections and the used/missing split live in `src/lib/inventory.ts`. Keep that logic there, pure and tested, not in components.

## Commits

Small and focused: one logical change, roughly 5 to 100 lines, explainable in one sentence and easy to revert. Commit when a function, a fix or a logical step is done; if you pause work, you should be able to commit. Never mix a refactor with a feature, or a fix with formatting. No 1000+ line commits, no WIP commits on shared branches, and no vague messages like "update code" or "fix bugs".

**Before committing.** `pnpm lint`, `pnpm typecheck` and `pnpm test` pass, plus `pnpm test:e2e` when the change touches pages, navigation or the data layer. New features come with tests, and the change works locally.

**Messages.** [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): description`, scope optional, e.g. `feat(auth): add JWT refresh token`. Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`. Mark breaking changes with `!`, e.g. `feat(api)!: change response format`.

## Branches

Trunk-based. `main` is always release-ready; there is no `develop`, `staging` or `release` branch. Work on short-lived branches named for the change: `feature/<short-description>`, `fix/<bug-description>` or `chore/<maintenance>`, e.g. `feature/payment-integration`. Every change reaches `main` through a pull request; commit directly to `main` only for an emergency hotfix.

## Pull requests

Start from an issue and agree on the approach before building. One problem per PR, ideally under 500 lines; split larger work into several PRs, stacked when they depend on each other.

- The title carries the ticket id, e.g. `feat(auth): add JWT refresh token (#14)`, and the PR links the issue.
- Fill in [the PR template](.github/pull_request_template.md): summary, problem, solution, test evidence, deployment prerequisites or breaking changes, notes.
- Include tests and docs when applicable, screenshots or a recording for UI changes, and migration steps for breaking changes.
- Call out new environment variables or production config needed before deployment.

Merge only when CI passes, all discussions are resolved, required reviewers approve, and the commits follow the rules above.

## Docs

Keep the README sections current: overview, tech stack, setup and run, environment variables, deployment. Decisions are ADRs in [legoin-docs/decisions](https://github.com/al-dioooo/legoin-docs/tree/main/decisions), not in this repo.

## Secrets

Never commit `.env*` files, API keys, tokens, credentials or logs. Only `.env.example` is committed, with empty or sample values; add every new variable there and to the README.
