#!/usr/bin/env node
// PostToolUse hook: remind Claude to update module-bindings.md after spacetime generate
//
// When `spacetime generate` runs, the bindings in src/module_bindings/ change.
// The skill reference at .claude/skills/spacetimedb/references/module-bindings.md
// must be kept in sync so Claude has accurate schema knowledge. This hook
// injects a reminder into Claude's context so it doesn't forget.

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(input);

    // Only care about Bash commands containing spacetime generate
    if (event.tool_name !== 'Bash') {
      process.exit(0);
    }

    const cmd = (event.tool_input && event.tool_input.command) || '';

    if (/spacetime\s+generate/.test(cmd)) {
      // Output reminder as JSON with additionalContext
      const output = {
        additionalContext: [
          'POST-GENERATE BINDING REFRESH REQUIRED:',
          'spacetime generate was just run. You MUST now:',
          '1. Read src/module_bindings/types.ts (all type/enum/struct definitions)',
          '2. Read src/module_bindings/index.ts (table schema with indexes, constraints, reducers list)',
          '3. Rewrite .claude/skills/spacetimedb/references/module-bindings.md to match the new schema',
          'Do NOT skip this step — stale module-bindings.md causes hallucinated APIs in future work.',
        ].join('\n'),
      };
      console.log(JSON.stringify(output));
    }
  } catch (e) {
    // Silently ignore parse errors
  }
});
