import { isBinaryFile } from 'npm:isbinaryfile';
import { parseArgs } from 'jsr:@std/cli@1.0.6/parse-args';
import { join } from 'jsr:@std/path';
const args = parseArgs(Deno.args);

//検索除外ディレクトリ名
const exclude = [
  // 'node_modules',
  '.git',
  '.vscode',
  'testssl',
  '.cargo',
  '.cpan',
  '.local',
  '.cpanm',
  '.cpam',
  '.npm',
  '.pyenv',
  '.rbenv',
  '.rustup',
  '.volta',
  'vendor',
  'lib',
  '.lib',
  '.cache',
  '.config',
  '.deno',
];

const searchFiles = async (dir: string, word: string) => {
  const files = Deno.readDir(dir);
  for await (const file of files) {
    const fileName = file.name;
    const filePath = join(dir, fileName);
    if (exclude.includes(fileName)) continue;
    if (file.isDirectory) {
      await searchFiles(filePath, word);
      continue;
    }

    if (file.isFile && !(await isBinaryFile(filePath))) {
      try {
        const content = await Deno.readTextFile(filePath);
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(word)) {
            console.log('-------------------------');
            console.log(`${filePath}:${index + 1}`);
            console.log(line);
          }
        });
      } catch (e) {
        console.error(e as Error);
      }
    }
  }
};

//main
(async () => {
  const word = args._[0].toString();
  const helpTriggers = ['-h', '--help', 'help', ''];
  if (helpTriggers.includes(word)) {
    console.log('Usage: yurusearch {検索ワード}');
    console.log(
      '現在のディレクトリ以下全てのファイルを検索します。\n検索ワードに引っかかると、そのファイルと行数を表示します。',
    );
    console.log(
      'helpなどの予約語を検索したい場合は、スクリプトの中の、helperTriggersという配列からそれを削除してください。(使用後、戻さないとhelpが出なくなります)',
    );
    Deno.exit(0);
  }
  console.log(`検索ワード: ${word}`);
  const cwd = Deno.cwd();
  await searchFiles(cwd, word);
})();
