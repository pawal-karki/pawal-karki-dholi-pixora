import requests

def test_get_api_stripe_plan_prices_list_plan_price_ids():
    base_url = "http://localhost:3000"
    url = f"{base_url}/api/stripe/plan-prices"
    timeout = 30
    headers = {
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, dict), "Response JSON is not an object"

    # Expected keys for plans as per PRD: PRO and AGENCY
    expected_keys = {"PRO", "AGENCY"}
    actual_keys = set(data.keys())
    missing_keys = expected_keys - actual_keys
    assert not missing_keys, f"Response missing expected plan keys: {missing_keys}"

    for key in expected_keys:
        price_id = data.get(key)
        assert isinstance(price_id, str) and price_id.strip(), f"Price ID for {key} is missing or not a non-empty string"


test_get_api_stripe_plan_prices_list_plan_price_ids()