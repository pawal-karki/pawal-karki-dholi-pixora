
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** pixora
- **Date:** 2026-03-28
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 post api auth signup create new user account
- **Test Code:** [TC001_post_api_auth_signup_create_new_user_account.py](./TC001_post_api_auth_signup_create_new_user_account.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/b0b0451c-b05b-4035-99b8-a8717e422b10
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 post api auth signin authenticate user and get jwt
- **Test Code:** [TC002_post_api_auth_signin_authenticate_user_and_get_jwt.py](./TC002_post_api_auth_signin_authenticate_user_and_get_jwt.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/9602f7e2-1293-4c8d-a15c-554592acbcbd
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 get api auth me return current user profile with role
- **Test Code:** [TC003_get_api_auth_me_return_current_user_profile_with_role.py](./TC003_get_api_auth_me_return_current_user_profile_with_role.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 78, in <module>
  File "<string>", line 63, in test_get_api_auth_me_return_current_user_profile_with_role
AssertionError: Expected 401 for invalid token, got 500

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/292d7766-11af-4cc0-a32c-ff046decfe44
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 post api auth forgot password anti enumeration
- **Test Code:** [TC004_post_api_auth_forgot_password_anti_enumeration.py](./TC004_post_api_auth_forgot_password_anti_enumeration.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/5e43424e-5382-49ba-bf25-ddca44eefa64
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 post api auth verify otp with invalid otp
- **Test Code:** [TC005_post_api_auth_verify_otp_with_invalid_otp.py](./TC005_post_api_auth_verify_otp_with_invalid_otp.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/8e681c68-e191-41c1-a4de-800cfd964478
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 post api auth reset password with invalid token
- **Test Code:** [TC006_post_api_auth_reset_password_with_invalid_token.py](./TC006_post_api_auth_reset_password_with_invalid_token.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/de88e95d-12bc-4f5a-b357-76f44aa34277
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 post api contact messages submit and validate fields
- **Test Code:** [TC007_post_api_contact_messages_submit_and_validate_fields.py](./TC007_post_api_contact_messages_submit_and_validate_fields.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/f65292bf-1510-4237-ad33-aab4ac109c55
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 post api contact messages reply requires auth
- **Test Code:** [TC008_post_api_contact_messages_reply_requires_auth.py](./TC008_post_api_contact_messages_reply_requires_auth.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/464b87ab-f20d-48c7-be3e-2e6bbfc1bb16
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 post api chat ai requires auth and validates body
- **Test Code:** [TC009_post_api_chat_ai_requires_auth_and_validates_body.py](./TC009_post_api_chat_ai_requires_auth_and_validates_body.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/8649c01f-1c5c-4c2a-b829-7041a2c63551
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 post api chat send requires auth and validates body
- **Test Code:** [TC010_post_api_chat_send_requires_auth_and_validates_body.py](./TC010_post_api_chat_send_requires_auth_and_validates_body.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/00ee4733-3cc5-495f-9cdd-16d6497e8b48
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 get api stripe plan prices public endpoint
- **Test Code:** [TC011_get_api_stripe_plan_prices_public_endpoint.py](./TC011_get_api_stripe_plan_prices_public_endpoint.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/35b0b973-688d-481c-bc28-22cedb8358af
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 get api plan limits subaccount validation
- **Test Code:** [TC012_get_api_plan_limits_subaccount_validation.py](./TC012_get_api_plan_limits_subaccount_validation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/c836f254-0b63-4ede-a3c7-f6c0f08abd55
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 get api media requires subaccountid param
- **Test Code:** [TC013_get_api_media_requires_subaccountid_param.py](./TC013_get_api_media_requires_subaccountid_param.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/c3c9c3da-83e4-4497-992a-778f7f21f2e2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 post api stripe cancel subscription role based access
- **Test Code:** [TC014_post_api_stripe_cancel_subscription_role_based_access.py](./TC014_post_api_stripe_cancel_subscription_role_based_access.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/ea39aefa-1b01-4bb8-98bc-b48081100aaf
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 post api stripe create subscription session role access
- **Test Code:** [TC015_post_api_stripe_create_subscription_session_role_access.py](./TC015_post_api_stripe_create_subscription_session_role_access.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/36c0f78b-25f8-41e5-b590-4ce5d8fe417d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 post api stripe create checkout session validation
- **Test Code:** [TC016_post_api_stripe_create_checkout_session_validation.py](./TC016_post_api_stripe_create_checkout_session_validation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/3e668843-e10b-40a9-aa0d-1963f17d7ca8
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 get api stripe products list by subaccount
- **Test Code:** [TC017_get_api_stripe_products_list_by_subaccount.py](./TC017_get_api_stripe_products_list_by_subaccount.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 80, in <module>
  File "<string>", line 58, in test_get_api_stripe_products_list_by_subaccount
AssertionError: Failed to create product for testing local source: {"error":"\nInvalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__[\"db\"].product.create()` invocation in\nC:\\Users\\Administrator\\Videos\\pixora\\.next\\server\\chunks\\[root of the server]__83e713._.js:287:169\n\n  284 const truncatedDescription = description && description.length > 1000 ? description.substring(0, 1000) : description;\n  285 // If localOnly flag or no Stripe Connect, create local product only\n  286 if (localOnly || !hasStripeConnect) {\n→ 287     const localProduct = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__[\"db\"].product.create(\nForeign key constraint failed on the field: `Product_subAccountId_fkey (index)`"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/e236c44b-608f-46e6-8d62-5c87887be3f0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 post api stripe products create product validation
- **Test Code:** [TC018_post_api_stripe_products_create_product_validation.py](./TC018_post_api_stripe_products_create_product_validation.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 103, in <module>
  File "<string>", line 73, in test_post_api_stripe_products_create_product_validation
AssertionError: Expected 200 for valid product but got 500: {"error":"\nInvalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__[\"db\"].product.create()` invocation in\nC:\\Users\\Administrator\\Videos\\pixora\\.next\\server\\chunks\\[root of the server]__83e713._.js:287:169\n\n  284 const truncatedDescription = description && description.length > 1000 ? description.substring(0, 1000) : description;\n  285 // If localOnly flag or no Stripe Connect, create local product only\n  286 if (localOnly || !hasStripeConnect) {\n→ 287     const localProduct = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__[\"db\"].product.create({\n            data: {\n              name: \"Valid Product\",\n              price: 1500,\n                     ~~~~\n              description: \"Optional product description\",\n              image: undefined,\n              recurring: undefined,\n              currency: \"NPR\",\n              subAccountId: \"test-subaccount-id\"\n            }\n          })\n\nArgument `price`: Invalid value provided. Expected String, provided Int."}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/76051fd9-861b-417f-99f4-d259f23c6bbe
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 delete api stripe products delete validation
- **Test Code:** [TC019_delete_api_stripe_products_delete_validation.py](./TC019_delete_api_stripe_products_delete_validation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/061d067e-bcc5-4d82-9d35-d7395de44578
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 post api auth signin rate limit protection
- **Test Code:** [TC020_post_api_auth_signin_rate_limit_protection.py](./TC020_post_api_auth_signin_rate_limit_protection.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 33, in <module>
  File "<string>", line 30, in test_post_api_auth_signin_rate_limit_protection
AssertionError: Expected at least one 429 Too Many Requests response due to rate limiting

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/9e153332-3794-4dae-a650-09ba1cbedd9a/548fe78f-f12b-4a26-96b2-fc546a277523
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **80.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---