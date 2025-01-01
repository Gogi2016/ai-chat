import requests
import json

def test_connections():
    # Test backend directly
    try:
        backend_health = requests.get("http://localhost:8001/health")
        print("\nBackend Health Check:")
        print(f"Status: {backend_health.status_code}")
        print(f"Response: {backend_health.json()}")
    except Exception as e:
        print(f"Backend Error: {str(e)}")

    # Test frontend
    try:
        frontend_response = requests.get("http://localhost:3000")
        print("\nFrontend Check:")
        print(f"Status: {frontend_response.status_code}")
    except Exception as e:
        print(f"Frontend Error: {str(e)}")

    # Test backend query endpoint
    try:
        query_data = {
            "message": "Show me all projects",
            "page": 1,
            "page_size": 5
        }
        backend_query = requests.post(
            "http://localhost:8001/query",
            json=query_data,
            headers={"Content-Type": "application/json"}
        )
        print("\nBackend Query Test:")
        print(f"Status: {backend_query.status_code}")
        response = backend_query.json()
        print(f"Got response with {len(response.get('response', '').split('---'))} projects")
    except Exception as e:
        print(f"Backend Query Error: {str(e)}")

if __name__ == "__main__":
    test_connections() 