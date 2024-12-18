import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, List, Spin, message, Radio, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { API_CONFIG } from './config/config';
import './App.css';

const { Content } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const API_BASE_URL = API_CONFIG.SQL_API_URL;

// Language configurations
const LANGUAGES = {
  english: {
    code: 'english',
    label: 'English',
    welcome: 'Welcome! Ask me about infrastructure projects in Malawi.',
    placeholder: 'Ask about infrastructure projects in Malawi...',
    suggested: 'Suggested questions:',
    typing: 'Typing...',
    error_timeout: 'Request timed out after 60 seconds. Please try again.',
    error_general: 'Failed to get response from chatbot:',
    no_response: 'No response received',
    requires_translation: false
  },
  russian: {
    code: 'russian',
    label: "Русский",
    welcome: "Добро пожаловать! Спрашивайте меня об инфраструктурных проектах в Малави.",
    placeholder: "Спросите об инфраструктурных проектах в Малави...",
    suggested: "Предлагаемые вопросы:",
    typing: "Печатает...",
    error_timeout: "Запрос не отвечен за 60 секунд. Пожалуйста, попробуйте снова.",
    error_general: "Не удалось получить ответ от чат-бота:",
    no_response: "Ответ не получен",
    requires_translation: false
  },
  uzbek: {
    code: 'uzbek',
    label: "O'zbek",
    welcome: "Xush kelibsiz! Malavining infratuzilma loyihalari haqida so'rang.",
    placeholder: "Malavining infratuzilma loyihalari haqida so'rang...",
    suggested: "Tavsiya etilgan savollar:",
    typing: "Yozmoqda...",
    error_timeout: "Soat 60 dan keyin sozlamadi. Iltimos, qayta urinib ko\"ring.",
    error_general: "Chatbotdan javob olishda xatolik yuz berdi:",
    no_response: "Javob olishda xatolik yuz berdi",
    requires_translation: true
  }
};

const RAGSQLChatbot = () => {
  const [language, setLanguage] = useState('english');
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const chatContainerRef = useRef(null);

  // Initialize chat with welcome message
  useEffect(() => {
    setChatHistory([{
      type: 'response',
      text: LANGUAGES[language].welcome
    }]);
  }, [language]);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    // Reset chat with new language welcome message
    setChatHistory([{
      type: 'response',
      text: LANGUAGES[newLanguage].welcome
    }]);
    setSuggestions([]);
  };

  const handleSend = async (question) => {
    const userQuery = question || input;
    if (userQuery.trim()) {
      const requestId = `req-${Date.now()}`;
      const startTime = performance.now();
      
      // Add query to chat history immediately
      setChatHistory((prevHistory) => [...prevHistory, { type: 'query', text: userQuery }]);
      setIsTyping(true);
      setInput('');

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
              language: LANGUAGES[language].code,
              session_id: requestId,
              require_translation: LANGUAGES[language].requires_translation,
              include_language_suggestions: true
            }),
            signal: controller.signal
          }),
          timeoutPromise
        ]);

        clearTimeout(timeoutId);
        clearInterval(checkConnectionInterval);

        const fetchEndTime = performance.now();
        console.log(`[${requestId}] Fetch completed in ${(fetchEndTime - fetchStartTime).toFixed(2)}ms`);

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Network response was not ok';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData?.detail || errorMessage;
          } catch (e) {
            console.error(`[${requestId}] Error parsing error response:`, e);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(`[${requestId}] Parsed response:`, data);
        
        // Add response to chat history
        setChatHistory((prevHistory) => [...prevHistory, { 
          type: 'response',
          text: data.response || data.answer || LANGUAGES[language].no_response,
          error: data.error,
          language: language
        }]);
        
        // Update suggested questions if available and ensure they're in the correct language
        if (data.suggested_questions && data.suggested_questions.length > 0) {
          // If we're in Russian or Uzbek mode, use the translated suggestions from the API
          // Otherwise, use the English suggestions
          if (language === 'russian') {
            setSuggestions(data.suggested_questions_ru || suggestedQuestions.russian);
          } else if (language === 'uzbek') {
            setSuggestions(data.suggested_questions_uz || suggestedQuestions.uzbek);
          } else {
            setSuggestions(data.suggested_questions || suggestedQuestions.english);
          }
        } else {
          // Fallback to our predefined translated questions
          setSuggestions(suggestedQuestions[language]);
        }

        const endTime = performance.now();
        console.log(`[${requestId}] Total request time: ${(endTime - startTime).toFixed(2)}ms`);

      } catch (error) {
        clearInterval(checkConnectionInterval);
        const endTime = performance.now();
        
        console.error(`[${requestId}] Request failed:`, {
          name: error.name,
          message: error.message,
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
        });

        const errorMessage = error.name === 'AbortError' 
          ? `${LANGUAGES[language].error_timeout}`
          : `${LANGUAGES[language].error_general}: ${error.message}`;
        
        message.error(errorMessage);
        setChatHistory((prevHistory) => [...prevHistory, { 
          type: 'error', 
          text: errorMessage
        }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const suggestedQuestions = {
    english: [
      "Show me infrastructure projects in Malawi",
      "What are the project sectors?",
      "Show projects by region",
      "List projects in Northern Region",
      "What is the status of education projects?"
    ],
    russian: [
      "Покажите инфраструктурные проекты в Малави",
      "Какие есть секторы проектов?",
      "Покажите проекты по регионам",
      "Покажите проекты в Северном регионе",
      "Какой статус образовательных проектов?"
    ],
    uzbek: [
      "Malavining infratuzilma loyihalarini ko'rsating",
      "Loyiha sektorlari qanday?",
      "Hududlar bo'yicha loyihalarni ko'rsating",
      "Shimoliy mintaqadagi loyihalarni ko'rsating",
      "Ta'lim loyihalarining holati qanday?"
    ]
  };

  return (
    <Layout className="chat-container">
      <Content style={{ padding: '24px', height: '100vh' }}>
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Text>Select Language / Выберите язык / Tilni tanlang</Text>
          <div style={{ marginTop: '10px' }}>
            <Radio.Group value={language} onChange={handleLanguageChange}>
              <Radio value="english">{LANGUAGES.english.label}</Radio>
              <Radio value="russian">{LANGUAGES.russian.label}</Radio>
              <Radio value="uzbek">{LANGUAGES.uzbek.label}</Radio>
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
                </div>
              </List.Item>
            )}
          />
          {isTyping && (
            <div className="typing-indicator">
              <Spin size="small" /> {LANGUAGES[language].typing}
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Text strong>{LANGUAGES[language].suggested}</Text>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            {(suggestions.length > 0 ? suggestions : suggestedQuestions[language]).map((question, index) => (
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
            placeholder={LANGUAGES[language].placeholder}
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