#!/usr/bin/env bun
import { promises as fs, type Dirent, constants as fsConstants } from 'node:fs';
import { basename, dirname, join, parse, relative } from 'node:path';
import { $ } from 'bun';

import os from 'node:os';
import chalk from 'chalk';

const infoPath = join('info.json');

type Result = {
  message: string;
  error: boolean;
  created: string[];
  notCreated: string[];
  skipped: string[];
};

type Info = {
  HOME_DIRECTORY: string;
  USER_NAME: string;
  COMMANDS_INSTALL: string;
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
  options: { ifDeno: boolean; ifBun: boolean },
): Promise<{ logname: string; success: boolean; skip: boolean }> => {
  const scriptPath = join(targetDir, script.name);
  const scriptNameWithoutExt = script.name.split('.')[0];
  const binPath = join(binDir, scriptNameWithoutExt);
  const logname = relative(process.cwd(), scriptPath);

  if (
    ['deploy', 'hinagata'].includes(scriptNameWithoutExt) ||
    script.name.startsWith('_')
  ) {
    return { logname, success: true, skip: true };
  }

  try {
    if (options.ifDeno) {
      const compileResult =
        await $`deno compile --allow-all --output ${binPath} ${scriptPath}`;
      if (compileResult.exitCode !== 0) throw new Error('Deno compile failed');
    } else if (!options.ifBun) {
      await fs.symlink(scriptPath, binPath);
    }
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
  options: { ifDeno: boolean; ifBun: boolean },
): Promise<Result> => {
  const result = genResult();
  const targetDirEnts = await fs.readdir(targetDir, { withFileTypes: true });
  const scripts = targetDirEnts.filter(
    (ent) => ent.isFile() && (!options.ifBun || ent.name.endsWith('.ts')),
  );

  for (const script of scripts) {
    const { logname, success, skip } = await processScript(
      script,
      targetDir,
      binDir,
      options,
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

const isPathSet = (binDir: string) => {
  const path = Bun.env.PATH ?? '';
  return path.split(':').includes(binDir);
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
  const tsDir = join(srcDir, 'ts');
  const denoDir = join(tsDir, 'deno');
  const bunDir = join(tsDir, 'bun');
  const dirsObj = {
    srcDir: srcDir,
    commandsDir: commandsDir,
    binDir: binDir,
    tsDir: tsDir,
    denoDir: denoDir,
    bunDir: bunDir,
  };
  if (process.env.DEBUG === '1') {
    console.log('[debug] dirsObj:', JSON.stringify(dirsObj, null, 2));
  }
  //準備ここから
  const srcDirs = ['py', 'shell', 'applescript'].map((dir) =>
    join(srcDir, dir),
  );
  srcDirs.push(bunDir);
  const srcTSDirs = [denoDir];
  const initMessage = `リンク作成対象ディレクトリ${srcDirs.map(typedBasename).join(',')} \nコンパイル対象ディレクトリ${srcTSDirs.map(typedBasename).join(',')}`;
  const separator = '///////////////////////////////';
  console.log(chalk.red(separator));
  console.log(chalk.bgGreen(initMessage));
  console.log(chalk.red(separator));
  //準備ここまで
  // リンク、コンパイルここから
  const result = [
    //linker
    ...(await Promise.all(
      srcDirs.map((srcDir) =>
        processDirectory(srcDir, binDir, { ifDeno: false, ifBun: false }),
      ),
    )),
    ...(await Promise.all(
      srcTSDirs.map((srcDir) =>
        processDirectory(srcDir, binDir, { ifDeno: true, ifBun: false }),
      ),
    )),
  ].reduce(resultReducer, genResult());

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
  // リンク、コンパイルここまで
  //Permission
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
  //Exit
  console.log('プログラムを終了します。');
  process.exit(result.error ? 1 : 0);
})();
