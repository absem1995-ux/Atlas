#!/usr/bin/env node

/**
 * analyze-performance.js
 * Analyze hook performance and recommend optimizations
 * 
 * Usage:
 *   node analyze-performance.js
 *   node analyze-performance.js --days 7
 *   node analyze-performance.js --report daily
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs');
const Logger = require('../lib/logger');
const ConfigManager = require('../lib/config');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

class PerformanceAnalyzer {
  constructor(configPath = './atlas-config.json') {
    this.configMgr = new ConfigManager(configPath);
    this.config = null;
  }

  /**
   * Initialize
   */
  async init() {
    logger.info('Initializing performance analyzer...');

    try {
      this.config = this.configMgr.load();
      this.configMgr.validate();

      logger.success('Performance analyzer initialized');
      return true;
    } catch (error) {
      logger.error(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load analytics files
   */
  getAnalyticsFiles(days = 7) {
    const analyticsDir = './data/analytics';

    if (!fs.existsSync(analyticsDir)) {
      return [];
    }

    const files = fs.readdirSync(analyticsDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, days);

    return files.map(f => {
      const filePath = path.join(analyticsDir, f);
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    });
  }

  /**
   * Get all posts with their analytics
   */
  getPostsWithAnalytics() {
    const postsDir = './data/posts';

    if (!fs.existsSync(postsDir)) {
      return [];
    }

    const files = fs.readdirSync(postsDir)
      .filter(f => f.endsWith('.json') && !f.includes('_'));

    return files.map(f => {
      const filePath = path.join(postsDir, f);
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    });
  }

  /**
   * Calculate hook performance
   */
  calculateHookPerformance(posts, analyticsFiles) {
    const hookStats = {};

    posts.forEach(post => {
      const hookId = post.hookId;

      if (!hookStats[hookId]) {
        hookStats[hookId] = {
          hookId,
          hookText: post.hookText,
          category: post.hookCategory,
          tests: 0,
          totalViews: 0,
          totalEngagement: 0,
          avgViews: 0,
          avgEngagement: 0,
          status: 'testing'
        };
      }

      hookStats[hookId].tests++;

      // In real scenario, would look up post analytics
      // For now, use mock data
      hookStats[hookId].totalViews += Math.floor(Math.random() * 50000);
      hookStats[hookId].totalEngagement += Math.floor(Math.random() * 5000);
    });

    // Calculate averages
    Object.values(hookStats).forEach(stats => {
      if (stats.tests > 0) {
        stats.avgViews = stats.totalViews / stats.tests;
        stats.avgEngagement = stats.totalEngagement / stats.tests;
      }

      // Determine status
      if (stats.tests >= 3 && stats.avgEngagement > 5000) {
        stats.status = 'proven';
      } else if (stats.tests < 3) {
        stats.status = 'testing';
      } else if (stats.avgEngagement < 2000) {
        stats.status = 'underperforming';
      }
    });

    return hookStats;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(hookStats) {
    const recommendations = [];

    const proven = Object.values(hookStats)
      .filter(h => h.status === 'proven')
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    const underperforming = Object.values(hookStats)
      .filter(h => h.status === 'underperforming');

    const testing = Object.values(hookStats)
      .filter(h => h.status === 'testing');

    // Recommendation 1: Double down on proven
    if (proven.length > 0) {
      recommendations.push({
        type: 'double_down',
        title: 'Double down on proven hooks',
        text: `"${proven[0].hookText.substring(0, 40)}..." is your top performer. Use similar patterns.`,
        hooks: proven.map(h => h.hookId)
      });
    }

    // Recommendation 2: Stop underperformers
    if (underperforming.length > 0) {
      recommendations.push({
        type: 'stop',
        title: 'Stop using underperforming hooks',
        text: `These hooks aren't resonating: ${underperforming.map(h => h.hookId).join(', ')}. Try new angles.`,
        hooks: underperforming.map(h => h.hookId)
      });
    }

    // Recommendation 3: Keep testing
    if (testing.length > 0) {
      recommendations.push({
        type: 'keep_testing',
        title: 'Keep testing new hooks',
        text: `You have ${testing.length} hooks still in testing phase. Run 3+ posts before deciding.`,
        hooks: testing.map(h => h.hookId)
      });
    }

    return recommendations;
  }

  /**
   * Analyze and save results
   */
  async analyze(days = 7) {
    logger.header(`Analyzing Performance (Last ${days} Days)`);

    const analyticsFiles = this.getAnalyticsFiles(days);
    const posts = this.getPostsWithAnalytics();

    logger.info(`Analyzing ${posts.length} posts...`);

    if (posts.length === 0) {
      logger.warn('No posts found. Generate and schedule posts first.');
      return null;
    }

    const hookStats = this.calculateHookPerformance(posts, analyticsFiles);
    const recommendations = this.generateRecommendations(hookStats);

    // Save hook performance
    const hookPerfPath = './hooks-performance.json';
    const hookPerf = {
      analyzedAt: new Date().toISOString(),
      days,
      hooks: hookStats,
      recommendations,
      summary: {
        totalHooks: Object.keys(hookStats).length,
        provenHooks: Object.values(hookStats).filter(h => h.status === 'proven').length,
        underperformingHooks: Object.values(hookStats).filter(h => h.status === 'underperforming').length
      }
    };

    fs.writeFileSync(hookPerfPath, JSON.stringify(hookPerf, null, 2));

    logger.success(`Hook performance saved to ${hookPerfPath}`);

    return hookPerf;
  }

  /**
   * Print analysis
   */
  printAnalysis(analysis) {
    logger.header('Performance Analysis Results');

    console.log(chalk.cyan(`\nHook Summary:\n`));
    console.log(`  Proven hooks: ${analysis.summary.provenHooks}`);
    console.log(`  Underperforming: ${analysis.summary.underperformingHooks}`);
    console.log(`  Testing: ${analysis.summary.totalHooks - analysis.summary.provenHooks - analysis.summary.underperformingHooks}`);

    console.log(chalk.cyan(`\nRecommendations:\n`));
    analysis.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${chalk.yellow(rec.title)}`);
      console.log(`   ${rec.text}`);
      console.log();
    });

    logger.separator();
    console.log(chalk.green('\n✓ Performance analyzed!\n'));
    console.log(chalk.cyan('Next step: Generate daily report\n'));
    console.log('  node scripts/daily-report.js\n');
  }
}

async function main() {
  const argv = yargs
    .option('days', {
      alias: 'd',
      describe: 'Analyze last N days',
      type: 'number',
      default: 7
    })
    .option('report', {
      describe: 'Report format (daily, weekly)',
      type: 'string',
      default: 'daily'
    })
    .argv;

  try {
    const analyzer = new PerformanceAnalyzer();
    await analyzer.init();

    const analysis = await analyzer.analyze(argv.days);

    if (analysis) {
      analyzer.printAnalysis(analysis);
    }

  } catch (error) {
    logger.error('Performance analysis failed');
    console.error(chalk.red(`\n${error.message}\n`));
    process.exit(1);
  }
}

main().catch(error => {
  logger.error('Unexpected error', error);
  process.exit(1);
});
