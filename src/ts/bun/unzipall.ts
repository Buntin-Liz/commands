#!/usr/bin/env bun
import { $ } from 'bun';
import { parseArgs } from 'util';
import fs from 'node:fs';
const _args = parseArgs({
  args: Bun.argv,
  options: {},
  strict: true,
  allowPositionals: true,
});

(async () => {
  // all file entries
  const files = fs
    .readdirSync('.')
    .filter((f) => fs.statSync(f).isFile())
    .filter((f) => f.endsWith('.zip'));
  for (const file of files) {
    await $`unzip -o ${file}`;
  }
})();
