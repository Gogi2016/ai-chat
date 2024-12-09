// Backend API configuration
const isDevelopment = window.location.hostname === 'localhost';

// Base URLs for both backends
const QA_DOMAIN = 'ai.kwantu.support';
const PROD_DOMAIN = 'ai.kwantu.net';

export const API_BASE_URLS = {
    nasp: isDevelopment 
        ? 'http://localhost:8000' 
        : `https://${QA_DOMAIN}/api/nasp`,
    malawi: isDevelopment 
        ? 'http://localhost:8001' 
        : `https://${QA_DOMAIN}/api/malawi`
};

// Frontend base URL
export const APP_BASE_URL = isDevelopment
    ? 'http://localhost:3000'
    : `https://${QA_DOMAIN}/app`;

export const endpoints = {
    query: '/query',
    upload: '/upload',
    languages: '/languages'
};
