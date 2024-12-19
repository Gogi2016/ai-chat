import React from 'react';
import { Tabs } from 'antd';
import RAGPDFChatbot from './RAGPDFChatbot';
import RAGSQLChatbot from './RAGSQLChatbot';
import NLPDemo from './NLPDemo';
import './App.css';

const App = () => {
  const items = [
    {
      key: '1',
      label: 'RAG PDF Chatbot demo',
      children: (
        <div style={{ padding: '20px' }}>
          <h2>RAG PDF Chatbot demo</h2>
          <p style={{ marginBottom: '20px' }}>
            This tab is a demonstration of a retrieval augmented generation (RAG) chatbot. 
            It uses generative AI but is restricted to responding to questions based on 
            (i) a pre-loaded library of PDF (related to social protection in Uzbekistan) and 
            (ii) additional PDFs that you upload for the session
          </p>
          <RAGPDFChatbot />
        </div>
      ),
    },
    {
      key: '2',
      label: 'RAG SQL Chatbot demo',
      children: (
        <div style={{ padding: '20px' }}>
          <h2>RAG SQL Chatbot demo</h2>
          <p style={{ marginBottom: '20px' }}>
            This tab is a demonstration of a retrieval augmented generation (RAG) chatbot. 
            It uses generative AI but is restricted to responding to questions based on 
            information held in a database. For this demo the information relates to 
            infrastructure projects (schools, bridges etc) being constructed in Malawi. 
            However, the chatbot could be linked to any database. Note, the chatbot has 
            only been trained on a limited range of responses so far.
          </p>
          <RAGSQLChatbot />
        </div>
      ),
    },
    {
      key: '3',
      label: 'NLP demo',
      children: (
        <div style={{ padding: '20px' }}>
          <h2>NLP demo</h2>
          <p style={{ marginBottom: '20px' }}>
            This tab is a demonstration of natural language processing (NLP). Three use 
            cases are covered - (i) summarizing text, (ii) extracting common topics from 
            text and (iii) sentiment analysis of text. Copy and paste your text into the 
            input text box to begin.
          </p>
          <NLPDemo />
        </div>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default App;
