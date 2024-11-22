import React from 'react';
import { Upload, Button, Radio, Input, Layout, List } from 'antd';
import { UploadOutlined, SendOutlined } from '@ant-design/icons';

const { Sider, Content } = Layout;
const { TextArea } = Input;

const ChatWithPDF = () => {
  // Handle file upload
  const onUpload = (info) => {
    console.log('Uploaded file:', info.file.name);
  };

  // Sample uploaded files (for display purposes)
  const uploadedFiles = [
    'Seq 1: Fintegrate Product Manual - Payments v7Current (1).pdf',
    'Seq 2: Invitation-Letter.pdf'
  ];

  return (
    <Layout style={{ minHeight: '80vh', background: '#f0f2f5' }}>
      {/* Left Panel for File Uploads */}
      <Sider width={300} style={{ background: '#1e1e1e', padding: '16px', color: '#fff' }}>
        <h3 style={{ color: '#fff' }}>Upload Additional Documents</h3>
        <Upload.Dragger 
          multiple 
          onChange={onUpload} 
          style={{ backgroundColor: '#2e2e2e', padding: '20px', marginBottom: '20px' }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ color: '#fff', fontSize: '24px' }} />
          </p>
          <p style={{ color: '#fff' }}>Drag and drop files here or click to upload</p>
        </Upload.Dragger>

        <List
          header={<div style={{ color: '#fff', borderBottom: '1px solid #444' }}>Uploaded Files</div>}
          dataSource={uploadedFiles}
          renderItem={item => <List.Item style={{ color: '#fff', borderBottom: '1px solid #444' }}>{item}</List.Item>}
          style={{ background: '#1e1e1e', borderRadius: '5px' }}
        />
      </Sider>

      {/* Chat Content */}
      <Content style={{ padding: '20px', background: '#fff' }}>
        {/* Language Selector */}
        <Radio.Group defaultValue="English" style={{ marginBottom: '20px' }}>
          <Radio.Button value="English">English</Radio.Button>
          <Radio.Button value="Русский">Русский</Radio.Button>
          <Radio.Button value="O'zbek">O'zbek</Radio.Button>
        </Radio.Group>

        {/* Chat Window */}
        <div style={{ border: '1px solid #ccc', padding: '20px', height: '300px', overflowY: 'auto', marginBottom: '20px' }}>
          <p>Welcome! How can I assist you?</p>
        </div>

        {/* Chat Input and Send Button */}
        <TextArea placeholder="Type your message..." rows={3} />
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          style={{ marginTop: '10px', float: 'right' }}
        >
          Send
        </Button>
      </Content>
    </Layout>
  );
};

export default ChatWithPDF;
