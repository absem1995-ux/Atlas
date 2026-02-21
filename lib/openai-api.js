/**
 * OpenAI Image Generation Wrapper
 * Handles gpt-image-1.5 API calls with fallback to mock mode
 */

const axios = require('axios');
const Logger = require('./logger');
const { mockPost } = require('./mock-data');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

class OpenAIImageGen {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.mockMode = process.env.MOCK_MODE === 'true';
    this.baseURL = 'https://api.openai.com/v1';
    this.model = 'gpt-image-1.5';
    this.retries = 3;
    this.retryDelay = 1000; // ms
  }

  /**
   * Validate API key
   */
  validateApiKey() {
    if (!this.apiKey && !this.mockMode) {
      throw new Error('OPENAI_API_KEY not found. Set in .env file.');
    }
    return true;
  }

  /**
   * Generate image from prompt
   */
  async generateImage(prompt, options = {}) {
    const {
      size = '1024x1024',
      quality = 'standard',
      n = 1
    } = options;

    if (this.mockMode) {
      logger.mock(`Would generate image: "${prompt.substring(0, 50)}..."`);
      return this.mockGenerateImage(prompt);
    }

    this.validateApiKey();

    try {
      return await this.withRetry(async () => {
        const response = await axios.post(
          `${this.baseURL}/images/generations`,
          {
            prompt,
            model: this.model,
            size,
            quality,
            n
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        logger.success(`Generated image (${size})`);
        return response.data.data[0]?.url || null;
      });
    } catch (error) {
      logger.error(`Failed to generate image: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retry with exponential backoff
   */
  async withRetry(fn, attempt = 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt < this.retries && this.shouldRetry(error)) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        logger.warn(`Retry attempt ${attempt}/${this.retries}. Waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Determine if error should be retried
   */
  shouldRetry(error) {
    const status = error.response?.status;
    // Retry on 429 (rate limit), 500, 502, 503, 504
    return [429, 500, 502, 503, 504].includes(status);
  }

  /**
   * Mock image generation (for testing)
   */
  mockGenerateImage(prompt) {
    // Return a fake but realistic image data structure
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // In real scenario, would save file to disk
    // For now, return object that can be used by text-overlay
    return {
      url: `mock://image-${Date.now()}.png`,
      size: '1024x1024',
      prompt: prompt.substring(0, 50),
      mockColor: randomColor,
      isMock: true
    };
  }

  /**
   * Test API connection
   */
  async testConnection() {
    if (this.mockMode) {
      logger.mock('Testing connection (mock mode)');
      return true;
    }

    try {
      this.validateApiKey();
      logger.info('OpenAI API key validated');
      return true;
    } catch (error) {
      logger.error(`OpenAI connection test failed: ${error.message}`);
      return false;
    }
  }
}

module.exports = OpenAIImageGen;
