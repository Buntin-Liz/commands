#!/usr/bin/env zx
//初期設定(TypeScript,ZXの制約による)
import "zx/globals";
const commandName = 'hinagata';
$.verbose = false;
argv._ = argv._.filter((t) => !t.includes("commands/" + commandName));

await (async () => {
  //do something
})();

/* 
$ hinagata -x 3 -y 4 -n5 -abc --beep=boop foo bar baz

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
