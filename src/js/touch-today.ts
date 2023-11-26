#!/usr/bin/env zx
import "zx/globals";
$.verbose = false;

//初期設定(TypeScript,ZXの制約による)
const commandName = 'touch-today';
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
	console.log(argv);
	const today = new Date();
	const y = today.getFullYear();
	const m = today.getMonth() + 1;
	const d = today.getDate();
	const h = today.getHours();
	const min = today.getMinutes();
	const s = today.getSeconds();
	const name = argv._[0] || "touch-today";
	const filename = '' + y + m + d + '-' + h + min + s + '-' + name;
	const sh = await $`touch ${filename}`;
	//if success 
	if (sh.exitCode === 0) {
		echo("作成成功");
	} else {
		echo("作成失敗\n" + sh.stderr);
	}
})();

