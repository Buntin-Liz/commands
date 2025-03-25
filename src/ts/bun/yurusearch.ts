#!/usr/bin/env bun

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { isBinaryFile } from 'isbinaryfile';

const exclude = [
  'dist',
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

const searchFiles = async (dir, word) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const tasks = entries.map(async (entry) => {
    const fileName = entry.name;
    const filePath = join(dir, fileName);

    if (exclude.includes(fileName)) return;

    if (entry.isDirectory()) {
      return searchFiles(filePath, word);
    }

    if (entry.isFile() && !(await isBinaryFile(filePath))) {
      try {
        const content = await readFile(filePath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(word)) {
            console.log('-------------------------');
            console.log(`${filePath}:${index + 1}`);
            console.log(line);
          }
        });
      } catch (e) {
        console.error(`Error reading file ${filePath}:`, e);
      }
    }
  });

  await Promise.all(tasks);
};

(async () => {
  const args = process.argv.slice(2);
  const { values, positionals } = parseArgs({
    args: Bun.argv,
    options: {
      help: {
        type: 'boolean',
        short: 'h',
        description: 'Show help',
      },
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.help) {
    console.log('Usage: yurusearch {検索ワード}');
    console.log(
      '現在のディレクトリ以下全てのファイルを検索します。\n検索ワードに引っかかると、そのファイルと行数を表示します。',
    );
    process.exit(0);
  }

  // console.log(`検索ワード: ${word}`);
  const cwd = process.cwd();
  // await searchFiles(cwd, word);
  console.log(values);
  console.log(positionals);

  const flags =
  switch (true) {
    case flags['all']:
      all(flags._.toString());
      break;

    case flags['short']:
      short(flags._.toString());
      break;

    case flags['version']:
      version();
      break;

    case flags['help']:
      help();
      break;

    default:
      defaultFn(flags._.toString());
  }
})();
