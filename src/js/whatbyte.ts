#!/usr/bin/env zx

import 'zx/globals';

import { exit } from 'process';

const bytesToSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + " " + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

(() => {
  const argv = process.argv;
  if (argv.length !== 4) {
    console.log('Usage: whatbyte <file>');
    exit(1);
  }
  const byteCount = Number(argv[3]);
  const maxSafeInteger = Number.MAX_SAFE_INTEGER;
  if (byteCount >= maxSafeInteger) {
    console.log(`The byte count ${ byteCount } is greater than the maximum safe integer ${ maxSafeInteger }.`);
    exit(1);
  }
  console.log(bytesToSize(byteCount));
})();