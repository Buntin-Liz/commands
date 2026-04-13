#!/usr/bin/env bun
import { promises as fs, type Dirent } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { $ } from 'bun';

import chalk from 'chalk';

type Result = {
  message: string;
  error: boolean;
  created: string[];
  notCreated: string[];
  skipped: string[];
};

const genResult = (): Result => ({
  message: '',
  error: false,
  created: [],
  notCreated: [],
  skipped: [],
});

const processScript = async (
  script: Dirent,
  targetDir: string,
  binDir: string,
): Promise<{ logname: string; success: boolean; skip: boolean }> => {
  const scriptPath = join(targetDir, script.name);
  const scriptNameWithoutExt = script.name.split('.')[0];
  const binPath = join(binDir, scriptNameWithoutExt);
  const logname = relative(process.cwd(), scriptPath);

  if (
    ['deploy', 'hinagata'].includes(scriptNameWithoutExt) ||
    script.name.startsWith('_') ||
    script.name.startsWith('.')
  ) {
    return { logname, success: true, skip: true };
  }

  try {
    await fs.symlink(scriptPath, binPath);
    return { logname, success: true, skip: false };
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
    );
    return { logname, success: false, skip: false };
  }
};

const processDirectory = async (
  targetDir: string,
  binDir: string,
): Promise<Result> => {
  const result = genResult();
  const targetDirEnts = await fs.readdir(targetDir, { withFileTypes: true });
  const scripts = targetDirEnts.filter((ent) => ent.isFile());

  for (const script of scripts) {
    const { logname, success, skip } = await processScript(
      script,
      targetDir,
      binDir,
    );
    if (success) {
      if (skip) {
        result.skipped.push(logname);
      } else {
        result.created.push(logname);
      }
    } else {
      result.notCreated.push(logname);
      result.error = true;
    }
  }
  return result;
};

const logTheTable = (t: string[]) => {
  const result = t.reduce((acc, cur) => {
    return `${acc}- ${cur} \n`;
  }, '');
  return `${result}\n`;
};

const resultReducer = (acc: Result, cur: Result): Result => ({
  ...acc,
  created: [...acc.created, ...cur.created],
  notCreated: [...acc.notCreated, ...cur.notCreated],
  skipped: [...acc.skipped, ...cur.skipped],
  error: acc.error || cur.error,
});

const typedBasename = (pathString: string): string => basename(pathString);

(async () => {
  const srcDir = dirname(Bun.main);
  const commandsDir = dirname(srcDir);
  const binDir = join(commandsDir, 'bin');

  if (process.env.DEBUG === '1') {
    const dirsObj = { srcDir, commandsDir, binDir };
    console.log('[debug] dirsObj:', JSON.stringify(dirsObj, null, 2));
  }

  // 準備ここから
  const srcDirs = ['py', 'shell', 'applescript', 'ts'].map((dir) =>
    join(srcDir, dir),
  );

  const initMessage = `リンク作成対象ディレクトリ${srcDirs.map(typedBasename).join(',')} `;
  const separator = '///////////////////////////////';
  console.log(chalk.red(separator));
  console.log(chalk.bgGreen(initMessage));
  console.log(chalk.red(separator));
  // 準備ここまで

  // リンク作成ここから
  const result = (
    await Promise.all(
      srcDirs.map((dirTarget) => processDirectory(dirTarget, binDir))
    )
  ).reduce(resultReducer, genResult());

  if (result.skipped.length > 0) {
    console.log(
      chalk.bgYellow('以下のスクリプトはリンク作成をスキップしました。\n'),
    );
    console.log(chalk.yellow(logTheTable(result.skipped)));
  }

  if (result.error) {
    console.log(
      chalk.bgRed(
        'エラーが発生しています。\n以下のスクリプトについて、シンボリックリンクの作成に失敗しました。\n',
      ),
    );
    console.log(chalk.yellow(logTheTable(result.notCreated)));
  }
  console.log(
    chalk.bgGreen(
      '以下のスクリプトについて、シンボリックリンクの作成に成功しました。\n',
    ),
  );
  if (result.created.length === 0) {
    console.log('なし\n');
  } else {
    console.log(chalk.green(logTheTable(result.created)));
  }
  // リンク作成ここまで

  // Permission
  console.log('\nスクリプトのパーミッション設定を行います。');
  const chmodResultBinDir = await $`chmod -R 755 ${binDir}`;
  const chmodResultSrcDir = await $`chmod -R 755 ${srcDir}`;
  if (chmodResultBinDir.exitCode === 0 && chmodResultSrcDir.exitCode === 0) {
    console.log('パーミッションの変更に成功しました。');
  } else {
    console.log('パーミッションの変更に失敗しました。');
    if (chmodResultBinDir.stderr) console.log(chmodResultBinDir.stderr);
    if (chmodResultSrcDir.stderr) console.log(chmodResultSrcDir.stderr);
  }

  // Exit
  console.log('プログラムを終了します。');
  process.exit(result.error ? 1 : 0);
})();
