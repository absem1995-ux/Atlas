#!/usr/bin/env node

/**
 * onboarding.js
 * Interactive setup for Atlas
 * 
 * Usage:
 *   node onboarding.js --init              Create new config from template
 *   node onboarding.js --validate          Validate existing config
 *   node onboarding.js --mock --auto       Auto-setup with mock config (testing)
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Logger = require('../lib/logger');
const ConfigManager = require('../lib/config');
const { mockConfig, mockStrategy } = require('../lib/mock-data');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

// Simple questions (no external dependencies)
function askQuestion(question) {
  return new Promise(resolve => {
    process.stdout.write(chalk.cyan(`\n${question}\n> `));
    process.stdin.once('data', data => {
      resolve(data.toString().trim());
    });
  });
}

async function interactiveSetup() {
  logger.header('Welcome to Atlas — Multi-Platform Marketing Automation');

  console.log(chalk.gray(`
Atlas helps you:
  • Generate content using AI
  • Adapt content for each platform
  • Schedule posts to TikTok, Instagram, YouTube, LinkedIn, Reddit, Facebook
  • Track performance across platforms
  • Optimize what works

Let's set up your configuration.
  `));

  // Create config object
  const config = {
    business: {},
    imageGeneration: {
      provider: 'openai',
      model: 'gpt-image-1.5',
      apiKey: '${OPENAI_API_KEY}',
      defaultResolution: '1024x1024'
    },
    postiz: {
      apiKey: '${POSTIZ_API_KEY}',
      workspace: 'default',
      integrationIds: {}
    },
    platforms: {},
    content: {
      hookMix: {
        narratives: 0.40,
        tutorials: 0.30,
        showcases: 0.20,
        engagement: 0.10
      },
      callsToAction: [],
      toneOfVoice: ''
    },
    audio: {
      voiceoverEnabled: false,
      nativeAudioStrategy: 'use_platform_defaults',
      musicLicense: 'platform_native'
    },
    analytics: {
      trackingMode: 'platform_apis',
      minimumViewsToReport: 500,
      dailyReportTime: '08:00',
      reportingTimezone: 'UTC'
    }
  };

  // Business info
  logger.header('About Your Business');

  config.business.name = await askQuestion('What\'s your business/brand name?');
  config.business.description = await askQuestion('What does it do? (one sentence)');
  config.business.audience = await askQuestion('Who\'s your target audience?');
  config.business.positioning = await askQuestion('What makes you different?');
  config.business.website = await askQuestion('Website or link? (optional, press Enter to skip)');
  config.business.callToAction = await askQuestion('What should people do? (e.g., "Join Discord", "Visit website")');

  // Platforms
  logger.header('Which Platforms?');
  
  console.log(chalk.gray(`
Choose which platforms to enable.
(TikTok, Instagram, YouTube are recommended for 2026)
  `));

  const platformOptions = {
    tiktok: { name: 'TikTok', recommended: true },
    instagram: { name: 'Instagram', recommended: true },
    youtube: { name: 'YouTube Shorts', recommended: true },
    linkedin: { name: 'LinkedIn', recommended: true },
    reddit: { name: 'Reddit', recommended: false },
    facebook: { name: 'Facebook', recommended: false }
  };

  for (const [key, platform] of Object.entries(platformOptions)) {
    const rec = platform.recommended ? ' (recommended)' : '';
    const answer = await askQuestion(`Enable ${platform.name}?${rec} (yes/no)`);

    if (answer.toLowerCase().startsWith('y')) {
      config.platforms[key] = {
        enabled: true,
        postingSchedule: key === 'tiktok' ? ['07:30', '16:30', '21:00'] : ['09:00']
      };

      if (key === 'tiktok') {
        config.platforms[key].username = await askQuestion('Your TikTok username? (@handle)');
        config.platforms[key].accountType = 'creator';
        config.platforms[key].privacyLevel = 'SELF_ONLY';
        config.platforms[key].warmupComplete = false;
        config.platforms[key].warmupStartDate = new Date().toISOString();
      } else if (key === 'instagram') {
        config.platforms[key].username = await askQuestion('Your Instagram username?');
        config.platforms[key].accountType = 'creator';
      }
    } else {
      config.platforms[key] = { enabled: false };
    }
  }

  // Content strategy
  logger.header('Content Strategy');

  config.content.toneOfVoice = await askQuestion('Describe your tone (e.g., "Technical, practical, no fluff")');

  const cta1 = await askQuestion('First CTA? (e.g., "Join our Discord")');
  const cta2 = await askQuestion('Second CTA? (e.g., "Check the docs")');
  const cta3 = await askQuestion('Third CTA? (optional, press Enter to skip)');

  config.content.callsToAction = [cta1, cta2];
  if (cta3) {
    config.content.callsToAction.push(cta3);
  }

  // Save config
  logger.header('Saving Configuration');

  const configPath = './atlas-config.json';
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  logger.success(`Configuration saved to ${configPath}`);

  // Create strategy template
  const strategyPath = './atlas-strategy.json';
  if (!fs.existsSync(strategyPath)) {
    const strategy = {
      campaign: {
        name: `${config.business.name} Launch`,
        startDate: new Date().toISOString().split('T')[0],
        theme: 'First campaign'
      },
      hooks: {
        narratives: [],
        tutorials: [],
        showcases: [],
        engagement: []
      },
      contentCalendar: {
        postingFrequency: {
          tiktok: 3,
          instagram: 2,
          youtube: 1,
          linkedin: 2,
          reddit: 1,
          facebook: 1
        }
      },
      performance: {
        topPerformers: [],
        underperformers: [],
        recommendations: []
      }
    };

    fs.writeFileSync(strategyPath, JSON.stringify(strategy, null, 2));
    logger.success(`Strategy template saved to ${strategyPath}`);
  }

  // Final instructions
  logger.header('Next Steps');

  console.log(chalk.green(`
✓ Configuration created!

Now you need to:

1. ${chalk.cyan('Add API credentials to .env')}
   Copy .env.template → .env
   Fill in these:
   - OPENAI_API_KEY (image generation)
   - POSTIZ_API_KEY (posting service)
   - Platform tokens (TikTok, Instagram, YouTube, LinkedIn, etc.)

2. ${chalk.cyan('Validate your setup')}
   node scripts/validate-config.js

3. ${chalk.cyan('Fill in your content strategy')}
   Edit atlas-strategy.json with your hooks and CTAs

4. ${chalk.cyan('Generate your first posts')}
   node scripts/generate-content.js --count 3

Questions? Check the docs:
   references/PLATFORM_GUIDELINES.md
   references/CONTENT_FORMATS.md
   `));

  logger.separator();
}

async function mockSetup() {
  logger.header('Atlas Setup (MOCK MODE - Testing)');

  logger.mock('Creating mock configuration...');

  // Save mock configs
  fs.writeFileSync('./atlas-config.json', JSON.stringify(mockConfig, null, 2));
  logger.mock('Saved atlas-config.json');

  fs.writeFileSync('./atlas-strategy.json', JSON.stringify(mockStrategy, null, 2));
  logger.mock('Saved atlas-strategy.json');

  logger.success('Mock configuration ready for testing');
  logger.info('Run: node scripts/validate-config.js');
}

async function main() {
  const args = process.argv.slice(2);
  const isMockMode = args.includes('--mock');
  const isAuto = args.includes('--auto');
  const isValidate = args.includes('--validate');

  if (isMockMode && isAuto) {
    await mockSetup();
  } else if (isValidate) {
    const configMgr = new ConfigManager();
    configMgr.load();
    configMgr.validate();
    configMgr.printReport();
  } else {
    // Interactive setup
    try {
      process.stdin.setRawMode(true);
      process.stdin.resume();

      await interactiveSetup();

      process.exit(0);
    } catch (error) {
      logger.error('Setup interrupted');
      process.exit(1);
    }
  }
}

main().catch(error => {
  logger.error('Onboarding failed', error);
  process.exit(1);
});
