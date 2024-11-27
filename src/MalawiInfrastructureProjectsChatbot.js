import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, Select, List, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './App.css';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const MalawiInfrastructureProjectsChatbot = () => {
  const [language, setLanguage] = useState('english'); // Language selection state
  const [input, setInput] = useState(''); // User input state
  const [chatHistory, setChatHistory] = useState([]); // Chat history state
  const [isTyping, setIsTyping] = useState(false); // Typing animation state
  const chatContainerRef = useRef(null); // Ref for auto-scrolling the chat

  const handleLanguageChange = (value) => {
    setLanguage(value);
  };

  const handleSend = (question) => {
    const userQuery = question || input;
    if (userQuery.trim()) {
      setChatHistory((prevHistory) => [...prevHistory, { type: 'query', text: userQuery }]);
      setIsTyping(true);

      // Simulate fetching a dynamic response (replace with API call if needed)
      setTimeout(() => {
        const mockResponse = generateResponse(userQuery);

        // Add bot response to chat history
        setChatHistory((prevHistory) => [...prevHistory, { type: 'response', text: mockResponse }]);

        setIsTyping(false);
        setInput(''); 
      }, 1500); // Simulate network delay
    }
  };

  // Mock function to simulate responses based on the query
  const generateResponse = (query) => {
    const responses = {
      "Show more projects": "Currently, there are 20 infrastructure projects in Malawi, focusing on key development areas.",
      "Show projects by sector.": "The projects are categorized into three main sectors: Education, Transport, and Health.",
      "Show projects by region": "The projects are distributed across Northern, Central, and Southern regions of Malawi."
    };
  
    return responses[query] || "Fetching the latest data. Please wait...";
  };

  const suggestedQuestions = [
    "Show more projects",
    "Show projects by sector.",
    "Show projects by region"
  ];

  // Auto-scroll chat container to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <Layout className="chat-layout">
      <Content className="chat-content">
        <h1 className="chat-title">Malawi Infrastructure Projects Chatbot</h1>
        <p className="language-label">Select Language</p>
  
        {/* Language Selection Dropdown */}
        <Select
          value={language}
          onChange={handleLanguageChange}
          style={{ width: 200, marginBottom: '20px' }}
        >
          <Option value="english">English</Option>
          <Option value="chichewa">Chichewa</Option>
          <Option value="tumbuka">Tumbuka</Option>
          <Option value="yao">Yao</Option>
        </Select>
  
        {/* Combined Chat Container */}
        <div className="combined-container">
          {/* Chat History */}
          <div className="chat-box" ref={chatContainerRef}>
            <List
              dataSource={chatHistory}
              renderItem={(item, index) => (
                <List.Item key={index} className={item.type === 'query' ? 'query' : 'response'}>
                  <div className={item.type === 'query' ? 'query-text' : 'response-text'}>
                    {item.text}
                  </div>
                </List.Item>
              )}
              className="chat-history"
            />
            {/* Typing Indicator */}
            {isTyping && (
              <div className="typing-indicator">
                <Spin size="small" />
                <span>Typing...</span>
              </div>
            )}
          </div>
  
          {/* Suggested Questions */}
          <div className="suggested-questions">
            <h3>Suggested Questions:</h3>
            <div className="flex-container">
              {suggestedQuestions.map((item, index) => (
                <div
                  key={index}
                  className="suggested-question-item"
                  onClick={() => handleSend(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
  
          {/* Text Area and Send Button */}
          <div className="text-area-container">
            <TextArea
              placeholder="Ask about infrastructure projects..."
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input"
            />
            <Button
              type="text"
              icon={<SendOutlined />}
              className="send-button"
              onClick={() => handleSend()}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default MalawiInfrastructureProjectsChatbot;
