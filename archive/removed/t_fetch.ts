#!/usr/bin/env -S deno run -A
import $ from "https://deno.land/x/dax@0.35.0/mod.ts";


(async () => {
  // do something
  //prompt
  const target = await $.prompt('Enter target URL: ');
  const result = await $`curl ${ target }`.text();
  console.log('target URL is', target);
  console.log(result);
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
