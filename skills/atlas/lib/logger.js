/**
 * Atlas Logger
 * Simple logging utility with levels: debug, info, warn, error
 */

const chalk = require('chalk');

class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    this.mockMode = process.env.MOCK_MODE === 'true';
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.level];
  }

  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    let prefix = '';

    switch (level) {
      case 'debug':
        prefix = chalk.gray('[DEBUG]');
        break;
      case 'info':
        prefix = chalk.blue('[INFO]');
        break;
      case 'warn':
        prefix = chalk.yellow('[WARN]');
        break;
      case 'error':
        prefix = chalk.red('[ERROR]');
        break;
    }

    let output = `${prefix} ${message}`;
    if (data) {
      output += ` ${JSON.stringify(data, null, 2)}`;
    }

    return output;
  }

  debug(message, data) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message, data) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  warn(message, data) {
    if (this.shouldLog('warn')) {
      console.log(this.formatMessage('warn', message, data));
    }
  }

  error(message, data) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  success(message, data) {
    console.log(chalk.green(`✓ ${message}`), data ? JSON.stringify(data) : '');
  }

  fail(message, data) {
    console.error(chalk.red(`✗ ${message}`), data ? JSON.stringify(data) : '');
  }

  separator() {
    console.log(chalk.gray('─'.repeat(80)));
  }

  header(title) {
    console.log(chalk.bold.cyan(`\n📌 ${title}`));
    this.separator();
  }

  mock(message) {
    if (this.mockMode) {
      console.log(chalk.magenta(`[MOCK] ${message}`));
    }
  }
}

module.exports = Logger;
