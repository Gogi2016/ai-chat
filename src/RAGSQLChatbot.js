import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layout, Input, Button, List, Spin, Radio, Typography, Switch } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { API_CONFIG } from './config/config';
import './App.css';
import './styles/rag-sql.css';

const { Content } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const API_BASE_URL = API_CONFIG.SQL_API_URL;

// Language configurations
const LANGUAGES = {
  english: {
    code: 'english',
    label: 'English',
    welcome: 'Welcome! Ask me about infrastructure projects.',
    placeholder: 'Ask about infrastructure projects...',
    suggested: 'Suggested questions:',
    typing: 'Typing...',
    error_timeout: 'Request timed out after 60 seconds. Please try again.',
    error_general: 'Failed to get response from chatbot:',
    no_response: 'I apologize, but I do not have enough information to answer this question. Please try asking about infrastructure projects in our database.',
    requires_translation: false
  },
  russian: {
    code: 'russian',
    label: "Русский",
    welcome: "Добро пожаловать! Спрашивайте меня об инфраструктурных проектах.",
    placeholder: "Спросите об инфраструктурных проектах...",
    suggested: "Предлагаемые вопросы:",
    typing: "Печатает...",
    error_timeout: "Запрос не отвечен за 60 секунд. Пожалуйста, попробуйте снова.",
    error_general: "Не удалось получить ответ от чат-бота:",
    no_response: "Извините, но у меня недостаточно информации для ответа на этот вопрос. Пожалуйста, попробуйте спросить об инфраструктурных проектах в нашей базе данных.",
    requires_translation: true
  },
  uzbek: {
    code: 'uzbek',
    label: "O'zbek",
    welcome: "Xush kelibsiz! Infratuzilma loyihalari haqida so'rang.",
    placeholder: "Infratuzilma loyihalari haqida so'rang...",
    suggested: "Tavsiya etilgan savollar:",
    typing: "Yozmoqda...",
    error_timeout: "So'rov 60 soniyadan keyin tugadi. Iltimos, qayta urinib ko'ring.",
    error_general: "Chatbotdan javob olishda xatolik yuz berdi:",
    no_response: "Kechirasiz, lekin bu savolga javob berish uchun yetarli ma'lumot yo'q. Iltimos, bizning ma'lumotlar bazamizdagi infratuzilma loyihalari haqida so'rang.",
    requires_translation: true
  }
};

// LLM Configuration
const LLM_CONFIG = {
  enabled: true,
  model: "mixtral-8x7b",
  temperature: 0.7,
  tasks: ["query_enhancement", "response_formatting", "follow_up_suggestions"]
};

// Suggested questions for each language
const suggestedQuestions = {
  english: [
    "Show me all infrastructure projects",
    "List projects by location",
    "Show projects in Northern Region",
    "Show projects in Central Region",
    "Show projects in Southern Region"
  ],
  russian: [
    "Покажите все инфраструктурные проекты",
    "Покажите проекты по местоположению",
    "Покажите проекты в Северном регионе",
    "Покажите проекты в Центральном регионе",
    "Покажите проекты в Южном регионе"
  ],
  uzbek: [
    "Barcha infratuzilma loyihalarini ko'rsating",
    "Joylashuv bo'yicha loyihalarni ko'rsating",
    "Shimoliy mintaqadagi loyihalarni ko'rsating",
    "Markaziy mintaqadagi loyihalarni ko'rsating",
    "Janubiy mintaqadagi loyihalarni ko'rsating"
  ]
};

const RAGSQLChatbot = () => {
  const [language, setLanguage] = useState('english');
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [useLLM, setUseLLM] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastQuery, setLastQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const chatContainerRef = useRef(null);

  // Initialize chat with welcome message
  useEffect(() => {
    setChatHistory([{
      text: LANGUAGES[language].welcome,
      isUser: false,
      timestamp: new Date().toISOString(),
      isFormatted: false
    }]);
  }, [language]);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    // Reset chat with new language welcome message
    setChatHistory([{
      text: LANGUAGES[newLanguage].welcome,
      isUser: false,
      timestamp: new Date().toISOString(),
      isFormatted: false
    }]);
    setSuggestions([]);
  };

  const handleSend = useCallback(async (message) => {
    if (message.trim() === '') return;

    // Check if this is a "show more" request
    const isShowMore = message.toLowerCase().trim() === 'show more';
    if (isShowMore && !lastQuery) {
      return; // No previous query to show more results from
    }

    setIsTyping(true);
    const newMessage = {
      text: message,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prevMessages => [...prevMessages, newMessage]);
    setInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/query`, {
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
          message: isShowMore ? lastQuery : message,
          language: LANGUAGES[language].code,
          translate: LANGUAGES[language].requires_translation,
          session_id: `req-${Date.now()}`,
          page: isShowMore ? currentPage + 1 : 1,
          page_size: 30,
          llm_config: useLLM ? {
            ...LLM_CONFIG,
            context: chatHistory.slice(-5).map(msg => ({
              role: msg.isUser ? 'user' : 'assistant',
              content: msg.text,
              language: language
            }))
          } : null
        }),
      });

      const data = await response.json();
      
      // Format the response based on the data structure and language
      let formattedResponse = '';
      
      // For non-English languages, prioritize translated responses
      if (LANGUAGES[language].requires_translation) {
        if (data.translated_response) {
          formattedResponse = data.translated_response;
        } else if (data.response) {
          formattedResponse = data.response;
        } else {
          formattedResponse = LANGUAGES[language].no_response;
        }
      } else {
        // For English, use standard response handling
        formattedResponse = data.response || LANGUAGES[language].no_response;
      }

      // Check if this is an out-of-scope query response
      const isOutOfScope = formattedResponse.includes('I can only answer questions') ||
                          formattedResponse.includes('Я могу отвечать только на вопросы') ||
                          formattedResponse.includes('Men faqat savollar') ||
                          formattedResponse === LANGUAGES[language].no_response;

      // Only format the response if it contains project information and is not an out-of-scope message
      const isProjectResponse = !isOutOfScope && (
        formattedResponse.includes(':')
      );

      if (isProjectResponse) {
        // Keep the response as is to preserve translated labels
        formattedResponse = formattedResponse.trim();
      }

      // Update suggestions if available
      if (data.suggested_questions) {
        setSuggestions(data.suggested_questions);
      }

      const botMessage = {
        text: formattedResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
        isFormatted: isProjectResponse,
        translated: LANGUAGES[language].requires_translation && data.translated,
        original_language: data.original_language,
        suggested_questions: data.suggested_questions,
        metadata: {
          total_results: data.metadata?.total_results || 0,
          current_page: data.metadata?.current_page || 1,
          total_pages: data.metadata?.total_pages || 1,
          has_more: data.metadata?.has_more || false
        }
      };

      setChatHistory(prevMessages => [...prevMessages, botMessage]);
      
      // Update pagination state
      if (!isShowMore) {
        setLastQuery(message);
        setCurrentPage(1);
      } else {
        setCurrentPage(prev => prev + 1);
      }
      setTotalResults(data.metadata.total_results);
      setHasMore(data.metadata.has_more);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        text: LANGUAGES[language].error_general + ' ' + error.message,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [language, useLLM, chatHistory, currentPage, lastQuery]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Add formatResponse function
  const formatResponse = (response) => {
    // Split projects by the separator
    const projects = response.split('---');
    
    // Format each project
    const formattedProjects = projects.map(project => {
      const lines = project.trim().split('\n');
      const formattedLines = lines.map(line => {
        // Check if line starts with Project: or Location:
        if (line.match(/^(Project|Проект|Loyiha|Location|Местоположение|Joylashuv):/i)) {
          // Make only the label bold, not the value
          const [label, ...rest] = line.split(':');
          return `**${label}:** ${rest.join(':')}`;
        }
        return line;
      });
      return formattedLines.join('\n');
    });
    
    // Join projects with a nice separator
    return formattedProjects.join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n');
  };

  useEffect(() => {
    const handleProjectClick = (event) => {
      const projectTitle = event.detail;
      handleSend(`Tell me about the project: ${projectTitle}`);
    };

    window.addEventListener('projectClick', handleProjectClick);
    return () => {
      window.removeEventListener('projectClick', handleProjectClick);
    };
  }, [handleSend]);

  const renderMessage = (message) => {
    return (
      <List.Item key={message.timestamp} className={`message ${message.isUser ? 'user' : 'bot'}`}>
        <List.Item.Meta
          title={
            <div className="message-header">
              <span className="message-sender">{message.isUser ? 'You' : 'Bot'}</span>
              <span className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
          }
          description={
            message.isFormatted ? (
              <div 
                className="message-text llm-processed"
                dangerouslySetInnerHTML={{ __html: message.text }}
              />
            ) : (
              <div className="message-text">{message.text}</div>
            )
          }
        />
        {!message.isUser && message.metadata?.has_more && (
          <div className="message-footer">
            <Text type="secondary">
              Showing {message.metadata.current_page * 30} of {message.metadata.total_results} projects. 
              Type "show more" to see additional results.
            </Text>
          </div>
        )}
      </List.Item>
    );
  };

  return (
    <Layout style={{ minHeight: '100%', background: '#fff' }}>
      <Content className="chat-content">
        <div>
          <h1 className="chat-title">RAG SQL Chatbot</h1>
          <p className="chat-description">
            This tab demonstrates a chatbot that can interact with an SQL database containing information on infrastructure projects being implemented in Malawi.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Radio.Group value={language} onChange={handleLanguageChange}>
              <Radio.Button value="english">English</Radio.Button>
              <Radio.Button value="russian">Русский</Radio.Button>
              <Radio.Button value="uzbek">O'zbek</Radio.Button>
            </Radio.Group>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text>Use LLM</Text>
              <Switch checked={useLLM} onChange={setUseLLM} />
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
              dataSource={chatHistory}
              renderItem={renderMessage}
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
                  handleSend(input);
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSend(input)}
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

export default RAGSQLChatbot;