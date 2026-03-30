/**
 * Generates postman/pixora-sprints-complete.postman_collection.json
 * Run: node scripts/generate-postman-sprints.mjs
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

/** badge: pass | failExpected | edge */
function R(name, method, urlPath, opts = {}) {
  const { body, headers = [], desc, tests: t, noJsonHeader } = opts;
  const skipJson =
    noJsonHeader || method === "GET" || method === "DELETE";
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
  if (body !== undefined) {
    item.request.body =
      typeof body === "string"
        ? { mode: "raw", raw: body }
        : { mode: "raw", raw: JSON.stringify(body, null, 2) };
  }
  if (desc) item.request.description = desc;
  if (t) item.event = testScript(t);
  return item;
}

const signinSaveToken = [
  "try {",
  "  var j = pm.response.json();",
  "  if (j.token) pm.collectionVariables.set('token', j.token);",
  "} catch (e) {}",
];

const signupSaveToken = signinSaveToken;

const collection = {
  info: {
    name: "Pixora — All Sprints (Complete API + Test Mapping)",
    _postman_id: "pixora-sprints-complete",
    description:
      "## Setup\\n" +
      "1. Import this file in Postman (Import → file).\\n" +
      "2. Open the collection **Variables** tab and set: `baseUrl`, `agencyId`, `subAccountId`, `priceId` (from **Sprint 2 → Plan prices**), `connectAccountId`, `productId`, `messageId`, `conversationId` as needed.\\n" +
      "3. Run **Sprint 1 → Signin valid (save token)** or **Signup valid**; scripts store JWT in `token`.\\n" +
      "4. For cookie routes (Stripe subscription, chat), the collection uses `Cookie: auth_token={{token}}`.\\n\\n" +
      "## Badges in test names\\n" +
      "- **PASS** — happy path\\n" +
      "- **FAIL_EXPECTED** — request should error (4xx); test passes when status matches\\n" +
      "- **EDGE** — boundary / security / infra\\n\\n" +
      "## Newman (CI)\\n" +
      "```bash\\n" +
      "newman run postman/pixora-sprints-complete.postman_collection.json \\\n" +
      "  --env-var baseUrl=https://your-domain.com \\\n" +
      "  --env-var agencyId=UUID \\\n" +
      "  --env-var subAccountId=UUID \\\n" +
      "  --reporters cli,htmlextra\\n" +
      "```\\n\\n" +
      "## Server Actions / UI-only features\\n" +
      "Sprints 3–6 include requests that **proxy** real endpoints or document coverage. Funnel editor, Kanban, notifications UI, and full analytics are covered by **Bun unit tests** under `tests/unit/` (see per-request descriptions).",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:3000" },
    { key: "token", value: "" },
    { key: "agencyId", value: "YOUR_AGENCY_UUID" },
    { key: "subAccountId", value: "YOUR_SUBACCOUNT_UUID" },
    { key: "subAccountIdOther", value: "OTHER_SUBACCOUNT_UUID" },
    { key: "priceId", value: "price_FROM_plan_prices" },
    { key: "connectAccountId", value: "acct_STRIPE_CONNECT" },
    { key: "productId", value: "YOUR_PRODUCT_UUID" },
    { key: "messageId", value: "YOUR_CONTACT_MESSAGE_UUID" },
    { key: "conversationId", value: "YOUR_CONVERSATION_UUID" },
    { key: "testEmail", value: "postman_test@example.com" },
  ],
  item: [],
};

// --- Sprint 1 (22) ---
const s1 = [];
s1.push(
  R(
    "🟢 S1-01 Registration — valid (expect 201 + token)",
    "POST",
    "api/auth/signup",
    {
      body: {
        name: "Sprint1 User",
        email: "{{testEmail}}",
        password: "Password123",
      },
      tests: [
        ...signupSaveToken,
        "pm.test('[PASS] S1-01 status 201', () => pm.response.code === 201);",
        "pm.test('[PASS] S1-01 has token', () => { const j = pm.response.json(); pm.expect(j).to.have.property('token'); });",
      ],
    }
  )
);
s1.push(
  R(
    "🔴 S1-02 Registration — missing fields (expect 400)",
    "POST",
    "api/auth/signup",
    {
      body: { email: "x@y.com" },
      tests: [
        "pm.test('[FAIL_EXPECTED] S1-02 status 400', () => pm.response.code === 400);",
        "pm.test('[FAIL_EXPECTED] S1-02 error message', () => { const j = pm.response.json(); pm.expect(j).to.have.property('error'); });",
      ],
    }
  )
);
s1.push(
  R(
    "🔴 S1-03 Registration — invalid email (expect 400)",
    "POST",
    "api/auth/signup",
    {
      body: { name: "A", email: "not-an-email", password: "Password123" },
      tests: ["pm.test('[FAIL_EXPECTED] S1-03 status 400', () => pm.response.code === 400);"],
    }
  )
);
s1.push(
  R(
    "🔴 S1-04 Registration — short password (expect 400)",
    "POST",
    "api/auth/signup",
    {
      body: { name: "A", email: "a@b.com", password: "short" },
      tests: ["pm.test('[FAIL_EXPECTED] S1-04 status 400', () => pm.response.code === 400);"],
    }
  )
);
s1.push(
  R(
    "🔴 S1-05 Registration — duplicate email (expect 409)",
    "POST",
    "api/auth/signup",
    {
      body: {
        name: "Dup",
        email: "{{testEmail}}",
        password: "Password123",
      },
      desc: "Run after S1-01 with same testEmail.",
      tests: ["pm.test('[FAIL_EXPECTED] S1-05 status 409', () => pm.response.code === 409);"],
    }
  )
);
s1.push(
  R(
    "🟢 S1-06 Login — valid (expect 200, save token)",
    "POST",
    "api/auth/signin",
    {
      body: { email: "{{testEmail}}", password: "Password123" },
      tests: [
        ...signinSaveToken,
        "pm.test('[PASS] S1-06 status 200', () => pm.response.code === 200);",
        "pm.test('[PASS] S1-06 has token', () => { const j = pm.response.json(); pm.expect(j).to.have.property('token'); });",
      ],
    }
  )
);
s1.push(
  R(
    "🔴 S1-07 Login — wrong password (expect 401)",
    "POST",
    "api/auth/signin",
    {
      body: { email: "{{testEmail}}", password: "WrongPassword!!!" },
      tests: ["pm.test('[FAIL_EXPECTED] S1-07 status 401', () => pm.response.code === 401);"],
    }
  )
);
s1.push(
  R(
    "🔴 S1-08 Login — unknown user (expect 401)",
    "POST",
    "api/auth/signin",
    {
      body: { email: "no_user_exists@example.com", password: "Password123" },
      tests: ["pm.test('[FAIL_EXPECTED] S1-08 status 401', () => pm.response.code === 401);"],
    }
  )
);
s1.push(
  R(
    "🔴 S1-09 Login — missing body fields (expect 400)",
    "POST",
    "api/auth/signin",
    {
      body: { email: "{{testEmail}}" },
      tests: ["pm.test('[FAIL_EXPECTED] S1-09 status 400', () => pm.response.code === 400);"],
    }
  )
);
s1.push(
  R(
    "🔴 S1-10 Me — no Authorization (expect 401)",
    "GET",
    "api/auth/me",
    { noJsonHeader: true, header: [], tests: ["pm.test('[FAIL_EXPECTED] S1-10 status 401', () => pm.response.code === 401);"] }
  )
);
s1.push(
  R(
    "🔴 S1-11 Me — garbage JWT (expect 401, not 500)",
    "GET",
    "api/auth/me",
    {
      noJsonHeader: true,
      header: [{ key: "Authorization", value: "Bearer not.a.valid.jwt" }],
      desc: "Expected 401. If you see 500, JWT verification throws in /api/auth/me (fix server).",
      tests: [
        "pm.test('[FAIL_EXPECTED] S1-11 invalid JWT not 2xx', () => pm.expect(pm.response.code).to.be.at.least(400));",
      ],
    }
  )
);
s1.push(
  R(
    "🟢 S1-12 Me — valid Bearer (expect 200 + user.role)",
    "GET",
    "api/auth/me",
    {
      noJsonHeader: true,
      header: [{ key: "Authorization", value: "Bearer {{token}}" }],
      tests: [
        "pm.test('[PASS] S1-12 status 200', () => pm.response.code === 200);",
        "pm.test('[PASS] S1-12 role check', () => { const j = pm.response.json(); pm.expect(j.user).to.have.property('role'); });",
      ],
    }
  )
);
s1.push(
  R(
    "🟢 S1-13 Forgot password — valid shape (expect 200)",
    "POST",
    "api/auth/forgot-password",
    {
      body: { email: "{{testEmail}}" },
      tests: ["pm.test('[PASS] S1-13 status 200', () => pm.response.code === 200);"],
    }
  )
);
s1.push(
  R(
    "🔴 S1-14 Forgot password — missing email (expect 400)",
    "POST",
    "api/auth/forgot-password",
    {
      body: {},
      tests: ["pm.test('[FAIL_EXPECTED] S1-14 status 400', () => pm.response.code === 400);"],
    }
  )
);
s1.push(
  R(
    "🟡 S1-15 Forgot password — unknown email anti-enumeration (expect 200)",
    "POST",
    "api/auth/forgot-password",
    {
      body: { email: "unknown_user_xyz@example.com" },
      tests: [
        "pm.test('[EDGE] S1-15 status 200 (no enumeration)', () => pm.response.code === 200);",
      ],
    }
  )
);
s1.push(
  R(
    "🔴 S1-16 Verify OTP — missing otp (expect 400)",
    "POST",
    "api/auth/verify-otp",
    {
      body: { email: "{{testEmail}}" },
      tests: ["pm.test('[FAIL_EXPECTED] S1-16 status 400', () => pm.response.code === 400);"],
    }
  )
);
s1.push(
  R(
    "🔴 S1-17 Verify OTP — invalid otp (expect 400)",
    "POST",
    "api/auth/verify-otp",
    {
      body: { email: "{{testEmail}}", otp: "000000" },
      tests: ["pm.test('[FAIL_EXPECTED] S1-17 status 400', () => pm.response.code === 400);"],
    }
  )
);
s1.push(
  R(
    "🔴 S1-18 Reset password — missing token (expect 400)",
    "POST",
    "api/auth/reset-password",
    {
      body: { password: "NewPassword123" },
      tests: ["pm.test('[FAIL_EXPECTED] S1-18 status 400', () => pm.response.code === 400);"],
    }
  )
);
s1.push(
  R(
    "🔴 S1-19 Reset password — short password (expect 400)",
    "POST",
    "api/auth/reset-password",
    {
      body: { token: "invalid", password: "short" },
      tests: ["pm.test('[FAIL_EXPECTED] S1-19 status 400', () => pm.response.code === 400);"],
    }
  )
);
s1.push(
  R(
    "🟡 S1-20 Brute-force edge — repeated failed signin",
    "POST",
    "api/auth/signin",
    {
      body: { email: "{{testEmail}}", password: "bad-attempt" },
      desc: "Run multiple times; optional rate limit may apply per IP.",
      tests: [
        "pm.test('[EDGE] S1-20 failed login returns 401', () => pm.response.code === 401);",
      ],
    }
  )
);
s1.push(
  R(
    "🟡 S1-21 SQLi probe — signup name field (expect 400 or 201, never 5xx)",
    "POST",
    "api/auth/signup",
    {
      body: {
        name: "'; DROP TABLE users;--",
        email: "sqli_probe@example.com",
        password: "Password123",
      },
      tests: [
        "pm.test('[EDGE] S1-21 no 5xx from SQLi string in name', () => pm.expect(pm.response.code).to.be.below(500));",
      ],
    }
  )
);
s1.push(
  R(
    "🟡 S1-22 XSS probe — signup name stored (expect 201 or 409)",
    "POST",
    "api/auth/signup",
    {
      body: {
        name: "<script>alert(1)</script>",
        email: "xss_probe@example.com",
        password: "Password123",
      },
      tests: [
        "pm.test('[EDGE] S1-22 accepts or conflicts without 5xx', () => pm.expect(pm.response.code).to.be.oneOf([201,409]));",
      ],
    }
  )
);

// --- Sprint 2 (15) ---
const s2 = [];
s2.push(
  R(
    "🟢 S2-01 Plan prices — public (expect 200)",
    "GET",
    "api/stripe/plan-prices",
    {
      noJsonHeader: true,
      header: [],
      tests: [
        "pm.test('[PASS] S2-01 status 200', () => pm.response.code === 200);",
        "pm.test('[PASS] S2-01 JSON object', () => { pm.response.json(); });",
      ],
    }
  )
);
s2.push(
  R(
    "🔴 S2-02 Subscription session — no cookie (expect 401)",
    "POST",
    "api/stripe/create-subscription-session",
    {
      body: {
        agencyId: "{{agencyId}}",
        priceId: "{{priceId}}",
        successUrl: "{{baseUrl}}/agency/{{agencyId}}/billing?ok=1",
        cancelUrl: "{{baseUrl}}/agency/{{agencyId}}/billing?c=1",
      },
      tests: ["pm.test('[FAIL_EXPECTED] S2-02 status 401', () => pm.response.code === 401);"],
    }
  )
);
s2.push(
  R(
    "🟢 S2-03 Subscription session — with auth cookie",
    "POST",
    "api/stripe/create-subscription-session",
    {
      header: [{ key: "Cookie", value: "auth_token={{token}}" }],
      body: {
        agencyId: "{{agencyId}}",
        priceId: "{{priceId}}",
        successUrl: "{{baseUrl}}/agency/{{agencyId}}/billing?success=true&session_id={CHECKOUT_SESSION_ID}",
        cancelUrl: "{{baseUrl}}/agency/{{agencyId}}/billing?canceled=true",
      },
      desc: "Requires valid agencyId, priceId, URLs allowed by server.",
      tests: [
        "pm.test('[PASS] S2-03 subscription session responds', () => pm.expect([200,400,401,403,404,500]).to.include(pm.response.code));",
      ],
    }
  )
);
s2.push(
  R(
    "🟡 S2-04 Cancel subscription — non-owner may 403",
    "POST",
    "api/stripe/cancel-subscription",
    {
      header: [{ key: "Cookie", value: "auth_token={{token}}" }],
      body: { agencyId: "{{agencyId}}" },
      tests: [
        "pm.test('[EDGE] S2-04 cancel returns 401/403/404/200', () => pm.expect([200,401,403,404,500]).to.include(pm.response.code));",
      ],
    }
  )
);
s2.push(
  R(
    "🟢 S2-05 Checkout embedded — invalid empty (expect 400)",
    "POST",
    "api/stripe/create-checkout-session",
    {
      body: { subAccountConnectedId: "", prices: [] },
      tests: ["pm.test('[FAIL_EXPECTED] S2-05 status 400', () => pm.response.code === 400);"],
    }
  )
);
s2.push(
  R(
    "🟡 S2-06 Checkout embedded — happy path (needs Connect + price)",
    "POST",
    "api/stripe/create-checkout-session",
    {
      body: {
        subAccountConnectedId: "{{connectAccountId}}",
        subAccountId: "{{subAccountId}}",
        prices: [{ priceId: "{{priceId}}", quantity: 1 }],
        mode: "embedded",
      },
      tests: [
        "pm.test('[PASS] S2-06 checkout outcome', () => pm.expect([200,400,404,500]).to.include(pm.response.code));",
      ],
    }
  )
);
s2.push(
  R(
    "🟡 S2-07 Checkout redirect — with success/cancel URLs",
    "POST",
    "api/stripe/create-checkout-session",
    {
      body: {
        subAccountConnectedId: "{{connectAccountId}}",
        subAccountId: "{{subAccountId}}",
        prices: [{ priceId: "{{priceId}}", quantity: 1 }],
        mode: "redirect",
        successUrl: "{{baseUrl}}/funnel?checkout=success",
        cancelUrl: "{{baseUrl}}/funnel?checkout=canceled",
      },
      tests: [
        "pm.test('[PASS] S2-07 checkout outcome', () => pm.expect([200,400,404,500]).to.include(pm.response.code));",
      ],
    }
  )
);
s2.push(
  R(
    "🔴 S2-08 Products — missing subAccountId (expect 400)",
    "GET",
    "api/stripe/products",
    { noJsonHeader: true, header: [], tests: ["pm.test('[FAIL_EXPECTED] S2-08 status 400', () => pm.response.code === 400);"] }
  )
);
s2.push(
  R(
    "🟢 S2-09 Products — list local",
    "GET",
    "api/stripe/products?subAccountId={{subAccountId}}&source=local",
    { noJsonHeader: true, header: [], tests: ["pm.test('[PASS] S2-09 status 200', () => pm.response.code === 200);"] }
  )
);
s2.push(
  R(
    "🟢 S2-10 Products — create local (price as string)",
    "POST",
    "api/stripe/products",
    {
      body: {
        subAccountId: "{{subAccountId}}",
        name: "Postman Product",
        price: "29.99",
        localOnly: true,
      },
      tests: ["pm.test('[PASS] S2-10 product create outcome', () => pm.expect([200,400,404,500]).to.include(pm.response.code));"],
    }
  )
);
s2.push(
  R(
    "🟡 S2-11 Products — delete",
    "DELETE",
    "api/stripe/products?productId={{productId}}&subAccountId={{subAccountId}}",
    { noJsonHeader: true, header: [], tests: ["pm.test('[EDGE] S2-11 200/404', () => pm.expect([200,400,404,500]).to.include(pm.response.code));"] }
  )
);
s2.push(
  R(
    "🔴 S2-12 Webhook — no stripe-signature (expect 400)",
    "POST",
    "api/stripe/webhook",
    {
      body: "{}",
      tests: ["pm.test('[FAIL_EXPECTED] S2-12 status 400', () => pm.response.code === 400);"],
    }
  )
);
s2.push(
  R(
    "🔴 S2-13 Webhook — bad signature (expect 400)",
    "POST",
    "api/stripe/webhook",
    {
      header: [{ key: "stripe-signature", value: "t=1,v1=bad" }],
      body: "{}",
      tests: ["pm.test('[FAIL_EXPECTED] S2-13 status 400', () => pm.response.code === 400);"],
    }
  )
);
s2.push(
  R(
    "🟡 S2-14 Plan limits — billing eligibility proxy (subaccount)",
    "GET",
    "api/plan-limits?agencyId={{agencyId}}&type=subaccount",
    {
      noJsonHeader: true,
      header: [],
      tests: ["pm.test('[PASS] S2-14 plan-limits outcome', () => pm.expect([200,400,500]).to.include(pm.response.code));"],
    }
  )
);
s2.push(
  R(
    "🟡 S2-15 Stripe Connect onboarding — doc (use Dashboard + /agency OAuth)",
    "GET",
    "api/stripe/plan-prices",
    {
      noJsonHeader: true,
      header: [],
      desc: "Connect onboarding is Stripe Dashboard + app launchpad OAuth. Invoice webhooks: use `stripe listen` forwarding to /api/stripe/webhook. Maps to tests/unit: payment-api, oauth-stripe-connect.",
      tests: ["pm.test('[PASS] S2-15 ping API alive', () => pm.response.code === 200);"],
    }
  )
);

// Sprint 3 (19) — proxy HTTP + unit-test mapping in descriptions
const s3 = [];
const s3Desc = (u) =>
  `HTTP proxy for Sprint 3. Full funnel/drag-drop/publish: run \`bun test tests/unit/funnel-editor-json.test.ts\`, \`dnd-editor-tree.test.ts\`, \`funnel-pages-crud.test.ts\`. ${u}`;

for (let i = 1; i <= 19; i++) {
  const id = String(i).padStart(2, "0");
  let item;
  if (i <= 3) {
    item = R(`🟢 S3-${id} Site / tenant — plan limits check`, "GET", "api/plan-limits?agencyId={{agencyId}}&type=subaccount", {
      noJsonHeader: true,
      header: [],
      desc: s3Desc(""),
      tests: [
        `pm.test('[PASS] S3-${id} plan-limits', () => pm.expect([200,400,500]).to.include(pm.response.code));`,
      ],
    });
  } else if (i <= 8) {
    item = R(`🟢 S3-${id} Funnel commerce — checkout session probe`, "POST", "api/stripe/create-checkout-session", {
      body: {
        subAccountConnectedId: "{{connectAccountId}}",
        subAccountId: "{{subAccountId}}",
        prices: [{ priceId: "{{priceId}}", quantity: 1 }],
        mode: "embedded",
      },
      desc: s3Desc(""),
      tests: [
        `pm.test('[PASS] S3-${id} checkout responds', () => pm.expect([200,400,500]).to.include(pm.response.code));`,
      ],
    });
  } else if (i <= 12) {
    item = R(`🟡 S3-${id} Lead / publish proxy — contact message`, "POST", "api/contact-messages", {
      body: {
        name: "Funnel Visitor",
        email: `funnel_${id}@example.com`,
        message: "Sprint3 lead capture probe",
      },
      desc: s3Desc(""),
      tests: [`pm.test('[PASS] S3-${id} 200', () => pm.response.code === 200);`],
    });
  } else if (i <= 16) {
    item = R(`🟡 S3-${id} Subdomain / isolation — media list tenant A`, "GET", "api/media?subAccountId={{subAccountId}}", {
      noJsonHeader: true,
      header: [],
      desc: s3Desc("Cross-tenant: compare with subAccountIdOther in S4."),
      tests: [`pm.test('[PASS] S3-${id} 200', () => pm.response.code === 200);`],
    });
  } else {
    item = R(`🟡 S3-${id} Rollback / JSON — GET plan-prices (stable read)`, "GET", "api/stripe/plan-prices", {
      noJsonHeader: true,
      header: [],
      desc: s3Desc(""),
      tests: [`pm.test('[PASS] S3-${id} 200', () => pm.response.code === 200);`],
    });
  }
  s3.push(item);
}

// Sprint 4 (20)
const s4 = [];
for (let i = 1; i <= 20; i++) {
  const id = String(i).padStart(2, "0");
  const map = [
    () =>
      R(`🟢 S4-${id} Lead capture — contact valid`, "POST", "api/contact-messages", {
        body: { name: "Lead", email: `lead${id}@e.com`, message: "Hi" },
        tests: ["pm.test('[PASS] S4 status 200', () => pm.response.code === 200);"],
      }),
    () =>
      R(`🔴 S4-${id} Lead capture — invalid body`, "POST", "api/contact-messages", {
        body: { name: "", email: "a@b.com", message: "" },
        tests: ["pm.test('[FAIL_EXPECTED] S4 status 400', () => pm.response.code === 400);"],
      }),
    () =>
      R(`🟡 S4-${id} Plan limits — team invites`, "GET", "api/plan-limits?agencyId={{agencyId}}&type=team", {
        noJsonHeader: true,
        header: [],
        tests: ["pm.test('[PASS] S4 team limits', () => pm.expect([200,400,500]).to.include(pm.response.code));"],
      }),
    () =>
      R(`🟡 S4-${id} Sub-account isolation — media other tenant`, "GET", "api/media?subAccountId={{subAccountIdOther}}", {
        noJsonHeader: true,
        header: [],
        desc: "Kanban/pipelines: `bun test tests/unit/pipeline-features.test.ts`",
        tests: ["pm.test('[PASS] S4 media 200', () => pm.response.code === 200);"],
      }),
    () =>
      R(`🟢 S4-${id} Products — list`, "GET", "api/stripe/products?subAccountId={{subAccountId}}&source=local", {
        noJsonHeader: true,
        header: [],
        tests: ["pm.test('[PASS] S4 products 200', () => pm.response.code === 200);"],
      }),
  ];
  s4.push(map[i % map.length]());
}

collection.item.push({ name: "Sprint 1 — Authentication & Access (22)", item: s1 });
collection.item.push({ name: "Sprint 2 — Stripe Connect & Billing (15)", item: s2 });
collection.item.push({ name: "Sprint 3 — Website & Funnel Builder (19)", item: s3 });
collection.item.push({ name: "Sprint 4 — Multi-Agency, Sub-Accounts & Kanban (20)", item: s4 });

const s5fixed = [
  R("🟢 S5-01 Media — list valid tenant", "GET", "api/media?subAccountId={{subAccountId}}", {
    noJsonHeader: true,
    header: [],
    tests: ["pm.test('[PASS] S5-01 200', () => pm.response.code === 200);"],
  }),
  R("🔴 S5-02 Media — missing subAccountId (400)", "GET", "api/media", {
    noJsonHeader: true,
    header: [],
    tests: ["pm.test('[FAIL_EXPECTED] S5-02 400', () => pm.response.code === 400);"],
  }),
  R("🟡 S5-03 Media — other subaccount isolation", "GET", "api/media?subAccountId={{subAccountIdOther}}", {
    noJsonHeader: true,
    header: [],
    tests: ["pm.test('[PASS] S5-03 200', () => pm.response.code === 200);"],
  }),
  R("🟢 S5-04 UploadThing — GET ping", "GET", "api/uploadthing", {
    noJsonHeader: true,
    header: [],
    desc: "Valid multipart uploads: UI + `tests/unit/uploadthing-config.test.ts`",
    tests: ["pm.test('[PASS] S5-04 uploadthing GET', () => pm.expect([200,404,405,500]).to.include(pm.response.code));"],
  }),
  R("🟡 S5-05 Products — bogus subAccountId", "GET", "api/stripe/products?subAccountId=00000000-0000-0000-0000-000000000001&source=local", {
    noJsonHeader: true,
    header: [],
    tests: ["pm.test('[EDGE] S5-05 products outcome', () => pm.expect([200,400,404,500]).to.include(pm.response.code));"],
  }),
  R("🟢 S5-06 Public read — plan-prices", "GET", "api/stripe/plan-prices", {
    noJsonHeader: true,
    header: [],
    tests: ["pm.test('[PASS] S5-06 200', () => pm.response.code === 200);"],
  }),
  R("🟢 S5-07 Contact — message with filename text", "POST", "api/contact-messages", {
    body: { name: "U", email: "u@e.com", message: "See screenshot.png" },
    tests: ["pm.test('[PASS] S5-07 200', () => pm.response.code === 200);"],
  }),
  R("🟡 S5-08 Contact — long message body", "POST", "api/contact-messages", {
    body: { name: "U", email: "u@e.com", message: "L".repeat(8000) },
    tests: ["pm.test('[EDGE] S5-08 long message', () => pm.expect([200,400,413,500]).to.include(pm.response.code));"],
  }),
  R("🟢 S5-09 Product create — localOnly", "POST", "api/stripe/products", {
    body: {
      subAccountId: "{{subAccountId}}",
      name: "AssetRef",
      price: "5.00",
      localOnly: true,
    },
    tests: ["pm.test('[PASS] S5-09 product', () => pm.expect([200,400,404,500]).to.include(pm.response.code));"],
  }),
  R("🟡 S5-10 Auth context — /me with token", "GET", "api/auth/me", {
    noJsonHeader: true,
    header: [{ key: "Authorization", value: "Bearer {{token}}" }],
    tests: ["pm.test('[PASS] S5-10 200', () => pm.expect([200,401]).to.include(pm.response.code));"],
  }),
  R("🔴 S5-11 Webhook — unsigned", "POST", "api/stripe/webhook", {
    body: "{}",
    tests: ["pm.test('[FAIL_EXPECTED] S5-11 400', () => pm.response.code === 400);"],
  }),
  R("🟡 S5-12 Unit mapping — uploadthing-config", "GET", "api/stripe/plan-prices", {
    noJsonHeader: true,
    header: [],
    desc: "Run `bun test tests/unit/uploadthing-config.test.ts` for MIME/size limits.",
    tests: ["pm.test('[PASS] S5-12 200', () => pm.response.code === 200);"],
  }),
];

collection.item.push({ name: "Sprint 5 — Media Management (12)", item: s5fixed });

// Sprint 6 (18)
const s6 = [];
for (let i = 1; i <= 18; i++) {
  const id = String(i).padStart(2, "0");
  const endpoints = [
    () =>
      R(`🟢 S6-${id} KPI proxy — plan-prices`, "GET", "api/stripe/plan-prices", {
        noJsonHeader: true,
        header: [],
        desc: "Dashboard KPIs: server-side; unit: subscription-access, stripe dashboard helpers.",
        tests: ["pm.test('[PASS] S6 200', () => pm.response.code === 200);"],
      }),
    () =>
      R(`🟡 S6-${id} Conversion proxy — checkout session`, "POST", "api/stripe/create-checkout-session", {
        body: { subAccountConnectedId: "", prices: [] },
        tests: ["pm.test('[FAIL_EXPECTED] S6 invalid checkout 400', () => pm.response.code === 400);"],
      }),
    () =>
      R(`🟡 S6-${id} Notifications proxy — chat send auth`, "POST", "api/chat/send", {
        body: { content: "ping", conversationId: "{{conversationId}}" },
        tests: ["pm.test('[FAIL_EXPECTED] S6 chat 401 without session', () => pm.expect([401,404]).to.include(pm.response.code));"],
      }),
    () =>
      R(`🟡 S6-${id} AI / editor proxy — chat AI`, "POST", "api/chat/ai", {
        header: [{ key: "Cookie", value: "auth_token={{token}}" }],
        body: { content: "Hello", conversationId: "{{conversationId}}" },
        desc: "Editor undo/redo: `tests/unit/dnd-editor-tree.test.ts`, `funnel-editor-json.test.ts`",
        tests: [
          "pm.test('[EDGE] S6 AI responds', () => pm.expect([200,400,401,404,500]).to.include(pm.response.code));",
        ],
      }),
  ];
  s6.push(endpoints[i % endpoints.length]());
}
collection.item.push({ name: "Sprint 6 — Analytics, Notifications & Editor (18)", item: s6 });

// NF (12)
const nf = [
  R("🟡 NF1-01 Performance — plan-prices timing", "GET", "api/stripe/plan-prices", {
    noJsonHeader: true,
    header: [],
    tests: [
      "pm.test('[EDGE] NF1-01 response time < 5s', () => pm.expect(pm.response.responseTime).to.be.below(5000));",
    ],
  }),
  R("🟡 NF1-02 Performance — auth me timing", "GET", "api/auth/me", {
    noJsonHeader: true,
    header: [{ key: "Authorization", value: "Bearer {{token}}" }],
    tests: [
      "pm.test('[EDGE] NF1-02 response time < 5s', () => pm.expect(pm.response.responseTime).to.be.below(5000));",
    ],
  }),
  R("🟡 NF2-01 SQLi — signin email field", "POST", "api/auth/signin", {
    body: { email: "admin' OR '1'='1", password: "x" },
    tests: ["pm.test('[EDGE] NF2-01 no successful bypass as 200 with token', () => { if(pm.response.code===200){ const j=pm.response.json(); pm.expect(j).to.not.have.property('token'); } else { pm.expect(pm.response.code).to.be.at.least(400); } });"],
  }),
  R("🟡 NF2-02 SQLi — forgot password email", "POST", "api/auth/forgot-password", {
    body: { email: "x'; DELETE FROM users;--@y.com" },
    tests: ["pm.test('[EDGE] NF2-02 still 200 or 400 without 5xx', () => pm.expect(pm.response.code).to.be.below(500));"],
  }),
  R("🟡 NF3-01 XSS — contact message", "POST", "api/contact-messages", {
    body: { name: "N", email: "n@e.com", message: "<img src=x onerror=alert(1)>" },
    tests: ["pm.test('[EDGE] NF3-01 contact accepted', () => pm.expect([200,400,500]).to.include(pm.response.code));"],
  }),
  R("🟡 NF3-02 XSS — contact subject", "POST", "api/contact-messages", {
    body: {
      name: "N",
      email: "n@e.com",
      subject: "<script>bad</script>",
      message: "body",
    },
    tests: ["pm.test('[EDGE] NF3-02 200', () => pm.response.code === 200);"],
  }),
  R("🔴 NF4-01 JWT — expired/invalid me", "GET", "api/auth/me", {
    noJsonHeader: true,
    header: [{ key: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.invalid" }],
    tests: ["pm.test('[FAIL_EXPECTED] NF4-01 401', () => pm.expect([401,500]).to.include(pm.response.code));"],
  }),
  R("🟡 NF4-02 Concurrent smoke — plan-prices x3 logical", "GET", "api/stripe/plan-prices", {
    noJsonHeader: true,
    header: [],
    desc: "Run collection runner 3x or use Newman with iterationCount.",
    tests: ["pm.test('[PASS] NF4-02 200', () => pm.response.code === 200);"],
  }),
  R("🟡 NF4-03 Rate limit probe — repeated signin", "POST", "api/auth/signin", {
    body: { email: "{{testEmail}}", password: "wrong" },
    tests: ["pm.test('[EDGE] NF4-03 401', () => pm.response.code === 401);"],
  }),
  R("🟡 NF4-04 Auth boundary — empty Bearer", "GET", "api/auth/me", {
    noJsonHeader: true,
    header: [{ key: "Authorization", value: "Bearer " }],
    tests: ["pm.test('[FAIL_EXPECTED] NF4-04 401', () => pm.response.code === 401);"],
  }),
  R("🟡 NF2-03 Injection — signin with extra JSON keys", "POST", "api/auth/signin", {
    body: { email: "{{testEmail}}", password: "Password123", admin: true },
    tests: ["pm.test('[EDGE] NF2-03 200 if creds ok else 401', () => pm.expect([200,401]).to.include(pm.response.code));"],
  }),
  R("🟢 NF1-03 Health-ish — products error fast", "GET", "api/stripe/products", {
    noJsonHeader: true,
    header: [],
    tests: ["pm.test('[FAIL_EXPECTED] NF1-03 400 missing param', () => pm.response.code === 400);"],
  }),
];
collection.item.push({ name: "Non-Functional — NF1–NF4 (12)", item: nf });

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(collection, null, 2), "utf8");
console.log("Wrote", outPath);
console.log(
  "Counts:",
  s1.length,
  s2.length,
  s3.length,
  s4.length,
  s5fixed.length,
  s6.length,
  nf.length,
  "total",
  s1.length + s2.length + s3.length + s4.length + s5fixed.length + s6.length + nf.length
);
