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
  const modules = [
    "mod_rewrite",
    "mod_headers",
    "mod_env",
    "mod_dir",
    "mod_mime",
    "mod_php",
    "mod_setenvif"
  ];

  for (const module of modules) {
    console.log(`\n${module} の設定を確認します...`);

    try {
      const { stdout } = await $`grep -riH --include=*.conf "${module}.so" /etc/httpd/conf.modules.d/`;
      if (stdout) {
        const lines = stdout.trim().split("\n");
        for (const line of lines) {
          console.log(line);
        }
      } else {
        console.log(`${module} に関する設定が見つかりませんでした。`);
      }
    } catch (error) {
      console.error(`エラー: ${module} の設定を確認中に問題が発生しました。`);
    }
  }

  console.log("\n全てのモジュールの設定確認が終了しました。");
})();

