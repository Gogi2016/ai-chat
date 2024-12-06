import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, Select, List, Spin, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { API_CONFIG } from './config/config';
import './App.css';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const API_BASE_URL = API_CONFIG.MALAWI_API_URL;

const MalawiInfrastructureProjectsChatbot = () => {
  const [language, setLanguage] = useState('english');
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const chatContainerRef = useRef(null);

  const handleLanguageChange = (value) => {
    setLanguage(value);
  };

  const handleSend = async (question) => {
    const userQuery = question || input;
    if (userQuery.trim()) {
      setChatHistory((prevHistory) => [...prevHistory, { type: 'query', text: userQuery }]);
      setIsTyping(true);

      try {
        console.log('Sending request to:', `${API_BASE_URL}/chat`);
        console.log('Request payload:', {
          message: userQuery,
          language: language
        });

        const response = await fetch(`${API_BASE_URL}/chat`, {
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
            language: language
          }),
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);

        if (!response.ok) {
          let errorMessage = 'Network response was not ok';
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData?.detail || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          throw new Error(errorMessage);
        }

        const data = JSON.parse(responseText);
        console.log('Parsed response data:', data);

        setChatHistory((prevHistory) => [...prevHistory, { 
          type: 'response', 
          text: data.answer || 'No response received',
          error: data.error
        }]);
        
        if (data.suggested_questions && data.suggested_questions.length > 0) {
          setSuggestions(data.suggested_questions);
        }

      } catch (error) {
        console.error('Full error:', error);
        message.error(`Failed to get response from chatbot: ${error.message}`);
        setChatHistory((prevHistory) => [...prevHistory, { 
          type: 'error', 
          text: `Error: ${error.message}`
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
  ];

  return (
    <Layout className="chat-container">
      <Content style={{ padding: '24px', height: '100vh' }}>
        <div className="language-selector" style={{ marginBottom: '20px' }}>
          <Select
            defaultValue={language}
            onChange={handleLanguageChange}
            style={{ width: 120 }}
          >
            <Option value="english">English</Option>
            <Option value="chichewa">Chichewa</Option>
          </Select>
        </div>

        <div
          ref={chatContainerRef}
          className="chat-messages"
          style={{
            height: 'calc(100vh - 200px)',
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

        <div className="suggested-questions" style={{ marginBottom: '20px' }}>
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

        <div className="chat-input" style={{ display: 'flex', gap: '8px' }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSend()}
            style={{ alignSelf: 'flex-end' }}
          >
            Send
          </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default MalawiInfrastructureProjectsChatbot;
