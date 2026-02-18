#!/usr/bin/env node

/**
 * validate-config.js
 * Pre-flight checklist before posting
 * 
 * Usage:
 *   node validate-config.js
 */

require('dotenv').config();

const chalk = require('chalk');
const Logger = require('../lib/logger');
const ConfigManager = require('../lib/config');
const OpenAIImageGen = require('../lib/openai-api');
const PostizAPI = require('../lib/postiz-api');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

async function main() {
  logger.header('Atlas — Configuration Validation');

  try {
    // 1. Load config
    logger.info('Loading atlas-config.json...');
    const configMgr = new ConfigManager('./atlas-config.json');
    configMgr.load();

    // 2. Validate config structure
    logger.info('Validating configuration structure...');
    const isValid = configMgr.validate();

    // 3. Print report
    const success = configMgr.printReport();

    if (!success) {
      logger.separator();
      console.log(chalk.red('\n❌ Configuration has critical issues.\n'));
      console.log('To fix:');
      configMgr.getErrors().forEach(err => {
        console.log(chalk.yellow(`  1. ${err}`));
      });
      process.exit(1);
    }

    // 4. Test API connections
    logger.separator();
    logger.header('Testing API Connections');

    // Test OpenAI
    logger.info('Testing OpenAI API...');
    const openai = new OpenAIImageGen();
    const openaiOk = await openai.testConnection();
    if (openaiOk) {
      logger.success('OpenAI API ✓');
    } else {
      logger.warn('OpenAI API (skipped in mock mode)');
    }

    // Test Postiz
    logger.info('Testing Postiz API...');
    const postiz = new PostizAPI();
    const postizOk = await postiz.testConnection();
    if (postizOk) {
      logger.success('Postiz API ✓');
    } else {
      logger.warn('Postiz API (skipped in mock mode)');
    }

    // 5. Check enabled platforms
    logger.separator();
    logger.header('Platform Status');

    const platforms = configMgr.getEnabledPlatforms();
    for (const platform of platforms) {
      const schedule = configMgr.getPostingSchedule(platform);
      console.log(chalk.cyan(`  ✓ ${platform.toUpperCase()}`));
      console.log(chalk.gray(`    Schedule: ${schedule.join(', ')}`));
    }

    if (platforms.length === 0) {
      logger.warn('No platforms enabled!');
    }

    // 6. Summary
    logger.separator();
    logger.header('Configuration Summary');

    console.log(chalk.cyan('Business'));
    console.log(`  Name: ${configMgr.get('business.name')}`);
    console.log(`  Audience: ${configMgr.get('business.audience')}`);
    console.log(`  Positioning: ${configMgr.get('business.positioning')}`);

    console.log(chalk.cyan('\nImage Generation'));
    console.log(`  Provider: ${configMgr.get('imageGeneration.provider')}`);
    console.log(`  Model: ${configMgr.get('imageGeneration.model')}`);

    console.log(chalk.cyan('\nPlatforms'));
    console.log(`  Enabled: ${platforms.length} (${platforms.join(', ')})`);

    console.log(chalk.cyan('\nOperating Mode'));
    console.log(`  Mock Mode: ${process.env.MOCK_MODE === 'true' ? '✓ ON' : '✗ OFF'}`);

    // 7. Next steps
    logger.separator();
    logger.header('Next Steps');

    console.log(chalk.green('\n✓ Configuration validated!\n'));
    console.log('You can now:');
    console.log(chalk.cyan('  1. Generate content:'));
    console.log('     node scripts/generate-content.js --count 3\n');
    console.log(chalk.cyan('  2. Adapt for platforms:'));
    console.log('     node scripts/adapt-for-platform.js --adaptAll\n');
    console.log(chalk.cyan('  3. Schedule posts:'));
    console.log('     node scripts/schedule-posts.js --posts 5\n');

    logger.separator();

  } catch (error) {
    logger.error('Configuration validation failed');
    console.error(chalk.red(`\n${error.message}\n`));
    process.exit(1);
  }
}

main().catch(error => {
  logger.error('Unexpected error', error);
  process.exit(1);
});
