import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, List, Spin, message, Radio, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { API_CONFIG } from './config/config';
import './App.css';

const { Content } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const API_BASE_URL = API_CONFIG.SQL_API_URL;

const RAGSQLChatbot = () => {
  const [language, setLanguage] = useState('english');
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const chatContainerRef = useRef(null);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSend = async (question) => {
    const userQuery = question || input;
    if (userQuery.trim()) {
      const requestId = `req-${Date.now()}`;
      const startTime = performance.now();
      
      // Log API configuration
      console.log(`[${requestId}] API Configuration:`, {
        baseUrl: API_BASE_URL,
        environment: process.env.NODE_ENV,
        apiUrl: API_CONFIG.SQL_API_URL
      });

      console.log(`[${requestId}] Starting API call to ${API_BASE_URL}/query`);
      console.log(`[${requestId}] Network Information:`, {
        onLine: navigator.onLine,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          rtt: navigator.connection.rtt,
          downlink: navigator.connection.downlink
        } : 'Not available'
      });

      setChatHistory((prevHistory) => [...prevHistory, { type: 'query', text: userQuery }]);
      setIsTyping(true);

      let timeoutCounter = 0;
      const checkConnectionInterval = setInterval(() => {
        timeoutCounter += 1;
        console.log(`[${requestId}] Connection check at ${timeoutCounter}s:`, {
          online: navigator.onLine,
          timeElapsed: `${timeoutCounter} seconds`
        });
      }, 1000);

      try {
        const controller = new AbortController();
        let timeoutId;

        // Create a promise that rejects after timeout
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            controller.abort();
            reject(new Error('Request timed out after 60 seconds'));
          }, 60000);
        });

        console.log(`[${requestId}] Initiating fetch call...`);
        const fetchStartTime = performance.now();

        // Race between fetch and timeout
        const response = await Promise.race([
          fetch(`${API_BASE_URL}/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Origin': window.location.origin,
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type'
            },
            mode: 'cors',
            body: JSON.stringify({
              message: userQuery,
              language: language,
              session_id: requestId
            }),
            signal: controller.signal
          }),
          timeoutPromise
        ]);

        clearTimeout(timeoutId);
        clearInterval(checkConnectionInterval);

        const fetchEndTime = performance.now();
        console.log(`[${requestId}] Fetch completed in ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`);

        // Test server response time with a GET request
        try {
          const serverCheckStart = performance.now();
          await fetch(`${API_BASE_URL}/status`, {
            method: 'GET'
          });
          const serverCheckEnd = performance.now();
          console.log(`[${requestId}] Server response time: ${(serverCheckEnd - serverCheckStart).toFixed(2)}ms`);
        } catch (error) {
          console.error(`[${requestId}] Server check failed:`, error);
        }

        console.log(`[${requestId}] Response status:`, response.status);
        const responseText = await response.text();
        console.log(`[${requestId}] Raw response:`, responseText);

        if (!response.ok) {
          let errorMessage = 'Network response was not ok';
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData?.detail || errorMessage;
          } catch (e) {
            console.error(`[${requestId}] Error parsing error response:`, e);
          }
          throw new Error(errorMessage);
        }

        const data = JSON.parse(responseText);
        console.log(`[${requestId}] Parsed response:`, data);
        
        if (data.processing_time) {
          console.log(`[${requestId}] Backend processing time:`, {
            total: data.processing_time,
            operations: data.operation_times
          });
        }

        setChatHistory((prevHistory) => [...prevHistory, { 
          type: 'response', 
          text: data.answer || 'No response received',
          error: data.error
        }]);
        
        if (data.suggested_questions && data.suggested_questions.length > 0) {
          setSuggestions(data.suggested_questions);
        }

        const endTime = performance.now();
        console.log(`[${requestId}] Total request time: ${(endTime - startTime).toFixed(2)}ms`);

      } catch (error) {
        clearInterval(checkConnectionInterval);
        const endTime = performance.now();
        
        // Enhanced error logging
        const errorDetails = {
          name: error.name,
          message: error.message,
          stack: error.stack,
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
          }
        };

        console.error(`[${requestId}] Request failed:`, errorDetails);

        const errorMessage = error.name === 'AbortError' 
          ? `Request timed out after 60 seconds. Please try again. Network status: ${navigator.onLine ? 'Online' : 'Offline'}`
          : `Failed to get response from chatbot: ${error.message}`;
        
        message.error(errorMessage);
        setChatHistory((prevHistory) => [...prevHistory, { 
          type: 'error', 
          text: `Error: ${errorMessage}`
        }]);
      } finally {
        setIsTyping(false);
        setInput('');
      }
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const suggestedQuestions = [
    "Show me infrastructure projects in Malawi",
    "What are the project sectors?",
    "Show projects by region",
    "List projects in Northern Region",
    "What is the status of education projects?"
  ];

  return (
    <Layout className="chat-container">
      <Content style={{ padding: '24px', height: '100vh' }}>
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Text>Select Language / Выберите язык / Tilni tanlang</Text>
          <div style={{ marginTop: '10px' }}>
            <Radio.Group value={language} onChange={handleLanguageChange}>
              <Radio value="english">English</Radio>
              <Radio value="chichewa">Chichewa</Radio>
            </Radio.Group>
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="chat-messages"
          style={{
            height: 'calc(100vh - 300px)',
            overflowY: 'auto',
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={chatHistory}
            renderItem={(item) => (
              <List.Item className={`message ${item.type}`}>
                <div className={`message-content ${item.type}`}>
                  <p>{item.text}</p>
                  {item.context && (
                    <div className="context-info">
                      <small>Source: {item.context}</small>
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
          {isTyping && (
            <div className="typing-indicator">
              <Spin size="small" /> Typing...
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Text strong>Suggested questions:</Text>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            {(suggestions.length > 0 ? suggestions : suggestedQuestions).map((question, index) => (
              <Button
                key={index}
                type="default"
                size="small"
                style={{ margin: '0 8px 8px 0' }}
                onClick={() => handleSend(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ 
          position: 'sticky',
          bottom: 0,
          background: '#fff',
          padding: '20px 0',
          borderTop: '1px solid #f0f0f0',
          marginTop: '20px'
        }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about infrastructure projects in Malawi..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSend()}
            style={{ marginTop: '10px', float: 'right' }}
          >
            Send
          </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default RAGSQLChatbot; 