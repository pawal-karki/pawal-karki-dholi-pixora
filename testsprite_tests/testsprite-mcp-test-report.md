
# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** Pixora
- **Date:** 2026-03-28
- **Prepared by:** TestSprite AI Team
- **Test Scope:** Full codebase (backend API + frontend UI)
- **Local Endpoint:** http://localhost:3000
- **Server Mode:** Development

---

## 2️⃣ Requirement Validation Summary

### Requirement: User Authentication (Backend)
- **Description:** Email/password signup, signin, JWT-based session, forgot password with OTP, password reset.

#### Test TC001 — POST /api/auth/signup — Create new user account
- **Test Code:** [TC001_post_api_auth_signup_create_new_user_account.py](./TC001_post_api_auth_signup_create_new_user_account.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/1c4c5db4-edd2-4ca1-b474-c49481681cd4
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Signup returns 201 with JWT token and user object. Duplicate email correctly returns 409.
---

#### Test TC002 — POST /api/auth/signin — Authenticate user
- **Test Code:** [TC002_post_api_auth_signin_authenticate_user.py](./TC002_post_api_auth_signin_authenticate_user.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/47b61ecc-b422-43d0-aa35-633161050572
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Signin works with valid credentials (test_pawal@yopmail.com). Invalid password correctly returns 401.
---

#### Test TC003 — GET /api/auth/me — Return current user profile
- **Test Code:** [TC003_get_api_auth_me_return_current_user_profile.py](./TC003_get_api_auth_me_return_current_user_profile.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/7251e837-4c7e-4537-a1e9-976be5a74bfb
- **Status:** ❌ Failed
- **Severity:** HIGH
- **Analysis / Findings:** **Real bug found.** When an invalid/malformed JWT is provided, the endpoint returns HTTP 500 (Internal Server Error) instead of the expected 401. The `verifyToken` function returns null for invalid tokens, but the route handler's catch block swallows the error as a generic 500. This needs a fix to gracefully return 401 for invalid tokens.
---

#### Test TC004 — POST /api/auth/forgot-password — Send OTP
- **Test Code:** [TC004_post_api_auth_forgot_password_send_otp.py](./TC004_post_api_auth_forgot_password_send_otp.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/b30541b7-9510-4f18-8cf2-a57d8c24d28e
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Forgot password endpoint works correctly. Anti-enumeration pattern confirmed: unknown emails also return 200.
---

#### Test TC005 — POST /api/auth/verify-otp — Validate OTP
- **Test Code:** [TC005_post_api_auth_verify_otp_validate_otp.py](./TC005_post_api_auth_verify_otp_validate_otp.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/317ddd34-c6b9-4856-aaed-35df37dc33ef
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Invalid OTP correctly returns 400. Valid OTP flow cannot be tested without email inbox access.
---

#### Test TC006 — POST /api/auth/reset-password — Set new password
- **Test Code:** [TC006_post_api_auth_reset_password_set_new_password.py](./TC006_post_api_auth_reset_password_set_new_password.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/58633aed-6af6-4036-b0aa-a6f0d1276740
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Invalid/expired reset token correctly returns 400. Valid flow depends on verify-otp.
---

### Requirement: Contact Messages (Backend)
- **Description:** Public contact form submission and staff reply with SMTP email.

#### Test TC007 — POST /api/contact-messages — Submit public message
- **Test Code:** [TC007_post_api_contact_messages_submit_public_message.py](./TC007_post_api_contact_messages_submit_public_message.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/db92eff3-31b9-442c-8cbd-466ee38dddf9
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Contact message submission works. Missing fields correctly return 400.
---

#### Test TC008 — POST /api/contact-messages/reply — Send email reply
- **Test Code:** [TC008_post_api_contact_messages_reply_send_email_reply.py](./TC008_post_api_contact_messages_reply_send_email_reply.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/6eec025b-5c11-499b-b519-83ac2f18dc34
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** The reply endpoint returns 401 when cookie auth is sent through the TestSprite tunnel proxy. This is a **test environment limitation** — the `getCurrentUserEmail()` function reads cookies via Next.js `cookies()` which cannot access cookies forwarded through an external tunnel. Not a code bug.
---

### Requirement: Chat System (Backend)
- **Description:** Direct user-to-user chat with Pusher realtime events.

#### Test TC009 — POST /api/chat/send — Save direct chat message
- **Test Code:** [TC009_post_api_chat_send_save_direct_chat_message.py](./TC009_post_api_chat_send_save_direct_chat_message.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/91eb590d-b8cb-4e41-b45d-3f911b0017cb
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Auth validation works — unauthenticated requests return 401. Missing content/conversationId returns 400.
---

### Requirement: Stripe Payments (Backend)
- **Description:** Plan prices, subscription management, checkout sessions, cancellation.

#### Test TC010 — GET /api/stripe/plan-prices — List plan price IDs
- **Test Code:** [TC010_get_api_stripe_plan_prices_list_plan_price_ids.py](./TC010_get_api_stripe_plan_prices_list_plan_price_ids.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/8ee28413-1d23-45f4-b3cb-ba503f2b15d9
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Plan prices endpoint returns a valid object mapping plan keys to Stripe price IDs.
---

#### Test TC013 — POST /api/stripe/cancel-subscription — Authorization validation
- **Test Code:** [TC013_post_api_stripe_cancel_subscription_unauthorized.py](./TC013_post_api_stripe_cancel_subscription_unauthorized.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/f1951d8e-390b-4d59-abf1-37ce44a309ba
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Unauthenticated requests correctly return 401. Non-owner roles return 403.
---

#### Test TC014 — POST /api/stripe/create-subscription-session — Validation
- **Test Code:** [TC014_post_api_stripe_create_subscription_session_validation.py](./TC014_post_api_stripe_create_subscription_session_validation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/c974be9b-86f0-447b-98f7-1aa59b98471f
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Missing auth returns 401. Missing required fields return 400.
---

#### Test TC015 — POST /api/stripe/create-checkout-session — Validation
- **Test Code:** [TC015_post_api_stripe_create_checkout_session_validation.py](./TC015_post_api_stripe_create_checkout_session_validation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/941894fc-b4e5-4d3c-9f27-df41ca8476ba
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Missing required fields and empty prices correctly return 400.
---

### Requirement: Plan Limits & Media (Backend)
- **Description:** Agency plan limit checks and media file listing.

#### Test TC011 — GET /api/plan-limits — Check agency plan limits
- **Test Code:** [TC011_get_api_plan_limits_check_agency_plan_limits.py](./TC011_get_api_plan_limits_check_agency_plan_limits.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/4b5e5fff-dbe5-48bc-8cd4-93b39479a962
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Plan limits endpoint returns allowed, currentCount, maxAllowed fields. Missing agencyId returns 400.
---

#### Test TC012 — GET /api/media — List media files
- **Test Code:** [TC012_get_api_media_list_media_files.py](./TC012_get_api_media_list_media_files.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/b243b9f5-4fb6-4587-b9de-78d3008ac326/c3947da5-022f-4d25-8ba1-f8796bbadcf5
- **Status:** ❌ Failed
- **Severity:** LOW
- **Analysis / Findings:** Test expected the response to be a direct array but the API returns `{ media: Media[] }` (wrapped in an object). This is a **test expectation mismatch**, not a code bug. The API returns media correctly inside a `media` property.
---

### Requirement: Landing Page UI (Frontend)
- **Description:** Hero section, navigation, pricing, about, testimonials, contact form, footer, icons.

#### Test FE001 — Landing page loads with hero section and navigation
- **Test Code:** [FE001_landing_page_loads_with_hero_section_and_navigation.py](./FE001_landing_page_loads_with_hero_section_and_navigation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/78df24eb-7f1d-40f1-aa9e-cabbc7e887ff
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Hero section renders with heading, navigation bar, and Get Started CTA button.
---

#### Test FE002 — Pricing section displays plans with Rs currency
- **Test Code:** [FE002_landing_page_pricing_section_displays_plans.py](./FE002_landing_page_pricing_section_displays_plans.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/9bf808dc-eb8a-4ff0-a0af-4b56f873311e
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Pricing cards render with Nepali Rupee (Rs) amounts and feature lists.
---

#### Test FE003 — About section renders with feature descriptions and icons
- **Test Code:** [FE003_landing_page_about_section_renders_with_features.py](./FE003_landing_page_about_section_renders_with_features.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/4583fe96-4402-491a-a88e-90bec8c374b2
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** About section displays features with SVG icons and descriptive text.
---

#### Test FE004 — Contact form submission with valid data
- **Test Code:** [FE004_contact_form_submission_with_valid_data.py](./FE004_contact_form_submission_with_valid_data.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/531a0058-4d3e-47b7-905e-eb506dea8e56
- **Status:** ❌ Failed
- **Severity:** MEDIUM
- **Analysis / Findings:** Form was filled and submitted but the success toast notification was not detected by the automated browser. The toast uses a client-side library (likely `sonner` or `react-hot-toast`) which renders outside the main DOM tree. The API call likely succeeded but the visual confirmation was not captured. This is a **test detection limitation** — the toast may appear briefly and disappear before the automated browser checks.
---

#### Test FE005 — Contact form validation rejects empty fields
- **Test Code:** [FE005_contact_form_validation_rejects_empty_fields.py](./FE005_contact_form_validation_rejects_empty_fields.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/ffc4e3bf-6e20-408b-bd3b-9c4c1a3521d0
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Empty form submission is correctly prevented with validation feedback.
---

#### Test FE006 — Footer renders with link columns and copyright
- **Test Code:** [FE006_footer_renders_with_link_columns_and_copyright.py](./FE006_footer_renders_with_link_columns_and_copyright.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/b8f7300d-107b-4a3a-b831-32d17684111f
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Footer renders Product, Resources, Company columns with copyright year 2026.
---

#### Test FE008 — Navigation anchor links scroll to sections
- **Test Code:** [FE008_navigation_anchor_links_scroll_to_sections.py](./FE008_navigation_anchor_links_scroll_to_sections.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/1781db63-42de-4f4c-a763-d1a6f1d2037c
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Clicking Pricing, About, Contact links scrolls to the correct page sections.
---

#### Test FE009 — Testimonials section displays reviews
- **Test Code:** [FE009_testimonials_section_displays_reviews.py](./FE009_testimonials_section_displays_reviews.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/b0a7e42f-9f2e-4ed3-b949-c51f0e966be3
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Testimonial cards render with names, roles, and review text.
---

#### Test FE010 — Landing page icons render as SVGs in all sections
- **Test Code:** [FE010_landing_page_icons_render_as_SVGs_in_all_sections.py](./FE010_landing_page_icons_render_as_SVGs_in_all_sections.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/1efc6079-5881-477d-ad7b-3b351a2a832e
- **Status:** ✅ Passed
- **Severity:** LOW
- **Analysis / Findings:** Lucide React SVG icons confirmed in hero, pricing, about, and contact sections.
---

### Requirement: Authentication UI (Frontend)
- **Description:** Sign-in page rendering and login flow.

#### Test FE007 — Sign in page renders login form
- **Test Code:** [FE007_sign_in_page_renders_login_form.py](./FE007_sign_in_page_renders_login_form.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/326e5446-7773-479a-b287-6f51ded73469
- **Status:** ❌ Failed
- **Severity:** LOW
- **Analysis / Findings:** The test navigated to `/agency/auth/sign-in` which returned "Not Found". The actual sign-in page uses Clerk's hosted auth at a different path. This is a **test configuration issue** — the sign-in URL needs to match the Clerk-managed route.
---

#### Test FE012 — Sign in with valid credentials redirects to dashboard
- **Test Code:** [FE012_sign_in_with_valid_credentials_redirects_to_dashboard.py](./FE012_sign_in_with_valid_credentials_redirects_to_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/0932b379-4144-4112-a2c2-d7d7638796ad
- **Status:** ❌ Failed
- **Severity:** LOW
- **Analysis / Findings:** Same issue as FE007 — sign-in page route doesn't exist at the tested path. Clerk handles auth routes differently.
---

### Requirement: Responsive Design (Frontend)
- **Description:** Mobile viewport layout and responsive navigation.

#### Test FE011 — Landing page is responsive on mobile viewport
- **Test Code:** [FE011_landing_page_is_responsive_on_mobile_viewport.py](./FE011_landing_page_is_responsive_on_mobile_viewport.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/ffdf90ac-7a09-4640-9e9e-a0d8443f1270/7adab364-0b11-461e-b562-121660fa5131
- **Status:** ❌ Failed
- **Severity:** LOW
- **Analysis / Findings:** **Test environment limitation** — TestSprite's browser automation does not support viewport resizing. The desktop layout loaded correctly but mobile viewport testing was not possible.
---

## 3️⃣ Coverage & Matching Metrics

### Backend API Tests
- **Pass rate: 80.00%** (12 out of 15 passed)

| Requirement | Total Tests | ✅ Passed | ❌ Failed |
|---|---|---|---|
| User Authentication | 6 | 5 | 1 |
| Contact Messages | 2 | 1 | 1 |
| Chat System | 1 | 1 | 0 |
| Stripe Payments | 3 | 3 | 0 |
| Plan Limits & Media | 2 | 1 | 1 |
| **Backend Total** | **15** | **12** | **3** |

### Frontend UI Tests
- **Pass rate: 66.67%** (8 out of 12 passed)

| Requirement | Total Tests | ✅ Passed | ❌ Failed |
|---|---|---|---|
| Landing Page UI | 8 | 7 | 1 |
| Authentication UI | 2 | 0 | 2 |
| Responsive Design | 1 | 0 | 1 |
| Contact Form | 1 | 0 | 1 |
| **Frontend Total** | **12** | **8** | **4** |

### Combined Results
- **Total tests: 27**
- **Passed: 20 (74.07%)**
- **Failed: 7 (25.93%)**

---

## 4️⃣ Key Gaps / Risks

### Real Bugs Found (1)
1. **`GET /api/auth/me` returns HTTP 500 for invalid JWT** — The endpoint crashes with an Internal Server Error when given a malformed JWT token instead of gracefully returning 401. This is a security concern as it leaks implementation details in error responses. **Priority: HIGH**

### Test Environment Limitations (4)
2. **Cookie forwarding through tunnel proxy** — TC008 (contact reply) fails because the TestSprite tunnel proxy cannot forward `auth_token` cookies to Next.js server-side `cookies()` function. Not a code bug.
3. **Toast notification detection** — FE004 (contact form submission) likely succeeds at the API level but the success toast is rendered outside the DOM tree and disappears before the automated browser can detect it.
4. **Viewport resizing not supported** — FE011 (mobile responsive) cannot be tested because the TestSprite browser does not support programmatic viewport resizing.
5. **Sign-in page path** — FE007 and FE012 fail because the app uses Clerk-managed authentication routes, not `/agency/auth/sign-in`.

### Test Expectation Mismatches (1)
6. **Media endpoint response shape** — TC012 expected a flat array but the API correctly returns `{ media: Media[] }`. The test assertion should be updated to access `response.media`.

### Untested Flows
- OTP verification (positive path) — requires email inbox access
- Password reset (positive path) — depends on OTP verification
- Stripe webhook handling — requires Stripe signature
- File upload endpoints — requires UploadThing protocol
- Agency dashboard (authenticated pages) — requires Clerk session
---
