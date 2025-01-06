import React, { useState, useEffect } from 'react';
import { Upload, Button, Radio, Input, Layout, List, message, Divider, Typography } from 'antd';
import { UploadOutlined, SendOutlined, ShareAltOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_CONFIG } from './config/config';
import DOMPurify from 'dompurify';
import SourceRenderer from './components/SourceRenderer';
import ShareModal from './components/share-modal';

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
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchEmbeddedDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents`);
      console.log('Documents response:', response.data);
      setEmbeddedDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching embedded documents:', error);
      setEmbeddedDocuments([]);
    }
  };

  useEffect(() => {
    console.log('API_BASE_URL:', API_BASE_URL);
    const messages = getWelcomeMessages(language);
    setChatHistory([
      { sender: 'bot', text: messages[0] },
      { sender: 'bot', text: messages[1] }
    ]);
    setSuggestions(getStaticSuggestions(language));
    fetchEmbeddedDocuments();
  }, [language]);

  useEffect(() => {
    fetchEmbeddedDocuments();
  }, []);

  useEffect(() => {
    const handleViewDocument = (event) => {
      const { fileName, pageNumber } = event.detail;
      message.info(`Opening ${fileName} at page ${pageNumber}`);
    };

    window.addEventListener('viewDocument', handleViewDocument);
    return () => {
      window.removeEventListener('viewDocument', handleViewDocument);
    };
  }, []);

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
        "Каковы основные программы социальной защиты в Узбекистане?",
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

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    const messages = getWelcomeMessages(newLanguage);
    setChatHistory([
      { sender: 'bot', text: messages[0] },
      { sender: 'bot', text: messages[1] }
    ]);

    setSuggestions(getStaticSuggestions(newLanguage));
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
        timeout: 60000
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

    const userMessage = { sender: 'user', text: chatInput };
    const initialBotMessage = { 
        sender: 'bot', 
        text: '', 
        sources: [],
        isStreaming: true 
    };

    setChatHistory(prev => [...prev, userMessage, initialBotMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: chatInput,
                source_lang: language
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    const data = JSON.parse(line);
                    setChatHistory(prev => {
                        const newHistory = [...prev];
                        const lastMessage = newHistory[newHistory.length - 1];
                        
                        if (lastMessage && lastMessage.sender === 'bot') {
                            lastMessage.text = (data.response || data.content || data.answer || '').replace(/^AI Assistant:\s*/i, '');
                            lastMessage.sources = data.sources || [];
                            lastMessage.isStreaming = false;
                        }
                        
                        return newHistory;
                    });
                } catch (e) {
                    console.error('Error parsing stream:', e);
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        setChatHistory(prev => {
            const newHistory = [...prev];
            const lastMessage = newHistory[newHistory.length - 1];
            
            if (lastMessage && lastMessage.sender === 'bot') {
                lastMessage.text = `Error: ${error.message}`;
                lastMessage.isStreaming = false;
            }
            
            return newHistory;
        });
    } finally {
        setIsLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    return (
        <List.Item key={index} className={`message ${msg.sender}`}>
            <div className="message-content">
                <div className="message-text">
                    {msg.text}
                    {msg.isStreaming && <span className="streaming-indicator">...</span>}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                    <div className="message-sources">
                        <Divider orientation="left">Sources</Divider>
                        <SourceRenderer sources={msg.sources} />
                    </div>
                )}
            </div>
        </List.Item>
    );
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

          <Divider />

          <h3>Available Documents</h3>
          <List
            size="small"
            dataSource={embeddedDocuments}
            renderItem={doc => (
              <List.Item>
                <div style={{ width: '100%', fontSize: '14px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <Text strong>{doc.title}</Text>
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    {`Page ${doc.page} of ${doc.total_pages}`}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
      </Sider>

      <Content className="chat-content">
        <h1 className="chat-title">RAG PDF Chatbot</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Radio.Group value={language} onChange={handleLanguageChange}>
            <Radio.Button value="en">English</Radio.Button>
            <Radio.Button value="ru">Русский</Radio.Button>
            <Radio.Button value="uz">O'zbek</Radio.Button>
          </Radio.Group>
          <Button 
            icon={<ShareAltOutlined />} 
            onClick={() => setShowShareModal(true)}
          >
            Share Chat
          </Button>
        </div>

        <div className="chat-history">
          {chatHistory.map((message, index) => renderMessage(message, index))}
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Text strong>
            {language === 'en' ? 'Suggested questions:' : 
             language === 'ru' ? 'Рекомендуемые вопросы:' : 
             'Tavsiya etilgan savollar:'}
          </Text>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            {suggestions.map((question, index) => (
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
        {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
      </Content>
    </Layout>
  );
};

export default RAGPDFChatbot;
