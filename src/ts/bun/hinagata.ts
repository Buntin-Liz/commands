#!/usr/bin/env bun
import { $ } from 'zx';
import "zx/globals";

const args = argv;

(async () => {
  // 引数に基づいて何かする（例）
  console.log(`引数: `, args);

  const result = await $`echo "Hello from zx in Bun!"`;
  console.log(JSON.stringify(result, null, 2));
})();
