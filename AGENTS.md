<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Rules for anyone changing this repository, people and coding agents alike. They summarize the team guidelines in [legoin-docs/guidelines](https://github.com/al-dioooo/legoin-docs/tree/main/guidelines); when the two disagree, the guidelines win.

## Stack and commands

Next.js 16 App Router under `src/app`, TypeScript, Tailwind CSS 4, with Cache Components and the React Compiler enabled. Biome lints and formats; Vitest with Testing Library runs the tests. Use pnpm only.

- `pnpm dev` starts the dev server.
- `pnpm lint` runs Biome; `pnpm format` writes formatting fixes.
- `pnpm typecheck` generates route types, then runs `tsc --noEmit`.
- `pnpm test` runs Vitest once; `pnpm test:watch` keeps it running.
- `pnpm build` makes a production build.

Vitest cannot render `async` Server Components, so test them end to end or test the logic they call.

## UI

Follow [DESIGN.md](DESIGN.md) and check `/desain` before building a screen. Use the role utilities (`bg-primary`, `text-ink`, `bg-callout`, ...); Tailwind's default palette is disabled, and literal colors belong only in `src/app/tokens.css`. Brick colors (`--brick-*`) paint real bricks only, always with the color name. Use one red primary button per screen; destructive actions use the `danger` outline. Status is a dot plus a label. UI copy is in Bahasa Indonesia.

## Commits

Small and focused: one logical change, roughly 5 to 100 lines, explainable in one sentence and easy to revert. Commit when a function, a fix or a logical step is done; if you pause work, you should be able to commit. Never mix a refactor with a feature, or a fix with formatting. No 1000+ line commits, no WIP commits on shared branches, and no vague messages like "update code" or "fix bugs".

**Before committing.** `pnpm lint`, `pnpm typecheck` and `pnpm test` pass, new features come with tests, and the change works locally.

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
