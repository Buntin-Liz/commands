#!/usr/bin/env bun
import { $ } from 'bun';
import { parseArgs } from 'util';
const args = parseArgs({
  args: Bun.argv,
  options: {},
  strict: true,
  allowPositionals: true,
});

(async () => {
  // 引数に基づいて何かする（例）
  console.log(`引数: `, args);

  const result = await $`echo "Hello from zx in Bun!"`;
})();
