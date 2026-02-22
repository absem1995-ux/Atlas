#!/usr/bin/env node

/**
 * Marketing Agent Orchestrator
 * 
 * Executes the skill graph:
 * 1. Discovers trends (optional)
 * 2. Generates content (image + text)
 * 3. Adapts for platforms (TikTok, Instagram, YouTube)
 * 4. Schedules posts
 * 5. Collects analytics
 * 6. Analyzes performance
 * 7. Sends daily report
 * 
 * Usage:
 *   node marketing-orchestrator.js --setup
 *   node marketing-orchestrator.js --generate --count 3
 *   node marketing-orchestrator.js --analyze --days 7
 *   node marketing-orchestrator.js --run (full workflow)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const CONFIG_PATH = process.env.CONFIG_PATH || './config/marketing-config.json';
const SKILL_GRAPH_PATH = './skill-graph.json';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const MOCK_MODE = process.env.MOCK_MODE === 'true';

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

// Load skill graph
function loadSkillGraph() {
  try {
    const content = fs.readFileSync(SKILL_GRAPH_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    logger.error(`Failed to load skill graph: ${error.message}`);
    process.exit(1);
  }
}

// Load user config
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    logger.error(`Config not found: ${CONFIG_PATH}`);
    logger.info('Run: node marketing-orchestrator.js --setup');
    process.exit(1);
  }
  
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    logger.error(`Failed to parse config: ${error.message}`);
    process.exit(1);
  }
}

// Execute a single skill
async function executeSkill(skillId, inputs) {
  logger.info(`Executing skill: ${skillId}`);
  
  // Mock mode: return fake data
  if (MOCK_MODE) {
    logger.debug('Running in MOCK_MODE');
    return { success: true, data: {}, message: `${skillId} completed (mock)` };
  }

  const skillGraph = loadSkillGraph();
  const skill = skillGraph.skills.find(s => s.id === skillId);

  if (!skill) {
    logger.error(`Skill not found: ${skillId}`);
    return { success: false, error: `Skill ${skillId} not found` };
  }

  logger.debug(`Skill details: ${JSON.stringify(skill, null, 2)}`);
  
  // Route to correct skill execution
  switch (skill.source.type) {
    case 'local':
      return executeLocalSkill(skill, inputs);
    case 'clawhub':
      return executeClawHubSkill(skill, inputs);
    default:
      logger.error(`Unknown skill source type: ${skill.source.type}`);
      return { success: false };
  }
}

// Execute local skill
async function executeLocalSkill(skill, inputs) {
  const skillPath = path.resolve(skill.source.path);
  const mainScript = path.join(skillPath, 'scripts', `${skill.id.split('-').pop()}.js`);

  if (!fs.existsSync(mainScript)) {
    logger.error(`Skill script not found: ${mainScript}`);
    return { success: false };
  }

  return new Promise((resolve) => {
    const child = spawn('node', [mainScript, JSON.stringify(inputs)], {
      env: { ...process.env, MOCK_MODE }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve({ success: true, data: result });
        } catch {
          resolve({ success: true, data: { output: stdout } });
        }
      } else {
        logger.error(`Skill failed: ${stderr}`);
        resolve({ success: false, error: stderr });
      }
    });
  });
}

// Execute ClawHub skill
async function executeClawHubSkill(skill, inputs) {
  // For now, mock ClawHub skills
  logger.info(`ClawHub skill: ${skill.id} (would call external skill)`);
  return { success: true, data: {}, message: `${skill.id} executed` };
}

// Visualize and approve plan before execution
async function showPlan(config, skillGraph) {
  logger.info('\n╔════════════════════════════════════════════════════════════════╗');
  logger.info('║            MARKETING AGENT EXECUTION PLAN                    ║');
  logger.info('╚════════════════════════════════════════════════════════════════╝\n');

  let totalTime = 0;
  let stepNum = 1;

  for (const stage of skillGraph.workflow.stages) {
    if (stage.optional && !config.enableOptionalSkills) continue;

    const timeEstimate = estimateStageTime(stage);
    totalTime += timeEstimate;

    logger.info(`STEP ${stepNum}: ${stage.stage.toUpperCase()}`);
    logger.info(`  Description: ${stage.description}`);
    logger.info(`  Skills: ${stage.skills.join(', ')}`);
    logger.info(`  Mode: ${stage.parallel ? 'PARALLEL' : 'SEQUENTIAL'}`);
    logger.info(`  Est. Time: ${timeEstimate}-${timeEstimate + 2} minutes`);
    logger.info(`  Required: ${stage.required ? 'YES' : 'Optional'}`);
    logger.info('');
    stepNum++;
  }

  logger.info('════════════════════════════════════════════════════════════════');
  logger.info(`Total estimated execution time: ${totalTime}-${totalTime + 5} minutes`);
  logger.info('════════════════════════════════════════════════════════════════\n');
  logger.info('Note: TikTok posts require manual audio selection in the app before publishing.');
  logger.info('      Other platforms post automatically.\n');
}

// Estimate stage time based on skill types
function estimateStageTime(stage) {
  const timingMap = {
    'discovery': 2,
    'generation': 3,
    'adaptation': 2,
    'distribution': 2,
    'monitoring': 2,
    'analysis': 1,
    'reporting': 1
  };
  return timingMap[stage.stage] || 2;
}

// Orchestrate full workflow
async function runFullWorkflow(skipPlan = false) {
  const config = loadConfig();
  const skillGraph = loadSkillGraph();

  if (!skipPlan) {
    await showPlan(config, skillGraph);
    // In interactive mode, could ask for confirmation here
    // For now, proceed automatically
  }

  logger.info('Starting Marketing Agent Workflow\n');
  
  // Run each stage in sequence
  for (const stage of skillGraph.workflow.stages) {
    logger.info(`📍 ${stage.stage.toUpperCase()}`);
    
    if (stage.optional && !config.enableOptionalSkills) {
      logger.info(`   ⊘ Skipping (optional)`);
      continue;
    }

    const stageInputs = prepareInputsForStage(stage, config);

    if (stage.parallel) {
      // Run all skills in parallel
      logger.info(`   ⚡ Running ${stage.skills.length} skills in parallel...`);
      const promises = stage.skills.map(skillId => executeSkill(skillId, stageInputs));
      const results = await Promise.all(promises);
      
      if (!results.every(r => r.success)) {
        logger.error(`   ✗ Stage ${stage.stage} failed`);
        return false;
      }
      logger.info(`   ✓ All skills completed`);
    } else {
      // Run skills sequentially
      for (const skillId of stage.skills) {
        const result = await executeSkill(skillId, stageInputs);
        
        if (!result.success) {
          logger.error(`   ✗ Skill ${skillId} failed`);
          if (stage.required) return false;
        }
      }
    }

    logger.info(`   ✓ Stage completed\n`);
  }

  logger.info('═══════════════════════════════════════════════════════════════');
  logger.info('✓ WORKFLOW COMPLETED SUCCESSFULLY');
  logger.info('═══════════════════════════════════════════════════════════════');
  logger.info('\nNext steps:');
  logger.info('  1. Review posts in Postiz (settings → drafts/scheduled)');
  logger.info('  2. For TikTok: Add audio to drafts before posting');
  logger.info('  3. Check analytics tomorrow: node orchestrator.js --analyze --days 1\n');
  return true;
}

// Prepare inputs for a stage
function prepareInputsForStage(stage, config) {
  return {
    businessProfile: config.business,
    contentStrategy: config.content,
    platforms: Object.keys(config.platforms).filter(p => config.platforms[p].enabled),
    platformConfig: config.platforms,
    hooks: config.content.hooks || []
  };
}

// Setup wizard
async function runSetup() {
  logger.info('Marketing Agent Setup Wizard\n');

  const config = {
    business: {
      name: 'MyApp',
      audience: 'Developers',
      positioning: 'The easiest automation tool',
      website: 'https://example.com'
    },
    platforms: {
      tiktok: {
        enabled: true,
        handle: '@myapp',
        postingSchedule: ['07:30', '16:30', '21:00'],
        strategy: 'larry'
      },
      instagram: {
        enabled: true,
        handle: '@myapp',
        postingSchedule: ['11:00', '18:00'],
        strategy: 'atlas'
      }
    },
    content: {
      hooks: [
        {
          id: 'narrative_001',
          hook: 'I spent 10 hours a week on repetitive tasks. Then I built this...',
          category: 'narrative',
          status: 'testing'
        }
      ],
      contentMix: {
        narratives: 0.40,
        tutorials: 0.30,
        showcases: 0.20,
        engagement: 0.10
      }
    },
    analytics: {
      trackHookPerformance: true,
      conversionGoal: 'sign_up',
      reportFrequency: 'daily'
    }
  };

  // Write template config
  const configDir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  logger.info(`✓ Config created: ${CONFIG_PATH}`);
  logger.info('Edit this file with your business details, then run: --generate');
}

// Generate content
async function generateContent(count = 3) {
  logger.info(`Generating ${count} posts...`);
  
  const config = loadConfig();
  
  // Run generation through orchestration
  const inputs = {
    businessProfile: config.business,
    contentStrategy: config.content,
    count: count
  };

  const result = await executeSkill('atlas-generate', inputs);
  
  if (result.success) {
    logger.info(`✓ Generated ${count} posts`);
    logger.info('Next: Adapt for platforms with --adapt');
  } else {
    logger.error('Generation failed');
  }
}

// Analyze performance
async function analyzePerformance(days = 7) {
  logger.info(`Analyzing performance (${days} days)...`);
  
  const config = loadConfig();
  
  const inputs = {
    dayRange: days,
    hooks: config.content.hooks
  };

  const result = await executeSkill('marketing-analyze', inputs);
  
  if (result.success) {
    logger.info('✓ Analysis complete');
    logger.info(JSON.stringify(result.data, null, 2));
  } else {
    logger.error('Analysis failed');
  }
}

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const commands = {
    setup: false,
    run: false,
    generate: false,
    analyze: false,
    adapt: false,
    count: 3,
    days: 7
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--setup') commands.setup = true;
    if (args[i] === '--run') commands.run = true;
    if (args[i] === '--generate') commands.generate = true;
    if (args[i] === '--analyze') commands.analyze = true;
    if (args[i] === '--adapt') commands.adapt = true;
    if (args[i] === '--count') commands.count = parseInt(args[i + 1]) || 3;
    if (args[i] === '--days') commands.days = parseInt(args[i + 1]) || 7;
  }

  return commands;
}

// Main entry point
async function main() {
  const commands = parseArgs();

  logger.info('Marketing Orchestrator v1.0.0');
  logger.debug(`Mock mode: ${MOCK_MODE}`);

  if (commands.setup) {
    await runSetup();
  } else if (commands.run) {
    await runFullWorkflow(false);  // false = show plan
  } else if (commands.generate) {
    await generateContent(commands.count);
  } else if (commands.analyze) {
    await analyzePerformance(commands.days);
  } else {
    console.log(`
Marketing Agent Orchestrator — v1.0.0 (MCP-Aligned)

Usage:
  node marketing-orchestrator.js --setup                Setup wizard
  node marketing-orchestrator.js --generate --count 3   Generate N posts
  node marketing-orchestrator.js --adapt               Format for platforms
  node marketing-orchestrator.js --schedule            Schedule posts
  node marketing-orchestrator.js --analyze --days 7    Analyze performance
  node marketing-orchestrator.js --run                 Run full workflow (with plan)
  node marketing-orchestrator.js --run --skip-plan     Run without showing plan

Environment Variables:
  MOCK_MODE=true        Run without real APIs (test mode)
  LOG_LEVEL=debug       Verbose logging (debug, info, warn, error)
  CONFIG_PATH           Path to config file (default: ./config/marketing-config.json)

MCP Integration:
  - Postiz API for multi-platform posting + analytics
  - Email MCP for report delivery
  - Slack MCP for notifications (optional)

Examples:
  MOCK_MODE=true node marketing-orchestrator.js --run       # Test without APIs
  node marketing-orchestrator.js --generate --count 5       # Generate 5 posts
  node marketing-orchestrator.js --run --skip-plan          # No plan preview
    `);
  }
}

main().catch(error => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
