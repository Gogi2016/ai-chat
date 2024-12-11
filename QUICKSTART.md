# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- serve (for production deployment)
```bash
npm install -g serve
```

## Development Setup (5 minutes)

1. **Clone & Install**
```bash
git clone https://github.com/kwantu/chatai
cd chatai
npm install
```

2. **Configure Development Environment**
Create `.env.development`:
```env
PORT=3000
HOST=0.0.0.0
REACT_APP_NODE_ENV=development
PUBLIC_URL=http://154.0.164.254:3000
```

3. **Start Development Server**
```bash
npm start
```
🚀 Access at: http://154.0.164.254:3000

## Production Deployment (10 minutes)

1. **Configure Production Environment**
Create `.env.production`:
```env
PORT=3000
HOST=0.0.0.0
REACT_APP_NODE_ENV=production
PUBLIC_URL=https://ai.kwantu.support
```

2. **Build & Deploy**
```bash
# Build production bundle
NODE_ENV=production npm run build

# Serve the application
serve -s build -l 3000
```
🚀 Access at: https://ai.kwantu.support

## Verify Installation

1. **Check Frontend**
- Open the application URL in your browser
- Verify the chat interface loads
- Check browser console for any errors

2. **Test API Connection**
- Click the status indicator in the UI
- Verify components status:
  - Vector Store: ✅
  - LLM: ✅
  - NLP: ✅
  - Translation: ⚠️ (currently unavailable)

3. **Test Basic Functions**
- Send a test message
- Try uploading a PDF
- Test different languages

## Common Issues & Quick Fixes

### Network Error
```
Error: Network Error (ERR_NAME_NOT_RESOLVED)
```
✅ Fix: Check your nginx configuration and ensure DNS resolution

### Build Error
```
Failed to compile
```
✅ Fix: Run `npm cache clean --force` and try again

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use
```
✅ Fix: Kill the process using port 3000:
```bash
lsof -i :3000
kill -9 <PID>
```

## Need Help?

- Check the full README.md for detailed documentation
- Review logs in the browser console
- Contact the development team on Slack
