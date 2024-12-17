// Get environment information
const getEnvironment = () => {
    // Check hostname first
    const hostname = window.location.hostname;
    
    if (hostname === 'ai.kwantu.support') {
        return 'production';
    }
    
    if (hostname === '154.0.164.254') {
        return 'server';
    }
    
    if (hostname === 'localhost') {
        return 'development';
    }
    
    // Fallback to environment variables
    return process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || 'development';
};

const env = getEnvironment();
console.log('Environment variables:', {
    REACT_APP_NODE_ENV: process.env.REACT_APP_NODE_ENV,
    NODE_ENV: process.env.NODE_ENV,
    env: env,
    hostname: window.location.hostname
});

// Helper function to get the appropriate API URL based on environment variables
const getApiUrl = () => {
    const config = {
        production: {
            PDF_API_URL: 'https://ai.kwantu.support/api/rag-pdf-chatbot',
            SQL_API_URL: 'https://ai.kwantu.support/api/rag-sql-chatbot',
            NLP_API_URL: 'https://ai.kwantu.support/api/nlp-demo'
        },
        server: {
            PDF_API_URL: 'http://154.0.164.254:8000',
            SQL_API_URL: 'http://154.0.164.254:8001',
            NLP_API_URL: 'http://154.0.164.254:8002'
        },
        development: {
            PDF_API_URL: 'http://localhost:8000',
            SQL_API_URL: 'http://localhost:8001',
            NLP_API_URL: 'http://localhost:8002'
        }
    };

    // Get config based on environment
    const envConfig = config[env] || config.server;
    console.log(`Using ${env} config:`, envConfig);
    return envConfig;
};

// Get API configuration based on environment
const apiConfig = getApiUrl();

console.log('Current environment:', env);
console.log('API Configuration:', apiConfig);

export const API_CONFIG = apiConfig;
export default apiConfig;
