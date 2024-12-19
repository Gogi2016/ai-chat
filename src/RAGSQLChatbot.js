import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, List, Spin, message, Radio, Typography, Switch } from 'antd';
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
    error_timeout: "So'rov 60 soniyadan keyin tugadi. Iltimos, qayta urinib ko'ring.",
    error_general: "Chatbotdan javob olishda xatolik yuz berdi:",
    no_response: "Javob olishda xatolik yuz berdi",
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

const RAGSQLChatbot = () => {
  const [language, setLanguage] = useState('english');
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [useLLM, setUseLLM] = useState(true);
  const [llmStatus, setLLMStatus] = useState({ processing: false, task: null });
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

  const handleSend = async (message) => {
    if (message.trim() === '') return;

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
          message: message,
              language: LANGUAGES[language].code,
          session_id: `req-${Date.now()}`,
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
        
      // Format the LLM response
      let formattedResponse = '';
        if (data.llm_processing) {
        formattedResponse = `
          <div class="llm-processed">
            ${data.llm_processing.enhanced_query ? 
              `<div><strong>Enhanced Query:</strong> ${data.llm_processing.enhanced_query}</div>` : ''
            }
            ${data.llm_processing.project_details ? `
            <div><strong>Project Details:</strong></div>
            ${data.llm_processing.project_details.map(detail => 
              `<div class="bullet-point">${detail}</div>`
            ).join('')}
            ` : ''}
            ${data.llm_processing.statistics ? `
              <div><strong>Statistics:</strong></div>
               ${data.llm_processing.statistics.map(stat => 
                 `<div class="bullet-point">${stat}</div>`
              ).join('')}
            ` : ''}
            ${data.llm_processing.follow_up_questions ? `
              <div><strong>Suggested Questions:</strong></div>
               ${data.llm_processing.follow_up_questions.map(q => 
                 `<div class="bullet-point">${q}</div>`
              ).join('')}
            ` : ''}
            ${data.llm_processing.translation_info ? 
              `<span class="translation-indicator">${data.llm_processing.translation_info}</span>` : ''
            }
          </div>
        `;

        // Update suggestions if available
        if (data.llm_processing.follow_up_questions) {
          setSuggestions(data.llm_processing.follow_up_questions);
        }
      }

      const botMessage = {
        text: formattedResponse || formatResponse(data.response),
        isUser: false,
        timestamp: new Date().toISOString(),
        isFormatted: !!formattedResponse,
        translated: LANGUAGES[language].requires_translation && data.translated,
        original_language: data.original_language,
        llm_processed: data.llm_processing ? true : false,
        suggested_questions: data.llm_processing?.follow_up_questions
      };

      setChatHistory(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        text: LANGUAGES[language].error_general + ' ' + error.message,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Add formatResponse function
  const formatResponse = (text) => {
    if (!text) return '';

    // Format project statistics
    text = text.replace(
      /(\d+)\s+projects?/gi,
      '<strong>$1</strong> projects'
    );

    // Format percentages
    text = text.replace(
      /(\d+(?:\.\d+)?%)/g,
      '<strong>$1</strong>'
    );

    // Format monetary values
    text = text.replace(
      /(MK\s*\d+(?:,\d{3})*(?:\.\d{2})?)/g,
      '<strong>$1</strong>'
    );

    // Format section headers
    text = text.replace(
      /(Summary:|Project Status:|Location:|Sector:|Budget:|Completion:)/g,
      '<br/><strong>$1</strong>'
    );

    // Convert bullet points
    text = text.replace(/•/g, '◆');
    
    // Add line breaks for readability
    text = text.replace(/\./g, '.<br/>');
    
    return text;
  };

  // Update the message rendering
  const renderMessage = (message) => (
    <div key={message.timestamp} className={`message ${message.isUser ? 'user' : 'bot'}`}>
      <div className="message-header">
        <span className="message-sender">{message.isUser ? 'You' : 'Bot'}</span>
        <span className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>
      {message.isFormatted ? (
        <div 
          className="message-text llm-processed"
          dangerouslySetInnerHTML={{ __html: message.text }}
        />
      ) : (
        <div className="message-text">{message.text}</div>
      )}
    </div>
  );

  return (
    <Layout className="chat-container">
      <Content style={{ padding: '24px', height: '100vh' }}>
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <Text>Select Language / Выберите язык / Tilni tanlang</Text>
            <div>
              <Text style={{ marginRight: '8px' }}>LLM Processing:</Text>
              <Switch
                checked={useLLM}
                onChange={setUseLLM}
                size="small"
              />
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <Radio.Group value={language} onChange={handleLanguageChange}>
              <Radio value="english">{LANGUAGES.english.label}</Radio>
              <Radio value="russian">{LANGUAGES.russian.label}</Radio>
              <Radio value="uzbek">{LANGUAGES.uzbek.label}</Radio>
            </Radio.Group>
          </div>
        </div>

        {llmStatus.processing && (
          <div className="llm-status" style={{ marginBottom: '10px', textAlign: 'center' }}>
            <Spin size="small" />
            <Text type="secondary" style={{ marginLeft: '8px' }}>{llmStatus.task}</Text>
          </div>
        )}

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
            renderItem={(msg, index) => (
              <List.Item className={`message ${msg.isUser ? 'user' : 'bot'}`}>
                <div className="message-content">
                  {msg.isFormatted ? (
                    <div 
                      className="message-text llm-processed"
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                  ) : (
                    <div className={`message-text ${msg.translated ? 'translated' : ''} ${msg.llm_processed ? 'llm-processed' : ''}`}>
                          {msg.text.split('•').map((section, index) => {
                            if (index === 0) return <div key={index}>{section}</div>;
                            return (
                              <div key={index} className="bullet-point">
                                • {section}
                              </div>
                            );
                          })}
                  {msg.translated && (
                    <Text type="secondary" className="translation-indicator">
                      (Translated from {msg.original_language || 'English'})
                    </Text>
                      )}
                    </div>
                  )}
                  {msg.suggested_questions && msg.suggested_questions.length > 0 && (
                    <div className="suggested-questions">
                      <Text strong>{LANGUAGES[language].suggested}</Text>
                      <List
                        size="small"
                        dataSource={msg.suggested_questions}
                        renderItem={(question) => (
                          <List.Item>
                            <Button type="link" onClick={() => handleSend(question)}>
                              {question}
                            </Button>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
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
      </Content>
    </Layout>
  );
};

export default RAGSQLChatbot; 