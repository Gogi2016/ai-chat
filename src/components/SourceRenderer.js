import React from 'react';
import { List, Typography, Collapse } from 'antd';

const { Text } = Typography;
const { Panel } = Collapse;

const SourceRenderer = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  const renderSourceContent = (source) => {
    const metadata = source.metadata || {};
    const title = metadata.title || source.title || 'Document';
    const pageNumber = metadata.page_number || source.page_number;
    const content = source.page_content || source.content || '';

    return (
      <div>
        <Text strong>{title}</Text>
        {pageNumber && <Text> - Page {pageNumber}</Text>}
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">{content}</Text>
        </div>
      </div>
    );
  };

  return (
    <div className="sources-section">
      <Collapse defaultActiveKey={['1']}>
        <Panel header={<Text strong>Sources ({sources.length})</Text>} key="1">
          <List
            size="small"
            dataSource={sources}
            renderItem={source => (
              <List.Item>
                {renderSourceContent(source)}
              </List.Item>
            )}
          />
        </Panel>
      </Collapse>
    </div>
  );
};

export default SourceRenderer;