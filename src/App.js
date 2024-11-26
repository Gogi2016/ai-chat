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
        <TabPane tab="NASP PDF Chatbot" key="1">
          <NASP_PDFChatbot />
        </TabPane>
        <TabPane tab="Malawi Infrastructure Projects Chatbot" key="2">
          <MalawiInfrastructureProjectsChatbot />
        </TabPane>
        <TabPane tab="Summarization" key="3">
          <Summarization />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;

