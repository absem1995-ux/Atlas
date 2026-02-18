/**
 * Postiz API Wrapper
 * Handles scheduling and posting across all platforms
 */

const axios = require('axios');
const Logger = require('./logger');
const { mockPostizDraft } = require('./mock-data');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

class PostizAPI {
  constructor(apiKey, workspace = 'default') {
    this.apiKey = apiKey || process.env.POSTIZ_API_KEY;
    this.workspace = workspace;
    this.mockMode = process.env.MOCK_MODE === 'true';
    this.baseURL = 'https://api.postiz.pro/api/v1';
    this.retries = 3;
    this.retryDelay = 1000;
  }

  /**
   * Validate API key
   */
  validateApiKey() {
    if (!this.apiKey && !this.mockMode) {
      throw new Error('POSTIZ_API_KEY not found. Set in .env file.');
    }
    return true;
  }

  /**
   * Schedule post to platforms via Postiz
   */
  async schedulePost(platforms, content, scheduledFor, options = {}) {
    if (this.mockMode) {
      logger.mock(`Would schedule post to: ${platforms.join(', ')}`);
      return this.mockSchedulePost(platforms, content, scheduledFor);
    }

    this.validateApiKey();

    try {
      return await this.withRetry(async () => {
        // Prepare request for Postiz
        const payload = {
          platforms,
          content: {
            text: content.text,
            images: content.images || [],
            video: content.video || null
          },
          scheduledFor,
          workspace: this.workspace
        };

        const response = await axios.post(
          `${this.baseURL}/posts/schedule`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        logger.success(`Scheduled to ${platforms.join(', ')}: Draft ID ${response.data.draftId}`);
        return response.data;
      });
    } catch (error) {
      logger.error(`Failed to schedule post: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get platform integrations
   */
  async getIntegrations() {
    if (this.mockMode) {
      logger.mock('Fetching integrations (mock mode)');
      return this.mockGetIntegrations();
    }

    try {
      return await this.withRetry(async () => {
        const response = await axios.get(
          `${this.baseURL}/integrations`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`
            }
          }
        );

        return response.data;
      });
    } catch (error) {
      logger.error(`Failed to fetch integrations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get scheduled posts
   */
  async getScheduledPosts(limit = 10, offset = 0) {
    if (this.mockMode) {
      logger.mock(`Fetching scheduled posts (mock mode): limit ${limit}`);
      return this.mockGetScheduledPosts(limit);
    }

    try {
      return await this.withRetry(async () => {
        const response = await axios.get(
          `${this.baseURL}/posts/scheduled`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`
            },
            params: { limit, offset }
          }
        );

        return response.data;
      });
    } catch (error) {
      logger.error(`Failed to fetch scheduled posts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    if (this.mockMode) {
      logger.mock('Testing Postiz connection (mock mode)');
      return true;
    }

    try {
      this.validateApiKey();
      await this.getIntegrations();
      logger.success('Postiz API connection verified');
      return true;
    } catch (error) {
      logger.error(`Postiz connection test failed: ${error.message}`);
      return false;
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
    return [429, 500, 502, 503, 504].includes(status);
  }

  /**
   * Mock schedule post
   */
  mockSchedulePost(platforms, content, scheduledFor) {
    const draftId = `draft_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return {
      success: true,
      draftId,
      platforms,
      scheduledFor,
      message: '[MOCK] Post scheduled successfully',
      content: content.text.substring(0, 50) + '...'
    };
  }

  /**
   * Mock get integrations
   */
  mockGetIntegrations() {
    return {
      integrations: [
        { platform: 'tiktok', connected: true, accountId: 'mock_tiktok_123' },
        { platform: 'instagram', connected: true, accountId: 'mock_instagram_123' },
        { platform: 'youtube', connected: true, accountId: 'mock_youtube_123' },
        { platform: 'linkedin', connected: true, accountId: 'mock_linkedin_123' },
        { platform: 'reddit', connected: false },
        { platform: 'facebook', connected: false }
      ]
    };
  }

  /**
   * Mock get scheduled posts
   */
  mockGetScheduledPosts(limit = 10) {
    const posts = [];
    for (let i = 0; i < Math.min(limit, 3); i++) {
      posts.push({
        draftId: `draft_mock_${i}`,
        platforms: ['tiktok', 'instagram'],
        scheduledFor: new Date(Date.now() + (i + 1) * 3600000).toISOString(),
        content: `Mock post ${i + 1}`
      });
    }
    return { posts, total: 3 };
  }
}

module.exports = PostizAPI;
