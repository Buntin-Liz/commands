#!/usr/bin/env -S deno run -A
import parseArgs from "https://deno.land/x/deno_minimist@v1.0.2/mod.ts";

const args = parseArgs(Deno.args);
const bytesToSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + " " + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}
(() => {
  if (args._.length === 0) {
    console.log('usage: whatbyte <byte count>');
    console.log('> whatbyte 1024');
    Deno.exit(1);
  }
  const byteCount = Number(args._[0]);
  const maxSafeInteger = Number.MAX_SAFE_INTEGER;
  if (byteCount >= maxSafeInteger) {
    console.log(`The byte count ${ byteCount } is greater than the maximum safe integer ${ maxSafeInteger }.`);
    Deno.exit(1);
  }
  console.log(bytesToSize(byteCount));
})();

/* 
[buntin@buntin ts]$ ./hinagata.ts -x 3 -y 4 -n5 -abc --beep=boop foo bar baz
[Object: null prototype] {
  _: [ "foo", "bar", "baz" ],
  x: 3,
  y: 4,
  n: 5,
  a: true,
  b: true,
  c: true,
  beep: "boop"
}
*/