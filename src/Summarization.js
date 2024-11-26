import React, { useState } from 'react';
import { Typography, Radio, Input, Button, Space } from 'antd';
import './App.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Summarization = () => {
  const [selectedUseCase, setSelectedUseCase] = useState('Summarization');  // Default to 'Summarization'

  // Function to render content based on the selected use case
  const renderContent = () => {
    switch (selectedUseCase) {
      case 'Summarization':
        return (
          <div>
            <Title level={3}>Enter Prompts</Title>
            <Text>User Prompt</Text>
            <TextArea placeholder="Enter your query here..." rows={4} className="chat-input" />
          </div>
        );
      case 'Topic Analysis':
        return (
          <div>
            <Title level={3}>Enter Prompts</Title>
            <Text>User Prompt</Text>
            <TextArea placeholder="Enter your query here..." rows={4} className="chat-input" />
          </div>
        );
      case 'Sentiment Analysis':
        return (
          <div>
            <Title level={3}>Enter Prompt</Title>
            <Text>User Prompt</Text>
            <TextArea placeholder="Enter your query here..." rows={4} className="chat-input" />
          </div>
        );
    }
  };

  return (
    <div className="container">
      <h1 className="chat-title">Together AI Web Interface</h1>
      <Text className="language-label">Select a use case, input your query, and see the results!</Text>

      {/* Radio Buttons for Use Case Selection */}
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

      {/* Render the content based on the selected use case */}
      <div className="section">
        {renderContent()}

        {/* System Prompt and Run Button */}
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
