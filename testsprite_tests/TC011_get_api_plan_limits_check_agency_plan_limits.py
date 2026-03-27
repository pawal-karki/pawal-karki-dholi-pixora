import requests

BASE_URL = "http://localhost:3000"


def test_get_api_plan_limits_check_agency_plan_limits():
    # We assume an example agencyId for valid test.
    # Since no resource creation is required, use fixed known agencyId for test.
    # If none known, this might fail or be replaced with an existing id.
    agency_id = "test-agency-id-123"
    # type=subaccount per test description

    # Test 1: Valid request with agencyId and type=subaccount -> Expect 200 with allowed, currentCount, maxAllowed fields
    params_valid = {"agencyId": agency_id, "type": "subaccount"}
    try:
        response = requests.get(f"{BASE_URL}/api/plan-limits", params=params_valid, timeout=30)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        data = response.json()
        # Validate keys in response
        # allowed, currentCount, maxAllowed are expected fields per description
        # Note: PRD schema says 200 returns { canCreateSubAccount, canInviteTeamMember } but test case description expects allowed, currentCount, maxAllowed fields
        # We validate those fields as per test case instructions
        assert isinstance(data, dict), "Response JSON must be a dictionary"
        for field in ("allowed", "currentCount", "maxAllowed"):
            assert field in data, f"Response JSON missing field '{field}'"
            # basic type checks
            assert isinstance(data[field], (int, float)), f"Field '{field}' must be a number"
    except requests.RequestException as e:
        assert False, f"Request to /api/plan-limits failed: {e}"

    # Test 2: Missing agencyId -> Expect 400 status code
    params_missing_agency = {"type": "subaccount"}
    try:
        response = requests.get(f"{BASE_URL}/api/plan-limits", params=params_missing_agency, timeout=30)
        assert response.status_code == 400, f"Expected status 400 when missing agencyId, got {response.status_code}"
    except requests.RequestException as e:
        assert False, f"Request to /api/plan-limits without agencyId failed: {e}"


test_get_api_plan_limits_check_agency_plan_limits()