// Get environment information
const env = process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || 'development';
console.log('Environment variables:', {
    REACT_APP_NODE_ENV: process.env.REACT_APP_NODE_ENV,
    NODE_ENV: process.env.NODE_ENV,
    env: env
});

// Helper function to get the appropriate API URL based on environment variables
const getApiUrl = () => {
    // Production environment
    if (env === 'production' || window.location.hostname === 'ai.kwantu.support') {
        const config = {
            PDF_API_URL: 'https://ai.kwantu.support/api/rag-pdf-chatbot',
            SQL_API_URL: 'https://ai.kwantu.support/api/rag-sql-chatbot',
            NLP_API_URL: 'https://ai.kwantu.support/api/nlp-demo'
        };
        console.log('Using production config:', config);
        return config;
    }

    // Development environment - use environment variables if provided
    if (process.env.REACT_APP_PDF_API_URL && process.env.REACT_APP_SQL_API_URL && process.env.REACT_APP_NLP_API_URL) {
        const config = {
            PDF_API_URL: process.env.REACT_APP_PDF_API_URL,
            SQL_API_URL: process.env.REACT_APP_SQL_API_URL,
            NLP_API_URL: process.env.REACT_APP_NLP_API_URL
        };
        console.log('Using environment variables config:', config);
        return config;
    }

    // Fallback to default configuration for development
    const isServerEnvironment = window.location.hostname === '154.0.164.254';
    const baseUrl = isServerEnvironment ? 'http://154.0.164.254' : 'http://localhost';
    const config = {
        PDF_API_URL: `${baseUrl}:8000`,
        SQL_API_URL: `${baseUrl}:8001`,
        NLP_API_URL: `${baseUrl}:8002`
    };
    console.log('Using fallback config:', config);
    return config;
};

// Get API configuration based on environment
const apiConfig = getApiUrl();

console.log('Current environment:', env);
console.log('Current hostname:', window.location.hostname);
console.log('API Configuration:', apiConfig);

export const API_CONFIG = apiConfig;
export default apiConfig;
