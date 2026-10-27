# Albumo

A minimal, editorial photo-book storefront for travellers and memory keepers.

Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000.

Keep `.npmrc` when installing: the shared `@albumo/tokens` dependency is copied into
this app so Next can watch only `frontend_album`. The sibling
`../packages/albumo-tokens` directory is required at install time. See its README
for refreshing tokens after an edit.

Persistent Turbopack development caching is disabled following long cache-compaction
stalls on Windows. In-session compilation/HMR still works, but a new server session
compiles routes again. Tailwind scans only `src`, excluding test outputs and other apps.

## Checks

```sh
npm run build
npm run format:check
```

Use `npm run format` to format the source and sort Tailwind utilities.

## Pages

- `/`: collection highlights, occasions, process, and brand introduction
- `/products`: product filters, sizes, finishes, and FAQs
- `/occasions`: travel, wedding, everyday, and celebration ideas
- `/about`: brand story and values

The header and footer are shared through the root layout.

## Update the content

- Products, prices, and image paths: `src/lib/site-content.ts`
- Brand colours and fonts: `../packages/albumo-tokens/theme.css` (see its README for updating both apps)
- Shared Tailwind utility groups: `src/lib/ui.ts`
- Logo: `public/Albumo Text Logo.png`

Image areas intentionally use placeholders until your photography is ready. See [DESIGN.md](DESIGN.md) for replacement instructions.

Customer support, contact enquiries, newsletter preferences, account access, and cookie consent connect to the sibling backend. Product enquiries open a prefilled contact form. See [INTEGRATION.md](INTEGRATION.md) for configuration and routes. Checkout, Studio uploads, and order processing remain separate milestones.

Shared interactive controls use selected Untitled UI components, styled with Albumo's Tailwind tokens. See [UNTITLED_UI.md](./UNTITLED_UI.md) for usage, future additions and verification.
