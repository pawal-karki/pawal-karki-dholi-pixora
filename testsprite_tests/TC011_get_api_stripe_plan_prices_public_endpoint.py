import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_get_api_stripe_plan_prices_public_endpoint():
    url = f"{BASE_URL}/api/stripe/plan-prices"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, dict), f"Response body is not a JSON object: {data}"
        # The API should return keys like PRO and AGENCY with priceId values
        expected_keys = ['PRO', 'AGENCY']
        for key in expected_keys:
            assert key in data, f"Missing expected key '{key}' in response"
            price_id = data[key]
            assert isinstance(price_id, str) and price_id.strip(), f"Invalid priceId value for key '{key}': {price_id}"
    except requests.RequestException as e:
        assert False, f"Request to {url} failed with exception: {e}"

test_get_api_stripe_plan_prices_public_endpoint()