#!/usr/bin/env bun
import os from 'os';
import { parseArgs } from 'util';

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    help: { type: 'boolean', short: 'h' },
  },
  strict: true,
  allowPositionals: true,
});

(async () => {
  try {
    if (values.help ?? false) {
      console.log('Usage: anken-helper [-h] ARG1');
      console.log('Options:');
      console.log('  -h: Show help');
      console.log('anken-manager remote controller');
    } else {
      //main process
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.log('エラーが発生しました。');
    }
  }
})();
