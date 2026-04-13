# AgentPome KYR — Admin Review Setup

## What was built

A fully on-demand PDF review system. No storage anywhere — the PDF is
regenerated from Sheets data every time you open a client's report.

```
Client completes quiz
  → /api/leads           saves answers to Google Sheets (fire-and-forget)

Admin opens /admin/review
  → password gate        (NEXT_PUBLIC_ADMIN_PASSWORD, sessionStorage)
  → enters phone number
  → GET /api/admin/lead  server proxy with secret token injection
      → Apps Script      looks up row by phone, returns all fields
  → POST /api/report     generates PDF from lead data on-demand
      → iframe renders   inline in the browser
      → Download button  triggers blob URL download
```

## File placement

| File                        | Place at                                    |
|-----------------------------|---------------------------------------------|
| `Code.gs`                   | Replace your existing Apps Script           |
| `api-leads-route.ts`        | `app/api/leads/route.ts`                    |
| `api-admin-lead-route.ts`   | `app/api/admin/lead/route.ts`               |
| `api-report-route.ts`       | `app/api/report/route.ts`                   |
| `admin-review-page.tsx`     | `app/admin/review/page.tsx`                 |
| `env.local.template`        | Copy to `.env.local`, fill all values       |

## Install dependency

```bash
npm install pdfkit
npm install -D @types/pdfkit
```

## Apps Script setup (one-time)

1. Open your Google Sheet → Extensions → Apps Script
2. Paste `Code.gs` content, replacing everything
3. Fill in at the top:
   ```javascript
   var SECRET_TOKEN = "your-SHEETS_WEBHOOK_SECRET-value";
   var ADMIN_TOKEN  = "your-ADMIN_REVIEW_TOKEN-value";
   ```
4. Run → `setupHeaders`  (creates styled header row)
5. Deploy → New deployment → Web App
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the Web App URL → paste as `GOOGLE_SHEETS_WEBHOOK_URL` in `.env.local`
7. **Redeploy** (new version) every time you update Code.gs

## Security model

| Layer              | What it protects                          | Secret                          |
|--------------------|-------------------------------------------|---------------------------------|
| Password gate      | /admin/review UI                         | NEXT_PUBLIC_ADMIN_PASSWORD      |
| x-admin-key header | /api/admin/lead + /api/report endpoints  | NEXT_PUBLIC_ADMIN_API_KEY       |
| Apps Script token  | Direct GET to your Sheet webhook         | ADMIN_REVIEW_TOKEN              |
| POST secret        | Fake leads being written to Sheets       | SHEETS_WEBHOOK_SECRET           |

For production, consider replacing the client-side password gate with
Next.js middleware + httpOnly cookie session (e.g. next-auth or iron-session).

## Why no Drive/storage?

- PDF is fully deterministic from Sheets data
- Regeneration takes ~300–500ms (PDFKit is fast)
- No storage quota, no broken links, no cleanup needed
- Scales to any volume without degradation