const config = {
    development: {
        NASP_API_URL: 'http://localhost:8000',
        MALAWI_API_URL: 'http://localhost:8001'
    },
    production: {
        NASP_API_URL: 'http://154.0.164.254/api/nasp',
        MALAWI_API_URL: 'http://154.0.164.254/api/malawi'
    }
};

// Prioritize production environment, fallback to development
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
export const API_CONFIG = config[env];
