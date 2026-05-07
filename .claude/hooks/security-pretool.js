#!/usr/bin/env node
// gsd-hook-version: 1.26.0
// PreToolUse security hook — blocks dangerous Bash commands
// Lightweight version for early development: only catches the worst patterns

const fs = require('fs');

// Read hook input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(input);

    // Only check Bash tool calls
    if (event.tool_name !== 'Bash') {
      process.exit(0);
    }

    const cmd = (event.tool_input && event.tool_input.command) || '';

    // Dangerous patterns that should never run
    const blocked = [
      { pattern: /rm\s+-rf\s+\/(?!\w)/, reason: 'rm -rf on root directory' },
      { pattern: /rm\s+-rf\s+~/, reason: 'rm -rf on home directory' },
      { pattern: /:\(\)\s*\{\s*:\|:\s*&\s*\}\s*;/, reason: 'fork bomb' },
      { pattern: /mkfs\./, reason: 'filesystem format command' },
      { pattern: /dd\s+if=.*of=\/dev\//, reason: 'dd writing to device' },
      { pattern: />\s*\/dev\/sda/, reason: 'writing directly to disk device' },
      { pattern: /chmod\s+-R\s+777\s+\//, reason: 'recursive 777 on root' },
      { pattern: /curl\s+.*\|\s*(ba)?sh/, reason: 'piping curl to shell' },
      { pattern: /wget\s+.*\|\s*(ba)?sh/, reason: 'piping wget to shell' },
      { pattern: /git\s+push\s+.*--force\s+.*main/, reason: 'force push to main' },
      { pattern: /git\s+push\s+.*--force\s+.*master/, reason: 'force push to master' },
    ];

    for (const { pattern, reason } of blocked) {
      if (pattern.test(cmd)) {
        // Output JSON to block the action
        const result = {
          decision: 'block',
          reason: `Security hook blocked: ${reason}`
        };
        process.stdout.write(JSON.stringify(result));
        process.exit(0);
      }
    }

    // Everything else is allowed (permissions block handles prompting)
    process.exit(0);
  } catch (e) {
    // On error, allow the command (fail open for dev ergonomics)
    process.exit(0);
  }
});
