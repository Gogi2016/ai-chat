import React from 'react';
import { Tabs } from 'antd';
import NASP_PDFChatbot from './NASP_PDFChatbot';
import MalawiInfrastructureProjectsChatbot from './MalawiInfrastructureProjectsChatbot';
import ChatSummarization from './ChatSummarization';
import ChatTopic from './ChatTopic';
import ChatSemantic from './ChatSemantic';
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
        <TabPane tab="Chat Summarization" key="3">
          <ChatSummarization />
        </TabPane>
        <TabPane tab="Chat Topic" key="4">
          <ChatTopic />
        </TabPane>
        <TabPane tab="Chat Semantic" key="5">
          <ChatSemantic />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;

