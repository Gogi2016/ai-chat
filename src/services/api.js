import { API_BASE_URL, endpoints } from '../config/api';

export const chatService = {
    sendMessage: async (message, language = 'en') => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoints.chat}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    message: message, 
                    language: language 
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    uploadFile: async (file, language = 'en') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);

        try {
            const response = await fetch(`${API_BASE_URL}${endpoints.upload}`, {
                method: 'POST',
                body: formData,
            });
            return await response.json();
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    getLanguages: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoints.languages}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching languages:', error);
            throw error;
        }
    }
};