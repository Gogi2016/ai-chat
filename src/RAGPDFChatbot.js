import React, { useState } from 'react';
import { Upload, Button, Radio, Input, Layout, List, message, Spin, Typography } from 'antd';
import { UploadOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_CONFIG } from './config/config';
import './App.css';

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const API_BASE_URL = `${API_CONFIG.RAG_PDF_API_URL}/api/rag-pdf-chatbot`;

const RAGPDFChatbot = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [language, setLanguage] = useState('en');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const customUpload = async (info) => {
    const file = info.file;
    setIsUploading(true);
    
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

    const userMessage = { sender: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
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
      const errorMessage = error.response?.data?.detail || 'An error occurred while processing your request.';
      setChatHistory(prev => [...prev, { sender: 'system', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleFiles = showMore ? uploadedFiles : uploadedFiles.slice(0, 3);

  return (
    <Layout style={{ minHeight: '100%', background: '#fff' }}>
      <Sider width={300} style={{ background: '#fff', padding: '20px', borderRight: '1px solid #f0f0f0' }}>
        <div>
          <h3>Upload Additional Documents</h3>
          <p>Upload PDF, DOCX, or TXT files</p>
          <Upload
            customRequest={customUpload}
            showUploadList={false}
            accept=".pdf,.docx,.txt"
            disabled={isUploading}
          >
            <div style={{ 
              border: '2px dashed #d9d9d9',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              background: '#fafafa',
              marginBottom: '20px'
            }}>
              <p><UploadOutlined style={{ fontSize: '24px' }} /></p>
              <p>Drag and drop file here</p>
              <Button type="primary" loading={isUploading}>
                Browse files
              </Button>
            </div>
          </Upload>

          <div>
            <h3>Uploaded Files</h3>
            {uploadedFiles.length === 0 ? (
              <p style={{ color: '#999' }}>No files uploaded yet</p>
            ) : (
              <List
                size="small"
                dataSource={visibleFiles}
                renderItem={item => (
                  <List.Item>
                    {item.name}
                  </List.Item>
                )}
              />
            )}
            {uploadedFiles.length > 3 && (
              <Button type="link" onClick={() => setShowMore(!showMore)}>
                {showMore ? 'Show Less' : 'Show More'}
              </Button>
            )}
          </div>
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

          <div style={{ 
            position: 'sticky',
            bottom: 0,
            background: '#fff',
            padding: '20px 0',
            borderTop: '1px solid #f0f0f0'
          }}>
            <TextArea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="What would you like to know?"
              autoSize={{ minRows: 1, maxRows: 6 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={isLoading}
              style={{ marginTop: '10px', float: 'right' }}
            >
              Send
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default RAGPDFChatbot;
