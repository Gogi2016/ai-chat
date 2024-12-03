import React, { useState } from 'react';
import { Upload, Button, Radio, Input, Layout, List } from 'antd';
import { UploadOutlined, SendOutlined } from '@ant-design/icons';
import './App.css';
import { chatService } from './services/api';

const { Sider, Content } = Layout;
const { TextArea } = Input;

const NASP_PDFChatbot = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [language, setLanguage] = useState('en'); // State for managing selected language
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const onUpload = (info) => {
    const file = info.file.originFileObj;
    if (file && !uploadedFiles.some(f => f.name === file.name)) {
      setUploadedFiles([...uploadedFiles, { name: file.name }]);
    }
  };

  const visibleFiles = showMore ? uploadedFiles : uploadedFiles.slice(0, 3);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value); // Update state when a new language is selected
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await chatService.sendMessage(inputText, language);
      setMessages(prev => [...prev, 
        { type: 'user', content: inputText },
        { type: 'bot', content: response.response }
      ]);
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (info) => {
    try {
      const response = await chatService.uploadFile(info.file.originFileObj, language);
      if (response.status === 'success') {
        setUploadedFiles(prev => [...prev, { name: info.file.name }]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (

    <div className="combined-container">
    <Layout className="chat-layout">
      <Sider width={300} className="upload-sider">
        {/* Upload Section */}
        <div className="upload-section">
          <h3 className="upload-header">Upload Additional Documents</h3>
          <p>Upload PDF, DOCX, or TXT files</p>
          <Upload.Dragger
            multiple
            onChange={onUpload}
            showUploadList={false}
            className="upload-dragger"
          >
            <div className="upload-info">
              <UploadOutlined className="upload-icon" />
              <p>Drag and drop file here</p>
              <Button className="browse-button">Browse files</Button>
            </div>
          </Upload.Dragger>
        </div>

        {/* Uploaded Files Section */}
        <div className="uploaded-files-section">
          <List
            header={<div className="file-list-header">Uploaded Files</div>}
            dataSource={visibleFiles}
            renderItem={(item) => (
              <List.Item className="file-list-item">
                {item.name}
              </List.Item>
            )}
            className="file-list"
            locale={{ emptyText: 'No files uploaded yet' }}
          />
          {uploadedFiles.length > 3 && (
            <Button type="link" onClick={toggleShowMore} className="show-more-button">
              {showMore ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </div>
      </Sider>

      {/* Chat Content Section */}
      <Content className="chat-content">
        <h1 className="chat-title">NASP Chatbot</h1>
        <p className="language-label">Select Language / Выберите язык / Tilni tanlang</p>

        {/* Radio buttons for language selection */}
        <Radio.Group onChange={handleLanguageChange} value={language}>
          <Radio value="en">English</Radio>
          <Radio value="ru">Русский</Radio>
          <Radio value="uz">O'zbek</Radio>
        </Radio.Group>

        {/* Display messages */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.content}
            </div>
          ))}
        </div>

        {/* Update TextArea and Send Button */}
        <div className="chat-input-container">
          <TextArea 
            value={inputText}
            onChange={handleInputChange}
            placeholder="What would you like to know?" 
            rows={4} 
            className="chat-input" 
          />
          <Button
            type="text"
            icon={<SendOutlined />}
            className="send-button"
            onClick={handleSendMessage}
          />
        </div>
      </Content>
    </Layout></div>
  );
};

export default NASP_PDFChatbot;
