
import React, { useState } from 'react';
import { Typography, Radio, Input, Button, Space } from 'antd';
import './App.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ChatSummarization = () => {
  const [selectedUseCase, setSelectedUseCase] = useState('Topic Analysis');

};


export default ChatSummarization;
