#!/usr/bin/env bun
import { $ } from 'bun';
import fs from 'node:fs';

await (async () => {
  const entries = fs.readdirSync('.', { withFileTypes: true });
  const deleted = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const r = await $`rm -rf ${entry.name}`;
      if (r.exitCode === 0) {
        deleted.push(entry.name);
      } else {
        console.error(`Error deleting ${entry.name}`);
      }
    }
  }
  console.log(`Deleted ${deleted.length} directories`);
})();
