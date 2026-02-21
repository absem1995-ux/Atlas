/**
 * Text Overlay Utility
 * Adds text overlays to images using canvas for video posts
 */

const canvas = require('canvas');
const fs = require('fs');
const path = require('path');
const Logger = require('./logger');

const logger = new Logger(process.env.LOG_LEVEL || 'info');

class TextOverlay {
  constructor(mockMode = false) {
    this.mockMode = mockMode || process.env.MOCK_MODE === 'true';
    this.outputDir = './data/posts';
    this.ensureOutputDir();
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Create slide with text overlay (mock or real)
   */
  async createSlide(slideData, index) {
    if (this.mockMode) {
      return this.createMockSlide(slideData, index);
    }

    try {
      // Create canvas
      const width = 1024;
      const height = 1024; // Will be 9:16 in aspect ratio
      const ctx = canvas.createCanvas(width, height * 1.777).getContext('2d');

      // Background (solid color or gradient)
      this.drawBackground(ctx, width, height * 1.777);

      // Add text
      this.drawText(ctx, slideData.text, width, height * 1.777);

      // Save to file
      const fileName = `slide_${index}_${Date.now()}.png`;
      const filePath = path.join(this.outputDir, fileName);

      const buffer = ctx.canvas.toBuffer('image/png');
      fs.writeFileSync(filePath, buffer);

      logger.success(`Created slide ${index}: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error(`Failed to create slide: ${error.message}`);
      // Fallback to mock
      return this.createMockSlide(slideData, index);
    }
  }

  /**
   * Draw background
   */
  drawBackground(ctx, width, height) {
    // Simple gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2d2d2d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw text on canvas
   */
  drawText(ctx, text, width, height) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Word wrap
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > width - 100) {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // Draw lines centered
    const lineHeight = 60;
    const totalHeight = lines.length * lineHeight;
    const startY = (height - totalHeight) / 2;

    // Add black outline for readability
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    lines.forEach((line, i) => {
      const y = startY + (i * lineHeight);
      ctx.strokeText(line, width / 2, y);
      ctx.fillText(line, width / 2, y);
    });
  }

  /**
   * Create mock slide (for testing without canvas)
   */
  createMockSlide(slideData, index) {
    logger.mock(`Would create slide ${index}: "${slideData.text.substring(0, 30)}..."`);

    // Return mock file path
    const fileName = `slide_${index}_mock_${Date.now()}.png`;
    const filePath = path.join(this.outputDir, fileName);

    // Create empty file for testing
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '');
    }

    return filePath;
  }

  /**
   * Create post from slides
   */
  async createPost(slides, postId) {
    const slideFiles = [];

    for (let i = 0; i < slides.length; i++) {
      const slideFile = await this.createSlide(slides[i], i);
      slideFiles.push({
        slideNumber: i + 1,
        filePath: slideFile,
        duration: slides[i].duration || 3
      });
    }

    logger.success(`Created post ${postId} with ${slideFiles.length} slides`);
    return slideFiles;
  }

  /**
   * Get slide file path
   */
  getSlideFilePath(postId, slideNumber) {
    return path.join(this.outputDir, `slide_${slideNumber}_${postId}.png`);
  }

  /**
   * Clean up old slides
   */
  cleanupOldSlides(olderThanDays = 30) {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    try {
      const files = fs.readdirSync(this.outputDir);
      let cleaned = 0;

      files.forEach(file => {
        const filePath = path.join(this.outputDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtimeMs < cutoffTime) {
          fs.unlinkSync(filePath);
          cleaned++;
        }
      });

      logger.info(`Cleaned up ${cleaned} old slide files`);
    } catch (error) {
      logger.warn(`Failed to cleanup slides: ${error.message}`);
    }
  }
}

module.exports = TextOverlay;
