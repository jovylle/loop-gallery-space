# LoopGallery

A personal visual gallery platform — your own corner of the internet. Collect loops, memories, and moods.

## Stack

- **Nuxt 3** + Nitro on **Cloudflare Pages**
- **Cloudflare D1** (metadata)
- **Cloudflare R2** (media)
- **Firebase Auth** (Google sign-in)
- **Tailwind CSS** (dark mode default)

## Development

```bash
cp .env.example .env
# Optional: R2 S3 credentials for presigned uploads
# Firebase web config lives in shared/firebase.config.ts (committed, public)

npm install
npm run db:migrate   # local D1 (requires wrangler)
npm run dev
```

For full Cloudflare bindings locally:

```bash
npx wrangler pages dev
```

## Deploy (production)

This repo targets **Cloudflare Workers** with Git (service name: `loop-gallery-space`), not classic Pages upload.

### Workers Builds (dashboard)

In **Workers & Pages** → **loop-gallery-space** → **Settings** → **Builds**:

| Setting | Value |
|---------|--------|
| **Build command** | `npm run build` |
| **Deploy command** | `npx wrangler deploy` |
| **Build output directory** | leave empty (Pages-only field) |

Bindings on the Worker: `loopgallery-db` (D1), `loopgallery-media` (R2).  
Firebase is baked into the build via `shared/firebase.config.ts` — no Worker secrets needed for sign-in.  
Optional secrets: `R2_*` only if you use presigned uploads.

### Why dashboard variables / secrets disappear

Deploy runs `npx wrangler deploy` using Nitro’s generated `.output/server/wrangler.json`
(`deployConfig: true`). If that file has empty or incomplete `vars`, **each deploy can overwrite**
variables you only set in the Cloudflare UI.

Use **both**:

1. **Build variables** (Settings → Builds → Build environment variables) — required for
   `NUXT_PUBLIC_*` during `npm run build` (baked into the client bundle).
2. **`wrangler.toml` `[vars]`** and/or the same names as Build variables — so deploy does not
   push `vars: {}` and clear runtime config.

**Secrets** (`R2_SECRET_ACCESS_KEY`, etc.) are not stored in git. Re-add with:

```bash
npx wrangler secret put R2_SECRET_ACCESS_KEY
```

Or Workers → Settings → Variables → Secrets (encrypted). They are separate from `[vars]` but
can still be lost if the Worker is recreated or the wrong project is deployed.

Run D1 migrations once locally: `npm run db:migrate:prod`

Merge to `master` → build + deploy run automatically.

### Manual deploy

```bash
npm run build
npm run deploy
```

## Quotas (free tier guardrails)

| Limit | Default |
|-------|---------|
| Storage per user | 100 MB |
| Max upload | 8 MB |
| Items per gallery | 100 |
| Uploads per day | 20 |

## License

Private / personal project.
