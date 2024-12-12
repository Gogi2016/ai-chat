// Get environment and host information
const env = process.env.NODE_ENV || 'development';
const isServerEnvironment = typeof window !== 'undefined' && window.location.hostname === '154.0.164.254';

const config = {
    // Local Windows development
    development: {
        BASE_API_URL: isServerEnvironment ? 'http://154.0.164.254:8000' : 'http://localhost:8000',
        RAG_PDF_API_URL: '/api/rag-pdf-chatbot',
        RAG_SQL_API_URL: '/api/rag-sql-chatbot',
        NLP_API_URL: '/api/nlp'
    },
    // Server IP testing
    testing: {
        BASE_API_URL: 'http://154.0.164.254:8000',
        RAG_PDF_API_URL: '/api/rag-pdf-chatbot',
        RAG_SQL_API_URL: '/api/rag-sql-chatbot',
        NLP_API_URL: '/api/nlp'
    },
    // QA Environment (public testing)
    qa: {
        BASE_API_URL: 'https://ai.kwantu.support',
        RAG_PDF_API_URL: '/api/rag-pdf-chatbot',
        RAG_SQL_API_URL: '/api/rag-sql-chatbot',
        NLP_API_URL: '/api/nlp'
    },
    // Production Environment
    production: {
        BASE_API_URL: 'https://ai.kwantu.support',
        RAG_PDF_API_URL: '/api/rag-pdf-chatbot',
        RAG_SQL_API_URL: '/api/rag-sql-chatbot',
        NLP_API_URL: '/api/nlp'
    }
};

// Determine the base URL based on environment and location
const baseApiUrl = process.env.REACT_APP_API_URL || config[env].BASE_API_URL;

console.log('Current environment:', env);
console.log('Using API URL:', baseApiUrl);
console.log('Using RAG PDF URL:', `${baseApiUrl}${config[env].RAG_PDF_API_URL}`);

const apiEndpoints = {
    RAG_PDF_API_URL: `${baseApiUrl}${config[env].RAG_PDF_API_URL}`,
    RAG_SQL_API_URL: `${baseApiUrl}${config[env].RAG_SQL_API_URL}`,
    NLP_API_URL: `${baseApiUrl}${config[env].NLP_API_URL}`
};

export const API_CONFIG = apiEndpoints;
