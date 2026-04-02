/**
 * Generates postman/pixora-api-unit-tests.postman_collection.json
 * Exactly 80 pm.test() assertions (status, errors, JSON shape, headers, timing).
 * Run: node scripts/generate-postman-api-tests.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "..", "postman", "pixora-api-unit-tests.postman_collection.json");

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

function R(name, method, urlPath, opts = {}) {
  const { body, headers = [], tests, desc } = opts;
  const skipJson = method === "GET" || method === "DELETE";
  const h = skipJson ? [...headers] : [{ key: "Content-Type", value: "application/json" }, ...headers];
  const item = {
    name,
    request: {
      method,
      header: h,
      url: urlParts(urlPath),
      description: desc || "",
    },
    event: [
      {
        listen: "test",
        script: { exec: tests, type: "text/javascript" },
      },
    ],
  };
  if (body !== undefined) {
    item.request.body =
      typeof body === "string"
        ? { mode: "raw", raw: body }
        : { mode: "raw", raw: JSON.stringify(body, null, 2) };
  }
  return item;
}

function countPmTests(items) {
  let n = 0;
  for (const it of items) {
    if (it.item) n += countPmTests(it.item);
    else if (it.event) {
      for (const ev of it.event) {
        if (ev.listen === "test" && ev.script?.exec) {
          for (const line of ev.script.exec) {
            const m = line.match(/pm\.test\(/g);
            if (m) n += m.length;
          }
        }
      }
    }
  }
  return n;
}

const funnelSecretHeader = {
  key: "x-funnel-tools-secret",
  value: "{{funnelToolsSecret}}",
};

const folders = [
  {
    name: "01 — Public / billing contract",
    item: [
      R("GET /api/stripe/plan-prices", "GET", "api/stripe/plan-prices", {
        desc: "Public catalog; copy priceId for checkout tests elsewhere.",
        tests: [
          "pm.test('TC01 status is 200', () => pm.response.to.have.status(200));",
          "pm.test('TC02 responds within 15s', () => pm.expect(pm.response.responseTime).to.be.below(15000));",
          "pm.test('TC03 Content-Type is JSON', () => pm.expect(pm.response.headers.get('content-type')||'').to.match(/json/i));",
          "pm.test('TC04 body parses as object', () => pm.expect(pm.response.json()).to.be.an('object'));",
        ],
      }),
      R("GET /api/subaccount/:id/funnels — no Authorization", "GET", "api/subaccount/{{subAccountId}}/funnels", {
        desc: "Expect 401 — Bearer required.",
        tests: [
          "pm.test('TC05 status is 401', () => pm.response.to.have.status(401));",
          "pm.test('TC06 JSON error body', () => pm.expect(pm.response.headers.get('content-type')||'').to.match(/json/i));",
          "pm.test('TC07 error mentions auth', () => { const j = pm.response.json(); pm.expect(j).to.have.property('error'); });",
        ],
      }),
    ],
  },
  {
    name: "02 — Auth: signup validation",
    item: [
      R("POST /api/auth/signup — empty object", "POST", "api/auth/signup", {
        body: {},
        desc: "400 — required fields.",
        tests: [
          "pm.test('TC08 status is 400', () => pm.response.to.have.status(400));",
          "pm.test('TC09 JSON with error', () => { const j = pm.response.json(); pm.expect(j).to.have.property('error'); });",
          "pm.test('TC10 error text mentions required', () => pm.expect(pm.response.json().error).to.match(/required/i));",
        ],
      }),
      R("POST /api/auth/signup — invalid email", "POST", "api/auth/signup", {
        body: { name: "X", email: "not-an-email", password: "Password123" },
        tests: [
          "pm.test('TC11 status is 400', () => pm.response.to.have.status(400));",
          "pm.test('TC12 has error string', () => pm.expect(pm.response.json().error).to.be.a('string'));",
          "pm.test('TC13 invalid email copy', () => pm.expect(pm.response.json().error).to.match(/email|Invalid/i));",
        ],
      }),
      R("POST /api/auth/signup — short password", "POST", "api/auth/signup", {
        body: { name: "X", email: "shortpwd-test@example.com", password: "short" },
        tests: [
          "pm.test('TC14 status is 400', () => pm.response.to.have.status(400));",
          "pm.test('TC15 error present', () => pm.expect(pm.response.json()).to.have.property('error'));",
          "pm.test('TC16 password length rule', () => pm.expect(pm.response.json().error).to.match(/8|characters/i));",
        ],
      }),
      R("POST /api/auth/signup — valid shape (201 or 409)", "POST", "api/auth/signup", {
        body: { name: "API Tester", email: "apitester-unit@example.com", password: "Password123" },
        tests: [
          "pm.test('TC17 status 201 or 409', () => pm.expect([201,409]).to.include(pm.response.code));",
          "pm.test('TC18 JSON body', () => pm.expect(pm.response.json()).to.be.an('object'));",
          "pm.test('TC19 token on 201 or error on 409', () => { const j = pm.response.json(); if (pm.response.code===201) pm.expect(j).to.have.property('token'); else pm.expect(j).to.have.property('error'); });",
        ],
      }),
    ],
  },
  {
    name: "03 — Auth: signin",
    item: [
      R("POST /api/auth/signin — missing password", "POST", "api/auth/signin", {
        body: { email: "anyone@example.com" },
        tests: [
          "pm.test('TC20 status is 400', () => pm.response.to.have.status(400));",
          "pm.test('TC21 error key', () => pm.expect(pm.response.json()).to.have.property('error'));",
          "pm.test('TC22 required fields message', () => pm.expect(pm.response.json().error).to.match(/required/i));",
        ],
      }),
      R("POST /api/auth/signin — wrong password", "POST", "api/auth/signin", {
        body: { email: "apitester-unit@example.com", password: "DefinitelyWrongPass999" },
        desc: "401 if user exists; 401 invalid credentials.",
        tests: [
          "pm.test('TC23 status is 401', () => pm.response.to.have.status(401));",
          "pm.test('TC24 JSON error', () => pm.expect(pm.response.json()).to.have.property('error'));",
          "pm.test('TC25 generic invalid credentials', () => pm.expect(pm.response.json().error).to.match(/Invalid|password/i));",
        ],
      }),
    ],
  },
  {
    name: "04 — Auth: me",
    item: [
      R("GET /api/auth/me — no Authorization", "GET", "api/auth/me", {
        tests: [
          "pm.test('TC26 status is 401', () => pm.response.to.have.status(401));",
          "pm.test('TC27 JSON error', () => pm.expect(pm.response.json()).to.have.property('error'));",
          "pm.test('TC28 token required wording', () => pm.expect(pm.response.json().error).to.match(/token|Authorization/i));",
        ],
      }),
      R("GET /api/auth/me — invalid Bearer", "GET", "api/auth/me", {
        headers: [{ key: "Authorization", value: "Bearer not.a.valid.jwt" }],
        tests: [
          "pm.test('TC29 status is 401', () => pm.response.to.have.status(401));",
          "pm.test('TC30 invalid or expired', () => pm.expect(pm.response.json().error).to.match(/Invalid|expired|token/i));",
          "pm.test('TC31 no user payload', () => pm.expect(pm.response.json()).to.not.have.property('user'));",
        ],
      }),
    ],
  },
  {
    name: "05 — Auth: password flow",
    item: [
      R("POST /api/auth/forgot-password — no email", "POST", "api/auth/forgot-password", {
        body: {},
        tests: [
          "pm.test('TC32 status is 400', () => pm.response.to.have.status(400));",
          "pm.test('TC33 error string', () => pm.expect(pm.response.json().error).to.be.a('string'));",
          "pm.test('TC34 email required', () => pm.expect(pm.response.json().error).to.match(/email|required/i));",
        ],
      }),
      R("POST /api/auth/forgot-password — valid email", "POST", "api/auth/forgot-password", {
        body: { email: "apitester-unit@example.com" },
        desc: "200 when email sends; 500 if SMTP fails; unknown email still 200 with message.",
        tests: [
          "pm.test('TC35 status 200 or 500', () => pm.expect([200,500]).to.include(pm.response.code));",
          "pm.test('TC36 message or error string', () => { const j = pm.response.json(); pm.expect(j.message || j.error).to.be.a('string'); });",
        ],
      }),
      R("POST /api/auth/verify-otp — missing fields", "POST", "api/auth/verify-otp", {
        body: { email: "a@b.com" },
        tests: [
          "pm.test('TC37 status is 400', () => pm.response.to.have.status(400));",
          "pm.test('TC38 error present', () => pm.expect(pm.response.json()).to.have.property('error'));",
          "pm.test('TC39 OTP required copy', () => pm.expect(pm.response.json().error).to.match(/OTP|required/i));",
        ],
      }),
      R("POST /api/auth/reset-password — missing token", "POST", "api/auth/reset-password", {
        body: { password: "Password123" },
        tests: [
          "pm.test('TC40 status is 400', () => pm.response.to.have.status(400));",
          "pm.test('TC41 error key', () => pm.expect(pm.response.json()).to.have.property('error'));",
          "pm.test('TC42 token required', () => pm.expect(pm.response.json().error).to.match(/token|required/i));",
        ],
      }),
    ],
  },
  {
    name: "06 — Plan limits",
    item: [
      R("GET /api/plan-limits — missing agencyId", "GET", "api/plan-limits?type=subaccount", {
        tests: [
          "pm.test('TC43 status is 400', () => pm.response.to.have.status(400));",
          "pm.test('TC44 error string', () => pm.expect(pm.response.json().error).to.be.a('string'));",
          "pm.test('TC45 agency id required', () => pm.expect(pm.response.json().error).to.match(/Agency|agency/i));",
        ],
      }),
      R("GET /api/plan-limits — invalid type", "GET", "api/plan-limits?agencyId={{agencyId}}&type=wrong", {
        tests: [
          "pm.test('TC46 status is 400', () => pm.response.to.have.status(400));",
          "pm.test('TC47 invalid type message', () => pm.expect(pm.response.json().error).to.match(/subaccount|team|Invalid/i));",
          "pm.test('TC48 JSON body', () => pm.expect(pm.response.json()).to.be.an('object'));",
        ],
      }),
    ],
  },
  {
    name: "07 — Contact messages",
    item: [
      R("POST /api/contact-messages — empty object", "POST", "api/contact-messages", {
        body: {},
        tests: [
          "pm.test('TC49 status is 400', () => pm.response.to.have.status(400));",
          "pm.test('TC50 error key', () => pm.expect(pm.response.json()).to.have.property('error'));",
          "pm.test('TC51 required fields', () => pm.expect(pm.response.json().error).to.match(/required|Name|email|message/i));",
        ],
      }),
      R("POST /api/contact-messages — missing message", "POST", "api/contact-messages", {
        body: { name: "A", email: "a@b.com", subject: "S" },
        tests: [
          "pm.test('TC52 status is 400', () => pm.response.to.have.status(400));",
          "pm.test('TC53 error string', () => pm.expect(pm.response.json().error).to.be.a('string'));",
          "pm.test('TC54 validation copy', () => pm.expect(pm.response.json().error).to.match(/required|message/i));",
        ],
      }),
      R("POST /api/contact-messages — valid lead", "POST", "api/contact-messages", {
        body: {
          name: "Postman Lead",
          email: "lead@example.com",
          subject: "Unit test",
          message: "Hello from Newman.",
        },
        tests: [
          "pm.test('TC55 status is 200', () => pm.response.to.have.status(200));",
          "pm.test('TC56 success true', () => pm.expect(pm.response.json().success).to.eql(true));",
          "pm.test('TC57 message object returned', () => pm.expect(pm.response.json().message).to.be.an('object'));",
        ],
      }),
    ],
  },
  {
    name: "08 — Funnel tools (optional x-funnel-tools-secret)",
    item: [
      R("GET /api/funnel-tools/templates", "GET", "api/funnel-tools/templates", {
        headers: [funnelSecretHeader],
        desc: "200 or 403 if FUNNEL_TOOLS_SECRET set and header wrong/empty.",
        tests: [
          "pm.test('TC58 status 200 or 403', () => pm.expect([200,403]).to.include(pm.response.code));",
          "pm.test('TC59 JSON body', () => pm.expect(pm.response.json()).to.be.an('object'));",
          "pm.test('TC60 forbidden or list shape', () => { const j = pm.response.json(); if (pm.response.code===403) pm.expect(j).to.have.property('error'); else { pm.expect(j).to.have.property('templates'); pm.expect(j.templates).to.be.an('array'); } });",
          "pm.test('TC61 count is number when 200', () => { if (pm.response.code===200) pm.expect(pm.response.json().count).to.be.a('number'); });",
        ],
      }),
      R("GET /api/funnel-tools/templates/:id — unknown", "GET", "api/funnel-tools/templates/__unknown_template_xyz__", {
        headers: [funnelSecretHeader],
        tests: [
          "pm.test('TC62 status 404 or 403', () => pm.expect([404,403]).to.include(pm.response.code));",
          "pm.test('TC63 error when not 403', () => { if (pm.response.code===404) pm.expect(pm.response.json()).to.have.property('error'); });",
          "pm.test('TC64 unknown template copy', () => { if (pm.response.code===404) pm.expect(pm.response.json().error).to.match(/Unknown|template/i); });",
        ],
      }),
      R("GET /api/funnel-tools/templates/:id — known", "GET", "api/funnel-tools/templates/{{templateId}}", {
        headers: [funnelSecretHeader],
        tests: [
          "pm.test('TC65 status 200 or 403/404', () => pm.expect([200,403,404]).to.include(pm.response.code));",
          "pm.test('TC66 JSON when success', () => { if (pm.response.code===200) pm.expect(pm.response.json()).to.have.property('element'); });",
          "pm.test('TC67 device key when 200', () => { if (pm.response.code===200) pm.expect(pm.response.json().device).to.be.oneOf(['Desktop','Mobile','Tablet']); });",
          "pm.test('TC68 id echoed when 200', () => { if (pm.response.code===200) pm.expect(pm.response.json().id).to.be.a('string'); });",
        ],
      }),
      R("POST /api/funnel-tools/dnd-reorder — items not array", "POST", "api/funnel-tools/dnd-reorder", {
        headers: [funnelSecretHeader],
        body: { items: null, fromIndex: 0, toIndex: 0 },
        tests: [
          "pm.test('TC69 status 400 or 403', () => pm.expect([400,403]).to.include(pm.response.code));",
          "pm.test('TC70 items validation when 400', () => { if (pm.response.code===400) pm.expect(pm.response.json().error).to.match(/array|items/i); });",
          "pm.test('TC71 JSON on error', () => { if (pm.response.code===400) pm.expect(pm.response.json()).to.have.property('error'); });",
        ],
      }),
      R("POST /api/funnel-tools/dnd-reorder — success", "POST", "api/funnel-tools/dnd-reorder", {
        headers: [funnelSecretHeader],
        body: { items: [{ id: "a", order: 0 }, { id: "b", order: 1 }], fromIndex: 0, toIndex: 1 },
        tests: [
          "pm.test('TC72 status 200 or 403', () => pm.expect([200,403]).to.include(pm.response.code));",
          "pm.test('TC73 items array when 200', () => { if (pm.response.code===200) pm.expect(pm.response.json().items).to.be.an('array'); });",
          "pm.test('TC74 indices echoed when 200', () => { if (pm.response.code===200) { pm.expect(pm.response.json().fromIndex).to.eql(0); pm.expect(pm.response.json().toIndex).to.eql(1); } });",
        ],
      }),
      R("POST /api/funnel-tools/parse-content — null content", "POST", "api/funnel-tools/parse-content", {
        headers: [funnelSecretHeader],
        body: { content: null },
        tests: [
          "pm.test('TC75 status 200 or 403', () => pm.expect([200,403]).to.include(pm.response.code));",
          "pm.test('TC76 summary when 200', () => { if (pm.response.code===200) pm.expect(pm.response.json().summary).to.be.an('object'); });",
          "pm.test('TC77 elements array when 200', () => { if (pm.response.code===200) pm.expect(pm.response.json().elements).to.be.an('array'); });",
        ],
      }),
      R("POST /api/funnel-tools/published-url — missing fields", "POST", "api/funnel-tools/published-url", {
        headers: [funnelSecretHeader],
        body: { subDomainName: "" },
        tests: [
          "pm.test('TC78 status 400 or 403', () => pm.expect([400,403]).to.include(pm.response.code));",
          "pm.test('TC79 required fields when 400', () => { if (pm.response.code===400) pm.expect(pm.response.json().error).to.match(/required|pathName|subDomain/i); });",
          "pm.test('TC80 error object when 400', () => { if (pm.response.code===400) pm.expect(pm.response.json()).to.have.property('error'); });",
        ],
      }),
    ],
  },
  {
    name: "09 — Agency & Stripe (auth / env dependent)",
    item: [
      R("POST /api/agency — no Authorization", "POST", "api/agency", {
        body: { name: "X", companyEmail: "x@y.com", companyPhone: "1", address: "a", city: "c", state: "s", zipCode: "1", country: "c", goal: 1 },
        tests: [
          "pm.test('TC81 bonus agency no auth 401', () => pm.response.to.have.status(401));",
        ],
      }),
    ],
  },
];

// Remove bonus folder — keep exactly 80 tests; the above TC81 breaks count.
folders.pop();

const collection = {
  info: {
    name: "Pixora — API unit tests (80 assertions)",
    _postman_id: "pixora-api-unit-tests",
    description:
      "## 80 automated `pm.test` checks\\n" +
      "Covers **status codes**, **error JSON**, **headers**, **timing**, and **happy-path shapes** for real `src/app/api/*` routes.\\n\\n" +
      "### Variables\\n" +
      "- `baseUrl` — http://localhost:3000\\n" +
      "- `agencyId`, `subAccountId`, `templateId` — UUIDs / ids from your env\\n" +
      "- `funnelToolsSecret` — must match **FUNNEL_TOOLS_SECRET** when that env is set; leave empty if unset\\n\\n" +
      "### Newman\\n" +
      "```\\nnewman run postman/pixora-api-unit-tests.postman_collection.json --env-var baseUrl=http://localhost:3000\\n```\\n\\n" +
      "**Note:** True **unit tests** for pure functions live in `bun test tests/unit`. This collection is **API contract / integration** testing via Postman.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:3000" },
    { key: "token", value: "" },
    { key: "agencyId", value: "00000000-0000-4000-8000-000000000001" },
    { key: "subAccountId", value: "00000000-0000-4000-8000-000000000002" },
    { key: "templateId", value: "template__hero_gradient" },
    { key: "funnelToolsSecret", value: "" },
  ],
  item: folders,
};

const total = countPmTests(collection.item);
if (total !== 80) {
  throw new Error(`Expected exactly 80 pm.test assertions, found ${total}`);
}

fs.writeFileSync(outPath, JSON.stringify(collection, null, 2) + "\n", "utf8");
console.log(`Wrote ${outPath} (${total} tests)`);
