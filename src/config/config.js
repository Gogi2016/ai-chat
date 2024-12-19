const getApiUrl = (envVar, defaultPort) => {
  if (envVar) return envVar;
  const host = process.env.REACT_APP_NODE_ENV === 'production' ? 'https://ai.kwantu.support' : 'http://localhost';
  return `${host}:${defaultPort}`;
};

const API_CONFIG = {
  PDF_API_URL: getApiUrl(process.env.REACT_APP_API_URL, 8000),
  SQL_API_URL: getApiUrl(process.env.REACT_APP_SQL_API_URL, 8001),
  NLP_API_URL: getApiUrl(process.env.REACT_APP_NLP_API_URL, 8002)
};

// Log configuration in development
if (process.env.REACT_APP_NODE_ENV === 'development') {
  console.log('API Configuration:', API_CONFIG);
}

export { API_CONFIG };
