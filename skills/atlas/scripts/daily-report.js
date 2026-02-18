#!/usr/bin/env node

/**
 * daily-report.js
 * Morning digest of performance and recommendations
 * 
 * Usage:
 *   node daily-report.js
 *   node daily-report.js --date 2026-02-18
 *   node daily-report.js --format html
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs');
const Logger = require('../lib/logger');
const ConfigManager = require('../lib/config');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

class DailyReporter {
  constructor(configPath = './atlas-config.json') {
    this.configMgr = new ConfigManager(configPath);
    this.config = null;
  }

  /**
   * Initialize
   */
  async init() {
    logger.info('Initializing daily reporter...');

    try {
      this.config = this.configMgr.load();
      this.configMgr.validate();

      logger.success('Daily reporter initialized');
      return true;
    } catch (error) {
      logger.error(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get yesterday's analytics
   */
  getYesterdayAnalytics(dateStr = null) {
    if (!dateStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      dateStr = yesterday.toISOString().split('T')[0];
    }

    const analyticsPath = path.join('./data/analytics', `${dateStr}.json`);

    if (!fs.existsSync(analyticsPath)) {
      return null;
    }

    const content = fs.readFileSync(analyticsPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Get hook performance data
   */
  getHookPerformance() {
    const hookPerfPath = './hooks-performance.json';

    if (!fs.existsSync(hookPerfPath)) {
      return null;
    }

    const content = fs.readFileSync(hookPerfPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Generate report data
   */
  generateReport(dateStr = null) {
    logger.header('Generating Daily Report');

    const analytics = this.getYesterdayAnalytics(dateStr);
    const hookPerf = this.getHookPerformance();

    if (!analytics) {
      logger.warn('No analytics found for yesterday');
      return null;
    }

    // Identify top/bottom performers
    const topPlatforms = analytics.platforms
      .sort((a, b) => b.views - a.views)
      .slice(0, 3);

    const recommendations = hookPerf?.recommendations || [];

    const report = {
      date: analytics.date,
      summary: {
        totalViews: analytics.totalViews,
        avgEngagement: analytics.avgEngagement,
        platformCount: analytics.platforms.length
      },
      platforms: analytics.platforms,
      topPerformers: topPlatforms,
      recommendations,
      insights: this.generateInsights(analytics, hookPerf),
      generatedAt: new Date().toISOString()
    };

    return report;
  }

  /**
   * Generate insights
   */
  generateInsights(analytics, hookPerf) {
    const insights = [];

    // Insight 1: Best platform
    if (analytics.platforms.length > 0) {
      const best = analytics.platforms.sort((a, b) => b.views - a.views)[0];
      insights.push(`📱 Best platform: ${best.platform.toUpperCase()} (${best.views} views)`);
    }

    // Insight 2: Engagement trends
    if (analytics.avgEngagement > 0.08) {
      insights.push(`📈 Engagement strong: ${(analytics.avgEngagement * 100).toFixed(1)}%`);
    } else if (analytics.avgEngagement < 0.03) {
      insights.push(`📉 Engagement low: Consider new hooks`);
    }

    // Insight 3: Hook recommendations
    if (hookPerf?.recommendations?.[0]) {
      insights.push(`💡 ${hookPerf.recommendations[0].text}`);
    }

    // Insight 4: Next steps
    insights.push(`⏭️  Schedule next batch of posts today`);

    return insights;
  }

  /**
   * Format report as text
   */
  formatAsText(report) {
    if (!report) {
      return 'No analytics available for today.';
    }

    let output = '';

    output += `\n📊 DAILY REPORT — ${report.date}\n`;
    output += `${'='.repeat(50)}\n\n`;

    output += `📈 SUMMARY\n`;
    output += `─────────────────────────────────────────────────\n`;
    output += `Total Views: ${report.summary.totalViews}\n`;
    output += `Avg Engagement: ${(report.summary.avgEngagement * 100).toFixed(1)}%\n`;
    output += `Platforms: ${report.summary.platformCount}\n\n`;

    output += `🏆 TOP PERFORMERS\n`;
    output += `─────────────────────────────────────────────────\n`;
    report.topPerformers.forEach((p, i) => {
      output += `${i + 1}. ${p.platform.toUpperCase()}\n`;
      output += `   Views: ${p.views}\n`;
      output += `   Engagement: ${(p.engagementRate * 100).toFixed(1)}%\n`;
    });
    output += '\n';

    output += `💡 INSIGHTS\n`;
    output += `─────────────────────────────────────────────────\n`;
    report.insights.forEach(insight => {
      output += `• ${insight}\n`;
    });
    output += '\n';

    if (report.recommendations.length > 0) {
      output += `📌 RECOMMENDATIONS\n`;
      output += `─────────────────────────────────────────────────\n`;
      report.recommendations.forEach((rec, i) => {
        output += `${i + 1}. ${rec.title}\n`;
        output += `   ${rec.text}\n`;
      });
      output += '\n';
    }

    output += `${'='.repeat(50)}\n`;

    return output;
  }

  /**
   * Format report as HTML
   */
  formatAsHtml(report) {
    if (!report) {
      return '<p>No analytics available.</p>';
    }

    let html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #1a1a1a; color: white; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .metric { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .insight { padding: 10px; background: #f0f0f0; margin: 5px 0; border-left: 4px solid #4CAF50; }
        .recommendation { padding: 10px; background: #fff3cd; margin: 5px 0; border-left: 4px solid #ff9800; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Daily Report</h1>
        <p>Date: ${report.date}</p>
      </div>

      <div class="section">
        <h2>Summary</h2>
        <div class="metric">
          <span>Total Views</span>
          <strong>${report.summary.totalViews}</strong>
        </div>
        <div class="metric">
          <span>Avg Engagement</span>
          <strong>${(report.summary.avgEngagement * 100).toFixed(1)}%</strong>
        </div>
      </div>

      <div class="section">
        <h2>Top Performers</h2>
        ${report.topPerformers.map(p => `
          <div style="padding: 10px; border: 1px solid #ddd; margin: 5px 0;">
            <strong>${p.platform.toUpperCase()}</strong>
            <p>Views: ${p.views} | Engagement: ${(p.engagementRate * 100).toFixed(1)}%</p>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2>Insights</h2>
        ${report.insights.map(i => `<div class="insight">${i}</div>`).join('')}
      </div>

      ${report.recommendations.length > 0 ? `
        <div class="section">
          <h2>Recommendations</h2>
          ${report.recommendations.map(r => `<div class="recommendation"><strong>${r.title}</strong><p>${r.text}</p></div>`).join('')}
        </div>
      ` : ''}

    </body>
    </html>
    `;

    return html;
  }

  /**
   * Save report
   */
  saveReport(report, format = 'text') {
    if (!report) {
      return null;
    }

    const reportsDir = './data/reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const ext = format === 'html' ? 'html' : 'txt';
    const fileName = `report_${report.date}.${ext}`;
    const filePath = path.join(reportsDir, fileName);

    const formatted = format === 'html'
      ? this.formatAsHtml(report)
      : this.formatAsText(report);

    fs.writeFileSync(filePath, formatted);

    logger.success(`Report saved to ${filePath}`);

    return filePath;
  }
}

async function main() {
  const argv = yargs
    .option('date', {
      describe: 'Specific date (YYYY-MM-DD)',
      type: 'string'
    })
    .option('format', {
      alias: 'f',
      describe: 'Format (text, html, json)',
      type: 'string',
      default: 'text'
    })
    .option('save', {
      alias: 's',
      describe: 'Save report to file',
      type: 'boolean',
      default: true
    })
    .argv;

  try {
    const reporter = new DailyReporter();
    await reporter.init();

    const report = reporter.generateReport(argv.date);

    if (report) {
      // Print to console
      if (argv.format === 'text') {
        console.log(reporter.formatAsText(report));
      } else if (argv.format === 'html') {
        console.log(reporter.formatAsHtml(report));
      } else {
        console.log(JSON.stringify(report, null, 2));
      }

      // Save to file
      if (argv.save) {
        reporter.saveReport(report, argv.format);
      }
    } else {
      logger.warn('No data available for report');
    }

  } catch (error) {
    logger.error('Report generation failed');
    console.error(chalk.red(`\n${error.message}\n`));
    process.exit(1);
  }
}

main().catch(error => {
  logger.error('Unexpected error', error);
  process.exit(1);
});
