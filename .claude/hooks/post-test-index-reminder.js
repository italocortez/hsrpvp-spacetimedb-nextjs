#!/usr/bin/env node
// PostToolUse hook: remind Claude to update test-index.md after relevant file changes
//
// When test files, docs/*/contract.md, or docs/*/ directories are created/modified,
// the UAT feature index at .claude/skills/uat/references/test-index.md should be
// updated to reflect the new state. This hook injects a reminder.

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(input);

    // Only care about Write and Edit tools (file creation/modification)
    if (event.tool_name !== 'Write' && event.tool_name !== 'Edit') {
      process.exit(0);
    }

    const filePath = (event.tool_input && (event.tool_input.file_path || '')) || '';
    const normalized = filePath.replace(/\\/g, '/');

    // Match patterns that affect the test index:
    // - test/backend/**/*.test.ts (new or modified test files)
    // - docs/*/contract.md (new or modified behavior specs)
    // - docs/*/architecture.md (new feature directories)
    // - test/shared/** (shared infrastructure changes)
    // - scripts/post-publish.ts, scripts/seed-data.ts, etc.
    const patterns = [
      /test\/backend\/.*\.test\.ts$/,
      /docs\/[^/]+\/contract\.md$/,
      /docs\/[^/]+\/architecture\.md$/,
      /test\/shared\//,
      /scripts\/(post-publish|seed-data|register-server|manage-user)\.ts$/,
    ];

    // Don't trigger on the test-index.md file itself
    if (normalized.includes('test-index.md')) {
      process.exit(0);
    }

    const matches = patterns.some(p => p.test(normalized));
    if (matches) {
      const output = {
        additionalContext: [
          'TEST INDEX UPDATE REMINDER:',
          `A file relevant to the UAT feature index was modified: ${normalized}`,
          'Check if .claude/skills/uat/references/test-index.md needs updating:',
          '- New test files? Update the Tests column for that feature',
          '- New contract.md? Update Behavior Spec and Coverage columns',
          '- New docs/{feature}/ directory? Add a row to the Backend Features table',
          '- Changed shared infrastructure? Update the Shared Infrastructure table',
        ].join('\n'),
      };
      console.log(JSON.stringify(output));
    }
  } catch (e) {
    // Silently ignore parse errors
  }
});
