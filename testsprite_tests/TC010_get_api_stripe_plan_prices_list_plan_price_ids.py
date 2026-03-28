import requests

BASE_URL = "http://localhost:3000"
STRIPE_PLAN_PRICES_ENDPOINT = "/api/stripe/plan-prices"
TIMEOUT = 30

def test_get_api_stripe_plan_prices_list_plan_price_ids():
    try:
        # Call GET /api/stripe/plan-prices endpoint directly (no auth required)
        headers = {
            "Accept": "application/json"
        }
        resp = requests.get(
            BASE_URL + STRIPE_PLAN_PRICES_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp.status_code == 200, f"Expected 200 status code, got {resp.status_code}. Response: {resp.text}"
        json_data = resp.json()
        # Validate response is a dict with keys PRO and AGENCY and values are non-empty strings
        assert isinstance(json_data, dict), f"Response is not a dict: {json_data}"
        for key in ["PRO", "AGENCY"]:
            assert key in json_data, f"Key '{key}' missing in response: {json_data}"
            assert isinstance(json_data[key], str) and json_data[key].strip(), f"Value for '{key}' should be a non-empty string"
    finally:
        pass

test_get_api_stripe_plan_prices_list_plan_price_ids()
