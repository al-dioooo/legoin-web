# legoin-web

The Legoin web frontend: scan your LEGO pieces and get build ideas, or turn a picture into a checked LEGO build (Picture to LEGO, ADR-0012). Product docs, team guidelines and decisions live in [legoin-docs](https://github.com/al-dioooo/legoin-docs).

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

## Accounts

Scanning, results, ideas and history need a log-in with an email and a password ([ADR-0011](https://github.com/al-dioooo/legoin-docs/blob/main/decisions/0011-accounts-with-email-and-password.md)). A visit to one of those pages without a session goes to `/[lang]/login`, then back to the page. The home page and the design pages stay public.

- **With the mock backend**, accounts live in this browser's `localStorage`. Any email and a password of 8 to 128 characters work, and the mock keeps a SHA-256 of the password, never the password itself. Each account has its own scans, and starts with the four demo scans. An account made in one browser doesn't exist in another.
- **With the API**, legoin-api has to implement ADR-0011 ([legoin-api#25](https://github.com/al-dioooo/legoin-api/issues/25)). The session token is kept in `localStorage` (`legoin.session.v1`) and sent as `Authorization: Bearer`. On the first log-in from a browser that used the API before accounts, its old `legoin.deviceId.v1` goes along once, so those scans move to the account.
- There's no password reset yet, since it needs an email service. A forgotten password means a new account.

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
| `NEXT_PUBLIC_API_URL` | No | Base URL of the Legoin API, version included, such as `https://api.legoin.example/v1` (see [the API contract](https://github.com/al-dioooo/legoin-docs/blob/main/api/contract.md)). Leave it empty to use the mock backend, which keeps accounts and scans in the browser's `localStorage`. When it's set, the browser calls the API itself, so the API has to allow the site's origin. A value that isn't an `http(s)` URL fails `pnpm build`, and the data screens in `pnpm dev`, with an error naming the variable. Next.js inlines it into the browser bundle at build time. |

Without a backend, demo conditions go in the page URL: `?mock=fail-<reason>` (`no_pieces`, `too_dark`, `too_blurry`, `network` or `timeout`) makes scanning or ideas fail, and `?mockDelay=<ms>` sets their pace (`0` skips the wait). On the Picture to LEGO page (`/en/picture`), `?mock=fail-<reason>` takes a picture build's reasons instead: `picture_unusable`, `picture_refused`, `no_valid_build`, `picture_limit`, `picture_budget`, `timeout`, `unavailable` or `network`. The mock turns any picture into one of the library's checked builds, two a day per account.

## Deployment

[Vercel](https://vercel.com) builds the app through its GitHub integration. There's no Vercel config in this repo; Vercel detects Next.js and pnpm by itself.

- **Production:** every push to `main` deploys to <https://legoin-web.vercel.app>, which is public.
- **Previews:** every pull request gets its own deployment, rebuilt on each push. The Vercel bot comments its link on the PR, and the commit gets a `Vercel` status. Previews sit behind Vercel's log-in, so open them with an account that has access to the project.
- **Backend:** both run on the mock backend, so accounts and scans live in each visitor's browser and the `?mock=` and `?mockDelay=` conditions work there too. Leave `NEXT_PUBLIC_API_URL` unset in the Vercel project until the API is deployed. Once it's set, a new build talks to the API, and the demo conditions stop working. The API has to have accounts (ADR-0011) by then: this app sends a session token, not the device id, so an API without accounts answers `401` to every call. Deploy the two together.

## Contributing

Read [AGENTS.md](AGENTS.md) before opening a pull request. CI runs `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` on every pull request to `main`, and `pnpm test:e2e` in a second job. The PR merges only when both pass.
