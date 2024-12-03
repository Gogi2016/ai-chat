// Backend API configuration
const isDevelopment = window.location.hostname === 'localhost';

export const API_BASE_URL = isDevelopment 
    ? 'http://localhost:8000'
    : 'http://154.0.164.254:8000';

export const endpoints = {
    chat: '/chat',
    upload: '/upload',
    languages: '/languages'
};
