// deno-lint-ignore-file no-explicit-any
import $, { CommandResult } from 'https://deno.land/x/dax@0.35.0/mod.ts';
import { dirname, join } from 'https://deno.land/std@0.209.0/path/mod.ts';
import chalk from 'https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js';
import { path } from 'https://deno.land/x/dax@0.35.0/src/deps.ts';

const chalk_ = chalk as any;

type Result = {
  message: string;
  error: boolean;
  created: string[];
  notCreated: string[];
};

const genResult = (): Result => ({
  message: '',
  error: false,
  created: [],
  notCreated: [],
});

const solveOneDir = async (targetDir: string, binDir: string) => {
  const scripts = Deno.readDir(targetDir);
  const result = genResult();
  for await (const script of scripts) {
    if (script.isFile && !['deploy', 'hinagata'].includes(script.name.split('.')[0])) {
      const scriptPath = join(targetDir, script.name);
      const scriptNameWithoutExt = script.name.split('.')[0];
      const binPath = join(binDir, scriptNameWithoutExt);
      const logname = scriptPath.split('/').slice(-3).join('/');
      try {
        const symlinkCreationResult = await $`ln -s ${scriptPath} ${binPath}`;
        if (symlinkCreationResult.code === 0) {
          result.created.push(logname);
        } else {
          result.notCreated.push(logname);
          result.error = true;
        }
      } catch (error) {
        console.log(error.message);
        result.notCreated.push(logname);
        result.error = true;
      }
    }
  }
  return result;
};

const solveTSDir = async (targetDir: string, binDir: string) => {
  const scripts = Deno.readDir(targetDir);
  const result = genResult();
  const ifDeno = targetDir.includes('deno');
  for await (const script of scripts) {
    if (script.isFile && script.name.endsWith('.ts') && !['deploy', 'hinagata'].includes(script.name.split('.')[0])) {
      const scriptPath = join(targetDir, script.name);
      const scriptNameWithoutExt = script.name.split('.')[0];
      const binPath = join(binDir, scriptNameWithoutExt);
      const logname = scriptPath.split('/').slice(-3).join('/');
      try {
        let compileResult:CommandResult | undefined = undefined;
        if(ifDeno){
          compileResult = await $`deno compile --allow-all --output ${binPath} ${scriptPath}`;
        } 
        if (compileResult.code === 0) {
          result.created.push(logname);
        } else {
          result.notCreated.push(logname);
          result.error = true;
        }
      } catch (error) {
        console.log(error.message);
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
};

const isPathSet = (binDir: string) => {
  const path = Deno.env.get('PATH') ?? '';
  return path.split(':').includes(binDir);
};

const getShell = () => {
  const shell = Deno.env.get('SHELL') ?? '';
  return shell.includes('zsh') ? 'zsh' : shell.includes('bash') ? 'bash' : 'unknown';
};

const logTheTable = (t: string[]) => {
  const result = t.reduce((acc, cur) => {
    return (acc += `- ${cur} \n`);
  }, '');
  return result + '\n';
};

const updateShellConfig = async (shell: string, binDir: string) => {
  const homeDir = Deno.env.get('HOME');
  if (!homeDir) {
    console.log('エラーが発生しました: 環境変数 $HOME が設定されていません。');
    return;
  }
  try {
    if (!(await Deno.stat(binDir)).isDirectory) throw new Error(`binDir(${binDir}) is not a directory.`);
    const keyword = `export PATH="${binDir}:$PATH"\n`;
    const configFile = shell === 'zsh' ? `${homeDir}/.zshrc` : `${homeDir}/.bashrc`;
    console.log(`以下の内容を ${configFile} に追加します: \n${keyword}\n`);
    if (await $.confirm('変更を適用してよろしいですか？')) {
      await Deno.writeTextFile(configFile, keyword, { append: true });
      await Deno.writeTextFile(configFile, '\n', { append: true });
      console.log(`${configFile} が更新されました。`);
    } else {
      console.log('変更はキャンセルされました。');
    }
  } catch (error) {
    console.log(`エラーが発生しました: 指定されたパス(${binDir}) にアクセスできません。`);
    console.error(error);
  }
};

const resultReducer = (acc: Result, cur: Result): Result => ({
  ...acc,
  created: [...acc.created, ...cur.created],
  notCreated: [...acc.notCreated, ...cur.notCreated],
  error: acc.error || cur.error,
});

(async () => {
  //準備ここから
  const srcDir = new URL('.', import.meta.url).pathname;
  checkScript(srcDir);

  const commandsDir = dirname(srcDir);
  const binDir = join(commandsDir, 'bin');
  const srcDirs = ['py', 'shell'].map((dir) => join(srcDir, dir));
  const tsDir = path.join(srcDir, 'ts');
  const denoDir = path.join(tsDir, 'deno');
  const bunDir = path.join(tsDir, 'bun');
  const tsDirs = [denoDir, bunDir];
  //準備ここまで
  // リンク、コンパイルここから
  const result = [
    ...(await Promise.all(srcDirs.map((srcDir) => solveOneDir(srcDir, binDir)))),
    ...(await Promise.all(tsDirs.map((srcDir) => solveTSDir(srcDir, binDir)))),
  ].reduce(resultReducer, genResult());

  if (result.error) {
    console.log(
      chalk_.bgRed('エラーが発生しています。\n以下のスクリプトについて、シンボリックリンクの作成に失敗しました。\n')
    );
    console.log(chalk_.yellow(logTheTable(result.notCreated)));
  }
  console.log(chalk_.bgGreen('以下のスクリプトについて、シンボリックリンクの作成に成功しました。\n'));
  if (result.created.length === 0) {
    console.log('なし\n');
  } else {
    console.log(chalk_.green(logTheTable(result.created)));
  }
  // リンク、コンパイルここまで
  //PATH
  console.log('\nPATH設定に移ります');
  if (!isPathSet(binDir)) {
    await updateShellConfig(getShell(), binDir);
  } else {
    console.log('PATHは既に設定されています。');
  }
  //Permission
  console.log('\nスクリプトのパーミッション設定を行います。');
  const chmodResult = await $`chmod -R 755 ${binDir}`;
  if (chmodResult.code === 0) {
    console.log('パーミッションの変更に成功しました。');
  } else {
    console.log('パーミッションの変更に失敗しました。');
  }
  //Exit
  console.log('プログラムを終了します。');
  Deno.exit(result.error ? 1 : 0);
})();
