import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, Select, List, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './App.css';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const ChatWithDB = () => {
  const [language, setLanguage] = useState('english'); // Language selection state
  const [input, setInput] = useState(''); // User input state
  const [chatHistory, setChatHistory] = useState([]); // Chat history state
  const [isTyping, setIsTyping] = useState(false); // Typing animation state
  const chatContainerRef = useRef(null); // Ref for auto-scrolling the chat

  const handleLanguageChange = (value) => {
    setLanguage(value);
  };

  const handleSend = (question) => {
    const userQuery = question || input;  // Use the clicked question or typed input
    if (userQuery.trim()) {
      // Add user query to chat history
      setChatHistory((prevHistory) => [...prevHistory, { type: 'query', text: userQuery }]);
      
      // Show typing animation for bot response
      setIsTyping(true);

      // Simulate fetching a dynamic response (replace with API call if needed)
      setTimeout(() => {
        const mockResponse = generateResponse(userQuery);

        // Add bot response to chat history
        setChatHistory((prevHistory) => [...prevHistory, { type: 'response', text: mockResponse }]);

        setIsTyping(false); // Hide typing animation
        setInput(''); // Clear input field
      }, 1500); // Simulate network delay
    }
  };

  // Mock function to simulate responses based on the query
  const generateResponse = (query) => {
    if (query.includes("projects")) return "There are 20 infrastructure projects across Malawi.";
    if (query.includes("sector")) return "The projects are categorized into Education, Transport, and Health sectors.";
    if (query.includes("region")) return "Projects are distributed in Northern, Central, and Southern regions.";
    return "Fetching the latest data. Please wait...";
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

        {/* Language Selection with Dropdown */}
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

        {/* Chat Area */}
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
          
          {/* Show typing animation if bot is typing */}
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
          <List
            dataSource={suggestedQuestions}
            renderItem={(item) => (
              <List.Item
                key={item}
                onClick={() => handleSend(item)}  // Send question on click
                className="suggested-question-item"
              >
                {item}
              </List.Item>
            )}
          />
        </div>

        {/* TextArea with Send Button */}
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
            onClick={() => handleSend()}  // Send input on button click
          />
        </div>
      </Content>
    </Layout>
  );
};

export default ChatWithDB;
