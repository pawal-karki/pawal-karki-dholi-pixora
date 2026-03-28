import requests

BASE_URL = "http://localhost:3000"
AUTH_COOKIE = {
    "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZGY0YWJhNi1iMGFlLTQ4MTUtYWQ0Mi02Mzk1NWM2NTQzMDciLCJlbWFpbCI6InRlc3RfcGF3YWxAeW9wbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwiaWF0IjoxNzc0Njg4MjU1LCJleHAiOjE3NzUyOTMwNTV9.LFtQEgaHNMtNyMuaVMA6aEj92lbRUs6UPJy0y4I3BI0"
}

def test_get_api_plan_limits_check_agency_plan_limits():
    headers = {}
    cookies = AUTH_COOKIE
    timeout = 30

    # Use a sample agencyId; since no specific ID provided, create a dummy resource is not feasible (no create endpoint for agency).
    # Assuming the agencyId "sample-agency-id" is valid in test environment.
    # Query params: agencyId and type=subaccount

    params_valid = {
        "agencyId": "sample-agency-id",
        "type": "subaccount",
    }

    url = f"{BASE_URL}/api/plan-limits"

    # Test valid request with agencyId and type=subaccount
    resp = requests.get(url, headers=headers, cookies=cookies, params=params_valid, timeout=timeout)
    try:
        assert resp.status_code == 200, f"Expected 200 but got {resp.status_code} with body {resp.text}"
        json_data = resp.json()
        # Validate required fields: allowed, currentCount, maxAllowed
        # The PRD says 200 returns { canCreateSubAccount, canInviteTeamMember } but test description expects allowed, currentCount, maxAllowed
        # Use test description fields priority:
        assert isinstance(json_data, dict), "Response is not a JSON object"
        # Check keys allowed, currentCount, maxAllowed are in response
        assert "allowed" in json_data, "'allowed' field missing in response"
        assert "currentCount" in json_data, "'currentCount' field missing in response"
        assert "maxAllowed" in json_data, "'maxAllowed' field missing in response"
    except Exception as e:
        raise AssertionError(f"Validation failed for valid query params: {e}")

    # Test request missing agencyId returns 400
    params_missing_agency = {
        "type": "subaccount"
    }
    resp2 = requests.get(url, headers=headers, cookies=cookies, params=params_missing_agency, timeout=timeout)
    try:
        assert resp2.status_code == 400, f"Expected 400 for missing agencyId but got {resp2.status_code}, body: {resp2.text}"
    except Exception as e:
        raise AssertionError(f"Validation failed for missing agencyId: {e}")

test_get_api_plan_limits_check_agency_plan_limits()