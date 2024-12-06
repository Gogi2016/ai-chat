import React from 'react';
import { Tabs } from 'antd';
import NASP_PDFChatbot from './NASP_PDFChatbot';
import MalawiInfrastructureProjectsChatbot from './MalawiInfrastructureProjectsChatbot';
import Summarization from './Summarization';
import './App.css';

const { TabPane } = Tabs;

const App = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="RAG PDF Chatbot demo" key="1">
          <div style={{ padding: '20px' }}>
            <h2>RAG PDF Chatbot demo</h2>
            <p style={{ marginBottom: '20px' }}>
              This tab is a demonstration of a retrieval augmented generation (RAG) chatbot. 
              It uses generative AI but is restricted to responding to questions based on 
              (i) a pre-loaded library of PDF (related to social protection in Uzbekistan) and 
              (ii) additional PDFs that you upload for the session
            </p>
            <NASP_PDFChatbot />
          </div>
        </TabPane>
        <TabPane tab="RAG SQL Chatbot demo" key="2">
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
            <MalawiInfrastructureProjectsChatbot />
          </div>
        </TabPane>
        <TabPane tab="NLP demo" key="3">
          <div style={{ padding: '20px' }}>
            <h2>NLP demo</h2>
            <p style={{ marginBottom: '20px' }}>
              This tab is a demonstration of natural language processing (NLP). Three use 
              cases are covered - (i) summarizing text, (ii) extracting common topics from 
              text and (iii) sentiment analysis of text. Copy and paste your text into the 
              input text box to begin.
            </p>
            <Summarization />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;
