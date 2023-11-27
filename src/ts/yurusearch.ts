#!/usr/bin/env -S deno run -A
import $ from "https://deno.land/x/dax/mod.ts";
import { path } from "https://deno.land/x/dax@0.35.0/src/deps.ts";
import { join } from "https://deno.land/std@0.201.0/path/join.ts";
import parseArgs from 'https://deno.land/x/deno_minimist/mod.ts';
import { isBinaryFile } from 'npm:isbinaryfile@5.0.0';

//
const args = parseArgs(Deno.args);

//検索除外ディレクトリ名
const exclude = ['node_modules', '.git', '.vscode', 'testssl', '.cargo', '.cpan', '.local', '.cpanm', '.cpam', '.npm', '.pyenv', '.rbenv', '.rustup', '.volta'];

const searchFiles = async (dir: string, word: string) => {
  const files = Deno.readDir(dir);
  for await (const file of files) {
    const fileName = file.name;
    const filePath = join(dir, fileName);
    //条件
    if (exclude.includes(fileName)) continue;
    if (file.isDirectory) {
      //file is directory
      await searchFiles(filePath, word);
      continue;
    };
    //file is file(text or binary)
    if (file.isFile && !(await isBinaryFile(filePath))) {
      try {
        const content = await Deno.readTextFile(filePath);
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(word)) {
            console.log('-------------------------');
            console.log(`${ filePath }:${ index + 1 }`);
            console.log(line);
          }
        });
      } catch (e) {
        console.error(e as Error);
      }
    }
  }
}

//main
(async () => {
  const word = args._[0];
  const helpTriggers = ['-h', '--help', 'help', ''];
  if (helpTriggers.includes(word)) {
    console.log('Usage: yurusearch {検索ワード}');
    console.log('現在のディレクトリ以下全てのファイルを検索します。\n検索ワードに引っかかると、そのファイルと行数を表示します。');
    console.log('helpなどの予約語を検索したい場合は、スクリプトの中の、helperTriggersという配列からそれを削除してください。(使用後、戻さないとhelpが出なくなります)');

    Deno.exit(0);
  }
  console.log(`検索ワード: ${ word }`);
  const cwd = Deno.cwd();
  await searchFiles(cwd, word);
})();
