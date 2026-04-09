# Docs Platform POC

A multi-tenant documentation platform built with Next.js 16 that demonstrates how Cache Components, Partial Prerendering (PPR), and granular cache tag invalidation work together to serve personalized, instantly-loading developer docs at scale.

## What This Proves

1. **Static + dynamic on the same page.** The MDX doc content is cached at the edge. Personalized values (user name, API key) stream in as client component islands — no full-page rerender needed.
2. **Granular cache invalidation.** When an editor publishes a change, only the affected cache entries are expired — a single doc, all docs for a tenant, or everything globally.
3. **Multi-tenant isolation.** Each tenant gets its own subdomain, branding, content, and cache scope. One tenant's publish event never touches another tenant's cache.
4. **Personalized code samples without breaking cache.** `{{user.apiKey}}` placeholders inside markdown (even inside fenced code blocks) render as dynamic client components while the surrounding static content serves from cache.

---

## Setup

```bash
pnpm install

# Add your Vercel Blob token to .env.local
echo 'BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...' > .env.local

# Seed markdown content into Vercel Blob
pnpm seed   # or: npx tsx scripts/seed.ts

# Start dev server
pnpm dev
```

## URLs (Local Dev)

| URL | What it shows |
|-----|---------------|
| `http://localhost:3000` | Hub page — links to all three tenant demos |
| `http://acme.localhost:3000` | Acme docs (blue branding) |
| `http://globex.localhost:3000` | Globex docs (green branding) |
| `http://initech.localhost:3000` | Initech docs (red branding) |
| `http://localhost:3000/admin` | Admin — edit content, publish, invalidate cache |

> `*.localhost` resolves to `127.0.0.1` automatically in modern browsers. No `/etc/hosts` changes needed.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│  acme.localhost:3000/docs/getting-started                        │
└──────────┬───────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────┐
│  proxy.ts         │  Reads Host header → resolves tenant slug
│  (Middleware)     │  Sets x-tenant header for downstream pages
└──────────┬───────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  Doc Page  (app/docs/[slug]/page.tsx)                            │
│                                                                   │
│  ┌─────────────────────────────────────────────┐                 │
│  │  "use cache"  CachedDocContent              │  ← Serves from │
│  │  cacheTag("doc:acme/getting-started")       │    edge cache   │
│  │  cacheTag("tenant:acme")                    │                 │
│  │  cacheTag("global")                         │                 │
│  │  cacheLife("max")                           │                 │
│  │                                             │                 │
│  │  Fetches markdown from Vercel Blob          │                 │
│  │  Compiles MDX with remark-gfm               │                 │
│  │  Returns static HTML + <UserVar /> islands  │                 │
│  └─────────────────────────────────────────────┘                 │
│                                                                   │
│  ┌───────────────────────┐  ┌──────────────────┐                 │
│  │  <UserVar />          │  │  <DynamicTimestamp│  ← Stream in   │
│  │  Fetches /api/user    │  │  />               │    after shell  │
│  │  Shows name, API key  │  │  300ms delay      │                │
│  └───────────────────────┘  └──────────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
           │
           │  On publish:
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  Server Action  (app/actions.ts)                                 │
│                                                                   │
│  updateTag("doc:acme/getting-started")  → immediate expiration   │
│  revalidateTag("tenant:acme", "max")    → background refresh     │
└──────────────────────────────────────────────────────────────────┘
```

### Two Simulated Services

- **"Gitto" API** (`/api/docs`, `lib/gitto.ts`) — A thin wrapper around Vercel Blob that serves raw markdown. Simulates ReadMe's existing content backend. Intentionally dumb — no caching, no compilation.

- **"Builder" pages** (`app/`) — The Next.js frontend that fetches markdown from Gitto, compiles it through MDX, and renders tenant-branded doc pages. This is the part we're rebuilding.

---

## Demo Flow

### 1. Show the docs page loading

Open `acme.localhost:3000/docs/getting-started`. Watch closely:

- **Instant:** The static shell appears — headings, paragraphs, code blocks, tables. This is served from the edge cache (`"use cache"` + `cacheLife("max")`).
- **~300ms later:** Skeleton placeholders in the prose and code blocks fill in with "Jane Developer" and "sk_live_abc123xyz789". These come from `GET /api/user` — a real API call with an artificial delay.
- **Same time:** The "Page rendered at..." timestamp streams in (also delayed 300ms to prove it's dynamic).

> Toggle the "Log in" / "Log out" button in the header. When you log out, values swap to `YOUR_NAME` / `YOUR_API_KEY` placeholders instantly. When you log back in, you see the loading skeletons again for 300ms while `/api/user` is re-fetched.

### 2. Edit and publish a doc change

Open `localhost:3000/admin`. Select a tenant (ACME/GLOBEX/INITECH), pick a doc, edit the markdown.

- The split-pane editor shows a live preview on the right.
- Click **Save & Publish** (or `Cmd+S`). This:
  1. Writes the updated markdown to Vercel Blob (`POST /api/docs/[slug]`)
  2. Calls `updateTag("doc:acme/getting-started")` — immediately expires that doc's cache
  3. Calls `revalidateTag("tenant:acme", "max")` — background refresh of the sidebar

- Reload the doc page in the other tab. The change is reflected immediately.

### 3. Demonstrate cache tag hierarchy

The admin sidebar has three invalidation buttons at the bottom:

| Button | Tag | What it expires |
|--------|-----|-----------------|
| **This page** (blue) | `doc:acme/getting-started` | Just this one doc page |
| **All Acme Corp** (amber) | `tenant:acme` | Sidebar + every doc for Acme |
| **All tenants** (red) | `global` | Every cached component across all tenants |

Click each one and show:
- **Doc-level:** Only the current doc re-renders on next visit. Other docs still serve from cache.
- **Tenant-level:** All Acme pages re-render. Globex and Initech are untouched.
- **Global:** Everything re-renders across all tenants.

The header shows which tag was invalidated and when.

### 4. Show tenant isolation

Open `acme.localhost:3000` and `globex.localhost:3000` side by side.

- Different branding (blue vs. green), different content, different sidebar.
- Edit an Acme doc in the admin and publish. Acme's cache is invalidated. Globex is unaffected — prove it by reloading both.

### 5. Show consistent performance under load

On Vercel, the cached static shell serves at edge latency regardless of traffic. The only per-request work is the dynamic islands (user API call). Point out:
- The static shell is the same bytes for every visitor — cached at the edge, no server compute.
- Only the `<UserVar />` components and timestamp are dynamic — they stream in after the shell.
- A traffic spike to one tenant's docs doesn't affect other tenants because cache tags are scoped.

---

## Cache Tag Hierarchy

Every cached component is tagged at three levels:

```
"global"
 └── "tenant:acme"
      ├── "doc:acme/getting-started"    ← individual doc
      └── "doc:acme/webhooks"           ← individual doc
 └── "tenant:globex"
      ├── "doc:globex/getting-started"
      └── "doc:globex/rate-limits"
 └── "tenant:initech"
      ├── "doc:initech/getting-started"
      └── "doc:initech/errors"
```

Invalidating a parent tag expires all children. Invalidating a leaf tag only expires that one entry.

### Invalidation APIs Used

| API | Where callable | Behavior |
|-----|---------------|----------|
| `updateTag(tag)` | Server Actions only | Immediate expiration — the publisher sees fresh content on next load |
| `revalidateTag(tag, "max")` | Server Actions + Route Handlers | Marks stale, serves stale-while-revalidate in background |

---

## File Map

### Config & Routing

| File | Purpose |
|------|---------|
| `next.config.ts` | `cacheComponents: true` — enables `"use cache"` directive and PPR |
| `proxy.ts` | Reads `Host` header, resolves tenant slug, sets `x-tenant` request header |
| `lib/tenants.ts` | Tenant definitions (name, color, logo) + `resolveTenantFromHost()` |

### Content Backend (Gitto)

| File | Purpose |
|------|---------|
| `lib/gitto.ts` | `listDocs()` / `getDoc()` — direct Vercel Blob reads |
| `app/api/docs/route.ts` | `GET /api/docs?tenant=X` — lists docs (used by admin page) |
| `app/api/docs/[slug]/route.ts` | `GET` reads markdown, `POST` writes to Blob |
| `app/api/user/route.ts` | `GET /api/user` — mock user data with 300ms delay |
| `content/` | Seed markdown files per tenant |
| `scripts/seed.ts` | Uploads seed content to Vercel Blob |

### Frontend (Builder)

| File | Key Directives | Purpose |
|------|---------------|---------|
| `app/layout.tsx` | `<Suspense>` | Root layout — UserProvider, conditional tenant shell (header + sidebar) |
| `app/page.tsx` | `<Suspense>` | Hub page (root domain) or tenant welcome (subdomain) |
| `app/docs/[slug]/page.tsx` | `"use cache"`, `cacheTag`, `cacheLife`, `<Suspense>` | Doc page — cached MDX with dynamic islands |
| `app/actions.ts` | `"use server"`, `updateTag`, `revalidateTag` | Three-level cache invalidation actions |
| `app/admin/page.tsx` | `"use client"` | Split-pane editor with live preview + invalidation controls |

### Components

| File | Type | Purpose |
|------|------|---------|
| `docs-sidebar.tsx` | `"use cache"` | Cached sidebar nav — tagged with `tenant:X` + `global` |
| `sidebar-links.tsx` | `"use client"` | Highlights active doc link |
| `tenant-header.tsx` | Server | Branded header with tenant logo |
| `user-var.tsx` | `"use client"` | Dynamic variable replacement — shows skeleton → real value |
| `dynamic-code.tsx` | `"use client"` | Replaces `__VAR:field__` tokens inside code blocks with `<UserVar />` |
| `welcome-banner.tsx` | `"use client"` | Personalized greeting with loading state |
| `login-toggle.tsx` | `"use client"` | Login/logout button |
| `dynamic-timestamp.tsx` | Server (async) | Current time with 300ms delay — proves dynamic streaming |

---

## How Variable Replacement Works

Markdown files contain `{{user.name}}` and `{{user.apiKey}}` placeholders.

The MDX pipeline (`lib/mdx.ts`) handles them in two passes:

1. **Inside fenced code blocks** (```` ``` ````): Replaced with `__VAR:user.apiKey__` text tokens. The custom `<DynamicCode />` component splits these at render time and swaps in `<UserVar />` components.

2. **In prose**: Replaced with `<UserVar field="user.apiKey" />` JSX directly, which MDX compiles as a component.

The result: cached static MDX with tiny client component islands that fetch user data at request time.

---

## Deploying to Vercel

```bash
# Deploy
vercel deploy

# Add wildcard domain for multi-tenant subdomains
vercel domains add yourdomain.com
vercel domains add '*.yourdomain.com'

# Set environment variables
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add ROOT_DOMAIN  # e.g. yourdomain.com

# Seed content
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_... npx tsx scripts/seed.ts
```

Then visit `acme.yourdomain.com`, `globex.yourdomain.com`, etc.

### Switching to Custom Domains (CNAME)

For the real use case where customers bring their own domains, see the commented-out section in `lib/tenants.ts`. The pattern:

1. Customer creates CNAME: `docs.acme.com → cname.vercel-dns.com`
2. You add `docs.acme.com` to the Vercel project
3. The proxy matches the exact hostname → tenant slug (from a KV/DB lookup in production)
