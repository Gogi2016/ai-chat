import React, { useState } from 'react';
import { Typography, Radio, Input, Button, Space } from 'antd';
import './App.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Summarization = () => {
  const [selectedUseCase, setSelectedUseCase] = useState('Topic Analysis');

  return (
    <div className="container">
       <h1 className="chat-title">Together AI Web Interface</h1>
      <Text className="language-label">Select a use case, input your query, and see the results!</Text>

     
      <div className="section">
        <Title level={3}>Select Use Case</Title>
        <Text>Choose one of the use cases:</Text>
        <div className="radio-group-container">
          <Radio.Group 
            onChange={(e) => setSelectedUseCase(e.target.value)} 
            value={selectedUseCase}
            className="radio-group"
          >
            <Space direction="vertical">
              <Radio value="Summarization">Summarization</Radio>
              <Radio value="Topic Analysis">Topic Analysis</Radio>
              <Radio value="Sentiment Analysis">Sentiment Analysis</Radio>
            </Space>
          </Radio.Group>
        </div>
      </div>

      <div className="section">
        <Title level={3}>Enter Prompts</Title>
        <Text>User Prompt</Text>
        <TextArea 
          placeholder="Enter your query here..." 
          rows={4} 
          className="chat-input"
        />

        <Text className="system-prompt-label">System Prompt</Text>
        <TextArea 
          placeholder="Provide instructions to the AI (optional)" 
          rows={4} 
          className="chat-input"
        />

        <Button type="primary" className="run-button">Run</Button>
      </div>
    </div>
  );
};

export default Summarization;
