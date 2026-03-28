import requests

BASE_URL = "http://localhost:3000"
SIGNIN_URL = f"{BASE_URL}/api/auth/signin"
PLAN_LIMITS_URL = f"{BASE_URL}/api/plan-limits"
AUTH_CREDENTIALS = {
    "email": "test_pawal@yopmail.com",
    "password": "Wlink123"
}
TIMEOUT = 30


def test_get_api_plan_limits_subaccount_validation():
    # Authenticate and get JWT via signin (Cookie-based auth via auth_token cookie)
    signin_resp = requests.post(
        SIGNIN_URL,
        json=AUTH_CREDENTIALS,
        timeout=TIMEOUT
    )
    assert signin_resp.status_code == 200, f"Signin failed: {signin_resp.text}"
    signin_json = signin_resp.json()
    assert "token" in signin_json, "Signin response missing token"
    token = signin_json["token"]
    # Cookie header for subsequent requests
    cookies = {"auth_token": token}

    # 1) Valid request: agencyId=test-id, type=subaccount
    params = {"agencyId": "test-id", "type": "subaccount"}
    resp = requests.get(
        PLAN_LIMITS_URL,
        params=params,
        cookies=cookies,
        timeout=TIMEOUT
    )
    assert resp.status_code == 200, f"Valid request failed: {resp.text}"
    data = resp.json()
    # Validate required fields with expected types
    assert isinstance(data.get("allowed"), bool), "allowed should be boolean"
    assert isinstance(data.get("currentCount"), int), "currentCount should be number"
    assert isinstance(data.get("maxAllowed"), int), "maxAllowed should be number"
    assert isinstance(data.get("planName"), str), "planName should be string"

    # 2) Missing agencyId returns 400
    params_missing_agency = {"type": "subaccount"}
    resp_missing_agency = requests.get(
        PLAN_LIMITS_URL,
        params=params_missing_agency,
        cookies=cookies,
        timeout=TIMEOUT
    )
    assert resp_missing_agency.status_code == 400, f"Missing agencyId did not return 400: {resp_missing_agency.text}"

    # 3) Missing type returns 400
    params_missing_type = {"agencyId": "test-id"}
    resp_missing_type = requests.get(
        PLAN_LIMITS_URL,
        params=params_missing_type,
        cookies=cookies,
        timeout=TIMEOUT
    )
    assert resp_missing_type.status_code == 400, f"Missing type did not return 400: {resp_missing_type.text}"

    # 4) type=team also works (valid request)
    params_team = {"agencyId": "test-id", "type": "team"}
    resp_team = requests.get(
        PLAN_LIMITS_URL,
        params=params_team,
        cookies=cookies,
        timeout=TIMEOUT
    )
    assert resp_team.status_code == 200, f"type=team request failed: {resp_team.text}"
    data_team = resp_team.json()
    # Validate required fields with expected types
    assert isinstance(data_team.get("allowed"), bool), "allowed should be boolean"
    assert isinstance(data_team.get("currentCount"), int), "currentCount should be number"
    assert isinstance(data_team.get("maxAllowed"), int), "maxAllowed should be number"
    assert isinstance(data_team.get("planName"), str), "planName should be string"


test_get_api_plan_limits_subaccount_validation()
