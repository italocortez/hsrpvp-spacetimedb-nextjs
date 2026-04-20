#!/usr/bin/env node
// Local shim for `gsd-sdk query ...` calls emitted by GSD workflows.
// Forwards to the sibling gsd-tools.cjs. See .planning/notes/gsd-sdk-shim.md.
const path = require('path');
const { spawnSync } = require('child_process');

const TOOLS = path.resolve(__dirname, 'gsd-tools.cjs');

let args = process.argv.slice(2);

if (args[0] === 'query') args = args.slice(1);

if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('.')) {
  const idx = args[0].indexOf('.');
  args = [args[0].slice(0, idx), args[0].slice(idx + 1), ...args.slice(1)];
}

const res = spawnSync(process.execPath, [TOOLS, ...args], { stdio: 'inherit' });
process.exit(res.status ?? 1);
