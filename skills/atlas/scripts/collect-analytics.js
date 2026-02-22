#!/usr/bin/env node

/**
 * collect-analytics.js
 * Fetch daily metrics from all enabled platforms
 * 
 * Usage:
 *   node collect-analytics.js
 *   node collect-analytics.js --date 2026-02-18
 *   node collect-analytics.js --platform tiktok
 *   node collect-analytics.js --days 7
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs');
const Logger = require('../lib/logger');
const ConfigManager = require('../lib/config');
const { mockPlatformMetrics, mockAnalytics } = require('../lib/mock-data');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

class AnalyticsCollector {
  constructor(configPath = './atlas-config.json') {
    this.configMgr = new ConfigManager(configPath);
    this.config = null;
  }

  /**
   * Initialize
   */
  async init() {
    logger.info('Initializing analytics collector...');

    try {
      this.config = this.configMgr.load();
      this.configMgr.validate();

      logger.success('Analytics collector initialized');
      return true;
    } catch (error) {
      logger.error(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Collect metrics for a platform
   */
  async collectPlatformMetrics(platform, date) {
    logger.info(`Collecting ${platform} metrics for ${date}...`);

    if (process.env.MOCK_MODE === 'true') {
      logger.mock(`Would fetch metrics from ${platform} API`);
      return this.mockCollectMetrics(platform, date);
    }

    // Real API implementation would go here
    // For now, return mock data
    return this.mockCollectMetrics(platform, date);
  }

  /**
   * Mock collect metrics
   */
  mockCollectMetrics(platform, date) {
    const metrics = mockPlatformMetrics[platform] || {
      views: Math.floor(Math.random() * 50000),
      engagement: Math.floor(Math.random() * 5000),
      completionRate: Math.random() * 0.8 + 0.2
    };

    return {
      platform,
      date,
      metrics,
      isMock: true
    };
  }

  /**
   * Normalize metrics to common schema
   */
  normalizeMetrics(platformMetrics) {
    const { platform, metrics, date } = platformMetrics;

    return {
      platform,
      date,
      views: metrics.views || 0,
      engagement: metrics.engagement || 0,
      engagementRate: metrics.engagement / (metrics.views || 1),
      completionRate: metrics.completionRate || 0,
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      saves: metrics.saves || 0,
      collected: new Date().toISOString()
    };
  }

  /**
   * Collect all platform metrics
   */
  async collectAll(date = null) {
    if (!date) {
      date = new Date();
      date.setDate(date.getDate() - 1); // Yesterday
    }

    if (typeof date === 'string') {
      date = new Date(date);
    }

    const dateStr = date.toISOString().split('T')[0];

    logger.header(`Collecting Analytics for ${dateStr}`);

    const enabledPlatforms = this.configMgr.getEnabledPlatforms();
    const allMetrics = [];

    for (const platform of enabledPlatforms) {
      try {
        const raw = await this.collectPlatformMetrics(platform, dateStr);
        const normalized = this.normalizeMetrics(raw);
        allMetrics.push(normalized);

        logger.success(`  ✓ ${platform}: ${normalized.views} views`);
      } catch (error) {
        logger.warn(`  ✗ ${platform}: ${error.message}`);
      }
    }

    // Save analytics
    const analyticsDir = './data/analytics';
    if (!fs.existsSync(analyticsDir)) {
      fs.mkdirSync(analyticsDir, { recursive: true });
    }

    const analyticsFile = path.join(analyticsDir, `${dateStr}.json`);
    const analyticsData = {
      date: dateStr,
      platforms: allMetrics,
      totalViews: allMetrics.reduce((sum, m) => sum + m.views, 0),
      avgEngagement: allMetrics.length > 0
        ? allMetrics.reduce((sum, m) => sum + m.engagementRate, 0) / allMetrics.length
        : 0,
      collectedAt: new Date().toISOString()
    };

    fs.writeFileSync(analyticsFile, JSON.stringify(analyticsData, null, 2));

    logger.success(`Analytics saved to ${analyticsFile}`);

    return analyticsData;
  }

  /**
   * Get analytics for date range
   */
  async getAnalyticsRange(days = 7) {
    logger.header(`Collecting Analytics (Last ${days} Days)`);

    const allAnalytics = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      try {
        const analytics = await this.collectAll(date);
        allAnalytics.push(analytics);

        logger.success(`Day ${i + 1}: ${analytics.totalViews} views`);
      } catch (error) {
        logger.warn(`Day ${i + 1}: Failed to collect`);
      }
    }

    return allAnalytics;
  }

  /**
   * Print summary
   */
  printSummary(analyticsData) {
    logger.header('Analytics Summary');

    console.log(chalk.cyan(`Date: ${analyticsData.date}\n`));

    console.log(chalk.cyan('Platform Breakdown:'));
    analyticsData.platforms.forEach(p => {
      console.log(chalk.gray(`  ${p.platform.toUpperCase()}`));
      console.log(chalk.gray(`    Views: ${p.views}`));
      console.log(chalk.gray(`    Engagement: ${(p.engagementRate * 100).toFixed(1)}%`));
      console.log(chalk.gray(`    Completion: ${(p.completionRate * 100).toFixed(1)}%`));
    });

    console.log(chalk.cyan(`\nTotal Views: ${analyticsData.totalViews}`));
    console.log(chalk.cyan(`Avg Engagement: ${(analyticsData.avgEngagement * 100).toFixed(1)}%`));

    logger.separator();
    console.log(chalk.green('\n✓ Analytics collected!\n'));
    console.log(chalk.cyan('Next step: Analyze performance\n'));
    console.log('  node scripts/analyze-performance.js --days 7\n');
  }
}

async function main() {
  const argv = yargs
    .option('date', {
      alias: 'd',
      describe: 'Specific date (YYYY-MM-DD)',
      type: 'string'
    })
    .option('platform', {
      alias: 'p',
      describe: 'Specific platform',
      type: 'string'
    })
    .option('days', {
      describe: 'Collect last N days',
      type: 'number'
    })
    .argv;

  try {
    const collector = new AnalyticsCollector();
    await collector.init();

    let result;

    if (argv.days) {
      result = await collector.getAnalyticsRange(argv.days);
      logger.info(`Collected analytics for ${result.length} days`);
    } else {
      result = await collector.collectAll(argv.date);
      collector.printSummary(result);
    }

  } catch (error) {
    logger.error('Analytics collection failed');
    console.error(chalk.red(`\n${error.message}\n`));
    process.exit(1);
  }
}

main().catch(error => {
  logger.error('Unexpected error', error);
  process.exit(1);
});
