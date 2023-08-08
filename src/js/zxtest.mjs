#!/usr/bin/env zx

(async () => {
  const result = await $`ls -la`;
  await $`echo ${ JSON.stringify(result) } > result.json`
})();
