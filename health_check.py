import aiohttp
import asyncio
import time
from datetime import datetime

ENDPOINTS = {
    "Local Development": {
        "Frontend": "http://localhost:3000",
        "Backend (PDF)": "http://localhost:8000/status",
        "Backend (SQL)": "http://localhost:8001/status",
        "Backend (NLP)": "http://localhost:8002/status"
    },
    "Server Testing": {
        "Frontend": "http://154.0.164.254:3000",
        "Backend (PDF)": "http://154.0.164.254:8000/status",
        "Backend (SQL)": "http://154.0.164.254:8001/status",
        "Backend (NLP)": "http://154.0.164.254:8002/status"
    },
    "Production": {
        "Frontend": "https://ai.kwantu.support",
        "Backend (PDF)": "https://ai.kwantu.support/api/rag-pdf-chatbot/status",
        "Backend (SQL)": "https://ai.kwantu.support/api/rag-sql-chatbot/status",
        "Backend (NLP)": "https://ai.kwantu.support/api/nlp-demo/status"
    }
}

async def check_endpoint(session, name, url):
    try:
        start_time = time.time()
        async with session.get(url, timeout=5) as response:
            elapsed = (time.time() - start_time) * 1000  # Convert to ms
            return {
                "name": name,
                "url": url,
                "status": response.status,
                "response_time": f"{elapsed:.0f}ms",
                "ok": response.status < 400
            }
    except Exception as e:
        return {
            "name": name,
            "url": url,
            "status": "Error",
            "response_time": "N/A",
            "error": str(e),
            "ok": False
        }

async def check_all_endpoints():
    print(f"\nHealth Check - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    async with aiohttp.ClientSession() as session:
        tasks = []
        for env_name, services in ENDPOINTS.items():
            for service_name, url in services.items():
                tasks.append(check_endpoint(session, f"{env_name} - {service_name}", url))
        
        results = await asyncio.gather(*tasks)
        
        # Print results grouped by environment
        current_env = None
        for result in sorted(results, key=lambda x: x['name']):
            env = result['name'].split(' - ')[0]
            if env != current_env:
                current_env = env
                print(f"\n{env}:")
                print("-" * 80)
            
            status_color = '\033[92m' if result.get('ok') else '\033[91m'  # Green for OK, Red for issues
            end_color = '\033[0m'
            
            service_name = result['name'].split(' - ')[1]
            status = result.get('status', 'Error')
            response_time = result.get('response_time', 'N/A')
            
            print(f"{service_name:20} {status_color}{status:10}{end_color} {response_time:>10}")
            if 'error' in result:
                print(f"  Error: {result['error']}")

if __name__ == "__main__":
    asyncio.run(check_all_endpoints()) 