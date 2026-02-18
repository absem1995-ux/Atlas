#!/usr/bin/env node

/**
 * schedule-posts.js
 * Schedule generated posts to all enabled platforms via Postiz
 * 
 * Usage:
 *   node schedule-posts.js --posts 5
 *   node schedule-posts.js --posts 3 --startDate 2026-02-20
 *   node schedule-posts.js --platform tiktok --posts 2
 *   node schedule-posts.js --dryRun
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs');
const Logger = require('../lib/logger');
const ConfigManager = require('../lib/config');
const PostizAPI = require('../lib/postiz-api');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

class PostScheduler {
  constructor(configPath = './atlas-config.json') {
    this.configMgr = new ConfigManager(configPath);
    this.config = null;
    this.postiz = null;
  }

  /**
   * Initialize
   */
  async init() {
    logger.info('Initializing post scheduler...');

    try {
      this.config = this.configMgr.load();
      this.configMgr.validate();

      this.postiz = new PostizAPI(
        this.config.postiz.apiKey,
        this.config.postiz.workspace
      );

      logger.success('Post scheduler initialized');
      return true;
    } catch (error) {
      logger.error(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available posts to schedule
   */
  getAvailablePosts() {
    const postsDir = './data/posts';
    if (!fs.existsSync(postsDir)) {
      return [];
    }

    const files = fs.readdirSync(postsDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const filePath = path.join(postsDir, f);
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      });

    return files;
  }

  /**
   * Calculate next posting slot
   */
  getNextPostingTime(platformKey, index = 0) {
    const schedule = this.config.platforms[platformKey]?.postingSchedule || [];
    if (schedule.length === 0) {
      return null;
    }

    const now = new Date();
    const [hours, minutes] = schedule[index % schedule.length].split(':').map(Number);

    let nextTime = new Date(now);
    nextTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (nextTime < now) {
      nextTime.setDate(nextTime.getDate() + 1);
    }

    return nextTime;
  }

  /**
   * Schedule single post
   */
  async schedulePost(post, platformKey, scheduledTime, options = {}) {
    const { dryRun = false } = options;

    logger.info(`Scheduling to ${platformKey.toUpperCase()}`);

    const contentPayload = {
      text: post.hookText + '\n\n' + post.cta,
      images: [post.imageUrl]
    };

    if (dryRun) {
      logger.info(`[DRY RUN] Would schedule to ${platformKey}`);
      logger.info(`  Time: ${scheduledTime.toISOString()}`);
      logger.info(`  Content: ${contentPayload.text.substring(0, 50)}...`);
      return {
        dryRun: true,
        platform: platformKey,
        scheduledFor: scheduledTime.toISOString()
      };
    }

    try {
      const result = await this.postiz.schedulePost(
        [platformKey],
        contentPayload,
        scheduledTime.toISOString()
      );

      logger.success(`Scheduled to ${platformKey}: Draft ${result.draftId}`);

      return {
        platform: platformKey,
        draftId: result.draftId,
        scheduledFor: scheduledTime.toISOString()
      };
    } catch (error) {
      logger.warn(`Failed to schedule to ${platformKey}: ${error.message}`);
      return null;
    }
  }

  /**
   * Schedule multiple posts
   */
  async scheduleMultiple(postCount = 5, options = {}) {
    const { startDate = null, platformFilter = null, dryRun = false } = options;

    logger.header(`Scheduling ${postCount} Posts`);

    const posts = this.getAvailablePosts();

    if (posts.length === 0) {
      logger.warn('No posts found to schedule. Run generate-content.js first.');
      return [];
    }

    // Use subset of posts
    const postsToSchedule = posts.slice(0, postCount);

    const enabledPlatforms = this.configMgr.getEnabledPlatforms();
    if (platformFilter) {
      enabledPlatforms = enabledPlatforms.filter(p => p === platformFilter);
    }

    const scheduled = [];
    let postIndex = 0;

    for (const post of postsToSchedule) {
      logger.separator();
      logger.info(`\nPost ${postIndex + 1}/${postsToSchedule.length}: ${post.postId}`);

      const platformSchedules = {};

      for (const platform of enabledPlatforms) {
        const schedule = this.config.platforms[platform]?.postingSchedule || [];
        const slotIndex = postIndex % schedule.length;
        const nextTime = this.getNextPostingTime(platform, slotIndex);

        if (!nextTime) {
          logger.warn(`  ${platform}: No schedule configured`);
          continue;
        }

        const result = await this.schedulePost(post, platform, nextTime, { dryRun });

        if (result) {
          platformSchedules[platform] = result;
          scheduled.push(result);
        }
      }

      // Update post metadata
      post.posting = post.posting || {};
      post.posting.status = dryRun ? 'dry_run' : 'scheduled';
      post.posting.scheduledPlatforms = platformSchedules;
      post.posting.scheduledAt = new Date().toISOString();

      // Save updated post
      const postPath = path.join('./data/posts', `${post.postId}.json`);
      fs.writeFileSync(postPath, JSON.stringify(post, null, 2));

      postIndex++;
    }

    return scheduled;
  }

  /**
   * Print summary
   */
  printSummary(scheduled) {
    logger.header('Scheduling Summary');

    if (scheduled.length === 0) {
      logger.warn('No posts scheduled');
      return;
    }

    console.log(chalk.cyan(`Scheduled ${scheduled.length} post(s)\n`));

    scheduled.forEach(item => {
      console.log(chalk.cyan(`  ${item.platform.toUpperCase()}`));
      console.log(chalk.gray(`    Time: ${new Date(item.scheduledFor).toLocaleString()}`));
      if (item.draftId) {
        console.log(chalk.gray(`    Draft: ${item.draftId}`));
      } else if (item.dryRun) {
        console.log(chalk.gray(`    [DRY RUN]`));
      }
    });

    logger.separator();
    console.log(chalk.green('\n✓ Posts scheduled!\n'));
    console.log(chalk.cyan('Next steps:\n'));
    console.log('  1. TikTok: Add audio manually before publishing');
    console.log('     Go to TikTok inbox → select draft → choose audio → publish\n');
    console.log('  2. Other platforms: Posts auto-publish at scheduled time\n');
    console.log('  3. Track performance:\n');
    console.log('     node scripts/collect-analytics.js\n');
  }
}

async function main() {
  const argv = yargs
    .option('posts', {
      alias: 'p',
      describe: 'Number of posts to schedule',
      type: 'number',
      default: 5
    })
    .option('platform', {
      alias: 'pl',
      describe: 'Schedule only to specific platform',
      type: 'string'
    })
    .option('startDate', {
      alias: 's',
      describe: 'Start scheduling from date (YYYY-MM-DD)',
      type: 'string'
    })
    .option('dryRun', {
      describe: 'Preview what would be scheduled without actually scheduling',
      type: 'boolean',
      default: false
    })
    .argv;

  try {
    const scheduler = new PostScheduler();
    await scheduler.init();

    const scheduled = await scheduler.scheduleMultiple(argv.posts, {
      startDate: argv.startDate,
      platformFilter: argv.platform,
      dryRun: argv.dryRun
    });

    scheduler.printSummary(scheduled);

  } catch (error) {
    logger.error('Scheduling failed');
    console.error(chalk.red(`\n${error.message}\n`));
    process.exit(1);
  }
}

main().catch(error => {
  logger.error('Unexpected error', error);
  process.exit(1);
});
