# legoin-web

The Legoin web frontend. Product docs, team guidelines and decisions live in [legoin-docs](https://github.com/al-dioooo/legoin-docs).

## Tech stack

- [Next.js 16](https://nextjs.org) App Router with Cache Components and the React Compiler
- React 19 and TypeScript
- Tailwind CSS 4
- [Biome](https://biomejs.dev) for linting and formatting
- [Vitest](https://vitest.dev) and Testing Library for tests
- [Playwright](https://playwright.dev) for end-to-end smoke tests, on Chromium
- English (default) and Indonesian UI, served under `/en` and `/id`
- pnpm

## Setup and run

Requires Node.js 22 or newer and pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000>. It redirects to the English site at `/en`; the Indonesian one is at `/id`.

The end-to-end tests need Chromium once: `pnpm exec playwright install chromium` (add `--with-deps` on a fresh Linux machine).

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Biome lint and format check |
| `pnpm format` | Apply Biome formatting |
| `pnpm typecheck` | Generate route types and run `tsc --noEmit` |
| `pnpm test` | Run Vitest once (`pnpm test:watch` to watch) |
| `pnpm test:e2e` | Build, serve on port 3100 and run the Playwright smoke tests in `e2e/` |

## Environment variables

Put every variable in `.env.example` too.

| Variable | Required | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | No | Base URL of the Legoin API. Leave it empty to use the mock backend, which keeps scans in the browser's `localStorage`. There is no HTTP client yet, so any value fails `pnpm build`, and the data screens in `pnpm dev`, with an error naming the variable. Next.js inlines it into the browser bundle at build time. |

Without a backend, demo conditions go in the page URL: `?mock=fail-<reason>` (`no_pieces`, `too_dark`, `too_blurry` or `network`) makes scanning or ideas fail, and `?mockDelay=<ms>` sets their pace (`0` skips the wait).

## Deployment

[Vercel](https://vercel.com) builds the app through its GitHub integration. There's no Vercel config in this repo; Vercel detects Next.js and pnpm by itself.

- **Production:** every push to `main` deploys to <https://legoin-web.vercel.app>, which is public.
- **Previews:** every pull request gets its own deployment, rebuilt on each push. The Vercel bot comments its link on the PR, and the commit gets a `Vercel` status. Previews sit behind Vercel's log-in, so open them with an account that has access to the project.
- **Backend:** both run on the mock backend, so scans live in each visitor's browser and the `?mock=` and `?mockDelay=` conditions work there too. Leave `NEXT_PUBLIC_API_URL` unset in the Vercel project until the API client exists, because any value fails the build.

## Contributing

Read [AGENTS.md](AGENTS.md) before opening a pull request. CI runs `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` on every pull request to `main`, and `pnpm test:e2e` in a second job. The PR merges only when both pass.
