import React, { useState, useEffect } from 'react';
import { Upload, Button, Radio, Input, Layout, List, message, Divider, Typography } from 'antd';
import { UploadOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_CONFIG } from './config/config';
import DOMPurify from 'dompurify';
import SourceRenderer from './components/SourceRenderer';

const { Content, Sider } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const API_BASE_URL = API_CONFIG.PDF_API_URL;

const RAGPDFChatbot = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [language, setLanguage] = useState('en');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [embeddedDocuments, setEmbeddedDocuments] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchEmbeddedDocuments();
  }, []);

  useEffect(() => {
    // Add event listener for document viewing
    const handleViewDocument = (event) => {
      const { fileName, pageNumber } = event.detail;
      message.info(`Opening ${fileName} at page ${pageNumber}`);
      // Here you can implement the actual document viewing logic
      // For example, open a modal with a PDF viewer
    };

    window.addEventListener('viewDocument', handleViewDocument);
    return () => {
      window.removeEventListener('viewDocument', handleViewDocument);
    };
  }, []);

  // Welcome messages for each language
  const getWelcomeMessages = (lang) => {
    const messages = {
      en: [
        "Welcome! This is a prototype chatbot for the National Agency of Social Protection. You can use it to ask questions about a library of reports, evaluations, research, and other documents.",
        "Please enter your question in the chat box to get started."
      ],
      ru: [
        "Добро пожаловать! Это прототип чат-бота Национального агентства социальной защиты. Вы можете использовать его для получения информации из библиотеки отчетов, оценок, исследований и других документов.",
        "Пожалуйста, введите ваш вопрос в чат, чтобы начать."
      ],
      uz: [
        "Xush kelibsiz! Bu Ijtimoiy himoya milliy agentligining prototip chatboti. Undan hisobotlar, baholashlar, tadqiqotlar va boshqa hujjatlar kutubxonasi haqida savol berish uchun foydalanishingiz mumkin.",
        "Boshlash uchun chat oynasiga savolingizni kiriting."
      ]
    };
    return messages[lang] || messages.en;
  };

  // Static suggested questions based on available documents and language
  const getStaticSuggestions = (lang) => {
    const suggestions = {
      en: [
        "What are the main social protection programs in Uzbekistan?",
        "Tell me about disability services in Uzbekistan",
        "What are the key findings from the COVID-19 impact analysis?",
        "Summarize the energy subsidy reform findings",
        "What are the recommendations for improving employment formality?"
      ],
      ru: [
        "Каковы основные программы социальной ��ащиты в Узбекистане?",
        "Расскажите об услугах для людей с инвалидностью в Узбекистане",
        "Каковы основные выводы анализа влияния COVID-19?",
        "Обобщите результаты реформы энергетических субсидий",
        "Каковы рекомендации по улучшению формальной занятости?"
      ],
      uz: [
        "O'zbekistondagi asosiy ijtimoiy himoya dasturlari qanday?",
        "O'zbekistondagi nogironligi bo'lgan shaxslarga xizmatlar haqida aytib bering",
        "COVID-19 ta'siri tahlilining asosiy xulosalari qanday?",
        "Energiya subsidiyalari islohotining natijalarini umumlashtiring",
        "Rasmiy bandlikni yaxshilash bo'yicha tavsiyalar qanday?"
      ]
    };
    return suggestions[lang] || suggestions.en;
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    // Clear chat and show welcome messages in selected language
    const messages = getWelcomeMessages(newLanguage);
    setChatHistory([
      { sender: 'bot', text: messages[0] },
      { sender: 'bot', text: messages[1] }
    ]);

    // Reset suggestions to static ones in the new language
    setSuggestions(getStaticSuggestions(newLanguage));
  };

  // Initial welcome messages and suggestions
  useEffect(() => {
    const messages = getWelcomeMessages(language);
    setChatHistory([
      { sender: 'bot', text: messages[0] },
      { sender: 'bot', text: messages[1] }
    ]);
    setSuggestions(getStaticSuggestions(language));
  }, []); // Only run on component mount

  const fetchEmbeddedDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents`);
      if (response.data.status === 'success') {
        setEmbeddedDocuments(response.data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching embedded documents:', error);
      // Don't show error message to user, just set empty documents
      setEmbeddedDocuments([]);
    }
  };

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
        text: response.data.response || 'No response received from the server.',
        sources: response.data.sources || [] 
      };
      setChatHistory(prev => [...prev, botMessage]);

      // Update suggestions if provided by backend, otherwise use static ones in current language
      if (response.data.suggested_questions && response.data.suggested_questions.length > 0) {
        setSuggestions(response.data.suggested_questions);
      } else {
        setSuggestions(getStaticSuggestions(language));
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

  const renderChatMessage = (message) => (
    <List.Item
      className={`chat-message ${message.sender}`}
    >
      <div>
        <div>{message.text}</div>
        {message.sources && <SourceRenderer sources={message.sources} />}
      </div>
    </List.Item>
  );

  const renderChatHistory = () => (
    <List
      className="chat-history"
      itemLayout="horizontal"
      dataSource={chatHistory}
      renderItem={message => renderChatMessage(message)}
    />
  );

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

          <Divider />

          <h3>Available Documents</h3>
          <List
            size="small"
            dataSource={[
              { title: "WorldBank ECA Economic Update 2022", url: "#" },
              { title: "WorldBank Energy Subsidy Reform Uzbekistan 2023", url: "#" },
              { title: "UNICEF Road to Recovery Uzbekistan COVID 2021", url: "#" },
              { title: "ESCAP Unpaid Care Work Uzbekistan 2023", url: "#" },
              { title: "Uzbekistan Public Expenditure Review 2022", url: "#" },
              { title: "UNDP Decent Employment Formality Central Asia 2024", url: "#" },
              { title: "Analysis State System Uzbekistan Disability Services 2024", url: "#" },
              { title: "IPCIG Universal Health Insurance Uzbekistan 2023", url: "#" }
            ]}
            renderItem={doc => (
              <List.Item>
                <div style={{ width: '100%', fontSize: '14px' }}>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#1890ff', textDecoration: 'none' }}
                    onClick={(e) => {
                      e.preventDefault();
                      message.info('Document link will be available soon');
                    }}
                  >
                    {doc.title}
                  </a>
                </div>
              </List.Item>
            )}
          />
        </div>
      </Sider>

      {/* Chat Content Section */}
      <Content className="chat-content">
        <h1 className="chat-title">RAG PDF Chatbot</h1>
        <p className="language-label">Select Language / Выберите язык / Tilni tanlang</p>

        {/* Radio buttons for language selection */}
        <Radio.Group onChange={handleLanguageChange} value={language}>
          <Radio value="en">English</Radio>
          <Radio value="ru">Русский</Radio>
          <Radio value="uz">O'zbek</Radio>
        </Radio.Group>

        {/* Chat History */}
        <div className="chat-history">
          {chatHistory.map((message, index) => (
            <div key={index}>
              <div className={`chat-message ${message.sender} ${message.isDocumentList ? 'document-list' : ''}`}>
                {message.isDocumentList ? (
                  <div className="document-list-content">
                    {message.text.split('\n').map((line, i) => (
                      <div key={i} className="document-item">{line}</div>
                    ))}
                  </div>
                ) : (
                  message.text
                )}
              </div>
              {message.sources && message.sources.length > 0 && (
                <div className="message-sources">
                  <h4>Sources:</h4>
                  {message.sources.map((source, sourceIndex) => (
                    <div key={sourceIndex} className="source-item">
                      {source.title && <div className="source-title">{source.title}</div>}
                      {source.citation && <div className="source-citation">{source.citation}</div>}
                      {source.content && (
                        <div className="source-content">
                          {source.content.length > 200 
                            ? `${source.content.substring(0, 200)}...` 
                            : source.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="chat-message bot loading">
              Typing...
            </div>
          )}
        </div>

        {/* Suggested Questions */}
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Text strong>
            {language === 'en' ? 'Suggested questions:' : 
             language === 'ru' ? 'Рекомендуемые вопросы:' : 
             'Tavsiya etilgan savollar:'}
          </Text>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            {(suggestions.length > 0 ? suggestions : getStaticSuggestions(language)).map((question, index) => (
              <Button
                key={index}
                type="default"
                size="small"
                style={{ margin: '0 8px 8px 0' }}
                onClick={() => {
                  setChatInput(question);
                  handleSendMessage();
                }}
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
