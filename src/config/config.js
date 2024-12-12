// Get environment information
const env = process.env.NODE_ENV || 'development';

// Helper function to get the appropriate API URL based on environment variables
const getApiUrl = (pdfUrl, sqlUrl, nlpUrl) => {
    // Use environment variables if provided
    if (process.env.REACT_APP_PDF_API_URL && process.env.REACT_APP_SQL_API_URL && process.env.REACT_APP_NLP_API_URL) {
        return {
            PDF_API_URL: process.env.REACT_APP_PDF_API_URL,
            SQL_API_URL: process.env.REACT_APP_SQL_API_URL,
            NLP_API_URL: process.env.REACT_APP_NLP_API_URL
        };
    }

    // Fallback to default configuration
    const isServerEnvironment = typeof window !== 'undefined' && window.location.hostname === '154.0.164.254';
    const baseUrl = isServerEnvironment ? 'http://154.0.164.254' : 'http://localhost';
    
    return {
        PDF_API_URL: `${baseUrl}:8000`,
        SQL_API_URL: `${baseUrl}:8001`,
        NLP_API_URL: `${baseUrl}:8002`
    };
};

// Get API configuration based on environment
const apiConfig = getApiUrl(
    process.env.REACT_APP_PDF_API_URL,
    process.env.REACT_APP_SQL_API_URL,
    process.env.REACT_APP_NLP_API_URL
);

console.log('Current environment:', env);
console.log('API Configuration:', apiConfig);

export const API_CONFIG = apiConfig;
