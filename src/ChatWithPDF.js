import React, { useState } from 'react';
import { Upload, Button, Radio, Input, Layout, List } from 'antd';
import { UploadOutlined, SendOutlined } from '@ant-design/icons';
import './App.css';

const { Sider, Content } = Layout;
const { TextArea } = Input;

const ChatWithPDF = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showMore, setShowMore] = useState(false);

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

  return (
    <Layout className="chat-layout">
      <Sider width={300} className="upload-sider">
        <h3 className="upload-header">Upload Additional Documents</h3>
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
      </Sider>

      <Content className="chat-content">
        <h1 className="chat-title">NASP Chatbot</h1>
        <p className="language-label">Select Language / Выберите язык / Tilni tanlang</p>
        <Radio.Group defaultValue="English" className="language-selector">
          <Radio.Button value="English">English</Radio.Button>
          <Radio.Button value="Русский">Русский</Radio.Button>
          <Radio.Button value="O'zbek">O'zbek</Radio.Button>
        </Radio.Group>

        <TextArea placeholder="What would you like to know?" rows={4} className="chat-input" />
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          className="send-button"
        >
          Send
        </Button>
      </Content>
    </Layout>
  );
};

export default ChatWithPDF;
