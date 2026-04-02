# Pixora API — cURL (Postman import) + strict expectations

## Postman collections

**All sprints in one file (24 requests):** [pixora-sprints-complete.postman_collection.json](./pixora-sprints-complete.postman_collection.json) — auth (incl. `POST /api/agency`), Stripe, contact, plan-limits, media, chat, webhook, plus **Sprint 5** `/api/funnel-tools/*` (template list/sample, DnD reorder JSON, parse editor content, published URL), **Sprint 6** `GET`/`POST /api/subaccount/:subAccountId/funnels` (Bearer JWT, subdomain funnel create/list). Optional env **`FUNNEL_TOOLS_SECRET`** + header `x-funnel-tools-secret` for funnel-tools only. Regenerate:

```powershell
bun run postman:generate
```

Or: `npm run postman:generate` / `node scripts/generate-postman-sprints.mjs`

Smaller per-area collections (same style as `pixora-auth.postman_collection.json`):

| File | APIs |
|------|------|
| [pixora-auth.postman_collection.json](./pixora-auth.postman_collection.json) | signup, signin, me, forgot/verify/reset password + auto-save `token` |
| [pixora-stripe.postman_collection.json](./pixora-stripe.postman_collection.json) | plan-prices, subscription, cancel, checkout, products, webhook |
| [pixora-contact.postman_collection.json](./pixora-contact.postman_collection.json) | contact-messages, reply |
| [pixora-media.postman_collection.json](./pixora-media.postman_collection.json) | media list |
| [pixora-chat.postman_collection.json](./pixora-chat.postman_collection.json) | chat send, AI |
| [pixora-plan-limits.postman_collection.json](./pixora-plan-limits.postman_collection.json) | plan limits subaccount / team |

Import each file in Postman: **Import** → select the JSON.

---

Use **Postman → Import → Raw text** and paste any block below (Postman parses `curl`).

Set your shell variables first:

```bash
export BASE_URL="http://localhost:3000"
export TOKEN=""          # fill after sign-in (JWT)
export AGENCY_ID=""      # UUID
export SUBACCOUNT_ID=""  # UUID
export PRICE_ID=""       # Stripe price_... from /api/stripe/plan-prices
```

### Troubleshooting: `POST /api/auth/signup` returns **500** (not a curl mistake)

If the server log shows **Prisma**: `Can't reach database server at '...:5432'`, your **`DATABASE_URL`** in `.env` points to a PostgreSQL host the dev machine cannot reach (wrong host, firewall, VPN, expired cloud DB, or typo).

**Fix for local API / Postman / curl testing:**

1. Set `DATABASE_URL` to a running Postgres instance, for example the value in [`.env.example`](../.env.example) (`postgresql://...@localhost:5432/pixora`).
2. Start Postgres (Docker, local install, or a cloud DB that allows your IP).
3. Run `bunx prisma db push` (or `migrate`) so the schema exists.
4. Restart `bun run dev` and retry the same curl.

Until the DB connects, auth and most API routes will return **500** no matter how correct the HTTP request is.

---

## Auth (matches `tests/unit` style: status + JSON shape)

### Sign up — expect `201`, body has `.user.email` and `.token`

```bash
curl -sS -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test User","email":"api_test_'$(date +%s)'@example.com","password":"Password123!"}'
```

### Sign up — strict fail: short password → `400`, `.error` string

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"X","email":"bad@example.com","password":"short"}'
```

### Sign up — strict fail: invalid email → `400`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"X","email":"not-an-email","password":"Password123!"}'
```

### Sign in — expect `200`, `.token` present

```bash
curl -sS -X POST "$BASE_URL/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}'
```

### Sign in — strict fail: wrong password → `401`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"WrongPassword!!!"}'
```

### Create agency — `multipart/form-data` (after sign-in; expect `201`)

Set `TOKEN` from sign-in JSON. `agencyLogo` must be a **URL string** (not a file), same as the app after upload.

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/agency" \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=My Agency" \
  -F "companyEmail=contact@myagency.com" \
  -F "companyPhone=+15551234567" \
  -F "address=123 Main Street Suite 100" \
  -F "city=Kathmandu" \
  -F "state=Bagmati" \
  -F "zipCode=44600" \
  -F "country=Nepal" \
  -F "agencyLogo=https://api.dicebear.com/7.x/initials/svg?seed=Agency" \
  -F "whiteLabel=true" \
  -F "goal=5"
```

JSON alternative: `Content-Type: application/json` with the same field names.

### Me — expect `200` with `Authorization: Bearer`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

### Me — strict fail: no header → `401`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/auth/me"
```

### Me — strict fail: garbage token → expect `401` (not 500)

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer not.a.valid.jwt"
```

### Forgot password — anti-enumeration: unknown email still `200` + message

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"does_not_exist_'$(date +%s)'@example.com"}'
```

### Verify OTP — strict fail: missing fields → `400`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com"}'
```

### Reset password — strict fail: missing token → `400`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"password":"Password123!"}'
```

---

## Funnel tools (templates, DnD JSON, editor parse)

Test-only HTTP surface aligned with `tests/unit/funnel-editor-json.test.ts`, `dnd-editor-tree.test.ts`, `template-system.test.ts`. No database writes.

If **`FUNNEL_TOOLS_SECRET`** is set in `.env`, add header `-H "x-funnel-tools-secret: YOUR_SECRET"` to every request below.

### List template ids

```bash
curl -sS "$BASE_URL/api/funnel-tools/templates"
```

### Sample JSON for one template (`template__hero_gradient`, `template__modern_navbar`, …)

```bash
curl -sS "$BASE_URL/api/funnel-tools/templates/template__hero_gradient?device=Desktop"
```

### Reorder items (same as funnel step drag — `reorderByIndex` + `assignSequentialOrder`)

```bash
curl -sS -X POST "$BASE_URL/api/funnel-tools/dnd-reorder" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"a"},{"id":"b"},{"id":"c"}],"fromIndex":0,"toIndex":2,"assignOrder":true}'
```

### Parse funnel page `content` JSON (optional `findId`)

```bash
curl -sS -X POST "$BASE_URL/api/funnel-tools/parse-content" \
  -H "Content-Type: application/json" \
  -d '{"content":null,"findId":"__body"}'
```

### Build published subdomain URL

```bash
curl -sS -X POST "$BASE_URL/api/funnel-tools/published-url" \
  -H "Content-Type: application/json" \
  -d '{"subDomainName":"myfunnel","pathName":"landing","scheme":"https","domain":"pawal.dev"}'
```

---

## Stripe & billing

### Plan prices (public) — expect `200`, JSON object of plan keys → price ids

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/stripe/plan-prices"
```

### Create subscription session — cookie session (app uses `getAuthDetails`; set cookie if your deploy uses it)

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/stripe/create-subscription-session" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=$TOKEN" \
  -d "{\"agencyId\":\"$AGENCY_ID\",\"priceId\":\"$PRICE_ID\",\"successUrl\":\"$BASE_URL/agency/$AGENCY_ID/billing?success=true&session_id={CHECKOUT_SESSION_ID}\",\"cancelUrl\":\"$BASE_URL/agency/$AGENCY_ID/billing?canceled=true\"}"
```

### Cancel subscription — owner + cookie

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/stripe/cancel-subscription" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=$TOKEN" \
  -d "{\"agencyId\":\"$AGENCY_ID\"}"
```

### Checkout session (embedded) — strict fail: missing connect + prices → `400`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/stripe/create-checkout-session" \
  -H "Content-Type: application/json" \
  -d '{"subAccountConnectedId":"","prices":[]}'
```

### Webhook — strict fail: no signature → `400`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/stripe/webhook" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Products GET — expect `400` without `subAccountId`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/stripe/products"
```

### Products GET — local source

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/stripe/products?subAccountId=$SUBACCOUNT_ID&source=local"
```

### Products POST — `price` must be string in API (strict contract)

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/stripe/products" \
  -H "Content-Type: application/json" \
  -d "{\"subAccountId\":\"$SUBACCOUNT_ID\",\"name\":\"Test\",\"price\":\"9.99\",\"localOnly\":true}"
```

### Products DELETE

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X DELETE \
  "$BASE_URL/api/stripe/products?productId=PRODUCT_UUID&subAccountId=$SUBACCOUNT_ID"
```

---

## Plan limits (like `plan-limits` unit expectations)

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/plan-limits?agencyId=$AGENCY_ID&type=subaccount"
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/plan-limits?agencyId=$AGENCY_ID&type=team"
```

### Strict fail: bad `type` → `400`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/plan-limits?agencyId=$AGENCY_ID&type=invalid"
```

---

## Contact / lead capture (parser matches `parseContactMessageBody`)

### Valid — expect `200` or `201` style success JSON

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/contact-messages" \
  -H "Content-Type: application/json" \
  -d '{"name":"Lead","email":"lead@example.com","message":"Hello"}'
```

### Strict fail: empty message → `400`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/contact-messages" \
  -H "Content-Type: application/json" \
  -d '{"name":"Lead","email":"lead@example.com","message":"   "}'
```

---

## Media

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/media?subAccountId=$SUBACCOUNT_ID"
```

### Strict fail: missing id → `400`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/media"
```

---

## Chat (requires session cookie like the app)

### Send — strict fail: no auth → `401`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/chat/send" \
  -H "Content-Type: application/json" \
  -d '{"content":"hi","conversationId":"00000000-0000-0000-0000-000000000000"}'
```

### AI — strict fail: missing fields → `400` (when authenticated)

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/chat/ai" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=$TOKEN" \
  -d '{"content":"hello"}'
```

---

## Newman (CI)

After exporting a Postman collection, run:

```bash
newman run YourCollection.json --env-url "$BASE_URL" --reporters cli,json
```

---

## Strict smoke scripts (same expectations as key unit tests)

| Unit test area | Script |
|----------------|--------|
| Auth validation, `/api/auth/me`, forgot-password shape | `postman/smoke-api-strict.ps1` or `postman/smoke-api-strict.sh` |
| `parseContactMessageBody` (contact API) | same (contact 400/200) |
| `plan-limits` route (`type` subaccount/team) | same + `AGENCY_ID` |
| Stripe webhook signature, empty checkout | same |

**PowerShell (Windows):**

```powershell
$env:BASE_URL = "http://localhost:3000"
$env:AGENCY_ID = "your-agency-uuid"      # optional
$env:SUBACCOUNT_ID = "your-sub-uuid"     # optional
powershell -ExecutionPolicy Bypass -File postman/smoke-api-strict.ps1
```

**Bash (Git Bash / Linux / macOS):** requires `curl` and `jq`.

```bash
chmod +x postman/smoke-api-strict.sh
BASE_URL=http://localhost:3000 AGENCY_ID=... SUBACCOUNT_ID=... ./postman/smoke-api-strict.sh
```

---

## Subaccount funnels (REST — Bearer JWT)

Same **subaccount access** rules as the app layout: user must have **Permissions** with `access: true` for that `subAccountId`, and must not be **SUBACCOUNT_GUEST**. Use the JWT from **Sign in** (`Authorization: Bearer $TOKEN`).

### List funnels — expect `200`, body `.funnels` array

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/subaccount/$SUBACCOUNT_ID/funnels" \
  -H "Authorization: Bearer $TOKEN"
```

### Create funnel (subdomain) — expect `201`, body `.funnel` with `.publishedBaseUrl`

`subDomainName` is validated like the dashboard form (lowercase slug, unique globally).

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/subaccount/$SUBACCOUNT_ID/funnels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"API Funnel\",\"subDomainName\":\"my-offer-$(date +%s)\",\"description\":\"\",\"favicon\":\"\"}"
```

### Strict fail: no Bearer → `401`

```bash
curl -sS -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/subaccount/$SUBACCOUNT_ID/funnels"
```

---

## Note on Server Actions

Pipelines, Kanban, funnel **page** editor persistence, and many dashboard flows are still **Next.js server actions**, not REST. **Funnel shell + subdomain** can also be created via **`POST /api/subaccount/:subAccountId/funnels`** above. Cover shared logic with **Bun unit tests** under `tests/unit/` (e.g. `funnel-editor-json.test.ts`, `pipeline-features.test.ts`, `payment-api.test.ts`, `notification-receiving.test.ts`).
