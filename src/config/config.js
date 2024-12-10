const config = {
    development: {
        RAG_PDF_API_URL: 'http://154.0.164.254:8000',
        RAG_SQL_API_URL: 'http://154.0.164.254:8001',
        NLP_API_URL: 'http://154.0.164.254:8002'
    },
    production: {
        RAG_PDF_API_URL: 'http://154.0.164.254:8000',
        RAG_SQL_API_URL: 'http://154.0.164.254:8001',
        NLP_API_URL: 'http://154.0.164.254:8002'
    }
};

// Prioritize production environment, fallback to development
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
export const API_CONFIG = config[env];
