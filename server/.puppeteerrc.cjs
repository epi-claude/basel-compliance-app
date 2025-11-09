/**
 * Puppeteer configuration
 * Skips Chrome download - we use system Chrome in production via nixpacks.toml
 */
const { join } = require('path');

module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
