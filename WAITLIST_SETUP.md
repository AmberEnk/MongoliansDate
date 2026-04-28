# Waitlist Backend Setup

This project now stores waitlist signups in a central Postgres database through Vercel Functions.

## 1) Add environment variables in Vercel

In your Vercel project settings, add:

- `POSTGRES_URL` (or `DATABASE_URL`) - your Postgres connection string
- `WAITLIST_EXPORT_TOKEN` - a strong random secret used for CSV export auth

If you use Vercel Postgres, copy the connection string from the Storage tab and set it as `POSTGRES_URL`.

## 2) Deploy

Deploy normally from `main` (or run `npx vercel --prod`).

The first successful submit will auto-create table `waitlist_entries`.

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

## Security notes

- Keep `WAITLIST_EXPORT_TOKEN` private.
- Rotate token if shared accidentally.
- Do not expose Postgres credentials in frontend code.
