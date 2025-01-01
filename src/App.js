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
      label: 'RAG PDF Chatbot',
      children: <RAGPDFChatbot />
    },
    {
      key: '2',
      label: 'RAG SQL Chatbot',
      children: <RAGSQLChatbot />
    },
    {
      key: '3',
      label: 'NLP Demo',
      children: <NLPDemo />
    }
  ];

  return (
    <div className="app-container">
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default App;
