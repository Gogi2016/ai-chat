import React, { useState } from 'react';
import { Radio, Input, Button, Space, Typography, message, Layout, Card } from 'antd';
import axios from 'axios';
import { API_CONFIG } from './config/config';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Content } = Layout;

const API_BASE_URL = API_CONFIG.NLP_API_URL;

const NLPDemo = () => {
  const [selectedUseCase, setSelectedUseCase] = useState('summarization');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUseCaseChange = (e) => {
    setSelectedUseCase(e.target.value);
  };

  const handleTextAnalysis = async () => {
    if (!inputText.trim()) {
      message.error('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, {
        text: inputText,
        use_case: selectedUseCase
      });

      setResult(response.data.result);
      message.success('Analysis completed successfully');
    } catch (error) {
      console.error('Analysis error:', error);
      message.error('Error processing your request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="chat-container">
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        <h1 className="chat-title">NLP Analysis Demo</h1>
        <Text className="language-label">Select a use case and input text to analyze!</Text>

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
          <Text>Enter text manually for analysis</Text>
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter the text you want to analyze..."
            autoSize={{ minRows: 4, maxRows: 8 }}
            style={{ marginTop: '10px' }}
          />

          <Button 
            type="primary" 
            className="run-button" 
            onClick={handleTextAnalysis}
            loading={loading}
            disabled={loading || !inputText.trim()}
          >
            {loading ? 'Processing...' : 'Analyze Text'}
          </Button>
        </div>

        {result && (
          <div className="section">
            <Title level={3}>Analysis Result</Title>
            <div className="result-container">
              <Text>{result}</Text>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default NLPDemo; 