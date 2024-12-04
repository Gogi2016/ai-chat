import React, { useState } from 'react';
import { Typography, Radio, Input, Button, Space, message } from 'antd';
import { summarizationService } from './services/api';
import './App.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Summarization = () => {
  const [selectedUseCase, setSelectedUseCase] = useState('Summarization');
  const [systemPrompt, setSystemPrompt] = useState('You are an assistant specialized in summarizing texts. Provide concise summaries for the given input.');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUseCaseChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedUseCase(selectedValue);

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

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      message.error('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await summarizationService.summarize(
        inputText,
        selectedUseCase,
        systemPrompt
      );
      setResult(response.result);
      message.success('Analysis completed successfully');
    } catch (error) {
      message.error('Error processing your request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="chat-title">Together AI Web Interface</h1>
      <Text className="language-label">Select a use case, input your query, and see the results!</Text>

      <div className="section">
        <Title level={3}>Select Use Case</Title>
        <Text>Choose one of the use cases:</Text>
        <div className="radio-group-container">
          <Radio.Group
            onChange={handleUseCaseChange}
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
        <Title level={3}>Enter Text</Title>
        <Text>Input Text</Text>
        <TextArea 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter the text you want to analyze..." 
          rows={4} 
          className="chat-input"
        />

        <Text className="system-prompt-label">System Prompt</Text>
        <TextArea 
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Provide instructions to the AI (optional)..." 
          rows={4} 
          className="chat-input"
        />

        <Button 
          type="primary" 
          className="run-button" 
          onClick={handleSubmit}
          loading={loading}
        >
          {loading ? 'Processing...' : 'Run'}
        </Button>

        {result && (
          <div className="section">
            <Title level={3}>Result</Title>
            <div className="result-container">
              <Text>{result}</Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summarization;
