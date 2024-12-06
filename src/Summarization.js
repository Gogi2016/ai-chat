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
    <div style={{ padding: '20px' }}>
      <Title level={2}>NLP demo</Title>
      <Text>
        This tab is a demonstration of natural language processing (NLP). Three use cases are covered - 
        (i) summarizing text, (ii) extracting common topics from text and (iii) sentiment analysis of text. 
        Copy and paste your text into the input text box to begin.
      </Text>

      <div style={{ marginTop: '20px' }}>
        <Title level={3}>Select Use Case</Title>
        <Radio.Group onChange={handleUseCaseChange} value={selectedUseCase}>
          <Space direction="vertical">
            <Radio value="Summarization">Summarization</Radio>
            <Radio value="Topic Analysis">Topic Analysis</Radio>
            <Radio value="Sentiment Analysis">Sentiment Analysis</Radio>
          </Space>
        </Radio.Group>
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
      </div>

      <Button 
        type="primary"
        onClick={handleSubmit}
        loading={loading}
        style={{ marginTop: '20px' }}
      >
        {loading ? 'Processing...' : 'Run'}
      </Button>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <Title level={3}>Result</Title>
          <div style={{ 
            padding: '15px',
            background: '#f5f5f5',
            borderRadius: '4px'
          }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default Summarization;
