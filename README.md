# legoin-web

The Legoin web frontend. Product docs, team guidelines and decisions live in [legoin-docs](https://github.com/al-dioooo/legoin-docs).

## Tech stack

- [Next.js 16](https://nextjs.org) App Router with Cache Components and the React Compiler
- React 19 and TypeScript
- Tailwind CSS 4
- [Biome](https://biomejs.dev) for linting and formatting
- [Vitest](https://vitest.dev) and Testing Library for tests
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

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Biome lint and format check |
| `pnpm format` | Apply Biome formatting |
| `pnpm typecheck` | Generate route types and run `tsc --noEmit` |
| `pnpm test` | Run Vitest once (`pnpm test:watch` to watch) |

## Environment variables

Put every variable in `.env.example` too.

| Variable | Required | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | No | Base URL of the Legoin API. Leave it empty to use the mock backend, which keeps scans in the browser's `localStorage`. There is no HTTP client yet, so any value fails `pnpm build`, and the data screens in `pnpm dev`, with an error naming the variable. Next.js inlines it into the browser bundle at build time. |

Without a backend, demo conditions go in the page URL: `?mock=fail-<reason>` (`no_pieces`, `too_dark`, `too_blurry` or `network`) makes scanning or ideas fail, and `?mockDelay=<ms>` sets their pace (`0` skips the wait).

## Deployment

Not set up yet.

## Contributing

Read [AGENTS.md](AGENTS.md) before opening a pull request. CI runs `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` on every pull request to `main`, and the PR merges only when they pass.
