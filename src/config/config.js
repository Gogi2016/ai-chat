const getApiUrl = (envVar, defaultPort) => {
  if (envVar) return envVar;
  
  // Get the current hostname
  const hostname = window?.location?.hostname || 'localhost';
  
  // Production environment
  if (process.env.REACT_APP_NODE_ENV === 'production') {
    return `https://ai.kwantu.support/api`;
  }
  
  // Server testing environment (IP address)
  if (hostname === '154.0.164.254') {
    return `http://154.0.164.254:${defaultPort}`;
  }
  
  // Local development
  return `http://localhost:${defaultPort}`;
};

// Create API configuration based on current environment
const createApiConfig = () => {
  // Check for production environment first
  if (process.env.REACT_APP_NODE_ENV === 'production') {
    return {
      PDF_API_URL: 'https://ai.kwantu.support/api/rag-pdf-chatbot',
      SQL_API_URL: 'https://ai.kwantu.support/api/rag-sql-chatbot',
      NLP_API_URL: 'https://ai.kwantu.support/api/nlp-demo'
    };
  }

  // For non-production environments
  const hostname = window?.location?.hostname || 'localhost';
  const isServerTesting = hostname === '154.0.164.254';
  const baseUrl = isServerTesting ? 'http://154.0.164.254' : 'http://localhost';

  return {
    PDF_API_URL: `${baseUrl}:8000`,
    SQL_API_URL: `${baseUrl}:8001`,
    NLP_API_URL: `${baseUrl}:8002`
  };
};

const API_CONFIG = createApiConfig();

// Log configuration in development
if (process.env.REACT_APP_NODE_ENV !== 'production') {
  console.log('API Configuration:', API_CONFIG);
}

export { API_CONFIG };
