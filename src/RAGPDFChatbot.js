import React, { useState } from 'react';
import { Upload, Button, Radio, Input, Layout, List, message, Spin } from 'antd';
import { UploadOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_CONFIG } from './config/config';
import './App.css';

const { Sider, Content } = Layout;
const { TextArea } = Input;

const API_BASE_URL = `${API_CONFIG.RAG_PDF_API_URL}/api/rag-pdf-chatbot`;

const RAGPDFChatbot = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [language, setLanguage] = useState('en');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const customUpload = async (info) => {
    const file = info.file;
    setIsUploading(true);
    
    // Create FormData to send file
    const formData = new FormData();
    formData.append('files', file);
    formData.append('session_id', Date.now().toString());

    try {
      await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success(`${file.name} uploaded successfully`);
      setUploadedFiles(prevFiles => {
        // Prevent duplicate files
        if (!prevFiles.some(f => f.name === file.name)) {
          return [...prevFiles, { name: file.name }];
        }
        return prevFiles;
      });
    } catch (error) {
      console.error('Upload error:', error);
      message.error(`${file.name} upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    // Add user message to chat history
    const userMessage = { sender: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    
    // Clear input
    setChatInput('');
    
    // Set loading state
    setIsLoading(true);

    try {
      // Send message to backend with detailed configuration
      const response = await axios.post(`${API_BASE_URL}/query`, {
        message: chatInput,
        language: language,
        session_id: Date.now().toString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000  // 10 seconds timeout
      });

      // Add bot response to chat history
      const botMessage = { 
        sender: 'bot', 
        text: response.data.response || 'No response received from the server.' 
      };
      setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Detailed error handling
      let errorMessage = 'Sorry, there was an error processing your message.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.detail || 
                       `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from the server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Request setup error: ${error.message}`;
      }

      // Add error message to chat history
      const systemMessage = { 
        sender: 'system', 
        text: errorMessage 
      };
      setChatHistory(prev => [...prev, systemMessage]);

      // Show error message to user
      message.error(errorMessage);
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  const visibleFiles = showMore ? uploadedFiles : uploadedFiles.slice(0, 3);

  const handleLanguageChange = (e) => {
    const languageMap = {
      'english': 'en',
      'russian': 'ru',
      'uzbek': 'uz'
    };
    setLanguage(languageMap[e.target.value]);
  };

  return (
    <div className="combined-container">
    <Layout className="chat-layout">
      <Sider width={300} className="upload-sider">
        {/* Upload Section */}
        <div className="upload-section">
          <h3 className="upload-header">Upload Additional Documents</h3>
          <p>Upload PDF, DOCX, or TXT files</p>
          <Upload.Dragger
            multiple={false}
            customRequest={customUpload}
            showUploadList={false}
            className="upload-dragger"
            accept=".pdf,.docx,.txt"
          >
            <div className="upload-info">
              {isUploading ? (
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              ) : (
                <div>
                  <UploadOutlined className="upload-icon" />
                  <p>Drag and drop file here</p>
                  <Button className="browse-button">Browse files</Button>
                </div>
              )}
            </div>
          </Upload.Dragger>
        </div>

        {/* Uploaded Files Section */}
        <div className="uploaded-files-section">
          <List
            header={<div className="file-list-header">Uploaded Files</div>}
            dataSource={visibleFiles}
            renderItem={(item) => (
              <List.Item className="file-list-item">
                {item.name}
              </List.Item>
            )}
            className="file-list"
            locale={{ emptyText: 'No files uploaded yet' }}
          />
          {uploadedFiles.length > 3 && (
            <Button type="link" onClick={toggleShowMore} className="show-more-button">
              {showMore ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </div>
      </Sider>

      {/* Chat Content Section */}
      <Content className="chat-content">
        <h1 className="chat-title">RAG PDF Chatbot</h1>
        <p className="language-label">Select Language / Выберите язык / Tilni tanlang</p>

        {/* Radio buttons for language selection */}
        <Radio.Group onChange={(e) => setLanguage(e.target.value)} value={language}>
          <Radio value="en">English</Radio>
          <Radio value="ru">Русский</Radio>
          <Radio value="uz">O'zbek</Radio>
        </Radio.Group>

        {/* Chat History */}
        <div className="chat-history">
          {chatHistory.map((message, index) => (
            <div 
              key={index} 
              className={`chat-message ${message.sender}`}
            >
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div className="chat-message bot loading">
              Typing...
            </div>
          )}
        </div>

        {/* TextArea and Send Button Container */}
        <div className="chat-input-container">
          <TextArea 
            placeholder="What would you like to know?" 
            rows={4} 
            className="chat-input"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onPressEnter={handleSendMessage}
          />
          <Button
            type="text"
            icon={<SendOutlined />}
            className="send-button"
            onClick={handleSendMessage}
            loading={isLoading}
          />
        </div>
      </Content>
    </Layout>
    </div>
  );
};

export default RAGPDFChatbot;
