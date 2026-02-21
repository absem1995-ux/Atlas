#!/usr/bin/env node

/**
 * adapt-for-platform.js
 * Adapt generated content for each platform (aspect ratio, text, CTAs)
 * 
 * Usage:
 *   node adapt-for-platform.js --adaptAll
 *   node adapt-for-platform.js --from tiktok --to linkedin --postId post_123
 *   node adapt-for-platform.js --listPosts
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs');
const Logger = require('../lib/logger');
const ConfigManager = require('../lib/config');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

class PlatformAdapter {
  constructor(configPath = './atlas-config.json') {
    this.configMgr = new ConfigManager(configPath);
    this.config = null;
  }

  /**
   * Initialize
   */
  async init() {
    logger.info('Initializing platform adapter...');

    try {
      this.config = this.configMgr.load();
      this.configMgr.validate();

      logger.success('Platform adapter initialized');
      return true;
    } catch (error) {
      logger.error(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Platform-specific adaptation rules
   */
  getAdaptationRules() {
    return {
      tiktok: {
        aspectRatio: '9:16',
        maxSlides: 6,
        maxTextLength: 150,
        textStyle: 'bold_white_outline',
        cta: 'Follow for more'
      },
      instagram: {
        aspectRatio: '9:16',
        maxSlides: 5,
        maxTextLength: 200,
        textStyle: 'instagram_style',
        cta: 'Tag someone who needs this'
      },
      youtube: {
        aspectRatio: '9:16',
        maxSlides: 6,
        maxTextLength: 150,
        textStyle: 'bold_white_outline',
        cta: 'Subscribe for more'
      },
      linkedin: {
        aspectRatio: '1:1',
        maxSlides: 4,
        maxTextLength: 300,
        textStyle: 'professional',
        cta: 'Comment below'
      },
      reddit: {
        aspectRatio: '4:3',
        maxSlides: 3,
        maxTextLength: 200,
        textStyle: 'simple',
        cta: 'What do you think?'
      },
      facebook: {
        aspectRatio: '16:9',
        maxSlides: 5,
        maxTextLength: 250,
        textStyle: 'bold_white_outline',
        cta: 'Like + Share'
      }
    };
  }

  /**
   * Adapt post for platform
   */
  adaptPost(post, targetPlatform) {
    const rules = this.getAdaptationRules()[targetPlatform];

    if (!rules) {
      throw new Error(`Unknown platform: ${targetPlatform}`);
    }

    logger.info(`Adapting to ${targetPlatform.toUpperCase()}`);

    // Create adapted copy
    const adapted = JSON.parse(JSON.stringify(post));

    // Adjust slides based on platform limits
    adapted.slides = adapted.slides.slice(0, rules.maxSlides);

    // Adjust text for platform
    adapted.slides = adapted.slides.map(slide => ({
      ...slide,
      text: this.adaptText(slide.text, rules.maxTextLength),
      textStyle: rules.textStyle
    }));

    // Adapt CTA for platform
    adapted.cta = this.getCtaForPlatform(targetPlatform, adapted.hookCategory);

    // Platform-specific metadata
    adapted.platform = targetPlatform;
    adapted.aspectRatio = rules.aspectRatio;
    adapted.maxSlides = rules.maxSlides;

    logger.success(`Adapted ${adapted.slides.length} slides for ${targetPlatform}`);

    return adapted;
  }

  /**
   * Adapt text for character limit
   */
  adaptText(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }

    // Truncate intelligently at word boundary
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
      return text.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  /**
   * Get CTA for platform
   */
  getCtaForPlatform(platform, hookCategory) {
    const ctas = {
      tiktok: [
        'Follow for more automation hacks',
        'Part 2 if this gets 50K views',
        'Link in bio for setup help'
      ],
      instagram: [
        'Drop a 🔥 if you\'d use this',
        'Comment which method you\'ll try',
        'Tag someone who needs this'
      ],
      youtube: [
        'Subscribe for more AI tutorials',
        'Watch the full version on my channel',
        'Like + Comment which video next'
      ],
      linkedin: [
        'What automation would change your workflow?',
        'Share this with a colleague drowning in manual tasks',
        'Connect if you\'re building AI agents'
      ],
      reddit: [
        'What\'s your take? Comment below',
        'Ever used this approach?',
        'Curious what the community thinks'
      ],
      facebook: [
        'Like + Share if you agree',
        'Comment your thoughts below',
        'Tag a friend who needs this'
      ]
    };

    const platformCtas = ctas[platform] || [];
    return platformCtas[Math.floor(Math.random() * platformCtas.length)] || 'Learn more';
  }

  /**
   * Get all posts ready to adapt
   */
  getAvailablePosts() {
    const postsDir = './data/posts';
    if (!fs.existsSync(postsDir)) {
      return [];
    }

    return fs.readdirSync(postsDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const filePath = path.join(postsDir, f);
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      });
  }

  /**
   * Adapt all posts to all enabled platforms
   */
  async adaptAllPosts() {
    logger.header('Adapting All Posts');

    const posts = this.getAvailablePosts();

    if (posts.length === 0) {
      logger.warn('No posts found to adapt');
      return [];
    }

    const enabledPlatforms = this.configMgr.getEnabledPlatforms();
    const adapted = [];

    for (const post of posts) {
      logger.info(`\nAdapting: ${post.postId}`);

      for (const platform of enabledPlatforms) {
        try {
          const adaptedPost = this.adaptPost(post, platform);

          // Save adapted version
          const adaptedDir = `./data/posts/adapted`;
          if (!fs.existsSync(adaptedDir)) {
            fs.mkdirSync(adaptedDir, { recursive: true });
          }

          const adaptedPath = path.join(
            adaptedDir,
            `${post.postId}_${platform}.json`
          );

          fs.writeFileSync(adaptedPath, JSON.stringify(adaptedPost, null, 2));

          adapted.push({
            original: post.postId,
            platform,
            path: adaptedPath
          });

          logger.success(`  ✓ ${platform}`);
        } catch (error) {
          logger.warn(`  ✗ ${platform}: ${error.message}`);
        }
      }

      logger.separator();
    }

    return adapted;
  }

  /**
   * Print summary
   */
  printSummary(adapted) {
    logger.header('Adaptation Summary');

    if (adapted.length === 0) {
      logger.warn('No posts adapted');
      return;
    }

    // Group by original post
    const grouped = {};
    adapted.forEach(item => {
      if (!grouped[item.original]) {
        grouped[item.original] = [];
      }
      grouped[item.original].push(item.platform);
    });

    Object.entries(grouped).forEach(([postId, platforms]) => {
      console.log(chalk.cyan(`  ${postId}`));
      console.log(chalk.gray(`    → ${platforms.join(', ')}`));
    });

    logger.separator();
    console.log(chalk.green('\n✓ Posts adapted for all platforms!\n'));
    console.log(chalk.cyan('Next step: Schedule posts\n'));
    console.log('  node scripts/schedule-posts.js --posts 5\n');
  }

  /**
   * List available posts
   */
  listPosts() {
    logger.header('Available Posts');

    const posts = this.getAvailablePosts();

    if (posts.length === 0) {
      logger.warn('No posts found');
      return;
    }

    posts.forEach((post, i) => {
      console.log(chalk.cyan(`  ${i + 1}. ${post.postId}`));
      console.log(chalk.gray(`     Hook: ${post.hookCategory}/${post.hookId}`));
      console.log(chalk.gray(`     Text: ${post.hookText.substring(0, 40)}...`));
      console.log(chalk.gray(`     Slides: ${post.slides.length}`));
    });

    logger.separator();
  }
}

async function main() {
  const argv = yargs
    .option('adaptAll', {
      describe: 'Adapt all posts to all enabled platforms',
      type: 'boolean',
      default: false
    })
    .option('from', {
      describe: 'Source platform',
      type: 'string'
    })
    .option('to', {
      describe: 'Target platform',
      type: 'string'
    })
    .option('postId', {
      describe: 'Specific post ID to adapt',
      type: 'string'
    })
    .option('listPosts', {
      describe: 'List available posts',
      type: 'boolean',
      default: false
    })
    .argv;

  try {
    const adapter = new PlatformAdapter();
    await adapter.init();

    let result = [];

    if (argv.listPosts) {
      adapter.listPosts();
    } else if (argv.adaptAll) {
      result = await adapter.adaptAllPosts();
      adapter.printSummary(result);
    } else if (argv.postId && argv.to) {
      logger.warn('Single post adaptation not yet implemented');
      logger.info('Use --adaptAll to adapt all posts');
    } else {
      logger.warn('Please specify --adaptAll or other options');
      logger.info('Run with --listPosts to see available posts');
    }

  } catch (error) {
    logger.error('Adaptation failed');
    console.error(chalk.red(`\n${error.message}\n`));
    process.exit(1);
  }
}

main().catch(error => {
  logger.error('Unexpected error', error);
  process.exit(1);
});
