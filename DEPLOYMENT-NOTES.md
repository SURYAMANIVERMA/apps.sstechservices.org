# Independent deployment notes

This project is configured for independent hosting and deployment. The app still uses Supabase for authentication/data and Resend for queued email delivery.

## Required environment variables

Configure these as Cloudflare Worker secrets/variables (never commit them):

- `VITE_SUPABASE_URL` — Supabase project URL (public URL, safe for client use)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable/anon key (public key)
- `SUPABASE_URL` — Supabase project URL for server functions
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service-role key; secret only
- `RESEND_API_KEY` — Resend API key; secret only

For GitHub Actions, add repository secrets `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `CLOUDFLARE_API_TOKEN`, and `CLOUDFLARE_ACCOUNT_ID`. The first two are injected at build time; the Cloudflare credentials are used only by the deployment step. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `RESEND_API_KEY` as runtime secrets/variables in the Cloudflare Worker settings.

## Supabase OAuth

Enable Google under Supabase Dashboard → Authentication → Providers → Google. Add `https://apps.sstechservices.org/auth` and your local development callback (for example `http://localhost:5173/auth`) to the allowed redirect URLs. Configure the Google OAuth client credentials in Supabase; do not place its client secret in this repository.

## Email queue

The queue processor endpoint is now `POST /api/email/queue/process`. It validates the incoming bearer token against `SUPABASE_SERVICE_ROLE_KEY` and sends through Resend. Update any Supabase `pg_cron`/`pg_net` job that called the previous email queue endpoint so it now calls `/api/email/queue/process`. Configure a verified sender/domain in Resend; `payload.from` must use that verified sender.

## Windows support installer

The source archive did not include the 118 MB Windows installer itself; it only contained external asset metadata from the previous hosting setup. To make the Download page's Windows link work independently, place your built installer at:

`public/downloads/SSTECH-Nexeus-Quick-Support-windows-x64.zip`

Until that file is supplied, the link will return 404. No installer was fabricated.

## Build and local run

```powershell
npm install
npm run build
npm run dev
```

The project uses TanStack Start server routes and is not a GitHub Pages static-only site. Deploy the Nitro Cloudflare build with the included workflow after setting the required GitHub and Cloudflare secrets.
