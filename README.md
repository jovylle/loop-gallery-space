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

1. Create Cloudflare **Pages** project linked to this repo.
2. Set **production branch** to `master` (auto-deploy on push).
3. Create **D1** database and **R2** bucket; update `wrangler.toml` `database_id`.
4. Add bindings in Pages: `loopgallery-db` → D1, `loopgallery-media` → R2 (variable names must match exactly).
5. Set environment variables from `.env.example`.
6. Build command: `npm run build && npm run db:migrate:prod`

Merge to `master` → production deploys automatically.

## Quotas (free tier guardrails)

| Limit | Default |
|-------|---------|
| Storage per user | 100 MB |
| Max upload | 8 MB |
| Items per gallery | 100 |
| Uploads per day | 20 |

## License

Private / personal project.
