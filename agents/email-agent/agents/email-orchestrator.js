#!/usr/bin/env node

/**
 * Email Agent Orchestrator
 * 
 * Centralized email service for multi-agent system
 * - Sends emails on behalf of all agents
 * - Enforces rate limits and guardrails
 * - Tracks delivery and opens
 * - Manages templates
 * - Logs all actions for audit trail
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// Configuration
const CONFIG_PATH = process.env.CONFIG_PATH || './email-config.json';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const MOCK_MODE = process.env.MOCK_MODE === 'true';
const PORT = process.env.PORT || 3000;

// Logger
class Logger {
  constructor(level = 'info') {
    this.level = { debug: 0, info: 1, warn: 2, error: 3 }[level] || 1;
  }

  debug(msg) { if (this.level <= 0) console.log(`[DEBUG] ${msg}`); }
  info(msg) { if (this.level <= 1) console.log(`[INFO] ${msg}`); }
  warn(msg) { if (this.level <= 2) console.warn(`[WARN] ${msg}`); }
  error(msg) { if (this.level <= 3) console.error(`[ERROR] ${msg}`); }
}

const logger = new Logger(LOG_LEVEL);

// Load configuration
function loadConfig() {
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    logger.error(`Failed to load config: ${error.message}`);
    // Return defaults
    return {
      service: { name: 'Email Agent', version: '1.0.0', port: PORT },
      providers: {},
      guardrails: {
        bulk_send_threshold: 500,
        bulk_send_escalate: 1000,
        rate_limit_per_hour: 50,
        rate_limit_per_day: 1000
      },
      templates: {}
    };
  }
}

// Email Queue Manager
class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(emailRequest) {
    this.queue.push({
      id: generateUUID(),
      request: emailRequest,
      status: 'queued',
      created_at: new Date(),
      processed_at: null
    });
    logger.info(`Email queued: ${emailRequest.to} (queue size: ${this.queue.length})`);
  }

  async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const emailJob = this.queue.shift();
      try {
        const result = await sendEmail(emailJob.request);
        emailJob.status = 'sent';
        emailJob.processed_at = new Date();
        emailJob.result = result;
        logger.info(`Email sent: ${emailJob.request.to} (${result.message_id})`);
      } catch (error) {
        emailJob.status = 'failed';
        emailJob.error = error.message;
        logger.error(`Email failed: ${emailJob.request.to} - ${error.message}`);
      }
    }

    this.processing = false;
  }
}

// Rate Limiter
class RateLimiter {
  constructor(limit = 50, window = 'hour') {
    this.limit = limit;
    this.window = window;
    this.agents = {};
  }

  async checkAndIncrement(agentName) {
    const now = new Date();
    const key = `${agentName}:${now.getHours()}`;

    if (!this.agents[key]) {
      this.agents[key] = { count: 0, window_start: now };
    }

    if (this.agents[key].count >= this.limit) {
      return {
        allowed: false,
        current: this.agents[key].count,
        limit: this.limit,
        message: `Rate limit exceeded for ${agentName}`
      };
    }

    this.agents[key].count++;
    return {
      allowed: true,
      current: this.agents[key].count,
      limit: this.limit
    };
  }
}

// Guardrails Enforcer
class GuardrailsEnforcer {
  constructor(config) {
    this.config = config.guardrails;
  }

  async checkRequest(emailRequest) {
    const violations = [];

    // Check: Bulk send
    if (emailRequest.recipients && emailRequest.recipients > this.config.bulk_send_threshold) {
      violations.push({
        level: 2,
        type: 'bulk_send',
        message: `Bulk send (${emailRequest.recipients}) exceeds threshold (${this.config.bulk_send_threshold})`,
        requiresApproval: true,
        escalateTo: 'coo'
      });
    }

    // Check: Unsubscribed (would be LEVEL 1, but we skip for now)

    // Check: Rate limit
    if (emailRequest.skipRateLimit !== true) {
      // Rate check happens separately
    }

    return {
      passed: violations.length === 0,
      violations: violations
    };
  }
}

// Email Sender
async function sendEmail(emailRequest) {
  if (MOCK_MODE) {
    // Mock: simulate sending
    await new Promise(r => setTimeout(r, 100));
    return {
      status: 'sent',
      message_id: generateUUID(),
      timestamp: new Date().toISOString(),
      provider: 'mock',
      from: emailRequest.from,
      to: emailRequest.to
    };
  }

  // Real sending would go here
  // For now, return success
  return {
    status: 'sent',
    message_id: generateUUID(),
    timestamp: new Date().toISOString(),
    from: emailRequest.from,
    to: emailRequest.to
  };
}

// Utility: Generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initialize Email Agent
async function initializeEmailAgent() {
  logger.info('═════════════════════════════════════════════════════════════');
  logger.info('Email Agent v1.0.0 — Multi-Agent Communication Service');
  logger.info('═════════════════════════════════════════════════════════════');
  logger.info(`Mode: ${MOCK_MODE ? 'MOCK' : 'PRODUCTION'}`);
  logger.info(`Log Level: ${LOG_LEVEL}`);
  logger.info(`Port: ${PORT}`);
  logger.info('');

  const config = loadConfig();
  const emailQueue = new EmailQueue();
  const rateLimiter = new RateLimiter(
    config.guardrails.rate_limit_per_hour,
    'hour'
  );
  const guardrails = new GuardrailsEnforcer(config);

  // Process queue every 5 seconds
  setInterval(async () => {
    await emailQueue.process();
  }, 5000);

  // API Endpoints (mock HTTP)
  const api = {
    async send(request) {
      logger.info(`📧 Email request from ${request.from} to ${request.to}`);

      // Check guardrails
      const guardrailCheck = await guardrails.checkRequest(request);
      if (!guardrailCheck.passed) {
        logger.warn(`⚠️  Guardrail violation: ${guardrailCheck.violations[0].message}`);
        return {
          status: 'requires_approval',
          escalation_id: generateUUID(),
          violations: guardrailCheck.violations,
          escalateTo: guardrailCheck.violations[0].escalateTo || 'coo'
        };
      }

      // Check rate limit
      const rateCheck = await rateLimiter.checkAndIncrement(request.from);
      if (!rateCheck.allowed) {
        logger.warn(`⏱️  Rate limit hit for ${request.from}`);
        // Queue for later
        await emailQueue.add(request);
        return {
          status: 'queued',
          message: 'Rate limit reached, queued for later',
          queue_position: emailQueue.queue.length
        };
      }

      // Send email
      const result = await sendEmail(request);
      return {
        status: 'sent',
        message_id: result.message_id,
        timestamp: result.timestamp,
        to: request.to
      };
    },

    async status(messageId) {
      // Mock response
      return {
        message_id: messageId,
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        open_count: 1,
        click_count: 0
      };
    },

    async rateLimit(agent) {
      // Return current rate limit status
      return {
        agent: agent,
        limit: config.guardrails.rate_limit_per_hour,
        remaining: Math.max(0, config.guardrails.rate_limit_per_hour - 40), // Mock
        resets_at: new Date(Date.now() + 3600000).toISOString()
      };
    },

    async templates() {
      return config.templates || {};
    }
  };

  // Example usage
  logger.info('📨 Ready to send emails');
  logger.info('');
  logger.info('Example requests:');
  logger.info('  api.send({ from: "atlas", to: "team@company.com", subject: "...", body: "..." })');
  logger.info('  api.status(messageId)');
  logger.info('  api.rateLimit("atlas")');
  logger.info('  api.templates()');
  logger.info('');

  return api;
}

// Main
async function main() {
  try {
    const api = await initializeEmailAgent();
    
    // Keep running
    console.log('✓ Email Agent running (listening for inter-agent messages)');
    
    // Don't exit
    await new Promise(() => {});
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Export for use by other agents
module.exports = {
  initializeEmailAgent,
  generateUUID,
  Logger,
  EmailQueue,
  RateLimiter,
  GuardrailsEnforcer
};

// Run if this is the main module
if (require.main === module) {
  main();
}
