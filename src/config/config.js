const API_CONFIG = {
  PDF_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8002',
  SQL_API_URL: process.env.REACT_APP_SQL_API_URL || 'http://localhost:8000',
  NLP_API_URL: process.env.REACT_APP_NLP_API_URL || 'http://localhost:8002'
};

export { API_CONFIG };
