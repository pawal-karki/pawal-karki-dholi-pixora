# Strict API smoke (PowerShell). Set BASE_URL, optional AGENCY_ID / SUBACCOUNT_ID.
# Run: pwsh -File postman/smoke-api-strict.ps1
$ErrorActionPreference = "Stop"

$BaseUrl = if ($env:BASE_URL) { $env:BASE_URL.TrimEnd("/") } else { "http://localhost:3000" }
$AgencyId = $env:AGENCY_ID
$SubAccountId = $env:SUBACCOUNT_ID

function Assert-Status {
    param([string]$Name, [int]$Expected, [int]$Actual, [string]$BodyPreview = "")
    if ($Actual -ne $Expected) {
        Write-Host "FAIL: $Name expected HTTP $Expected got $Actual" -ForegroundColor Red
        if ($BodyPreview) { Write-Host $BodyPreview }
        exit 1
    }
    Write-Host "PASS: $Name (HTTP $Actual)" -ForegroundColor Green
}

function Invoke-Strict {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [int]$ExpectedStatus,
        [string]$Name
    )
    $uri = "$BaseUrl$Path"
    $h = @{ "Content-Type" = "application/json" } + $Headers
    $params = @{
        Uri             = $uri
        Method          = $Method
        Headers         = $h
        SkipHttpErrorCheck = $true
    }
    if ($null -ne $Body) {
        $params.Body = ($Body | ConvertTo-Json -Compress -Depth 10)
    }
    $resp = Invoke-WebRequest @params
    $code = [int]$resp.StatusCode
    $preview = if ($resp.Content.Length -gt 300) { $resp.Content.Substring(0, 300) + "..." } else { $resp.Content }
    Assert-Status -Name $Name -Expected $ExpectedStatus -Actual $code -BodyPreview $preview
    return $resp.Content
}

Write-Host "=== Pixora strict API smoke ($BaseUrl) ===" -ForegroundColor Cyan

$rand = [guid]::NewGuid().ToString("N").Substring(0, 8)
$email = "smoke_$rand@example.com"

Invoke-Strict -Name "S1 signup short password -> 400" -Method POST -Path "/api/auth/signup" `
    -Body @{ name = "T"; email = $email; password = "short" } -ExpectedStatus 400

Invoke-Strict -Name "S1 signup invalid email -> 400" -Method POST -Path "/api/auth/signup" `
    -Body @{ name = "T"; email = "not-email"; password = "Password123!" } -ExpectedStatus 400

$signupBody = Invoke-Strict -Name "S1 signup valid -> 201" -Method POST -Path "/api/auth/signup" `
    -Body @{ name = "Smoke User"; email = $email; password = "Password123!" } -ExpectedStatus 201
$signupJson = $signupBody | ConvertFrom-Json
if (-not $signupJson.token) {
    Write-Host "FAIL: signup response missing .token" -ForegroundColor Red
    exit 1
}
$Token = $signupJson.token

Invoke-Strict -Name "S1 /api/auth/me no auth -> 401" -Method GET -Path "/api/auth/me" -ExpectedStatus 401 -Headers @{}

Invoke-Strict -Name "S1 /api/auth/me garbage JWT -> 401" -Method GET -Path "/api/auth/me" `
    -ExpectedStatus 401 -Headers @{ Authorization = "Bearer not.a.valid.jwt" }

Invoke-Strict -Name "S1 /api/auth/me valid Bearer -> 200" -Method GET -Path "/api/auth/me" `
    -ExpectedStatus 200 -Headers @{ Authorization = "Bearer $Token" }

Invoke-Strict -Name "S1 signin wrong password -> 401" -Method POST -Path "/api/auth/signin" `
    -Body @{ email = $email; password = "WrongPassword!!!" } -ExpectedStatus 401

Invoke-Strict -Name "S1 forgot-password unknown email -> 200" -Method POST -Path "/api/auth/forgot-password" `
    -Body @{ email = "missing_$rand@example.com" } -ExpectedStatus 200

Invoke-Strict -Name "S1 verify-otp missing otp -> 400" -Method POST -Path "/api/auth/verify-otp" `
    -Body @{ email = $email } -ExpectedStatus 400

Invoke-Strict -Name "S1 reset-password missing token -> 400" -Method POST -Path "/api/auth/reset-password" `
    -Body @{ password = "Password123!" } -ExpectedStatus 400

Invoke-Strict -Name "S2 plan-prices -> 200" -Method GET -Path "/api/stripe/plan-prices" -ExpectedStatus 200

Invoke-Strict -Name "S2 webhook no signature -> 400" -Method POST -Path "/api/stripe/webhook" `
    -Body @{} -ExpectedStatus 400

Invoke-Strict -Name "S2 checkout-session empty -> 400" -Method POST -Path "/api/stripe/create-checkout-session" `
    -Body @{ subAccountConnectedId = ""; prices = @() } -ExpectedStatus 400

Invoke-Strict -Name "S2 products GET no subAccountId -> 400" -Method GET -Path "/api/stripe/products" -ExpectedStatus 400

Invoke-Strict -Name "S4 contact-messages empty message -> 400" -Method POST -Path "/api/contact-messages" `
    -Body @{ name = "L"; email = "l@e.com"; message = "   " } -ExpectedStatus 400

Invoke-Strict -Name "S4 contact-messages valid -> 200" -Method POST -Path "/api/contact-messages" `
    -Body @{ name = "Lead"; email = "lead@example.com"; message = "Hello from smoke" } -ExpectedStatus 200

if ($AgencyId) {
    Invoke-Strict -Name "S2 plan-limits subaccount -> 200" -Method GET `
        -Path "/api/plan-limits?agencyId=$AgencyId&type=subaccount" -ExpectedStatus 200
    Invoke-Strict -Name "S2 plan-limits invalid type -> 400" -Method GET `
        -Path "/api/plan-limits?agencyId=$AgencyId&type=bad" -ExpectedStatus 400
} else {
    Write-Host "SKIP: set AGENCY_ID for plan-limits checks" -ForegroundColor Yellow
}

if ($SubAccountId) {
    Invoke-Strict -Name "S5 media list -> 200" -Method GET -Path "/api/media?subAccountId=$SubAccountId" -ExpectedStatus 200
} else {
    Write-Host "SKIP: set SUBACCOUNT_ID for media list" -ForegroundColor Yellow
}

Invoke-Strict -Name "S5 media missing subAccountId -> 400" -Method GET -Path "/api/media" -ExpectedStatus 400

Invoke-Strict -Name "S6 chat send no cookie -> 401" -Method POST -Path "/api/chat/send" `
    -Body @{ content = "x"; conversationId = "00000000-0000-0000-0000-000000000000" } -ExpectedStatus 401

Write-Host ""
Write-Host "All strict checks passed." -ForegroundColor Cyan
