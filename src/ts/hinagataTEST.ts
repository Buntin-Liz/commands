#!/usr/bin/env bun
import { parseArgs } from 'node:util';
import { $ } from 'bun';
const args = parseArgs({
  args: Bun.argv,
  options: {},
  strict: true,
  allowPositionals: true,
});

(async () => {
  // 引数に基づいて何かする（例）
  console.log(`引数: ${args}`);

  const result = await $`echo "Hello from zx in Bun!"`;
})();
