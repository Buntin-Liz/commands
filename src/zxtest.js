#!/usr/bin/env zx

(async () => {
  const result = await $`ls -la`
  console.log(result) // stdout, stderr, exitCodeなどが取得できる
})();
