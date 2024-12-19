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
  model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  temperature: 0.7,
  max_tokens: 1500,
  top_k: 50,
  top_p: 0.7,
  repetition_penalty: 1.1,
  tasks: {
    query_enhancement: true,    // Enhance user queries
    response_formatting: true,  // Format responses
    context_analysis: true,     // Analyze chat context
    suggestion_generation: true // Generate contextual suggestions
  }
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
      setChatHistory((prevHistory) => [...prevHistory, { 
        type: 'query', 
        text: userQuery,
        language: language
      }]);
      
      setIsTyping(true);
      setInput('');

      if (useLLM) {
        setLLMStatus({ processing: true, task: 'Processing with LLM...' });
      }

      try {
        const controller = new AbortController();
        let timeoutId;

        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            controller.abort();
            reject(new Error('Request timed out after 60 seconds'));
          }, 60000);
        });

        console.log(`[${requestId}] Initiating fetch call with LLM:`, useLLM);
        const fetchStartTime = performance.now();

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
              include_language_suggestions: true,
              llm_config: useLLM ? {
                ...LLM_CONFIG,
                context: chatHistory.slice(-5).map(msg => ({
                  role: msg.type === 'query' ? 'user' : 'assistant',
                  content: msg.text,
                  language: msg.language
                }))
              } : null
            }),
            signal: controller.signal
          }),
          timeoutPromise
        ]);

        clearTimeout(timeoutId);
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
        
        // Handle LLM processing results
        if (data.llm_processing) {
          console.log(`[${requestId}] LLM Processing:`, data.llm_processing);
          
          // Update query if it was enhanced
          if (data.llm_processing.enhanced_query) {
            setChatHistory((prevHistory) => {
              const newHistory = [...prevHistory];
              const lastQuery = newHistory[newHistory.length - 1];
              if (lastQuery.type === 'query') {
                lastQuery.enhanced = true;
                lastQuery.original = lastQuery.text;
                lastQuery.text = data.llm_processing.enhanced_query;
              }
              return newHistory;
            });
          }
        }

        // Add response to chat history with translation tracking
        setChatHistory((prevHistory) => [...prevHistory, { 
          type: 'response',
          text: data.response || data.answer || LANGUAGES[language].no_response,
          error: data.error,
          language: language,
          translated: LANGUAGES[language].requires_translation && data.translated,
          original_language: data.original_language,
          llm_processed: data.llm_processing?.response_formatted || false,
          enhanced_query: data.llm_processing?.enhanced_query,
          suggested_questions: data.llm_processing?.suggested_questions
        }]);
        
        // Update suggested questions from LLM if available
        if (data.llm_processing?.suggested_questions) {
          setSuggestions(data.llm_processing.suggested_questions);
        }

        const endTime = performance.now();
        console.log(`[${requestId}] Total request time: ${(endTime - startTime).toFixed(2)}ms`);

      } catch (error) {
        console.error(`[${requestId}] Request failed:`, {
          name: error.name,
          message: error.message,
          timings: {
            totalTime: (performance.now() - startTime).toFixed(2),
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
        setLLMStatus({ processing: false, task: null });
      }
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
              <List.Item className={`message ${msg.type}`}>
                <div className="message-content">
                  {msg.type === 'query' && msg.enhanced && (
                    <div className="enhanced-query">
                      <Text type="secondary">Original: {msg.original}</Text>
                      <Text type="secondary">Enhanced: {msg.text}</Text>
                    </div>
                  )}
                  {!msg.enhanced && (
                    <div 
                      className={`message-text ${msg.translated ? 'translated' : ''} ${msg.llm_processed ? 'llm-processed' : ''}`}
                      dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }}
                    >
                    </div>
                  )}
                  {msg.translated && (
                    <Text type="secondary" className="translation-indicator">
                      (Translated from {msg.original_language || 'English'})
                    </Text>
                  )}
                  {msg.type === 'response' && msg.suggested_questions && msg.suggested_questions.length > 0 && (
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