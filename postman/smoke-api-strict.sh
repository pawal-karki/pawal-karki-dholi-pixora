#!/usr/bin/env bash
# Strict API smoke (bash). Mirrors unit-test expectations for HTTP status + minimal JSON checks.
# Usage: BASE_URL=http://localhost:3000 AGENCY_ID=... SUBACCOUNT_ID=... ./postman/smoke-api-strict.sh
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
BASE_URL="${BASE_URL%/}"

die() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "PASS: $*"; }

expect_status() {
  local name="$1" want="$2" code="$3"
  if [[ "$code" != "$want" ]]; then
    die "$name — expected HTTP $want, got $code"
  fi
  pass "$name (HTTP $code)"
}

json_post() {
  local path="$1" body="$2"
  curl -sS -w "\n%{http_code}" -X POST "$BASE_URL$path" \
    -H "Content-Type: application/json" \
    -d "$body"
}

json_get() {
  local path="$1"
  curl -sS -w "\n%{http_code}" "$BASE_URL$path"
}

# Split body and status (last line = http code)
run_post() {
  local path="$1" body="$2"
  local raw
  raw=$(json_post "$path" "$body")
  local code
  code=$(echo "$raw" | tail -n1)
  local out
  out=$(echo "$raw" | sed '$d')
  echo "$out"
  echo "$code"
}

run_get() {
  local path="$1"
  local raw
  raw=$(json_get "$path")
  local code
  code=$(echo "$raw" | tail -n1)
  local out
  out=$(echo "$raw" | sed '$d')
  echo "$out"
  echo "$code"
}

echo "=== Pixora strict API smoke ($BASE_URL) ==="

RAND=$(openssl rand -hex 4 2>/dev/null || echo "test$RANDOM")
EMAIL="smoke_${RAND}@example.com"

# Signup short password -> 400
readarray -t RES < <(run_post "/api/auth/signup" "{\"name\":\"T\",\"email\":\"$EMAIL\",\"password\":\"short\"}")
CODE="${RES[-1]}"
expect_status "S1 signup short password" 400 "$CODE"

# Invalid email -> 400
readarray -t RES < <(run_post "/api/auth/signup" '{"name":"T","email":"bad","password":"Password123!"}')
CODE="${RES[-1]}"
expect_status "S1 signup invalid email" 400 "$CODE"

# Valid signup -> 201 + token
readarray -t RES < <(run_post "/api/auth/signup" "{\"name\":\"Smoke\",\"email\":\"$EMAIL\",\"password\":\"Password123!\"}")
CODE="${RES[-1]}"
BODY=$(printf '%s\n' "${RES[@]:0:${#RES[@]}-1}")
expect_status "S1 signup valid" 201 "$CODE"
TOKEN=$(echo "$BODY" | jq -er '.token' 2>/dev/null) || die "signup missing .token"

# /me no auth -> 401
readarray -t RES < <(run_get "/api/auth/me")
CODE="${RES[-1]}"
expect_status "S1 /api/auth/me no auth" 401 "$CODE"

# /me garbage JWT -> 401
RAW=$(curl -sS -w "\n%{http_code}" "$BASE_URL/api/auth/me" -H "Authorization: Bearer not.a.valid.jwt")
CODE=$(echo "$RAW" | tail -n1)
expect_status "S1 /api/auth/me garbage JWT" 401 "$CODE"

# /me valid -> 200
RAW=$(curl -sS -w "\n%{http_code}" "$BASE_URL/api/auth/me" -H "Authorization: Bearer $TOKEN")
CODE=$(echo "$RAW" | tail -n1)
expect_status "S1 /api/auth/me valid Bearer" 200 "$CODE"

# Wrong password -> 401
readarray -t RES < <(run_post "/api/auth/signin" "{\"email\":\"$EMAIL\",\"password\":\"Wrong!!!\"}")
CODE="${RES[-1]}"
expect_status "S1 signin wrong password" 401 "$CODE"

# Forgot unknown -> 200
readarray -t RES < <(run_post "/api/auth/forgot-password" "{\"email\":\"missing_${RAND}@example.com\"}")
CODE="${RES[-1]}"
expect_status "S1 forgot-password unknown email" 200 "$CODE"

# Verify OTP missing -> 400
readarray -t RES < <(run_post "/api/auth/verify-otp" "{\"email\":\"$EMAIL\"}")
CODE="${RES[-1]}"
expect_status "S1 verify-otp missing otp" 400 "$CODE"

# Reset missing token -> 400
readarray -t RES < <(run_post "/api/auth/reset-password" '{"password":"Password123!"}')
CODE="${RES[-1]}"
expect_status "S1 reset-password missing token" 400 "$CODE"

# Plan prices -> 200
readarray -t RES < <(run_get "/api/stripe/plan-prices")
CODE="${RES[-1]}"
expect_status "S2 plan-prices" 200 "$CODE"

# Webhook no signature -> 400
readarray -t RES < <(run_post "/api/stripe/webhook" '{}')
CODE="${RES[-1]}"
expect_status "S2 webhook no signature" 400 "$CODE"

# Checkout empty -> 400
readarray -t RES < <(run_post "/api/stripe/create-checkout-session" '{"subAccountConnectedId":"","prices":[]}')
CODE="${RES[-1]}"
expect_status "S2 checkout-session empty" 400 "$CODE"

# Products no subAccountId -> 400
readarray -t RES < <(run_get "/api/stripe/products")
CODE="${RES[-1]}"
expect_status "S2 products GET no subAccountId" 400 "$CODE"

# Contact empty message -> 400
readarray -t RES < <(run_post "/api/contact-messages" '{"name":"L","email":"l@e.com","message":"   "}')
CODE="${RES[-1]}"
expect_status "S4 contact empty message" 400 "$CODE"

# Contact valid -> 200
readarray -t RES < <(run_post "/api/contact-messages" '{"name":"Lead","email":"lead@example.com","message":"Hi"}')
CODE="${RES[-1]}"
expect_status "S4 contact valid" 200 "$CODE"

# Media missing -> 400
readarray -t RES < <(run_get "/api/media")
CODE="${RES[-1]}"
expect_status "S5 media missing subAccountId" 400 "$CODE"

if [[ -n "${SUBACCOUNT_ID:-}" ]]; then
  readarray -t RES < <(run_get "/api/media?subAccountId=$SUBACCOUNT_ID")
  CODE="${RES[-1]}"
  expect_status "S5 media list" 200 "$CODE"
else
  echo "SKIP: set SUBACCOUNT_ID for media list"
fi

if [[ -n "${AGENCY_ID:-}" ]]; then
  readarray -t RES < <(run_get "/api/plan-limits?agencyId=$AGENCY_ID&type=subaccount")
  CODE="${RES[-1]}"
  expect_status "S2 plan-limits subaccount" 200 "$CODE"
  readarray -t RES < <(run_get "/api/plan-limits?agencyId=$AGENCY_ID&type=bad")
  CODE="${RES[-1]}"
  expect_status "S2 plan-limits invalid type" 400 "$CODE"
else
  echo "SKIP: set AGENCY_ID for plan-limits"
fi

# Chat no auth -> 401
readarray -t RES < <(run_post "/api/chat/send" '{"content":"x","conversationId":"00000000-0000-0000-0000-000000000000"}')
CODE="${RES[-1]}"
expect_status "S6 chat send no auth" 401 "$CODE"

echo ""
echo "All strict checks passed."
