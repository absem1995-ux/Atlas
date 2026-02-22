const chalk = require('chalk');

class Logger {
  header(title) {
    console.log(chalk.bold.cyan(`\n📌 ${title}`));
    console.log(chalk.gray('─'.repeat(60)));
  }

  info(msg) {
    console.log(chalk.blue(`ℹ ${msg}`));
  }

  success(msg) {
    console.log(chalk.green(`✓ ${msg}`));
  }

  warn(msg) {
    console.log(chalk.yellow(`⚠ ${msg}`));
  }

  error(msg) {
    console.log(chalk.red(`✗ ${msg}`));
  }

  separator() {
    console.log(chalk.gray('─'.repeat(60)));
  }
}

module.exports = Logger;
