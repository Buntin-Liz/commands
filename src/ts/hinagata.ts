#!/usr/bin/env -S deno run -A
import $ from "https://deno.land/x/dax/mod.ts";
import parseArgs from 'https://deno.land/x/deno_minimist/mod.ts';

//
const args = parseArgs(Deno.args);

(async () => {
  // do something
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
