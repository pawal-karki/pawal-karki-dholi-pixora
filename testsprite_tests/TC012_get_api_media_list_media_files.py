import requests

BASE_URL = "http://localhost:3000"
AUTH_COOKIE = {
    'auth_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZGY0YWJhNi1iMGFlLTQ4MTUtYWQ0Mi02Mzk1NWM2NTQzMDciLCJlbWFpbCI6InRlc3RfcGF3YWxAeW9wbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwiaWF0IjoxNzc0Njg4MjU1LCJleHAiOjE3NzUyOTMwNTV9.LFtQEgaHNMtNyMuaVMA6aEj92lbRUs6UPJy0y4I3BI0'
}

def test_get_api_media_list_media_files():
    timeout_seconds = 30

    # Test with valid subAccountId query param - Expect 200 with { media: [...] }
    valid_sub_account_id = "valid-sub-account-id-example"  # Example subAccountId; in real scenario, replace or create

    # Since subAccountId is required and not provided in instructions, attempt to get a valid subAccountId first:
    # As we do not have an endpoint to create or list subAccountId, we will mock this as a fixed string.
    # The API docs show no auth required for /api/media.

    # Make GET request with valid subAccountId
    try:
        resp = requests.get(
            f"{BASE_URL}/api/media",
            params={"subAccountId": valid_sub_account_id},
            timeout=timeout_seconds
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    json_data = resp.json()
    assert isinstance(json_data, dict), f"Response should be JSON object/dict"
    assert "media" in json_data, "Response JSON must contain 'media' key"
    assert isinstance(json_data["media"], list), "'media' must be a list"

    # Test missing subAccountId parameter - Expect 400
    try:
        resp_missing = requests.get(
            f"{BASE_URL}/api/media",
            timeout=timeout_seconds
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert resp_missing.status_code == 400, f"Expected 400 for missing subAccountId, got {resp_missing.status_code}"

test_get_api_media_list_media_files()