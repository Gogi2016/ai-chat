import React, { useState } from 'react';
import { Typography, Radio, Input, Button, Space } from 'antd';
import './App.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Summarization = () => {
  const [selectedUseCase, setSelectedUseCase] = useState('Summarization');  // Default to 'Summarization'
  const [systemPrompt, setSystemPrompt] = useState('You are an assistant specialized in summarizing texts. Provide concise summaries for the given input.'); // Default system prompt

  // Function to update system prompt based on the selected use case
  const handleUseCaseChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedUseCase(selectedValue);

    // Update system prompt text based on the selected use case
    switch (selectedValue) {
      case 'Summarization':
        setSystemPrompt('You are an assistant specialized in summarizing texts. Provide concise summaries for the given input.');
        break;
      case 'Topic Analysis':
        setSystemPrompt('You are an assistant that analyzes texts to identify key topics. Extract and list the main topics from the input.');
        break;
      case 'Sentiment Analysis':
        setSystemPrompt('You are an assistant skilled in sentiment analysis. Determine whether the sentiment of the input is positive, negative, or neutral.');
        break;
      default:
        setSystemPrompt('');
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
            onChange={handleUseCaseChange} // Handle radio button changes
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
        <Title level={3}>Enter Prompts</Title>
        <Text>User Prompt</Text>
        <TextArea 
          placeholder="Enter your query here..." 
          rows={4} 
          className="chat-input"
        />

        {/* Editable System Prompt and Run Button */}
        <Text className="system-prompt-label">System Prompt</Text>
        <TextArea 
          value={systemPrompt} // Display the dynamic system prompt
          onChange={(e) => setSystemPrompt(e.target.value)} // Update the system prompt dynamically
          placeholder="Provide instructions to the AI (optional)..." 
          rows={4} 
          className="chat-input"
        />

        <Button type="primary" className="run-button">Run</Button>
      </div>
    </div>
  );
};

export default Summarization;
