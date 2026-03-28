import requests

BASE_URL = "http://localhost:3000"
AUTH_COOKIE = {
    "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZGY0YWJhNi1iMGFlLTQ4MTUtYWQ0Mi02Mzk1NWM2NTQzMDciLCJlbWFpbCI6InRlc3RfcGF3YWxAeW9wbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwiaWF0IjoxNzc0Njg4MjU1LCJleHAiOjE3NzUyOTMwNTV9.LFtQEgaHNMtNyMuaVMA6aEj92lbRUs6UPJy0y4I3BI0"
}

def test_get_api_subdomain_content_resolve_funnel_by_subdomain():
    # 1. Test GET /api/subdomain with valid subDomainName query - expect 200 with funnel data or null
    params = {"subDomainName": "exampleSubdomain"}
    try:
        response = requests.get(
            f"{BASE_URL}/api/subdomain",
            cookies=AUTH_COOKIE,
            params=params,
            timeout=30
        )
        assert response.status_code == 200, f"Expected 200 but got {response.status_code}"
        json_data = response.json()
        # Response can be valid funnel data (dict) or null
        assert "funnel" in json_data or json_data is None or json_data == {} or json_data == None, \
            "Response JSON should contain funnel data or be empty/null"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

    # 2. Test GET /api/subdomain missing subDomainName query - expect 400
    try:
        response = requests.get(
            f"{BASE_URL}/api/subdomain",
            cookies=AUTH_COOKIE,
            timeout=30
        )
        assert response.status_code == 400, f"Expected 400 but got {response.status_code}"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_subdomain_content_resolve_funnel_by_subdomain()