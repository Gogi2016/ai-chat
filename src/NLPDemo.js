import React, { useState } from 'react';
import { Radio, Input, Button, Space, Typography, message, Upload, Layout } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Content, Sider } = Layout;

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8002';

const NLPDemo = () => {
  const [selectedUseCase, setSelectedUseCase] = useState('summarization');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

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

  const handleFileAnalysis = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('use_case', selectedUseCase);

      const response = await axios.post(`${API_BASE_URL}/analyze-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data.result);
      message.success(`Analysis of ${file.name} completed successfully`);
    } catch (error) {
      console.error('File analysis error:', error);
      message.error(`Error analyzing file: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.txt,.pdf',
    fileList: uploadedFiles,
    beforeUpload: (file) => {
      const isPDForTXT = file.type === 'application/pdf' || file.type === 'text/plain';
      if (!isPDForTXT) {
        message.error('You can only upload PDF or TXT files!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return false;
      }
      handleFileAnalysis(file);
      return false;
    },
    onRemove: (file) => {
      setUploadedFiles(uploadedFiles.filter(item => item.uid !== file.uid));
    },
    onChange: (info) => {
      setUploadedFiles(info.fileList.slice(-1));
    }
  };

  return (
    <Layout className="chat-container">
      {/* Left Sidebar */}
      <Sider width={300} theme="light" style={{ padding: '20px', borderRight: '1px solid #f0f0f0' }}>
        <div>
          <h3>Upload Document</h3>
          <Text>Upload PDF or TXT files</Text>
          <div style={{ marginTop: '10px' }}>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for PDF and TXT files. Maximum file size: 10MB
              </p>
            </Dragger>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3>Uploaded Files</h3>
          {uploadedFiles.length === 0 ? (
            <Text type="secondary">No files uploaded yet</Text>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {uploadedFiles.map(file => (
                <li key={file.uid}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>
      </Sider>

      {/* Main Content */}
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        <h1 className="chat-title">NLP Analysis Demo</h1>
        <Text className="language-label">Select a use case, input text or upload a document to analyze!</Text>

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