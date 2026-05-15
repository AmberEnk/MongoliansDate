# Waitlist Backend Setup

This project now stores waitlist signups in a central Postgres database through Vercel Functions.

## 1) Add environment variables in Vercel

In your Vercel project settings, add:

- **`POSTGRES_URL`** (recommended) or **`PRISMA_DATABASE_URL`** / **`DATABASE_URL`** — must be a **direct** `postgres://` connection string (TLS is fine).
- **`WAITLIST_EXPORT_TOKEN`** — long random secret for admin CSV / JSON APIs

**Prisma Postgres** (host like `db.prisma.io`): use the **direct database URL** from the Prisma console. This API uses raw SQL via `node-pg`, not Prisma Client — but it talks to the same database.

**Prisma Accelerate** URLs (`prisma+postgres://…`, `prisma://…`, or `*.prisma-data.net` pooler) are **not** Postgres wire protocol here. Keep Accelerate for your app if you want, but set **`POSTGRES_URL`** on Vercel to a **direct** Postgres URL for these serverless routes (Prisma console usually provides both).

## 2) Deploy

Deploy normally from `main` (or run `npx vercel --prod`).

The first successful submit will auto-create table `waitlist_entries`.

## Local development (waitlist)

`npm run dev` only starts **Vite**; it does **not** run the `api/*.ts` serverless routes. Requests to `POST /api/waitlist` return **404** unless you do one of the following:

1. **Proxy to production (simplest)** — create `.env.development.local` in the repo root:

   ```bash
   VITE_DEV_API_ORIGIN=https://uchral.net
   ```

   Restart `npm run dev`. Vite will forward `/api/*` to that origin so signups hit the real database.

2. **Run API locally** — use the Vercel CLI so functions and env from the project run on your machine: `npx vercel dev` (see Vercel docs for linking the project).

### Waitlist admin — debug load without token (local only)

The **“Debug: load without token”** button on `/admin/waitlist` appears only in Vite dev builds (`import.meta.env.DEV`). It calls `GET /api/waitlist-admin` with `X-Uchral-Admin-Dev: 1` and **no** `Authorization` header.

The function accepts that **only** when **both** are true:

- `UCHRAL_ADMIN_DEV_BYPASS=1` in the environment of the process executing the API (e.g. `.env.local` for `vercel dev`).
- `VERCEL_ENV` is **not** `production` (so deployed production always requires the Bearer token).

`npm run dev` with `VITE_DEV_API_ORIGIN` proxies `/api` to production; **production will not honor the debug bypass**, so use **`vercel dev`** for no-token admin against a local/preview-linked database, or paste the token as before.

## 3) Waitlist submit API

- Endpoint: `POST /api/waitlist`
- Body:

```json
{
  "email": "person@example.com",
  "gender": "male",
  "country": "USA",
  "city": "Los Angeles",
  "age": 28
}
```

`gender` and `age` are required; `country` and `city` are optional.

## 4) CSV export API (admin)

- Endpoint: `GET /api/waitlist-export`
- Header:

```
Authorization: Bearer <WAITLIST_EXPORT_TOKEN>
```

Example:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://www.uchral.net/api/waitlist-export" \
  -o waitlist-export.csv
```

## Troubleshooting `FUNCTION_INVOCATION_FAILED` / HTTP 500 on `/api/waitlist*`

1. **Deploy the latest code** from this repo (`@neondatabase/serverless` + `waitlistQuery` in `api/_db.ts`). Old builds that only used `pg` often crash on Vercel when the database is **Neon**.
2. **Confirm env vars** on Vercel → Project → Settings → Environment Variables: **`POSTGRES_URL`** or **`DATABASE_URL`** must be a **direct** Postgres URL (not Prisma Accelerate / `prisma+postgres://` proxy).
3. **Neon**: Prefer the connection string copied from the Neon dashboard (`…neon.tech…`). If the host doesn’t match our auto-detection, set **`UCHRAL_USE_NEON_HTTP=1`** (Production + Preview) so the HTTP driver is always used.
4. **See the real error**: Vercel → project → **Logs** (or run `npx vercel logs <deployment-url>`). The browser only shows the generic platform message.
5. After changing env vars, **redeploy** so functions pick them up.

## Security notes

- Keep `WAITLIST_EXPORT_TOKEN` private.
- Rotate token if shared accidentally.
- Do not expose Postgres credentials in frontend code.
