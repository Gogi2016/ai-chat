# AI Chat Application

Repository: https://github.com/kwantu/chatai

This is the React frontend for the NASP Chatbot project. It provides a modern web interface for interacting with our AI chatbot system.

## Project Structure
The project consists of two main parts:
- Frontend: React application (this repository)
- Backend: FastAPI server (separate repository)

## Features
- PDF-based Question Answering (RAG-PDF-Chatbot)
- SQL-based Question Answering (RAG-SQL-Chatbot)
- Multi-language support
- File upload functionality
- Real-time chat interface

## Setup

1. Install dependencies:
```bash
npm install
```

2. Environment Configuration:

### Development Environment
Create `.env.development` in the root directory:
```env
PORT=3000
HOST=0.0.0.0
REACT_APP_NODE_ENV=development
PUBLIC_URL=http://154.0.164.254:3000
```

### Production Environment
Create `.env.production` in the root directory:
```env
PORT=3000
HOST=0.0.0.0
REACT_APP_NODE_ENV=production
PUBLIC_URL=https://ai.kwantu.support
```

## Available Scripts

### Development
```bash
# Start development server
npm start

# Serve built application
serve -s build -l 3000
```

### Production
```bash
# Build for production
NODE_ENV=production npm run build

# Serve production build
serve -s build -l 3000
```

## Configuration

### API Endpoints and Environment Configuration
The application uses different API endpoints based on the environment and host. The configuration is managed in `src/config/config.js`:

```javascript
// When running on development machine (localhost)
BASE_API_URL: 'http://localhost:8000'

// When running on server (154.0.164.254)
BASE_API_URL: 'http://154.0.164.254:8000'

// Production & QA
BASE_API_URL: 'https://ai.kwantu.support'
```

#### Environment Files
1. Development (`.env.development`):
```env
PORT=3000
HOST=0.0.0.0
REACT_APP_NODE_ENV=development
PUBLIC_URL=http://154.0.164.254:3000
REACT_APP_API_URL=http://154.0.164.254:8002  # Override for specific services
```

2. Production (`.env.production`):
```env
PORT=3000
HOST=0.0.0.0
REACT_APP_NODE_ENV=production
PUBLIC_URL=https://ai.kwantu.support
REACT_APP_API_URL=https://ai.kwantu.support/api/nlp
```

#### Important Notes
- The application automatically detects whether it's running on the server (154.0.164.254) or locally
- When running on the server, it will use server IP addresses regardless of the environment
- Environment variables (REACT_APP_API_URL) can override the default configuration
- Different services (NLP, RAG-PDF) may use different ports, configure these in the environment files

### Development Workflow
1. Local Development (Windows):
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Use `npm start` with NODE_ENV=development

2. Server Testing:
   - Frontend: http://154.0.164.254:3000
   - Backend: http://154.0.164.254:8000
   - Different services may use different ports (8000, 8001, 8002)
   - Stop service files if testing on same ports:
     ```bash
     sudo systemctl stop chatai-frontend.service nlp-demo.service rag-pdf-chatbot.service
     ```

3. Production:
   - Frontend: https://ai.kwantu.support
   - Backend: https://ai.kwantu.support/api/*
   - Managed by system service files in /opt/kwantuai/

## Development

The application is built using:
- React 18
- Create React App
- Ant Design components
- Axios for API calls

## Deployment Steps

1. Build the production version:
```bash
NODE_ENV=production npm run build
```

2. The build folder will be created with optimized production files

3. Serve the production build:
```bash
serve -s build -l 3000
```

4. The application will be available at:
   - Development: http://154.0.164.254:3000
   - Production: https://ai.kwantu.support

## Current Status
- Frontend Build: Working
- API Integration: Connected to https://ai.kwantu.support
- PDF Chatbot: Operational
- SQL Chatbot: Operational
- File Upload: Configured
- Translation Service: Currently unavailable

## Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Verify the correct environment variables are being used
3. Ensure Nginx configuration is properly set up
4. Check API endpoints are accessible
5. Verify SSL certificates are valid for HTTPS connections

## Related Projects

- Backend API: FastAPI server with RAG (Retrieval Augmented Generation) capabilities
- PDF Processing: PDF text extraction and vector storage
- SQL Integration: Database query processing with natural language
