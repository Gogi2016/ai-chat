import React, { useState } from 'react';
import { List, Typography, Collapse } from 'antd';
import DOMPurify from 'dompurify';

const { Text } = Typography;
const { Panel } = Collapse;

const SourceRenderer = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  const handleSourceClick = (e, source) => {
    // Prevent default link behavior
    e.preventDefault();
    
    if (!source.is_clickable) return;

    if (source.url) {
      window.open(source.url, '_blank', 'noopener,noreferrer');
    } else if (source.file_name) {
      const event = new CustomEvent('viewDocument', {
        detail: { 
          fileName: source.file_name, 
          pageNumber: source.page_number 
        }
      });
      window.dispatchEvent(event);
    }
  };

  // Configure DOMPurify
  DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if ('target' in node) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });

  const purifyConfig = {
    ALLOWED_TAGS: ['a', 'p', 'span', 'div', 'br'],
    ALLOWED_ATTR: ['href', 'class', 'data-page', 'data-file', 'target', 'rel'],
  };

  return (
    <div className="sources-section">
      <Collapse defaultActiveKey={[]}>
        <Panel header={<Text strong>Sources ({sources.length})</Text>} key="1">
          <List
            size="small"
            dataSource={sources}
            renderItem={source => (
              <List.Item 
                className="source-item"
                onClick={(e) => handleSourceClick(e, source)}
              >
                <div 
                  className={source.is_clickable ? 'clickable-source' : ''}
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(source.citation, purifyConfig)
                  }}
                />
              </List.Item>
            )}
          />
        </Panel>
      </Collapse>
    </div>
  );
};

export default SourceRenderer; 