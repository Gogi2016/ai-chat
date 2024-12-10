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

2. Create a `.env` file in the root directory with:
```env
REACT_APP_API_URL=http://localhost:8000
```

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`

Builds the app for production to the `build` folder

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
npm run build
```

2. Deploy the contents of the `build` folder to your web server

## Related Projects

- Backend API: See the `nasp-chatbot` directory for the FastAPI backend
