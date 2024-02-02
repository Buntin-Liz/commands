#!/usr/bin/env -S deno run -A
import $ from 'https://deno.land/x/dax@0.35.0/mod.ts';
import { copy } from 'https://deno.land/std@0.208.0/fs/mod.ts';

const checkCurrentDirectory = async (expectedDir: string) => {
  const pwd = await $`pwd`.text();
  const currentDir = await $`basename ${pwd}`.text();
  if (currentDir.trim() !== expectedDir) {
    console.log(`commandsディレクトリで実行してください`);
    Deno.exit(1);
  }
};

const copyDir = async (src: string, dest: string) => {
  try {
    await copy(src, dest, { overwrite: true });
    console.log(`ディレクトリがコピーされました: ${src} -> ${dest}`);
  } catch (error) {
    console.error(`ディレクトリのコピー中にエラーが発生しました: ${error}`);
  }
};
const removeTargetDirIfExists = async (targetDir: string) => {
  if (await $`test -d ${targetDir}`) {
    console.log(`TARGET_DIRを削除しています: ${targetDir}`);
    await $`rm -rf ${targetDir}`;
  } else {
    console.log(`ディレクトリが存在しません: ${targetDir}`);
  }
};

const copyTemplateDirToTarget = async (templateDir: string, targetDir: string) => {
  console.log('TEMPLATE_DIRをコピーします。');
  if ((await $`test -d ${templateDir}`).code === 0) {
    await copyDir(templateDir, targetDir);
  } else {
    console.log(`ディレクトリが存在しません: ${templateDir}`);
  }
};

(async () => {
  const targetDir = './bin';
  const templateDir = './archive/template';

  await checkCurrentDirectory('commands');
  await removeTargetDirIfExists(targetDir);
  await copyTemplateDirToTarget(templateDir, targetDir);
  console.log('削除が正常に完了しました');
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
