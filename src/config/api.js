// Backend API configuration
const isDevelopment = window.location.hostname === 'localhost';

// Base URLs for both backends
export const API_BASE_URLS = {
    nasp: isDevelopment ? 'http://localhost:8000' : 'http://154.0.164.254:8000',
    malawi: isDevelopment ? 'http://localhost:8001' : 'http://154.0.164.254:8001'
};

export const endpoints = {
    chat: '/chat',
    upload: '/upload',
    languages: '/languages',
    summarize: '/summarize'
};
