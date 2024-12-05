import { API_BASE_URLS, endpoints } from '../config/api';

export const chatService = {
    sendMessage: async (message, language = 'en', chatbotType = 'nasp') => {
        try {
            const baseUrl = API_BASE_URLS[chatbotType];
            const response = await fetch(`${baseUrl}${endpoints.chat}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message, 
                    language 
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    uploadFile: async (file, language = 'en', chatbotType = 'nasp') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);

        try {
            const baseUrl = API_BASE_URLS[chatbotType];
            const response = await fetch(`${baseUrl}${endpoints.upload}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }
};

export const summarizationService = {
    summarize: async (text, useCase, systemPrompt, chatbotType = 'nasp') => {
        try {
            const baseUrl = API_BASE_URLS[chatbotType];
            const response = await fetch(`${baseUrl}${endpoints.summarize}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text,
                    use_case: useCase,
                    system_prompt: systemPrompt
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error in summarization:', error);
            throw error;
        }
    }
};