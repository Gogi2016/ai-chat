import React from 'react';
import { List, Typography, message } from 'antd';
import DOMPurify from 'dompurify';

const { Text } = Typography;

const SourceRenderer = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  const handleSourceClick = (source) => {
    if (!source.is_clickable) return;

    if (source.url) {
      // Open URL in new tab
      window.open(source.url, '_blank', 'noopener,noreferrer');
    } else if (source.file_name) {
      // Handle local document click
      const page = source.page_number;
      const file = source.file_name;
      console.log(`Opening document: ${file} at page ${page}`);
      message.info(`Opening ${file} at page ${page}`);
      
      // You can implement document viewing logic here
      // For example, dispatch an event or call a callback
      const event = new CustomEvent('viewDocument', {
        detail: { fileName: file, pageNumber: page }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="sources-section">
      <Text strong>Sources:</Text>
      <List
        size="small"
        dataSource={sources}
        renderItem={source => (
          <List.Item className="source-item">
            <div 
              onClick={() => handleSourceClick(source)}
              className={source.is_clickable ? 'clickable-source' : ''}
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(source.citation) 
              }} 
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default SourceRenderer; 