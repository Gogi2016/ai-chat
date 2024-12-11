import React, { useState } from 'react';
import { Typography, Radio, Input, Button, Space, message } from 'antd';
import axios from 'axios';
import { API_CONFIG } from './config/config';
import './App.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE_URL = API_CONFIG.BASE_API_URL;

const NLPDemo = () => {
  const [selectedUseCase, setSelectedUseCase] = useState('summarization');
  const [systemPrompt, setSystemPrompt] = useState('You are an assistant specialized in summarizing texts. Provide concise summaries for the given input.');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUseCaseChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedUseCase(selectedValue);

    switch (selectedValue) {
      case 'summarization':
        setSystemPrompt('You are an assistant specialized in summarizing texts. Provide concise summaries for the given input.');
        break;
      case 'topic_analysis':
        setSystemPrompt('You are an assistant that analyzes texts to identify key topics. Extract and list the main topics from the input.');
        break;
      case 'sentiment_analysis':
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
      console.log('Sending request to:', `${API_BASE_URL}/api/nlp/analyze`);
      console.log('Request payload:', {
        text: inputText,
        use_case: selectedUseCase,
        system_prompt: systemPrompt
      });

      const response = await axios.post(`${API_BASE_URL}/api/nlp/analyze`, {
        text: inputText,
        use_case: selectedUseCase,
        system_prompt: systemPrompt
      });

      console.log('Response:', response.data);
      setResult(response.data.result);
      message.success('Analysis completed successfully');
    } catch (error) {
      console.error('Analysis error:', error);
      let errorMessage = 'Error processing your request';
      if (error.response?.data?.detail) {
        errorMessage += ': ' + error.response.data.detail;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="chat-title">NLP Analysis Demo</h1>
      <Text className="language-label">Select a use case, input your text, and see the analysis results!</Text>

      <div style={{ marginTop: '20px' }}>
        <Title level={3}>Select Use Case</Title>
        <Text>Choose one of the use cases:</Text>
        <div className="radio-group-container">
          <Radio.Group
            onChange={handleUseCaseChange}
            value={selectedUseCase}
            className="radio-group"
          >
            <Space direction="vertical">
              <Radio value="summarization">Summarization</Radio>
              <Radio value="topic_analysis">Topic Analysis</Radio>
              <Radio value="sentiment_analysis">Sentiment Analysis</Radio>
            </Space>
          </Radio.Group>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Title level={3}>Enter Text</Title>
        <Text>Input Text</Text>
        <TextArea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter the text you want to analyze..."
          autoSize={{ minRows: 4, maxRows: 8 }}
          style={{ marginTop: '10px' }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <Title level={3}>System Prompt</Title>
        <TextArea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          autoSize={{ minRows: 2, maxRows: 4 }}
          placeholder="Customize the system prompt if needed..."
        />

        <Button 
          type="primary" 
          className="run-button" 
          onClick={handleSubmit}
          loading={loading}
        >
          {loading ? 'Processing...' : 'Run Analysis'}
        </Button>

        {result && (
          <div className="section">
            <Title level={3}>Analysis Result</Title>
            <div className="result-container">
              <Text>{result}</Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NLPDemo; 