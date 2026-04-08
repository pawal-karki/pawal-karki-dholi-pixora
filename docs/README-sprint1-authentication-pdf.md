# Sprint 1 – Authentication PDF (Claude Code prompt)

Use this file as the **single source prompt** when you ask Claude Code (or any doc generator) to produce a **7–8 page technical PDF** for your coursework. The project name below is **Pixora** (this repo). If your brief still says *HamroTurf*, replace the name in the master prompt.

---

## How to use this in Claude Code

1. Open this repo in Claude Code.
2. Paste **§ Master prompt** below into a new task (or attach this file with: “Follow `docs/README-sprint1-authentication-pdf.md` exactly”).
3. Ask for output in one of these forms (pick one):
   - **Markdown** (`.md`) that you convert to PDF with Pandoc, VS Code, or Typora; or
   - **HTML** with embedded print CSS, then print to PDF from the browser; or
   - **LaTeX** if you use Overleaf / `pdflatex`.
4. For **images**: request *placeholder boxes* with captions (e.g. “[Screenshot: npmjs.com/package/bcryptjs]”) unless you paste real screenshots yourself later.
5. For **syntax highlighting**: ask for a **VS Code Dark+**-style palette (background `#1E1E1E`, keywords `#569CD6`, strings `#CE9178`, etc.) in HTML `<pre><code>` or fenced code blocks with a note to the PDF tool.

---

## Pixora vs prompt wording (important)

| Prompt section | Pixora reality (this codebase) |
|----------------|----------------------------------|
| **bcryptjs** | `src/lib/auth.ts` — `hashPassword` / `verifyPassword` (cost factor 12). |
| **JWT** | `src/lib/auth.ts` — `generateToken` / `verifyToken`, `JWTPayload`, env `JWT_SECRET`, `JWT_EXPIRES_IN`. |
| **AsyncStorage** | React Native API; **Pixora web** uses **`localStorage` + cookies** in `src/lib/auth-utils.ts` (`setJwtAuth`, `getJwtToken`, `JWT_COOKIE_NAME`). In the PDF, define AsyncStorage academically, then explain **how Pixora achieves the same goal** with browser storage + middleware-readable cookies. |
| **Axios** | Not a dependency in this repo; API routes use **Next.js `fetch`**. Still include **Axios** as required: academic definition + generic `get`/`post` examples; add a short subsection “Parity in Pixora” using `fetch` to `/api/...` if you want alignment with the stack. |

---

## § Master prompt (copy everything below this line)

**Task:** Generate a **7–8 page** technical documentation PDF titled **“Sprint 1 – Authentication and User Management”** for a project called **“Pixora.”**

**Audience & tone:** University-level development report—technical, instructional, neutral academic voice.

**Global layout & style**

- Clean **white** page background, professional typography, clear headings.
- Mix of body text and **simulated** IDE/terminal or website screenshots (use **placeholders** with descriptive captions where a real image is not available).
- **Code snippets:** Use colors inspired by **VS Code Dark** theme (dark background, high-contrast syntax colors) so they read clearly on white pages (e.g. code in a dark panel or bordered block).
- **Footer (every page):** Left or right: student line **`23049142 Aarya Ghimire`**. **Center:** page number (e.g. “Page 3 of 8”).
- **Structure:** Title page, table of contents (optional but recommended), then four main technology sections with **consistent internal structure** (see below).

---

### Document outline (suggested page budget)

| Pages | Content |
|------|---------|
| 1 | Title, author/course metadata, abstract/introduction to Sprint 1 |
| 2–7 | Four sections below (~1.5 pages each); adjust spacing |
| 8 | Summary, references (npm, JWT.io, MDN, React Native docs, Axios docs), glossary optional |

---

### Section template (repeat for each technology)

Use **numbered headers** like **1.1**, **1.2**, **2.1**, **2.2** as appropriate (one subsection per technology is fine: e.g. **1.1 bcryptjs**, **1.2 JWT**, **1.3 AsyncStorage**, **1.4 Axios**—or chapter 1 + 1.1–1.4).

For **each** of the four technologies, include **exactly** these blocks:

1. **Header**  
   Section number + technology name (e.g. **1.1 bcryptjs**).

2. **Introduction**  
   A **screenshot-style placeholder** (boxed image area) representing:
   - **bcryptjs:** npm package page or official docs entry.  
   - **JWT:** jwt.io or RFC overview diagram placeholder.  
   - **AsyncStorage:** React Native / Expo docs placeholder.  
   - **Axios:** axios-http.com or GitHub README placeholder.  
   Caption each placeholder (e.g. “Figure 1.1 — bcryptjs on npm”).

3. **Definitions — “What is [Technology]?”**  
   Clear, formal definition: purpose, typical use in auth stacks, security or networking role.

4. **Project implementation — “How it is used in Pixora”**  
   Concrete, project-specific explanation. For Pixora, tie to:
   - Password hashing at registration/login flows and persistence (e.g. Prisma + hashed passwords).  
   - JWT issuance after verification (e.g. OTP/auth routes under `src/app/api/auth/...`) and verification on the server.  
   - Session persistence: **for Pixora**, describe **`localStorage` + HTTP-only-style patterns via cookies** where applicable (`auth-utils`), not only AsyncStorage.  
   - HTTP client: Axios examples as **reference implementation**; optionally one **`fetch`** example calling a Pixora API route.

5. **Code snippets**  
   Clean, **syntax-highlighted** JavaScript/TypeScript (and React Native only where relevant):

   - **bcryptjs:** Asynchronous **`hash`** and **`compare`** (or `hash` / `compare` from **bcryptjs**) with `async/await`.  
   - **JWT:** **`sign`** and **`verify`** with a **secret key** and sensible `expiresIn`; show payload shape.  
   - **AsyncStorage:** **`getItem`** and **`setItem`** for persisting a login session token (React Native style). **Add a second snippet** for Pixora: **`localStorage.setItem` / `getItem`** mirroring session storage (align with `auth-utils` concepts).  
   - **Axios:** One example using **`async/await`** (`axios.get` / `axios.post`) and one using **`.then()`** chains for the same style of API call.

6. **Short reflection (optional, 2–3 sentences)**  
   Trade-offs, security notes (e.g. never store raw passwords, protect `JWT_SECRET`, HTTPS).

---

### Quality checklist (for the model)

- [ ] Exactly **four** technologies covered with the **same** subsection structure.  
- [ ] **7–8 pages** when rendered (adjust font size/margins in the template if needed).  
- [ ] Footer on **every** page: **`23049142 Aarya Ghimire`** + centered page number.  
- [ ] Code blocks visually distinct (VS Code Dark–style colors).  
- [ ] No placeholder lorem ipsum in headings; captions must name the real site/tool.

---

## Optional: alternate project name

If the assignment requires **HamroTurf** instead of Pixora, re-run the same prompt with global replace: **Pixora → HamroTurf**, and describe a **React Native + Express + MongoDB** stack in section 4 instead of Next.js/Prisma patterns.

---

## File reference in this repo (for accuracy when writing “How it is used in Pixora”)

- `src/lib/auth.ts` — bcryptjs, JWT sign/verify  
- `src/lib/auth-utils.ts` — client JWT persistence (`localStorage`, cookies)  
- `src/app/api/auth/*` — auth-related API routes (OTP, reset password, etc.)

---

## Appendix: Code as implemented in Pixora (copy into your PDF)

### A. `bcryptjs` + JWT — `src/lib/auth.ts`

```ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
```

### B. Signup — hash password + issue JWT (`src/app/api/auth/signup/route.ts`)

```ts
import { hashPassword, generateToken } from "@/lib/auth";

const hashedPassword = await hashPassword(password);

const user = await db.user.create({
  data: { name, email, password: hashedPassword, /* … */ },
});

const token = generateToken({
  userId: user.id,
  email: user.email,
  role: user.role,
});

return NextResponse.json({ message: "User created successfully", user: { /* … */ }, token }, { status: 201 });
```

### C. Signin — verify password + issue JWT (`src/app/api/auth/signin/route.ts`)

```ts
import { verifyPassword, generateToken } from "@/lib/auth";

const isValidPassword = await verifyPassword(password, user.password);
if (!isValidPassword) {
  return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
}

const token = generateToken({
  userId: user.id,
  email: user.email,
  role: user.role,
});

return NextResponse.json({ message: "Sign in successful", user: { /* … */ }, token }, { status: 200 });
```

### D. Protected API — verify Bearer JWT (`src/app/api/auth/me/route.ts`)

```ts
import { verifyToken } from "@/lib/auth";

const authHeader = request.headers.get("Authorization");
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return NextResponse.json({ error: "Authorization token required" }, { status: 401 });
}

const token = authHeader.split(" ")[1];
const payload = verifyToken(token);
if (!payload) {
  return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
}

// …load user from db with payload.userId…
```

### E. Session persistence (browser) — `localStorage` + cookie (`src/lib/auth-utils.ts`)

Pixora does **not** use React Native `AsyncStorage`; it uses **`localStorage`** and a **document cookie** for middleware.

```ts
"use client";

export const JWT_COOKIE_NAME = "auth_token";
export const AUTH_METHOD_KEY = "auth_method";

export function setJwtAuth(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(JWT_COOKIE_NAME, token);
    localStorage.setItem(AUTH_METHOD_KEY, "jwt");
    document.cookie = `${JWT_COOKIE_NAME}=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
  }
}

export function getJwtToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(JWT_COOKIE_NAME);
  }
  return null;
}

export function clearJwtAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(JWT_COOKIE_NAME);
    localStorage.removeItem(AUTH_METHOD_KEY);
    document.cookie = `${JWT_COOKIE_NAME}=; path=/; max-age=0`;
  }
}
```

### F. Client login — `fetch` + `setJwtAuth` (`src/app/(main)/agency/(auth)/sign-in/[[...sign-in]]/page.tsx`)

Pixora uses the **Fetch API**, not Axios.

```ts
import { setJwtAuth } from "@/lib/auth-utils";

const response = await fetch("/api/auth/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: values.email, password: values.password }),
});

const data = await response.json();
if (!response.ok) throw new Error(data.error || "Sign in failed");

if (data.token) {
  setJwtAuth(data.token);
  window.location.href = "/agency";
}
```

### G. Axios (not in repo) — equivalent pattern for coursework PDF

If the assignment requires Axios examples, add this **alongside** Pixora’s `fetch` usage:

```ts
// async/await
const { data } = await axios.post("/api/auth/signin", { email, password });
setJwtAuth(data.token);

// .then() chain
axios
  .get("/api/auth/me", { headers: { Authorization: `Bearer ${getJwtToken()}` } })
  .then((res) => console.log(res.data))
  .catch((err) => console.error(err.response?.data));
```

---

*End of prompt README.*
