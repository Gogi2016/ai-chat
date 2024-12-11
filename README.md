# AI Chat Application

Repository: https://github.com/kwantu/chatai

This is the React frontend for the NASP Chatbot project. It provides a modern web interface for interacting with our AI chatbot system.

## Project Structure
The project consists of two main parts:
- Frontend: React application (this repository)
- Backend: FastAPI server (in the `nasp-chatbot` directory)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Environment Configuration:

### Development Environment
Create a `.env` file in the root directory with:
```env
PORT=3000
HOST=0.0.0.0
REACT_APP_NODE_ENV=production
PUBLIC_URL=http://154.0.164.254:3000
```

### Production Environment
Create a `.env.production` file in the root directory with:
```env
PORT=3000
HOST=0.0.0.0
REACT_APP_NODE_ENV=production
PUBLIC_URL=https://ai.kwantu.support
```

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`

Builds the app for production to the `build` folder. For production builds, use:
```bash
NODE_ENV=production npm run build
```

### `npm test`

Launches the test runner in interactive watch mode

## Development

The application is built using:
- React 18
- Create React App
- Material-UI components
- Axios for API calls

## Deployment

1. Build the production version:
```bash
NODE_ENV=production npm run build
```

2. The build process will use:
   - Development settings (`.env`) when building with `npm run build`
   - Production settings (`.env.production`) when building with `NODE_ENV=production npm run build`

## Related Projects

- Backend API: See the `nasp-chatbot` directory for the FastAPI backend
