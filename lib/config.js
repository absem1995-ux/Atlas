/**
 * Config Loader & Validator
 * Loads atlas-config.json and validates completeness
 */

const fs = require('fs');
const path = require('path');
const Logger = require('./logger');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

class ConfigManager {
  constructor(configPath = './atlas-config.json') {
    this.configPath = configPath;
    this.config = null;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Load config from file
   */
  load() {
    try {
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`Config file not found: ${this.configPath}`);
      }

      const raw = fs.readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(raw);
      logger.success(`Loaded config from ${this.configPath}`);
      return this.config;
    } catch (error) {
      logger.error(`Failed to load config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate complete config
   */
  validate() {
    this.errors = [];
    this.warnings = [];

    if (!this.config) {
      this.errors.push('Config not loaded. Call load() first.');
      return false;
    }

    // Required business info
    if (!this.config.business?.name) {
      this.errors.push('business.name is required');
    }
    if (!this.config.business?.audience) {
      this.errors.push('business.audience is required');
    }

    // Required image generation
    if (!this.config.imageGeneration?.provider) {
      this.errors.push('imageGeneration.provider is required');
    }
    if (this.config.imageGeneration?.provider !== 'local') {
      if (!this.config.imageGeneration?.apiKey && !process.env.OPENAI_API_KEY) {
        this.errors.push('imageGeneration.apiKey or OPENAI_API_KEY required');
      }
    }

    // Required Postiz
    if (!this.config.postiz?.apiKey && !process.env.POSTIZ_API_KEY) {
      this.errors.push('postiz.apiKey or POSTIZ_API_KEY required');
    }

    // Check at least one platform enabled
    const enabledPlatforms = Object.keys(this.config.platforms || {})
      .filter(p => this.config.platforms[p]?.enabled === true);

    if (enabledPlatforms.length === 0) {
      this.errors.push('At least one platform must be enabled');
    }

    // Validate enabled platforms have integration IDs
    for (const platform of enabledPlatforms) {
      if (!this.config.postiz?.integrationIds?.[platform]) {
        this.warnings.push(`Platform ${platform} enabled but no Postiz integration ID found`);
      }
    }

    // Check content strategy exists
    if (!fs.existsSync('./atlas-strategy.json')) {
      this.warnings.push('atlas-strategy.json not found. Run onboarding.js to create it.');
    }

    logger.info(`Validation complete: ${this.errors.length} errors, ${this.warnings.length} warnings`);
    return this.errors.length === 0;
  }

  /**
   * Get config value, with fallback to env var
   */
  get(path) {
    const parts = path.split('.');
    let value = this.config;

    for (const part of parts) {
      if (value?.[part] !== undefined) {
        value = value[part];
      } else {
        return null;
      }
    }

    // If value looks like env var reference, try to get from env
    if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
      const envKey = value.slice(2, -1);
      return process.env[envKey] || value;
    }

    return value;
  }

  /**
   * Get all enabled platforms
   */
  getEnabledPlatforms() {
    return Object.keys(this.config.platforms || {})
      .filter(p => this.config.platforms[p]?.enabled === true);
  }

  /**
   * Get posting schedule for platform
   */
  getPostingSchedule(platform) {
    return this.config.platforms?.[platform]?.postingSchedule || [];
  }

  /**
   * Print validation report
   */
  printReport() {
    logger.header('Configuration Validation Report');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      logger.success('✨ All systems ready!');
    } else {
      if (this.errors.length > 0) {
        logger.fail(`${this.errors.length} critical issues:`);
        this.errors.forEach(e => console.log(chalk.red(`  ✗ ${e}`)));
      }

      if (this.warnings.length > 0) {
        logger.warn(`${this.warnings.length} warnings:`);
        this.warnings.forEach(w => console.log(chalk.yellow(`  ⚠ ${w}`)));
      }
    }

    logger.separator();
    console.log(chalk.cyan('Configuration Summary:'));
    console.log(`  Business: ${this.config.business?.name || '(not set)'}`);
    console.log(`  Platforms: ${this.getEnabledPlatforms().join(', ') || '(none enabled)'}`);
    console.log(`  Image Gen: ${this.config.imageGeneration?.provider || '(not set)'}`);
    logger.separator();

    return this.errors.length === 0;
  }

  /**
   * Get errors as array
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get warnings as array
   */
  getWarnings() {
    return this.warnings;
  }
}

module.exports = ConfigManager;
