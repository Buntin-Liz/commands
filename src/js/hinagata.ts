#!/usr/bin/env zx
import "zx/globals";
$.verbose = false;

//初期設定(TypeScript,ZXの制約による)
const commandName = 'hinagata';
argv._ = argv._.filter((t) => !t.includes("commands/" + commandName));

/* 
  hinagata -x 3 -y 4 -n5 -abc --beep=boop foo bar baz
  argv = {
	_: ['foo', 'bar', 'baz'],
	x: 3,
	y: 4,
	n: 5,
	a: true,
	b: true,
	c: true,
	beep: 'boop'
}
*/
await (async () => {
  //do something
})();

