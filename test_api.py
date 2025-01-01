import requests
import json

def test_api():
    url = "https://ai.kwantu.support/api/rag-sql-chatbot/query"
    headers = {"Content-Type": "application/json"}
    data = {
        "message": "Show me all infrastructure projects",
        "language": "english",
        "session_id": "test-1",
        "page": 1
    }

    try:
        print("Sending request...")
        response = requests.post(url, headers=headers, json=data)
        print(f"Status Code: {response.status_code}")
        print("\nResponse:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api() 