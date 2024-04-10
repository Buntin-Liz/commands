#!/usr/bin/env bun
import { $ } from 'bun';
import { Dirent, promises as fs, constants as fsConstants } from 'fs';
import { join, basename, dirname, parse, relative } from 'node:path';

import chalk from 'chalk';
import os from 'os';

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

const processScript = async (script: Dirent, targetDir: string, binDir: string, options: { ifDeno: boolean; ifBun: boolean }): Promise<{ logname: string; success: boolean; skip: boolean }> => {
  const scriptPath = join(targetDir, script.name);
  const scriptNameWithoutExt = script.name.split('.')[0];
  const binPath = join(binDir, scriptNameWithoutExt);
  const logname = relative(process.cwd(), scriptPath);

  if (['deploy', 'hinagata'].includes(scriptNameWithoutExt) || script.name.startsWith('_')) {
    return { logname, success: true, skip: true };
  }

  try {
    if (options.ifDeno) {
      const compileResult = await $`deno compile --allow-all --output ${binPath} ${scriptPath}`;
      if (compileResult.exitCode !== 0) throw new Error('Deno compile failed');
    } else if (!options.ifBun) {
      await fs.symlink(scriptPath, binPath);
    }
    return { logname, success: true, skip: false };
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'An unknown error occurred');
    return { logname, success: false, skip: false };
  }
};

const processDirectory = async (targetDir: string, binDir: string, options: { ifDeno: boolean; ifBun: boolean }): Promise<Result> => {
  const result = genResult();
  const targetDirEnts = await fs.readdir(targetDir, { withFileTypes: true });
  const scripts = targetDirEnts.filter((ent) => ent.isFile() && (!options.ifBun || ent.name.endsWith('.ts')));

  for (const script of scripts) {
    const { logname, success, skip } = await processScript(script, targetDir, binDir, options);
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

/* 

const solveOneDir = async (
  targetDir: string,
  binDir: string
): Promise<Result> => {
  const result = genResult();
  const targetDirEnts = await fs.readdir(targetDir, { withFileTypes: true });
  const scripts = targetDirEnts.filter((ent) => ent.isFile());
  for (const script of scripts) {
    const scriptPath = join(targetDir, script.name);
    const scriptNameWithoutExt = script.name.split('.')[0];
    const binPath = join(binDir, scriptNameWithoutExt);
    const logname = relative(process.cwd(), scriptPath);
    console.log('scriptPath', scriptPath);
    console.log('scriptNameWithoutExt', scriptNameWithoutExt);
    console.log('binPath', binPath);
    console.log('logname', logname);
    console.log('parsed');
    const parsed = parse(scriptPath);
    console.log(JSON.stringify(parsed, null, 2));
    if (['deploy', 'hinagata'].includes(scriptNameWithoutExt)) {
      // 無視
      continue;
    }
    if (script.name.startsWith('_')) {
      // 処理スキップ
      result.skipped.push(script.name);
      continue;
    }
    try {
      await fs.symlink(scriptPath, binPath);
      result.created.push(logname);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('error is not instance of Error.');
      }
      result.notCreated.push(logname);
      result.error = true;
    }
  }
  return result;
};

const solveTSDir = async (targetDir: string, binDir: string) => {
  const result = genResult();
  const ifDeno = targetDir.includes('deno');
  const ifBun = targetDir.includes('bun');

  const targetDirEnts = await fs.readdir(targetDir, { withFileTypes: true });
  const scripts = targetDirEnts.filter(
    (ent) => ent.isFile() && ent.name.endsWith('.ts')
  );
  for (const script of scripts) {
    const scriptPath = join(targetDir, script.name);
    const scriptNameWithoutExt = script.name.split('.')[0];
    const binPath = join(binDir, scriptNameWithoutExt);
    const logname = relative(process.cwd(), scriptPath);
    console.log('scriptPath', scriptPath);
    console.log('scriptNameWithoutExt', scriptNameWithoutExt);
    console.log('binPath', binPath);
    console.log('logname', logname);
    console.log('parsed');
    const parsed = parse(scriptPath);
    console.log(JSON.stringify(parsed, null, 2));
    if (['deploy', 'hinagata'].includes(scriptNameWithoutExt)) {
      continue;
    }
    if (script.name.startsWith('_')) {
      result.skipped.push(script.name);
      continue;
    }
    try {
      let compileResult: ShellOutput | undefined = undefined;
      if (ifDeno) {
        compileResult =
          await $`deno compile --allow-all --output ${binPath} ${scriptPath}`;
        if (compileResult.exitCode === 0) {
          result.created.push(logname);
        } else {
          result.notCreated.push(logname);
          result.error = true;
        }
      } else if (ifBun) {
        console.log(
          'this dir is ignored. Now, Bun scripts should be linked as "not compiled".'
        );
      } else {
        console.log('this dir is ignored. not deno nor bun.');
      }
      //
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('error is not instance of Error.');
      }
      result.notCreated.push(logname);
      result.error = true;
    }
  }
  return result;
};

*/

const isPathSet = (binDir: string) => {
  const path = Bun.env.PATH ?? '';
  return path.split(':').includes(binDir);
};

const getShell = () => {
  const shell = os.userInfo().shell ?? '';
  return shell.includes('zsh') ? 'zsh' : shell.includes('bash') ? 'bash' : 'unknown';
};

const updateShellConfig = async (shell: string, binDir: string): Promise<void> => {
  const homeDir = os.homedir();
  if (!homeDir) {
    console.log('エラーが発生しました: 環境変数 $HOME が設定されていません。');
    return;
  } else if (!shell) {
    console.log('エラーが発生しました: 環境変数 $SHELL が設定されていません。');
    return;
  } else {
    console.log(`$HOME: ${homeDir}`);
    console.log(`$SHELL: ${shell}`);
  }
  const configFile = shell.includes('zsh') ? join(homeDir, '.zshrc') : join(homeDir, '.bashrc');
  const keyword = `export PATH="${binDir}:$PATH"\n`;

  try {
    await fs.appendFile(configFile, keyword);
    console.log(`${configFile} が更新されました。`);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log('エラーが発生しました。');
    }
  }
};
// const updateShellConfig = async (shell: string, binDir: string) => {
//   const homeDir = Deno.env.get('HOME');
//   if (!homeDir) {
//     console.log('エラーが発生しました: 環境変数 $HOME が設定されていません。');
//     return;
//   }
//   try {
//     if (!(await Deno.stat(binDir)).isDirectory)
//       throw new Error(`binDir(${binDir}) is not a directory.`);
//     const keyword = `export PATH="${binDir}:$PATH"\n`;
//     const configFile =
//       shell === 'zsh' ? `${homeDir}/.zshrc` : `${homeDir}/.bashrc`;
//     console.log(`以下の内容を ${configFile} に追加します: \n${keyword}\n`);
//     if (await $.confirm('変更を適用してよろしいですか？')) {
//       await Deno.writeTextFile(configFile, keyword, { append: true });
//       await Deno.writeTextFile(configFile, '\n', { append: true });
//       console.log(`${configFile} が更新されました。`);
//     } else {
//       console.log('変更はキャンセルされました。');
//     }
//   } catch (error) {
//     console.log(
//       `エラーが発生しました: 指定されたパス(${binDir}) にアクセスできません。`
//     );
//     console.error(error);
//   }
// };

//Deno API 不使用
const logTheTable = (t: string[]) => {
  const result = t.reduce((acc, cur) => {
    return (acc += `- ${cur} \n`);
  }, '');
  return result + '\n';
};

const resultReducer = (acc: Result, cur: Result): Result => ({
  ...acc,
  created: [...acc.created, ...cur.created],
  notCreated: [...acc.notCreated, ...cur.notCreated],
  skipped: [...acc.skipped, ...cur.skipped],
  error: acc.error || cur.error,
});
const typedBasename = (pathString: string): string => basename(pathString);

const setInfo = async () => {
  //pwd
  try {
    const COMMANDS_INSTALL = (await $`pwd`.text()).trim();
    const HOME_DIRECTORY = os.homedir().trim();
    const USER_NAME = os.userInfo().username.trim();
    const info = { HOME_DIRECTORY, USER_NAME, COMMANDS_INSTALL };
    const res = await Bun.write(infoPath, JSON.stringify(info, null, 2));
    return 0;
  } catch {
    return 1;
  }
};
const getInfo = async () => {
  const info = await Bun.file(infoPath).text();
  return JSON.parse(info) as Info;
};

const checkInfo = async () => {
  try {
    const info = Bun.file(infoPath);
    if (await info.exists()) {
      return 0;
    } else {
      console.log(chalk.bgRed('commands設定ファイルが見つかりませんでした。生成します。\n'));
      const res = await setInfo();
      if (res === 0) {
        console.log('info.jsonの生成に成功しました。');
        return 0;
      } else {
        console.log('info.jsonの生成に失敗しました。');
        return -1;
      }
    }
  } catch {
    return -1;
  }
};

const checkEnvVars = async () => {
  const info = await getInfo();
  const COMMANDS_INSTALL = Bun.env.COMMANDS_INSTALL;
  const SHELL_CONFIG = join(Bun.env.HOME || '/User/takumi.aoki', '.zshrc');
  if (COMMANDS_INSTALL === undefined) {
    const keyword = `\n## commands install\nexport COMMANDS_INSTALL="${info.COMMANDS_INSTALL}"\n`;
    try {
      await fs.appendFile(SHELL_CONFIG, keyword);
      console.log(`${SHELL_CONFIG} が更新されました。`);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log('エラーが発生しました。');
      }
    } finally {
      return -1;
    }
  } else {
    console.log('環境変数 COMMANDS_INSTALL は既に設定されています。');
    return 0;
  }
};

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
  await checkInfo();
  const srcDirs = ['py', 'shell'].map((dir) => join(srcDir, dir));
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
    ...(await Promise.all(srcDirs.map((srcDir) => processDirectory(srcDir, binDir, { ifDeno: false, ifBun: false })))),
    ...(await Promise.all(srcTSDirs.map((srcDir) => processDirectory(srcDir, binDir, { ifDeno: true, ifBun: false })))),
  ].reduce(resultReducer, genResult());

  if (result.skipped.length > 0) {
    console.log(chalk.bgYellow('以下のスクリプトはリンク作成をスキップしました。\n'));
    console.log(chalk.yellow(logTheTable(result.skipped)));
  }

  if (result.error) {
    console.log(chalk.bgRed('エラーが発生しています。\n以下のスクリプトについて、シンボリックリンクの作成に失敗しました。\n'));
    console.log(chalk.yellow(logTheTable(result.notCreated)));
  }
  console.log(chalk.bgGreen('以下のスクリプトについて、シンボリックリンクの作成に成功しました。\n'));
  if (result.created.length === 0) {
    console.log('なし\n');
  } else {
    console.log(chalk.green(logTheTable(result.created)));
  }
  // リンク、コンパイルここまで
  //PATH
  console.log('\nPATH設定に移ります');
  if (!isPathSet(binDir)) {
    await updateShellConfig(getShell(), binDir);
  } else {
    console.log('PATHは既に設定されています。');
  }
  // //Permission
  // console.log('\nスクリプトのパーミッション設定を行います。');
  // const chmodResultBinDir = await $`chmod -R 755 ${binDir}`;
  // const chmodResultSrcDir = await $`chmod -R 755 ${srcDir}`;
  // if (chmodResultBinDir.exitCode === 0 && chmodResultSrcDir.exitCode === 0) {
  //   console.log('パーミッションの変更に成功しました。');
  // } else {
  //   console.log('パーミッションの変更に失敗しました。');
  //   if (chmodResultBinDir.stderr) console.log(chmodResultBinDir.stderr);
  //   if (chmodResultSrcDir.stderr) console.log(chmodResultSrcDir.stderr);
  // }
  //Info
  console.log('\ninfo.jsonを更新します。');
  const infoResult = await setInfo();
  if (infoResult === 0) {
    console.log('info.jsonの更新に成功しました。');
  } else {
    console.log('info.jsonの更新に失敗しました。');
  }
  //環境変数関連
  const envStatus = await checkEnvVars();
  console.log();
  //Exit
  console.log('プログラムを終了します。');
  process.exit(result.error ? 1 : 0);
})();
