#!/usr/bin/env -S deno run -A
import $ from "https://deno.land/x/dax@0.35.0/mod.ts";
import parseArgs from "https://deno.land/x/deno_minimist@v1.0.2/mod.ts";
import { dirname, join } from "https://deno.land/std/path/mod.ts";

const solveOneDir = async (targetDir: string, binDir: string) => {
  // targetDir:stringは、リンク対象があるディレクトリ
  // binDir:stringは、リンクを作成するディレクトリ
  //
  const scripts = Deno.readDir(targetDir);
  const result = {
    message: '',
    error: false,
    created: [] as string[],//Array<string>(),
    notCreated: [] as string[]//Array<string>(),
  };
  for await (const script of scripts) {
    if (script.isFile) {
      const scriptName = script.name;
      const scriptPath = join(targetDir, script.name);
      const scriptNameWithoutExt = scriptName.split('.')[0];
      const binPath = join(binDir, scriptNameWithoutExt);
      const logname = scriptPath.split('/').slice(-3).join('/');
      const symlinkCreationResult = await $`ln -s ${ scriptPath } ${ binPath }`;
      if (symlinkCreationResult.code === 0) {
        result.created.push(logname);
      } else {
        result.notCreated.push(logname);
        result.error = true;
      }
    }
  }
  return result;
};

const checkScript = (scriptDir: string) => {
  const dirName = scriptDir.split('/').slice(-2)[0];
  if (dirName !== 'src') {
    console.log('当スクリプトの位置が不当です。プログラムを終了します。');
    Deno.exit(1);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////|MAIN|/////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

const srcDir = new URL('.', import.meta.url).pathname;
checkScript(srcDir);

const commandsDir = dirname(srcDir);
const binDir = join(commandsDir, 'bin');
const srcDirs = ["js", "py", "shell", "ts"].map((dir) => join(srcDir, dir));

const results = srcDirs.map((srcDir) => solveOneDir(srcDir, binDir));
const resultsResolved = await Promise.all(results);
const result = resultsResolved.reduce((acc, cur) => {
  acc.created = acc.created.concat(cur.created);
  acc.notCreated = acc.notCreated.concat(cur.notCreated);
  acc.error = acc.error || cur.error;
  return acc;
}, {
  message: '',
  error: false,
  created: [] as string[],
  notCreated: [] as string[]
});
if (result.error) {
  result.message = 'エラーが発生しています。\n以下のスクリプトについて、シンボリックリンクの作成に失敗しました。\n';
  result.message += result.notCreated.join('\n');
}
result.message += '以下のスクリプトについて、シンボリックリンクの作成に成功しました。\n';
result.message += result.created.join('\n');
console.log(result.message);
Deno.exit(result.error ? 1 : 0);

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

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
