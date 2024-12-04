import React, { useState } from 'react';
import { Upload, Button, Radio, Input, Layout, List, message, Spin } from 'antd';
import { UploadOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import './App.css';
import { chatService } from './services/api';

const { Sider, Content } = Layout;
const { TextArea } = Input;

const API_BASE_URL = 'http://154.0.164.254:8000';

const NASP_PDFChatbot = () => {
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
    formData.append('file', file);
    formData.append('language', language);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
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
      message.error(`${file.name} upload failed: ${error.response?.data?.detail || error.message}`);
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
      // Send message to backend
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: chatInput,
        language: language
      });

      // Add bot response to chat history
      const botMessage = { 
        sender: 'bot', 
        text: response.data.response 
      };
      setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      message.error(`Failed to send message: ${error.response?.data?.detail || error.message}`);
      
      // Add error message to chat history
      const errorMessage = { 
        sender: 'system', 
        text: 'Sorry, there was an error processing your message.' 
      };
      setChatHistory(prev => [...prev, errorMessage]);
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
                <>
                  <UploadOutlined className="upload-icon" />
                  <p>Drag and drop file here</p>
                  <Button className="browse-button">Browse files</Button>
                </>
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
        <h1 className="chat-title">NASP Chatbot</h1>
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

export default NASP_PDFChatbot;
