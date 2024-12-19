/**
 * LLM Service using Together AI
 */

import { API_CONFIG } from '../config/config';

class LLMService {
  constructor() {
    this.apiKey = process.env.REACT_APP_TOGETHER_API_KEY;
    this.model = "mistralai/Mixtral-8x7B-Instruct-v0.1";
    this.baseConfig = {
      temperature: 0.7,
      max_tokens: 1500,
      top_k: 50,
      top_p: 0.7,
      repetition_penalty: 1.1
    };
  }

  /**
   * Generate system prompt based on language
   */
  getSystemPrompt(language) {
    switch (language.toLowerCase()) {
      case 'russian':
        return "Вы - полезный ассистент. Пожалуйста, предоставьте четкий и краткий ответ на русском языке.";
      case 'uzbek':
        return "Siz foydali yordamchisiz. Iltimos, o'zbek tilida aniq va qisqa javob bering.";
      default:
        return "You are a helpful assistant. Please provide a clear and concise response.";
    }
  }

  /**
   * Prepare context for LLM
   */
  prepareContext(chatHistory, currentQuery) {
    // Get last 5 messages for context
    const recentHistory = chatHistory.slice(-5);
    
    // Format context string
    const contextStr = recentHistory.map(msg => {
      const role = msg.type === 'query' ? 'User' : 'Assistant';
      return `${role}: ${msg.text}`;
    }).join('\n');

    return `Previous conversation:\n${contextStr}\n\nCurrent query: ${currentQuery}`;
  }

  /**
   * Process query with LLM
   */
  async processQuery(query, chatHistory, language = 'english') {
    try {
      const systemPrompt = this.getSystemPrompt(language);
      const context = this.prepareContext(chatHistory, query);

      const response = await fetch(`${API_CONFIG.LLM_API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          ...this.baseConfig,
          prompt: `${systemPrompt}\n\n${context}\n\nAssistant:`,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode and accumulate the chunks
        const chunk = new TextDecoder().decode(value);
        accumulatedResponse += chunk;

        // Emit progress for streaming UI updates
        if (this.onProgress) {
          this.onProgress(accumulatedResponse);
        }
      }

      return {
        response: accumulatedResponse,
        llm_processing: {
          model: this.model,
          response_formatted: true
        }
      };

    } catch (error) {
      console.error('LLM processing error:', error);
      throw error;
    }
  }

  /**
   * Set progress callback for streaming updates
   */
  setProgressCallback(callback) {
    this.onProgress = callback;
  }
}

export const llmService = new LLMService(); 