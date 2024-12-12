import React, { useState } from 'react';
import { Upload, Button, Radio, Input, Layout, List, message } from 'antd';
import { UploadOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_CONFIG } from './config/config';

const { Content, Sider } = Layout;
const { TextArea } = Input;

const API_BASE_URL = API_CONFIG.PDF_API_URL;

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
        },
        timeout: 60000 // 60 second timeout
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
      const errorMessage = error.code === 'ECONNABORTED'
        ? 'Upload timed out after 60 seconds. Please try again.'
        : `${file.name} upload failed: ${error.message}`;
      message.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const requestId = `req-${Date.now()}`;
    const startTime = performance.now();
    
    // Log API configuration
    console.log(`[${requestId}] API Configuration:`, {
      baseUrl: API_BASE_URL,
      environment: process.env.NODE_ENV,
      apiUrl: API_CONFIG.PDF_API_URL
    });

    console.log(`[${requestId}] Network Information:`, {
      onLine: navigator.onLine,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        rtt: navigator.connection.rtt,
        downlink: navigator.connection.downlink
      } : 'Not available'
    });

    const userMessage = { sender: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    let timeoutCounter = 0;
    const checkConnectionInterval = setInterval(() => {
      timeoutCounter += 1;
      console.log(`[${requestId}] Connection check at ${timeoutCounter}s:`, {
        online: navigator.onLine,
        timeElapsed: `${timeoutCounter} seconds`
      });
    }, 1000);

    try {
      console.log(`[${requestId}] Initiating axios call...`);
      const fetchStartTime = performance.now();

      // Test server response time with a HEAD request
      try {
        const serverCheckStart = performance.now();
        await fetch(`${API_BASE_URL}/status`, {
          method: 'HEAD'
        });
        const serverCheckEnd = performance.now();
        console.log(`[${requestId}] Server response time: ${(serverCheckEnd - serverCheckStart).toFixed(2)}ms`);
      } catch (error) {
        console.error(`[${requestId}] Server check failed:`, error);
      }

      const response = await axios.post(`${API_BASE_URL}/query`, {
        message: chatInput,
        language: language,
        session_id: requestId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`[${requestId}] Upload progress: ${progress}%`, {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            timeElapsed: (performance.now() - startTime).toFixed(2)
          });
        },
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`[${requestId}] Download progress: ${progress}%`, {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            timeElapsed: (performance.now() - startTime).toFixed(2)
          });
        }
      });

      clearInterval(checkConnectionInterval);
      const fetchEndTime = performance.now();
      console.log(`[${requestId}] Axios call completed in ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`);
      console.log(`[${requestId}] Response status:`, response.status);
      console.log(`[${requestId}] Response headers:`, response.headers);
      console.log(`[${requestId}] Response data:`, response.data);

      if (response.data.processing_time) {
        console.log(`[${requestId}] Backend processing time:`, {
          total: response.data.processing_time,
          operations: response.data.operation_times
        });
      }

      const botMessage = { 
        sender: 'bot', 
        text: response.data.response || 'No response received from the server.' 
      };
      setChatHistory(prev => [...prev, botMessage]);

      const endTime = performance.now();
      console.log(`[${requestId}] Total request time: ${(endTime - startTime).toFixed(2)}ms`);

    } catch (error) {
      clearInterval(checkConnectionInterval);
      const endTime = performance.now();

      // Enhanced error logging
      const errorDetails = {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        response: error.response?.data,
        timings: {
          totalTime: (endTime - startTime).toFixed(2),
          atTime: new Date().toISOString()
        },
        network: {
          online: navigator.onLine,
          connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            rtt: navigator.connection.rtt,
            downlink: navigator.connection.downlink
          } : 'Not available'
        },
        request: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          timeout: error.config?.timeout
        }
      };

      console.error(`[${requestId}] Request failed:`, errorDetails);

      const errorMessage = error.code === 'ECONNABORTED'
        ? `Request timed out after 60 seconds. Please try again. Network status: ${navigator.onLine ? 'Online' : 'Offline'}`
        : error.response?.data?.detail || error.message || 'An error occurred while processing your request.';
      
      message.error(errorMessage);
      setChatHistory(prev => [...prev, { 
        sender: 'system', 
        text: `Error: ${errorMessage}` 
      }]);
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
      </Content>
    </Layout>
  );
};

export default RAGPDFChatbot;
