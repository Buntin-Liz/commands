#!/usr/bin/env -S deno run -A
import $ from 'https://deno.land/x/dax@0.35.0/mod.ts';
import parseArgs from 'https://deno.land/x/deno_minimist@v1.0.2/mod.ts';
import { homedir } from 'https://deno.land/std@0.110.0/node/os.ts';
import { expandGlob } from 'https://deno.land/std@0.213.0/fs/expand_glob.ts';
//
const args = parseArgs(Deno.args);
const findZshFilesInHomeDirectory = async (): Promise<string[]> => {
  const zshFiles: string[] = [];
  for await (const file of expandGlob(homedir() + '/.zsh*')) {
    zshFiles.push(file.path);
  }
  return zshFiles;
};

(async () => {
  // do something
  // 使用例
  for await (const file of expandGlob(homedir() + '/.zsh*')) {
    console.log(file.path);
  }
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
