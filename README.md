# legoin-web

The Legoin web frontend. Product docs, team guidelines and decisions live in [legoin-docs](https://github.com/al-dioooo/legoin-docs).

## Tech stack

- [Next.js 16](https://nextjs.org) App Router with Cache Components and the React Compiler
- React 19 and TypeScript
- Tailwind CSS 4
- [Biome](https://biomejs.dev) for linting and formatting
- [Vitest](https://vitest.dev) and Testing Library for tests
- pnpm

## Setup and run

Requires Node.js 22 or newer and pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000>.

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

None yet. When you add one, put it in `.env.example` and list it here with whether it is required and what it does.

## Deployment

Not set up yet.

## Contributing

Read [AGENTS.md](AGENTS.md) before opening a pull request.
