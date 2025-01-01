# QuickStart Guide - Local Development

## Prerequisites
- Windows 10/11
- Python 3.8+
- Node.js 14+
- Virtual environments set up in each backend service directory

## Starting Services

### 1. Frontend (Port 3000)
```powershell
# Terminal 1 - Frontend
cd C:\Users\lfana\Documents\Kwantu\chatai
npm start
```

### 2. PDF Chatbot Backend (Port 8000)
```powershell
# Terminal 2 - PDF Chatbot
cd C:\Users\lfana\Documents\Kwantu\rag-pdf-chatbot
.\.venv\Scripts\activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 3. SQL Chatbot Backend (Port 8001)
```powershell
# Terminal 3 - SQL Chatbot
cd C:\Users\lfana\Documents\Kwantu\rag-sql-chatbot
.\.venv\Scripts\activate
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

### 4. NLP Demo Backend (Port 8002)
```powershell
# Terminal 4 - NLP Demo
cd C:\Users\lfana\Documents\Kwantu\nlp-demo
.\.venv\Scripts\activate
uvicorn app:app --host 0.0.0.0 --port 8002 --reload
```

## Verifying Services
Run the health check script to verify all services are running:
```powershell
cd C:\Users\lfana\Documents\Kwantu\chatai
python health_check.py
```

## Common Issues & Solutions

### Port Already in Use
If a port is already in use, find and terminate the process:
```powershell
# Find process using port
netstat -ano | findstr :<PORT>

# Kill process by PID
taskkill /PID <PID> /F
```

### Module Not Found Errors
If you encounter module not found errors, install requirements in the virtual environment:
```powershell
# Activate virtual environment first, then:
pip install -r requirements.txt
```

### Permission Errors
Run PowerShell as Administrator if you encounter permission issues.

## URLs
- Frontend: http://localhost:3000
- PDF Chatbot API: http://localhost:8000
- SQL Chatbot API: http://localhost:8001
- NLP Demo API: http://localhost:8002

## API Documentation
- PDF Chatbot API docs: http://localhost:8000/docs
- SQL Chatbot API docs: http://localhost:8001/docs
- NLP Demo API docs: http://localhost:8002/docs
