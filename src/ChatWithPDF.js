import React, { useState } from 'react';
import { Upload, Button, Radio, Input, Layout, List } from 'antd';
import { UploadOutlined, SendOutlined } from '@ant-design/icons';
import './App.css';

const { Sider, Content } = Layout;
const { TextArea } = Input;

const ChatWithPDF = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [language, setLanguage] = useState('english'); // State for managing selected language

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

  return (
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
          <Radio value="english">English</Radio>
          <Radio value="russian">Русский</Radio>
          <Radio value="uzbek">O'zbek</Radio>
        </Radio.Group>

        {/* TextArea and Send Button Container */}
        <div className="chat-input-container">
          <TextArea placeholder="What would you like to know?" rows={4} className="chat-input" />
          <Button
            type="text"  // No background
            icon={<SendOutlined />}
            className="send-button"
          />
        </div>
      </Content>
    </Layout>
  );
};

export default ChatWithPDF;
