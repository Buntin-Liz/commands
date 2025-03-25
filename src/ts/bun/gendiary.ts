#!/usr/bin/env bun
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { TOML, file } from 'bun';
const args = parseArgs({
  args: Bun.argv,
  options: {},
  strict: true,
  allowPositionals: true,
});

/* 
設定
*/
const diaryDirName = '日記';
const autoClean = true;
const markdownFilesMaximum = 7;
const archiveDirName = 'Archive';

const loadTomlObject = <T>(filePath: string): T => {
  const tomlString = fs.readFileSync(filePath, 'utf-8');
  return TOML.parse(tomlString) as T;
};

const getOldMarkdownFiles = (dirPath: string, maxFiles: number): string[] => {
  // ディレクトリ内の全ファイルを読み込む
  const files = fs.readdirSync(dirPath);

  const markdownFiles = files
    .filter((file) => path.extname(file).toLowerCase() === '.md')
    .map((file) => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      return { path: filePath, mtime: stats.mtime.getTime() };
    });

  markdownFiles.sort((a, b) => a.mtime - b.mtime);

  if (markdownFiles.length > maxFiles) {
    const excess = markdownFiles.length - maxFiles;
    return markdownFiles.slice(0, excess).map((file) => file.path);
  }

  return [];
};

(async () => {
  try {
    console.log('Creating a new diary file...');
    const today_string = new Date().toISOString().slice(0, 10);
    const todayDiaryPath = path.join(diaryDirName, `${today_string}.md`);
    const archiveDiaryPath = path.join(diaryDirName, archiveDirName, '.');
    const diaryFormattedInitializationMessage = `# ${today_string}\n\n## Tickets\n\n## Notes\n\n## Plans\n\n## Memo\n\n`;
    const writerResult = await Bun.write(
      Bun.file(todayDiaryPath),
      diaryFormattedInitializationMessage,
    );
    console.log('Diary file created:', todayDiaryPath, writerResult);
    if (autoClean) {
      const oldFiles = getOldMarkdownFiles(diaryDirName, markdownFilesMaximum);
      if (oldFiles.length > 0) {
        const moveResult =
          await $`mv ${oldFiles.join(' ')} ${archiveDiaryPath}`;
        if (moveResult.exitCode !== 0) {
          console.error('Failed to move old diary files.');
          return;
        }
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.log(e);
    }
  }
})();
