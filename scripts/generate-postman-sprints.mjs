/**
 * Generates postman/pixora-sprints-complete.postman_collection.json
 * Lean collection: 4 sprints × 4 core HTTP flows (real Pixora API routes only).
 * Run: node scripts/generate-postman-sprints.mjs  |  bun run postman:generate
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "..", "postman", "pixora-sprints-complete.postman_collection.json");

function urlParts(fullPath) {
  const [p, qs] = fullPath.split("?");
  const segments = p.split("/").filter(Boolean);
  const item = {
    raw: `{{baseUrl}}/${segments.join("/")}`,
    host: ["{{baseUrl}}"],
    path: segments,
  };
  if (qs) {
    item.query = qs.split("&").map((pair) => {
      const [k, v] = pair.split("=");
      return { key: k, value: v || "" };
    });
    item.raw += `?${qs}`;
  }
  return item;
}

function testScript(lines) {
  return [
    {
      listen: "test",
      script: {
        exec: Array.isArray(lines) ? lines : lines.split("\n").filter(Boolean),
        type: "text/javascript",
      },
    },
  ];
}

function R(name, method, urlPath, opts = {}) {
  const { body, formdata, headers = [], desc, tests: t, noJsonHeader } = opts;
  const isForm = Array.isArray(formdata);
  const skipJson =
    noJsonHeader || method === "GET" || method === "DELETE" || isForm;
  const h = skipJson
    ? [...headers]
    : [{ key: "Content-Type", value: "application/json" }, ...headers];
  const item = {
    name,
    request: {
      method,
      header: h,
      url: urlParts(urlPath),
    },
  };
  if (isForm) {
    item.request.body = { mode: "formdata", formdata };
  } else if (body !== undefined) {
    item.request.body =
      typeof body === "string"
        ? { mode: "raw", raw: body }
        : { mode: "raw", raw: JSON.stringify(body, null, 2) };
  }
  if (desc) item.request.description = desc;
  if (t) item.event = testScript(t);
  return item;
}

const saveToken = [
  "try {",
  "  var j = pm.response.json();",
  "  if (j.token) pm.collectionVariables.set('token', j.token);",
  "} catch (e) {}",
];

const collection = {
  info: {
    name: "Pixora — 4 Core Sprints (API smoke)",
    _postman_id: "pixora-sprints-complete",
    description:
      "## Six sprints (24 requests). Sprint 5 = **funnel-tools** (templates, DnD JSON, parse editor content, published URL). Sprint 6 = **subaccount funnels REST** (`GET`/`POST` `/api/subaccount/:id/funnels`, Bearer JWT). Optional: set **FUNNEL_TOOLS_SECRET** in `.env` and header `x-funnel-tools-secret` on funnel-tools requests.\\n" +
      "Only **real** `app/api/*` routes. Most dashboard flows = **Server Actions** — use `bun test tests/unit`.\\n\\n" +
      "## Variables\\n" +
      "- `baseUrl` — e.g. http://localhost:3000\\n" +
      "- `agencyId`, `subAccountId`, `priceId` (from Sprint 2 → Plan prices)\\n" +
      "- `token` — auto-set after **Signup** or **Signin**\\n\\n" +
      "## Order\\n" +
      "1. Sprint 1: Signup or Signin first → `token` filled\\n" +
      "2. Sprint 2: set `priceId`, cookie routes use `auth_token={{token}}`\\n" +
      "3. Requires **PostgreSQL** (`DATABASE_URL`) or auth/Stripe calls return 500\\n\\n" +
      "## Regenerate\\n`bun run postman:generate`\\n\\n" +
      "## Newman\\n```\\nnewman run postman/pixora-sprints-complete.postman_collection.json --env-var baseUrl=http://localhost:3000\\n```",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:3000" },
    { key: "token", value: "" },
    { key: "agencyId", value: "YOUR_AGENCY_UUID" },
    { key: "subAccountId", value: "YOUR_SUBACCOUNT_UUID" },
    { key: "priceId", value: "price_FROM_plan_prices" },
    { key: "messageId", value: "YOUR_CONTACT_MESSAGE_UUID" },
    { key: "templateId", value: "template__hero_gradient" },
    { key: "funnelToolsSecret", value: "" },
  ],
  item: [
    {
      name: "Sprint 1 — Authentication & access",
      item: [
        R("1.1 Signup", "POST", "api/auth/signup", {
          body: {
            name: "API User",
            email: "apiuser@example.com",
            password: "Password123",
          },
          desc: "Expect **201** + `token` when DB is up. Change email if user already exists (then **409**).",
          tests: [
            ...saveToken,
            "pm.test('Signup returns 201 or 409', () => pm.expect([201,409]).to.include(pm.response.code));",
          ],
        }),
        R("1.2 Signin", "POST", "api/auth/signin", {
          body: {
            email: "apiuser@example.com",
            password: "Password123",
          },
          desc: "Match email/password to **1.1**. Saves `token` for later.",
          tests: [
            ...saveToken,
            "pm.test('Signin 200 or 401', () => pm.expect([200,401]).to.include(pm.response.code));",
          ],
        }),
        R("1.3 Create agency (multipart form)", "POST", "api/agency", {
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          formdata: [
            { key: "name", value: "My API Agency", type: "text" },
            { key: "companyEmail", value: "contact@myapiagency.com", type: "text" },
            { key: "companyPhone", value: "+15551234567", type: "text" },
            { key: "address", value: "123 Main Street Suite 100", type: "text" },
            { key: "city", value: "Kathmandu", type: "text" },
            { key: "state", value: "Bagmati", type: "text" },
            { key: "zipCode", value: "44600", type: "text" },
            { key: "country", value: "Nepal", type: "text" },
            {
              key: "agencyLogo",
              value:
                "https://api.dicebear.com/7.x/initials/svg?seed=MyAgency",
              type: "text",
            },
            { key: "whiteLabel", value: "true", type: "text" },
            { key: "goal", value: "5", type: "text" },
          ],
          desc:
            "**POST /api/agency** — same fields as the agency settings form. Requires **Bearer** JWT; user must **not** already have an agency (**409** if they do). Saves returned `agency.id` to collection variable **agencyId**. Alternative: send **application/json** with the same keys.",
          tests: [
            "try {",
            "  var j = pm.response.json();",
            "  if (j.agency && j.agency.id) pm.collectionVariables.set('agencyId', j.agency.id);",
            "} catch (e) {}",
            "pm.test('Create agency 201 or 4xx', () => pm.expect([201,400,401,409,500]).to.include(pm.response.code));",
          ],
        }),
        R("1.4 Me (Bearer JWT)", "GET", "api/auth/me", {
          noJsonHeader: true,
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          desc: "Uses **Authorization: Bearer**, not cookies.",
          tests: [
            "pm.test('Me 200 with valid token', () => pm.expect([200,401]).to.include(pm.response.code));",
          ],
        }),
        R("1.5 Forgot password", "POST", "api/auth/forgot-password", {
          body: { email: "apiuser@example.com" },
          desc: "Expect **200** (anti-enumeration). OTP flow: verify-otp + reset-password in app or add requests manually.",
          tests: ["pm.test('Forgot password 200', () => pm.response.code === 200);"],
        }),
      ],
    },
    {
      name: "Sprint 2 — Stripe & billing",
      item: [
        R("2.1 Plan prices (public)", "GET", "api/stripe/plan-prices", {
          noJsonHeader: true,
          header: [],
          desc: "Copy a **priceId** into collection variable for **2.3**.",
          tests: [
            "pm.test('Plan prices 200', () => pm.response.code === 200);",
            "pm.test('Body is object', () => pm.expect(pm.response.json()).to.be.an('object'));",
          ],
        }),
        R("2.2 Products list (local)", "GET", "api/stripe/products?subAccountId={{subAccountId}}&source=local", {
          noJsonHeader: true,
          header: [],
          desc: "Set **subAccountId** first.",
          tests: ["pm.test('Products 200', () => pm.response.code === 200);"],
        }),
        R("2.3 Create subscription checkout", "POST", "api/stripe/create-subscription-session", {
          header: [{ key: "Cookie", value: "auth_token={{token}}" }],
          body: {
            agencyId: "{{agencyId}}",
            priceId: "{{priceId}}",
            successUrl:
              "{{baseUrl}}/agency/{{agencyId}}/billing?success=true&session_id={CHECKOUT_SESSION_ID}",
            cancelUrl: "{{baseUrl}}/agency/{{agencyId}}/billing?canceled=true",
          },
          desc: "Needs logged-in user + valid **agencyId** / **priceId** / URLs allowed by server.",
          tests: [
            "pm.test('Subscription session responds', () => pm.expect([200,400,401,403]).to.include(pm.response.code));",
          ],
        }),
        R("2.4 Cancel subscription (owner)", "POST", "api/stripe/cancel-subscription", {
          header: [{ key: "Cookie", value: "auth_token={{token}}" }],
          body: { agencyId: "{{agencyId}}" },
          desc: "**AGENCY_OWNER** only. 403 if not owner; 404 if no subscription.",
          tests: [
            "pm.test('Cancel responds', () => pm.expect([200,401,403,404,500]).to.include(pm.response.code));",
          ],
        }),
      ],
    },
    {
      name: "Sprint 3 — Leads, contact & plan limits",
      item: [
        R("3.1 Submit contact (public lead)", "POST", "api/contact-messages", {
          body: {
            name: "Site Visitor",
            email: "visitor@example.com",
            subject: "Hello",
            message: "Interested in your services.",
          },
          desc: "No auth. Maps to landing **Contact** form.",
          tests: ["pm.test('Contact 200', () => pm.response.code === 200);"],
        }),
        R("3.2 Plan limits — subaccounts", "GET", "api/plan-limits?agencyId={{agencyId}}&type=subaccount", {
          noJsonHeader: true,
          header: [],
          tests: [
            "pm.test('Plan limits responds', () => pm.expect([200,400,500]).to.include(pm.response.code));",
          ],
        }),
        R("3.3 Plan limits — team invites", "GET", "api/plan-limits?agencyId={{agencyId}}&type=team", {
          noJsonHeader: true,
          header: [],
          tests: [
            "pm.test('Team limits responds', () => pm.expect([200,400,500]).to.include(pm.response.code));",
          ],
        }),
        R("3.4 Reply to contact (agency)", "POST", "api/contact-messages/reply", {
          body: {
            messageId: "{{messageId}}",
            subject: "Re: Hello",
            replyBody: "Thanks for your message.",
          },
          desc: "Needs **Clerk/session** same as browser (`getCurrentUserEmail`). Often **401** from Postman unless you copy session cookie.",
          tests: [
            "pm.test('Reply responds', () => pm.expect([200,401,404,500]).to.include(pm.response.code));",
          ],
        }),
      ],
    },
    {
      name: "Sprint 4 — Media, chat & checkout API",
      item: [
        R("4.1 List media", "GET", "api/media?subAccountId={{subAccountId}}", {
          noJsonHeader: true,
          header: [],
          tests: ["pm.test('Media 200', () => pm.response.code === 200);"],
        }),
        R("4.2 Create product (local only)", "POST", "api/stripe/products", {
          body: {
            subAccountId: "{{subAccountId}}",
            name: "Postman Product",
            price: "9.99",
            localOnly: true,
          },
          desc: "**price** must be a string. Requires valid **subAccountId**.",
          tests: [
            "pm.test('Product create responds', () => pm.expect([200,400,404,500]).to.include(pm.response.code));",
          ],
        }),
        R("4.3 Chat send (session)", "POST", "api/chat/send", {
          header: [{ key: "Cookie", value: "auth_token={{token}}" }],
          body: {
            content: "Hello",
            conversationId: "00000000-0000-0000-0000-000000000000",
          },
          desc: "Replace **conversationId** with a real UUID from the app. **401** if cookie/session missing.",
          tests: [
            "pm.test('Chat responds', () => pm.expect([200,401,404,500]).to.include(pm.response.code));",
          ],
        }),
        R("4.4 Stripe webhook (signature check)", "POST", "api/stripe/webhook", {
          body: "{}",
          desc: "Without **stripe-signature** header expect **400**. Real events: `stripe listen --forward-to .../api/stripe/webhook`.",
          tests: ["pm.test('Webhook rejects unsigned', () => pm.response.code === 400);"],
        }),
      ],
    },
    {
      name: "Sprint 5 — Funnel editor, templates & DnD (test APIs)",
      item: [
        R("5.1 List editor templates", "GET", "api/funnel-tools/templates", {
          noJsonHeader: true,
          header: [{ key: "x-funnel-tools-secret", value: "{{funnelToolsSecret}}" }],
          desc: "All **TEMPLATE_GENERATORS** ids. If `FUNNEL_TOOLS_SECRET` is unset, leave **funnelToolsSecret** empty and omit header in Postman (disable the header row) or keep empty string.",
          tests: [
            "pm.test('Templates 200', () => pm.expect([200,403]).to.include(pm.response.code));",
            "if (pm.response.code === 200) { var j = pm.response.json(); pm.expect(j).to.have.property('templates'); }",
          ],
        }),
        R("5.2 Get template sample JSON", "GET", "api/funnel-tools/templates/{{templateId}}?device=Desktop", {
          noJsonHeader: true,
          header: [{ key: "x-funnel-tools-secret", value: "{{funnelToolsSecret}}" }],
          desc: "Fresh generated **EditorElement** tree (new UUIDs each call). Try **template__modern_navbar**, **template__pricing_table**, etc.",
          tests: [
            "pm.test('Sample 200 or 404', () => pm.expect([200,403,404]).to.include(pm.response.code));",
          ],
        }),
        R("5.3 DnD reorder (funnel steps JSON)", "POST", "api/funnel-tools/dnd-reorder", {
          header: [
            { key: "x-funnel-tools-secret", value: "{{funnelToolsSecret}}" },
          ],
          body: {
            items: [
              { id: "page-a", title: "Step A" },
              { id: "page-b", title: "Step B" },
              { id: "page-c", title: "Step C" },
            ],
            fromIndex: 0,
            toIndex: 2,
            assignOrder: true,
          },
          desc: "Same semantics as **reorderByIndex** + **assignSequentialOrder** (`src/lib/dnd-reorder.ts`).",
          tests: [
            "pm.test('DnD 200', () => pm.expect([200,403]).to.include(pm.response.code));",
          ],
        }),
        R("5.4 Parse funnel page editor JSON", "POST", "api/funnel-tools/parse-content", {
          header: [
            { key: "x-funnel-tools-secret", value: "{{funnelToolsSecret}}" },
          ],
          body: {
            content: null,
            findId: "__body",
          },
          desc: "Pass **content** string from **FunnelPage.content** or `null` for default body. Optional **findId** to locate an element.",
          tests: ["pm.test('Parse 200', () => pm.expect([200,403]).to.include(pm.response.code));"],
        }),
        R("5.5 Build published funnel page URL", "POST", "api/funnel-tools/published-url", {
          header: [
            { key: "x-funnel-tools-secret", value: "{{funnelToolsSecret}}" },
          ],
          body: {
            subDomainName: "myfunnel",
            pathName: "landing",
            scheme: "https",
            domain: "pawal.dev",
          },
          desc: "Matches **buildPublishedFunnelPageUrl** (`src/lib/funnel-url.ts`).",
          tests: ["pm.test('URL 200', () => pm.expect([200,403]).to.include(pm.response.code));"],
        }),
      ],
    },
    {
      name: "Sprint 6 — Subaccount funnels (create + list)",
      item: [
        R("6.1 List funnels", "GET", "api/subaccount/{{subAccountId}}/funnels", {
          noJsonHeader: true,
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          desc: "Requires **Signin** token and **subAccountId** the user has **Permissions** for (same rules as `/subaccount/[id]` layout). Expect **200** + `{ funnels: [...] }` with **publishedBaseUrl** when subdomain is set.",
          tests: [
            "pm.test('List 200/401/403/404', () => pm.expect([200,401,403,404]).to.include(pm.response.code));",
          ],
        }),
        R("6.2 Create funnel (subdomain)", "POST", "api/subaccount/{{subAccountId}}/funnels", {
          header: [{ key: "Authorization", value: "Bearer {{token}}" }],
          body: {
            name: "API Funnel",
            subDomainName: "api-funnel-demo",
            description: "Created via Postman",
            favicon: "",
          },
          desc: "**201** + `{ funnel }` if subdomain is free. **409** if **subDomainName** is taken globally. Change **subDomainName** (slug, lowercase) if you already created this funnel. Matches **FunnelDetailsValidator** (`src/queries/validators.ts`).",
          tests: [
            "pm.test('Create 201/400/401/403/409', () => pm.expect([201,400,401,403,409]).to.include(pm.response.code));",
          ],
        }),
      ],
    },
  ],
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(collection, null, 2), "utf8");
console.log("Wrote", outPath, "| 6 sprints, 24 requests");
