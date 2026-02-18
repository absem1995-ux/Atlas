#!/usr/bin/env node

/**
 * generate-content.js
 * Generate images via OpenAI, add text overlays, create posts
 * 
 * Usage:
 *   node generate-content.js --count 3
 *   node generate-content.js --hook narrative_001
 *   node generate-content.js --platform tiktok --count 5
 *   node generate-content.js --mock --count 3
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs');
const Logger = require('../lib/logger');
const ConfigManager = require('../lib/config');
const OpenAIImageGen = require('../lib/openai-api');
const TextOverlay = require('../lib/text-overlay');
const { mockPost, mockStrategy } = require('../lib/mock-data');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

class ContentGenerator {
  constructor(configPath = './atlas-config.json', strategyPath = './atlas-strategy.json') {
    this.configMgr = new ConfigManager(configPath);
    this.strategyPath = strategyPath;
    this.config = null;
    this.strategy = null;
    this.openai = null;
    this.overlay = null;
  }

  /**
   * Initialize
   */
  async init() {
    logger.info('Initializing content generator...');

    try {
      // Load configs
      this.config = this.configMgr.load();
      this.configMgr.validate();

      if (!fs.existsSync(this.strategyPath)) {
        throw new Error(`Strategy file not found: ${this.strategyPath}`);
      }

      const strategyRaw = fs.readFileSync(this.strategyPath, 'utf-8');
      this.strategy = JSON.parse(strategyRaw);

      // Initialize utilities
      this.openai = new OpenAIImageGen();
      this.overlay = new TextOverlay();

      logger.success('Content generator initialized');
      return true;
    } catch (error) {
      logger.error(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all hooks available
   */
  getAllHooks() {
    const hooks = [];

    ['narratives', 'tutorials', 'showcases', 'engagement'].forEach(category => {
      const items = this.strategy.hooks[category] || [];
      items.forEach(item => {
        hooks.push({
          id: item.id,
          text: item.hook,
          category,
          status: item.status
        });
      });
    });

    return hooks;
  }

  /**
   * Get hook by ID
   */
  getHook(hookId) {
    const allHooks = this.getAllHooks();
    return allHooks.find(h => h.id === hookId) || null;
  }

  /**
   * Select random hook based on mix
   */
  selectRandomHook() {
    const mix = this.config.content.hookMix;
    const rand = Math.random();
    let cumulative = 0;

    let selectedCategory = 'narratives';
    if (rand < (cumulative += mix.narratives)) {
      selectedCategory = 'narratives';
    } else if (rand < (cumulative += mix.tutorials)) {
      selectedCategory = 'tutorials';
    } else if (rand < (cumulative += mix.showcases)) {
      selectedCategory = 'showcases';
    } else {
      selectedCategory = 'engagement';
    }

    const hooks = this.strategy.hooks[selectedCategory] || [];
    if (hooks.length === 0) {
      throw new Error(`No ${selectedCategory} hooks defined in strategy`);
    }

    return hooks[Math.floor(Math.random() * hooks.length)];
  }

  /**
   * Generate image prompt from hook
   */
  generateImagePrompt(hook) {
    // Simple prompt generation based on hook text
    const basePrompt = `Create a professional, eye-catching image for social media that represents: "${hook.text}". 
    Style: Modern, clean, professional design. 
    Include relevant visual elements that communicate the message clearly.
    High quality, appropriate for TikTok/Instagram/YouTube.`;

    return basePrompt;
  }

  /**
   * Create slide data from hook
   */
  createSlideData(hook) {
    // Extract key phrases from hook for slides
    const sentences = hook.text.split('.').filter(s => s.trim());
    const slides = [];

    // Slide 1: Hook/main message
    slides.push({
      slideNumber: 1,
      text: hook.text,
      duration: 4
    });

    // Additional slides if needed (can be expanded based on hook type)
    if (hook.category === 'narratives') {
      slides.push({
        slideNumber: 2,
        text: 'The Solution',
        duration: 3
      });
      slides.push({
        slideNumber: 3,
        text: 'The Result',
        duration: 3
      });
    }

    // Final CTA
    const cta = this.config.content.callsToAction[
      Math.floor(Math.random() * this.config.content.callsToAction.length)
    ];
    slides.push({
      slideNumber: slides.length + 1,
      text: cta || 'Join us',
      duration: 2
    });

    return slides;
  }

  /**
   * Generate single post
   */
  async generatePost(hookId = null) {
    logger.header('Generating Post');

    try {
      // Select hook
      let hook;
      if (hookId) {
        hook = this.getHook(hookId);
        if (!hook) {
          throw new Error(`Hook not found: ${hookId}`);
        }
      } else {
        hook = this.selectRandomHook();
      }

      logger.info(`Using hook: ${hook.id} (${hook.category})`);
      logger.info(`Text: "${hook.text}"`);

      // Generate image prompt
      const imagePrompt = this.generateImagePrompt(hook);
      logger.info('Generating image...');

      // Generate image
      const imageUrl = await this.openai.generateImage(imagePrompt);
      logger.success(`Image generated: ${imageUrl}`);

      // Create slide data
      const slides = this.createSlideData(hook);

      // Create post object
      const postId = `atlas_post_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const post = {
        postId,
        hookId: hook.id,
        hookText: hook.text,
        hookCategory: hook.category,
        createdAt: new Date().toISOString(),
        imageUrl,
        slides,
        cta: slides[slides.length - 1].text,
        platforms: this.configMgr.getEnabledPlatforms(),
        posting: {
          status: 'ready'
        },
        analytics: {}
      };

      // Save post metadata
      const postsDir = './data/posts';
      if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true });
      }

      const postPath = path.join(postsDir, `${postId}.json`);
      fs.writeFileSync(postPath, JSON.stringify(post, null, 2));

      logger.success(`Post created: ${postId}`);
      logger.info(`Saved to: ${postPath}`);

      return post;
    } catch (error) {
      logger.error(`Failed to generate post: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate multiple posts
   */
  async generateMultiple(count = 1) {
    logger.header(`Generating ${count} Posts`);

    const posts = [];

    for (let i = 0; i < count; i++) {
      try {
        logger.info(`\n[${i + 1}/${count}]`);
        const post = await this.generatePost();
        posts.push(post);
        logger.separator();
      } catch (error) {
        logger.warn(`Skipped post ${i + 1}: ${error.message}`);
      }
    }

    return posts;
  }

  /**
   * Print summary
   */
  printSummary(posts) {
    logger.header('Generation Summary');

    console.log(chalk.cyan(`Generated ${posts.length} post(s)\n`));

    posts.forEach(post => {
      console.log(chalk.cyan(`  ${post.postId}`));
      console.log(chalk.gray(`    Hook: ${post.hookCategory}/${post.hookId}`));
      console.log(chalk.gray(`    Text: ${post.hookText.substring(0, 50)}...`));
      console.log(chalk.gray(`    Slides: ${post.slides.length}`));
      console.log(chalk.gray(`    Platforms: ${post.platforms.join(', ')}`));
    });

    logger.separator();
    console.log(chalk.green('\n✓ Next step: Adapt for platforms\n'));
    console.log(chalk.cyan('  node scripts/adapt-for-platform.js --adaptAll\n'));
  }
}

async function main() {
  const argv = yargs
    .option('count', {
      alias: 'c',
      describe: 'Number of posts to generate',
      type: 'number',
      default: 1
    })
    .option('hook', {
      alias: 'h',
      describe: 'Specific hook ID to use',
      type: 'string'
    })
    .option('platform', {
      alias: 'p',
      describe: 'Generate for specific platform',
      type: 'string'
    })
    .option('mock', {
      describe: 'Run in mock mode (no API calls)',
      type: 'boolean',
      default: process.env.MOCK_MODE === 'true'
    })
    .argv;

  try {
    const generator = new ContentGenerator();
    await generator.init();

    let posts;

    if (argv.count === 1 && argv.hook) {
      posts = [await generator.generatePost(argv.hook)];
    } else {
      posts = await generator.generateMultiple(argv.count);
    }

    generator.printSummary(posts);

  } catch (error) {
    logger.error('Content generation failed');
    console.error(chalk.red(`\n${error.message}\n`));
    process.exit(1);
  }
}

main().catch(error => {
  logger.error('Unexpected error', error);
  process.exit(1);
});
