#!/usr/bin/env zx
import 'zx/globals';

(async () => {
  await $`ls -la`
  echo('hello world');
})();