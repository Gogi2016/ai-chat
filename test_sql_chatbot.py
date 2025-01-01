import requests
import json
from datetime import datetime

def test_query(message, language="english"):
    url = "https://ai.kwantu.support/api/rag-sql-chatbot/query"
    headers = {"Content-Type": "application/json"}
    data = {
        "message": message,
        "language": language,
        "session_id": f"test-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "page": 1,
        "llm_config": {
            "enabled": True,
            "model": "mixtral-8x7b",
            "temperature": 0.7,
            "tasks": ["query_enhancement", "response_formatting", "follow_up_suggestions"]
        }
    }

    print(f"\nTesting query: {message}")
    print("=" * 80)
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        print(f"Status Code: {response.status_code}")
        print("\nResponse:")
        print(json.dumps(response.json(), indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

def main():
    # Test cases
    test_queries = [
        "Show me all infrastructure projects",  # Test summary view
        "Show projects in Northern Region",     # Test location filtering
        "Tell me about the Mangochi District Hospital Project",  # Test individual project details
        "List projects by location"            # Test location grouping
    ]
    
    for query in test_queries:
        test_query(query)
        print("\n" + "-" * 80)  # Separator between tests

if __name__ == "__main__":
    main() 