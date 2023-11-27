#!/usr/bin/env -S deno run -A
import $ from "https://deno.land/x/dax@0.35.0/mod.ts";
import { dirname, join } from "https://deno.land/std/path/mod.ts";

type Result = {
  message: string;
  error: boolean;
  created: string[];
  notCreated: string[];
};

const genResult = (): Result => {
  return {
    message: '',
    error: false,
    created: [] as string[],
    notCreated: [] as string[]
  };
};

const solveOneDir = async (targetDir: string, binDir: string) => {
  // targetDir:stringは、リンク対象があるディレクトリ
  // binDir:stringは、リンクを作成するディレクトリ
  //
  const scripts = Deno.readDir(targetDir);
  const result = genResult();
  for await (const script of scripts) {
    if (script.isFile) {
      const scriptName = script.name;
      const scriptPath = join(targetDir, script.name);
      const scriptNameWithoutExt = scriptName.split('.')[0];
      const binPath = join(binDir, scriptNameWithoutExt);
      const logname = scriptPath.split('/').slice(-3).join('/');
      if (scriptNameWithoutExt === 'deploy' || scriptNameWithoutExt === 'hinagata') continue;
      try {
        const symlinkCreationResult = await $`ln -s ${ scriptPath } ${ binPath }`;
        if (symlinkCreationResult.code === 0) {
          result.created.push(logname);
        } else {
          result.notCreated.push(logname);
          result.error = true;
        }
      } catch (e) {
        const error = e as Error;
        console.log(error.message);
        result.notCreated.push(logname);
        result.error = true;
      }
    }
  }

  return result;
};

const solveDenoDir = async (targetDir: string, binDir: string) => {
  // targetDir:stringは、リンク対象があるディレクトリ
  // binDir:stringは、リンクを作成するディレクトリ
  //
  const scripts = Deno.readDir(targetDir);
  const result = genResult();

  for await (const script of scripts) {
    if (script.isFile) {
      const scriptName = script.name;
      if (scriptName.endsWith('.ts')) {
        const scriptPath = join(targetDir, script.name);
        const scriptNameWithoutExt = scriptName.split('.')[0];
        const binPath = join(binDir, scriptNameWithoutExt);
        const logname = scriptPath.split('/').slice(-3).join('/');
        if (scriptNameWithoutExt === 'deploy' || scriptNameWithoutExt === 'hinagata') continue;
        try {
          const compileResult = await $`deno compile --output ${ binPath } ${ scriptPath }`;
          if (compileResult.code === 0) {
            result.created.push(logname);
          } else {
            result.notCreated.push(logname);
            result.error = true;
          }
        } catch (e) {
          const error = e as Error;
          console.log(error.message);
          result.notCreated.push(logname);
          result.error = true;
        }
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
  const path = Deno.env.get("PATH") ?? "";
  return path.split(":").includes(binDir);
};

const getShell = (): string => {
  // この関数はユーザーのデフォルトシェルを返します
  const shell = Deno.env.get("SHELL") ?? "";
  if (shell.includes("zsh")) {
    return "zsh";
  } else if (shell.includes("bash")) {
    return "bash";
  }
  return "unknown";
};

const updateShellConfig = async (shell: string, binDir: string) => {
  const homeDir = Deno.env.get("HOME");
  if (!homeDir) {
    console.log("エラーが発生しました: 環境変数 $HOME が設定されていません。");
    return;
  }
  try {
    const ifStatBin = await Deno.stat(binDir);
    if (!ifStatBin.isDirectory) throw new Error(`binDir(${ binDir }) is not a directory.`);
    const keyword = `export PATH = "${ binDir }:$PATH"\n`;
    const configFile = shell === "zsh" ? `${ homeDir } /.zshrc` : `${ homeDir }/.bashrc`;
    console.log(`以下の内容を ${ configFile } に追加します: \n${ keyword } \n`);
    const confirm = await $.confirm('変更を適用してよろしいですか？');
    if (confirm) {
      await Deno.writeTextFile(configFile, keyword, { append: true });
      await Deno.writeTextFile(configFile, '\n', { append: true });
      console.log(`${ configFile } が更新されました。`);
    } else {
      console.log("変更はキャンセルされました。");
    }
  } catch (error) {
    console.log(`エラーが発生しました: 指定されたパス(${ binDir }) にアクセスできません。`);
    console.error(error);
  }
};

const resultReducer = (results: Result[]) => {
  return results.reduce((acc, cur) => {
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
};

////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////|MAIN|/////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

(async () => {
  const srcDir = new URL('.', import.meta.url).pathname;
  checkScript(srcDir);

  const commandsDir = dirname(srcDir);
  const binDir = join(commandsDir, 'bin');
  const srcDirs = ["py", "shell"].map((dir) => join(srcDir, dir));
  const denoDirs = ["ts"].map((dir) => join(srcDir, dir));
  const results = srcDirs.map((srcDir) => solveOneDir(srcDir, binDir));
  const results_of_deno = denoDirs.map((srcDir) => solveDenoDir(srcDir, binDir));
  const resultsResolved = await Promise.all(results);
  const results_of_deno_resolved = await Promise.all(results_of_deno);
  const result_ = resultReducer(resultsResolved);
  const result_of_deno = resultReducer(results_of_deno_resolved);
  const result = resultReducer([result_, result_of_deno]);
  if (result.error) {
    result.message = 'エラーが発生しています。\n以下のスクリプトについて、シンボリックリンクの作成に失敗しました。\n例)既にリンクが存在する  ->  prune_bin\n';
    result.message += result.notCreated.join('\n');
  }
  result.message += '以下のスクリプトについて、シンボリックリンクの作成に成功しました。\n';
  result.message += result.created.join('\n');
  if (result.created.length === 0) result.message += 'なし\n';
  console.log(result.message);
  console.log('\n');
  console.log('PATH設定に移ります');

  const isPathSetResult = isPathSet(binDir);
  console.log(`binDir(${ binDir })はPATHに[[${ isPathSetResult ? '存在します' : '存在しません' }]]`);
  if (!isPathSetResult) {
    const shell = getShell();
    await updateShellConfig(shell, binDir);
  } else {
    console.log('PATHは既に設定されています。');
  }
  console.log('プログラムを終了します。');
  Deno.exit(result.error ? 1 : 0);
})();

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