#!/usr/bin/env node
// gsd-hook-version: 1.26.0
// Stop hook — checks for sensitive files staged in git before session ends

const { execSync } = require('child_process');

try {
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' });

  const sensitivePatterns = [
    /\.env$/,
    /\.env\.\w+$/,
    /credentials\.json$/,
    /\.pem$/,
    /\.key$/,
    /secret/i,
    /token/i,
  ];

  const flagged = staged
    .split('\n')
    .filter(Boolean)
    .filter(file => sensitivePatterns.some(p => p.test(file)));

  if (flagged.length > 0) {
    console.error(`\n⚠️  Sensitive files staged for commit:\n${flagged.map(f => `  - ${f}`).join('\n')}\n\nRun 'git reset HEAD <file>' to unstage before committing.\n`);
  }
} catch (e) {
  // Not a git repo or git not available — skip silently
}
