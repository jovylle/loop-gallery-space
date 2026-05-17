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
# Fill in Firebase and optional R2 S3 credentials

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
Secrets: Firebase vars from `.env.example`.

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
