import React from 'react';
import { Tabs } from 'antd';
import ChatWithPDF from './ChatWithPDF';
import ChatWithDB from './ChatWithDB';
import ChatSummarization from './ChatSummarization';
import ChatTopic from './ChatTopic';
import ChatSemantic from './ChatSemantic';
import './App.css';

const { TabPane } = Tabs;

const App = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Chat with PDF" key="1">
          <ChatWithPDF />
        </TabPane>
        <TabPane tab="Chat with DB" key="2">
          <ChatWithDB />
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

