# Docs Platform POC

Multi-tenant documentation platform built with Next.js 16, demonstrating Cache Components, Partial Prerendering (PPR), and cache tag revalidation.

## Architecture

Two simulated services:

- **Gitto API** (`/api/docs`) — serves raw markdown from Vercel Blob. Simulates ReadMe's existing backend content service.
- **Builder pages** (`/`, `/docs/[slug]`, `/admin`) — the Next.js frontend that compiles MDX and renders tenant-branded doc pages.

## Setup

```bash
pnpm install

# Set your Vercel Blob token
export BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Upload seed content to Vercel Blob
npx tsx scripts/seed.ts

# Start dev server
pnpm dev
```

Visit `http://localhost:3000?tenant=acme` (or `globex`, `initech`).

## File Map

| File | POC Concept |
|------|-------------|
| `next.config.ts` | Enables `cacheComponents: true` for `"use cache"` + PPR |
| `proxy.ts` | Multi-tenant routing — resolves tenant from hostname or `?tenant=` param |
| `lib/tenants.ts` | Tenant config (name, color, logo) — single source of truth |
| `lib/gitto.ts` | Direct Vercel Blob reads — shared by pages and API routes |
| `lib/mdx.ts` | MDX compilation pipeline — replaces `{{variables}}` with `<UserVar />` components |
| `lib/user-context.tsx` | Simulated auth context — toggle login/logout, no real auth |
| `app/api/docs/route.ts` | Gitto API: lists docs for a tenant from Vercel Blob |
| `app/api/docs/[slug]/route.ts` | Gitto API: reads/writes individual doc markdown |
| `app/page.tsx` | Landing page with `"use cache"` + tenant-level `cacheTag` |
| `app/docs/[slug]/page.tsx` | Doc page with `"use cache"` + per-doc `cacheTag` + PPR Suspense boundaries |
| `app/admin/page.tsx` | Admin editor — save triggers `updateTag()` for read-your-writes |
| `app/actions.ts` | Server Actions using `updateTag()` and `revalidateTag()` |
| `app/components/user-var.tsx` | Client component island — dynamic variable replacement inside cached MDX |
| `app/components/welcome-banner.tsx` | Dynamic welcome message (client component, reads user context) |
| `app/components/dynamic-timestamp.tsx` | Server component with artificial delay — proves dynamic streaming in PPR |
| `app/components/login-toggle.tsx` | Auth toggle button (client component) |
| `content/` | Seed markdown files per tenant |
| `scripts/seed.ts` | Uploads seed content to Vercel Blob |

## Key Patterns

### Cache Components + PPR
Pages use `"use cache"` with `cacheTag()` and `cacheLife('max')` for long-lived content. Dynamic sections (user personalization, timestamps) are wrapped in `<Suspense>` and stream in after the cached shell.

### Variable Replacement
Markdown contains `{{user.name}}` / `{{user.apiKey}}` placeholders. The MDX pipeline replaces these with `<UserVar />` client components that read from React context — personalized content without breaking the cache.

### Cache Revalidation
The admin page writes updated markdown to Vercel Blob, then calls a Server Action that uses `updateTag()` for immediate cache expiration (read-your-writes) and `revalidateTag()` for background refresh of related pages.

## Tenants

| Slug | Name | Color |
|------|------|-------|
| `acme` | Acme Corp | Blue |
| `globex` | Globex Corporation | Green |
| `initech` | Initech | Red |
