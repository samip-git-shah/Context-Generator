# Context Generator

Turn a rough idea + (optional) attachments into a production-grade LLM prompt
structured around the CO-STAR framework, with **Role pinned at the top** and
**Guardrails pinned just above the Response** section.

Free, open, no login. Bring your own API key (BYOK) — it stays in your browser.

---

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Click **Settings**, paste an API key from any of:
OpenAI, Anthropic, Google AI Studio, or Mistral. Pick the matching model. Type
a basic prompt, click **Generate Context Prompt**.

That's it. No accounts, no databases, no payment system, no environment
variables required.

---

## What's where

```
app/
  page.tsx                    # Two-pane workspace
  support/                    # Bug/feature feedback form
  api/generate/               # BYOK proxy → LLM provider
  api/parse/                  # Attachment extractor + summarizer
  api/support/                # Optional Resend email forwarder

components/
  Workspace.tsx               # Main two-pane layout
  Header.tsx                  # Top bar
  SettingsDialog.tsx          # BYOK key entry + model picker
  workspace/                  # PromptInput, AttachmentDropzone, views

lib/
  prompts/system.ts           # The CO-STAR meta-prompt
  prompts/schema.ts           # Zod schema for the LLM JSON response
  llm/client.ts               # BYOK client factory (4 providers)
  llm/models.ts               # Dropdown source of truth — add models here
  parsers/                    # PDF / DOCX / XLSX / CSV + summarizer
  storage.ts                  # Browser localStorage for BYOK key
  crypto.ts                   # Optional AES-GCM passphrase encryption
  logger.ts                   # Redacts API-key-shaped strings before logging

config/
  app.config.ts               # Tunable knobs: limits, copy, generation params
```

---

## Optional: support form email forwarding

By default the `/support` page accepts submissions and logs them to the server
console. If you want them emailed:

1. Sign up at https://resend.com (free tier).
2. Verify your sending domain.
3. Create `.env.local`:
   ```
   RESEND_API_KEY=re_...
   SUPPORT_INBOX_EMAIL=you@yourdomain.com
   SUPPORT_FROM_EMAIL=noreply@yourdomain.com
   ```
4. Restart `npm run dev`.

---

## Day-to-day maintenance

### Add a new model
Edit `lib/llm/models.ts`:
```ts
{ id: "the-model-id", label: "Provider · Friendly Name", provider: "openai" },
```

### Hide a deprecated model
Set `deprecated: true` on its entry in `lib/llm/models.ts`.

### Adjust limits or copy
Edit `config/app.config.ts`.

---

## Deploy

1. Push to GitHub.
2. Go to https://vercel.com → New Project → import the repo.
3. Deploy. Done.

(The optional Resend env vars go in Vercel → Settings → Environment Variables.)

---

## Security model

The strongest possible BYOK posture: **our server is not on the key's path at
all.**

| Step | Where it happens | Touches your key? |
|---|---|---|
| You paste the key in Settings | Browser only | — |
| Stored in `localStorage` (optionally AES-GCM encrypted with your passphrase) | Browser only | — |
| `fetch()` to OpenAI / Anthropic / Google / Mistral | Browser → provider, **directly** | Yes — only on HTTPS to the provider |
| Our `/api/parse` (extracts text from uploaded PDFs/DOCX/XLSX/CSV) | Server | **No** — this endpoint doesn't accept your key |

In other words, the only computer that ever sees your API key is **your
browser** and **the LLM provider**. Even if our server were fully compromised,
your key would not be there to steal.

Layered defenses:

1. **Direct browser → provider calls** — server never receives the key.
2. **Browser-only storage** — `localStorage`, optionally encrypted with
   AES-GCM (Web Crypto, PBKDF2 with 250 000 iterations) via a passphrase only
   you know.
3. **Strict Content-Security-Policy** — the browser is allowed to talk to
   exactly four destinations: `api.openai.com`, `api.anthropic.com`,
   `generativelanguage.googleapis.com`, `api.mistral.ai`. Any rogue script
   trying to exfiltrate the key elsewhere is blocked at the browser level.
2. **Show/hide eye toggle + masked input** — defends against shoulder-surfing
   and screen-share leaks.
3. **Logger that redacts** anything matching API-key shapes before reaching
   `console.*`.
4. **No analytics, no telemetry** on any request that could carry the key —
   because such requests don't exist.

**Your single most important habit:** create a dedicated, low-budget API key
on your provider's dashboard with a hard monthly spend cap. Even in the
absolute worst case, the blast radius is bounded by that cap.
