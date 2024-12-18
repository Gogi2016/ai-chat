import requests
import json
import os
import argparse

def test_file_analysis(file_path, use_case):
    """Test the /analyze-document endpoint with a specific file"""
    url = "http://localhost:8002/analyze-document"
    
    print(f"\nTesting file analysis for {file_path}")
    print(f"Use case: {use_case}")
    
    try:
        # Verify file exists
        if not os.path.exists(file_path):
            print(f"Error: File not found - {file_path}")
            return
            
        # Read and send file
        with open(file_path, 'rb') as f:
            files = {
                'file': (os.path.basename(file_path), f, 'application/pdf' if file_path.endswith('.pdf') else 'text/plain')
            }
            data = {
                'use_case': use_case
            }
            
            print("\nSending request...")
            response = requests.post(url, files=files, data=data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print("\nAnalysis Result:")
                print(json.dumps(response.json(), indent=2))
            else:
                print("Error Response:", response.text)
                
    except Exception as e:
        print(f"Error testing file analysis: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test NLP file analysis')
    parser.add_argument('--file', required=True, help='Path to the file to analyze')
    parser.add_argument('--use-case', default='summarization', 
                      choices=['summarization', 'topic_analysis', 'sentiment_analysis'],
                      help='Analysis use case')
    
    args = parser.parse_args()
    test_file_analysis(args.file, args.use_case) 