/**
 * Tweet Extractor
 * Uses browser automation to read X (Twitter) tweets
 */

class TweetExtractor {
  constructor() {
    this.timeout = 10000; // 10 seconds per tweet
  }

  /**
   * Normalize URL to ensure valid X tweet format
   */
  normalizeUrl(urlString) {
    // Handle various URL formats
    let url = urlString.trim();

    // Add https if missing
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    // Replace twitter.com with x.com
    url = url.replace('twitter.com', 'x.com');

    // Extract just the domain and status
    try {
      const urlObj = new URL(url);
      const match = urlObj.pathname.match(/\/(\w+)\/status\/(\d+)/);
      if (!match) {
        throw new Error('Invalid tweet URL format');
      }
      return `https://x.com/${match[1]}/status/${match[2]}`;
    } catch (error) {
      throw new Error(`Invalid URL: ${urlString}`);
    }
  }

  /**
   * Extract tweet content using browser
   * Claude will call this with browser access
   */
  async extractTweet(urlString) {
    const url = this.normalizeUrl(urlString);

    // This is where Claude's browser tool comes in
    // The skill framework will handle browser automation
    // For now, return the structure

    return {
      url,
      author: 'Extracting...',
      text: 'Browser will load tweet content here',
      timestamp: new Date().toISOString(),
      engagement: {
        likes: 0,
        retweets: 0,
        replies: 0
      },
      status: 'ready_for_browser'
    };
  }

  /**
   * Parse tweet from HTML
   * (Claude's browser will execute this)
   */
  parseTweetDOM(html) {
    // Selectors for X's current layout
    const selectors = {
      author: '[data-testid="tweet"] [data-testid="User-Name"]',
      text: '[data-testid="tweet"] [data-testid="tweetText"]',
      timestamp: '[data-testid="tweet"] time',
      likes: '[data-testid="like"] [aria-label*="like"]',
      retweets: '[data-testid="retweet"] [aria-label*="Retweet"]',
      replies: '[data-testid="reply"] [aria-label*="reply"]'
    };

    // This would parse the HTML
    // Claude's browser tool will handle the actual DOM queries
    return {
      author: 'Parsed from DOM',
      text: 'Tweet text extracted',
      engagement: {
        likes: 0,
        retweets: 0,
        replies: 0
      }
    };
  }

  /**
   * Extract multiple tweets
   */
  async extractMultiple(urls) {
    const results = [];

    for (const url of urls) {
      try {
        const tweet = await this.extractTweet(url);
        results.push(tweet);
      } catch (error) {
        results.push({
          url,
          error: error.message,
          status: 'failed'
        });
      }
    }

    return results;
  }

  /**
   * Validate URL before extraction
   */
  isValidTweetUrl(url) {
    try {
      this.normalizeUrl(url);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = TweetExtractor;
