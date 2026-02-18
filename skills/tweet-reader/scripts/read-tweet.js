#!/usr/bin/env node

/**
 * read-tweet.js
 * Extract text content from X (Twitter) tweets
 * 
 * Usage (in Claude context):
 *   Read this tweet: https://x.com/username/status/123
 *   Extract: https://x.com/user1/status/123 and https://x.com/user2/status/456
 */

const Logger = require('../lib/logger');
const TweetExtractor = require('../lib/tweet-extractor');

const logger = new Logger();

/**
 * Main entry point - called by Claude via the skill
 */
async function readTweets(urls) {
  logger.header('Tweet Reader');

  if (!urls || urls.length === 0) {
    logger.error('No tweet URLs provided');
    return null;
  }

  const extractor = new TweetExtractor();
  const results = [];

  for (const url of urls) {
    logger.info(`Reading: ${url}`);
    try {
      const tweet = await extractor.extractTweet(url);
      results.push(tweet);
      logger.success(`✓ ${tweet.author} - ${tweet.text.substring(0, 50)}...`);
    } catch (error) {
      logger.warn(`✗ Failed to read ${url}: ${error.message}`);
      results.push({
        url,
        error: error.message,
        status: 'failed'
      });
    }
  }

  return results;
}

module.exports = { readTweets };
