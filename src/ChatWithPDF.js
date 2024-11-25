import React, { useState } from 'react';
import { Upload, Button, Radio, Input, Layout, List } from 'antd';
import { UploadOutlined, SendOutlined } from '@ant-design/icons';

const { Sider, Content } = Layout;
const { TextArea } = Input;

const ChatWithPDF = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showMore, setShowMore] = useState(false);

  // Function to toggle showing more or fewer files
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  // Handle file upload
  const onUpload = (info) => {
    const file = info.file.originFileObj;
    if (file && !uploadedFiles.some(f => f.name === file.name)) {
      setUploadedFiles([...uploadedFiles, { name: file.name }]);
    }
  };

  // Determine which files to display
  const visibleFiles = showMore ? uploadedFiles : uploadedFiles.slice(0, 3);

  return (
    <Layout className="chat-layout">
      {/* Upload Section */}
      <Sider width={300} className="sider">
        <h3 style={{color:'white'}}>Upload Additional Documents</h3>
        <Upload.Dragger
          multiple
          onChange={onUpload}
          showUploadList={false}
          className="upload-dragger"
        >
          <p style={{color:'white'}} className="upload-icon">
            <UploadOutlined />
          </p>
          <p style={{color:'white'}}>Drag and drop file here</p>
          <Button >Browse files</Button>
        </Upload.Dragger>

        {/* Display uploaded files */}
        <List
          header={<div style={{fontWeight:'bold'}}>Uploaded Files</div>}
          dataSource={visibleFiles}
          renderItem={(item) => (
            <List.Item className="file-list-item">
              {item.name}
            </List.Item>
          )}
          className="file-list"
          locale={{ emptyText: 'No files uploaded yet' }}
        />

        {/* Show More/Show Less button */}
        {uploadedFiles.length > 3 && (
          <Button type="link" onClick={toggleShowMore} className="show-more-button">
            {showMore ? 'Show Less' : 'Show More'}
          </Button>
        )}
      </Sider>

      {/* Chat Section */}
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
