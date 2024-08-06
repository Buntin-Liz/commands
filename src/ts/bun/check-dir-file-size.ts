#!/usr/bin/env bun
import os from 'os';
import { parseArgs } from 'util';
import fs from 'fs/promises';
import path from 'path';

const HOME_DIR = os.homedir();

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    help: { type: 'boolean', short: 'h' },
  },
  strict: true,
  allowPositionals: true,
});

const defaultExcludeDirs = ['node_modules', '.git', '__pycache__'];

const getAllFiles = async (dirPath: string) => {
  const dirEntries = await fs.readdir(dirPath, { withFileTypes: true, recursive: true });
  const files = dirEntries.filter((dirent) => !defaultExcludeDirs.some((excludeDir) => dirent.parentPath.includes(excludeDir)) && dirent.isFile() && dirent.name !== '.DS_Store');
  return files;
};

(async () => {
  try {
    if (values.help ?? false) {
      console.log('Usage: sshls [-a] [-p] [-u] [-o] [-s] [-h]');
      console.log('Options:');
      console.log('  -a: Show all information');
      console.log('  -p: Show port information');
      console.log('  -u: Show user information');
      console.log('  -o: Show option information');
      console.log('  -s: Show short information');
      console.log('  -h: Show help');
      process.exit(0);
    }
    const targetDir = positionals[2] === undefined ? '.' : positionals[2];
    const printCount = positionals[3] === undefined ? 5 : Number(positionals[3]);

    const targetDirPath = path.join(process.cwd(), targetDir);
    const files = (await getAllFiles(targetDirPath)).map((dirent): [string, number] => [path.join(dirent.parentPath, dirent.name), Bun.file(path.join(dirent.parentPath, dirent.name)).size]);

    const result = files.sort((a, b) => (a[1] - b[1]) * -1).slice(0, printCount);
    console.table(result);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.log('エラーが発生しました。');
    }
  }
})();
