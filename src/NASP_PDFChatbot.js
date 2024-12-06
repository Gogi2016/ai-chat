import React, { useState } from 'react';
import { Upload, Button, Radio, Input, Layout, List, message, Spin, Typography } from 'antd';
import { UploadOutlined, SendOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_CONFIG } from './config/config';
import './App.css';

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const API_BASE_URL = API_CONFIG.NASP_API_URL;

const NASP_PDFChatbot = () => {
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
    formData.append('file', file);
    formData.append('language', language);

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
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: chatInput,
        language: language
      });

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

      <Content style={{ padding: '20px' }}>
        <div>
          <h2>RAG PDF Chatbot demo</h2>
          <div style={{ marginBottom: '20px' }}>
            <Text>Select Language / Выберите язык / Tilni tanlang</Text>
            <div style={{ marginTop: '10px' }}>
              <Radio.Group value={language} onChange={(e) => setLanguage(e.target.value)}>
                <Radio value="en">English</Radio>
                <Radio value="ru">Русский</Radio>
                <Radio value="uz">O'zbek</Radio>
              </Radio.Group>
            </div>
          </div>

          <div style={{ 
            minHeight: '400px', 
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto',
            border: '1px solid #f0f0f0',
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '20px',
            background: '#fff'
          }}>
            {chatHistory.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: message.sender === 'user' ? '#1890ff' : '#f5f5f5',
                    color: message.sender === 'user' ? '#fff' : '#000',
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
                <div style={{ marginTop: '10px' }}>Processing your message...</div>
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

export default NASP_PDFChatbot;
