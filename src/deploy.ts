import $ from "https://deno.land/x/dax@0.35.0/mod.ts";
import { dirname, join } from "https://deno.land/std/path/mod.ts";

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
  notCreated: []
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
        const symlinkCreationResult = await $`ln -s ${ scriptPath } ${ binPath }`;
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

const solveDenoDir = async (targetDir: string, binDir: string) => {
  const scripts = Deno.readDir(targetDir);
  const result = genResult();
  for await (const script of scripts) {
    if (script.isFile && script.name.endsWith('.ts') && !['deploy', 'hinagata'].includes(script.name.split('.')[0])) {
      const scriptPath = join(targetDir, script.name);
      const scriptNameWithoutExt = script.name.split('.')[0];
      const binPath = join(binDir, scriptNameWithoutExt);
      const logname = scriptPath.split('/').slice(-3).join('/');
      try {
        const compileResult = await $`deno compile --allow-all --output ${ binPath } ${ scriptPath }`;
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
  const path = Deno.env.get("PATH") ?? "";
  return path.split(":").includes(binDir);
};

const getShell = () => {
  const shell = Deno.env.get("SHELL") ?? "";
  return shell.includes("zsh") ? "zsh" : shell.includes("bash") ? "bash" : "unknown";
};

const updateShellConfig = async (shell: string, binDir: string) => {
  const homeDir = Deno.env.get("HOME");
  if (!homeDir) {
    console.log("エラーが発生しました: 環境変数 $HOME が設定されていません。");
    return;
  }
  try {
    if (!(await Deno.stat(binDir)).isDirectory) throw new Error(`binDir(${ binDir }) is not a directory.`);
    const keyword = `export PATH="${ binDir }:$PATH"\n`;
    const configFile = shell === "zsh" ? `${ homeDir }/.zshrc` : `${ homeDir }/.bashrc`;
    console.log(`以下の内容を ${ configFile } に追加します: \n${ keyword }\n`);
    if (await $.confirm('変更を適用してよろしいですか？')) {
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

const resultReducer = (acc: Result, cur: Result): Result => ({
  ...acc,
  created: [...acc.created, ...cur.created],
  notCreated: [...acc.notCreated, ...cur.notCreated],
  error: acc.error || cur.error
});

(async () => {
  const srcDir = new URL('.', import.meta.url).pathname;
  checkScript(srcDir);

  const commandsDir = dirname(srcDir);
  const binDir = join(commandsDir, 'bin');
  const srcDirs = ["py", "shell"].map(dir => join(srcDir, dir));
  const denoDirs = ["ts"].map(dir => join(srcDir, dir));

  const result = [
    ...await Promise.all(srcDirs.map(srcDir => solveOneDir(srcDir, binDir))),
    ...await Promise.all(denoDirs.map(srcDir => solveDenoDir(srcDir, binDir)))
  ].reduce(resultReducer, genResult());

  result.message += `以下のスクリプトについて、シンボリックリンクの作成に成功しました。\n${ result.created.join('\n') }`;
  if (result.created.length === 0) result.message += 'なし\n';
  console.log(result.message);

  console.log('\nPATH設定に移ります');

  if (!isPathSet(binDir)) {
    await updateShellConfig(getShell(), binDir);
  } else {
    console.log('PATHは既に設定されています。');
  }

  console.log('プログラムを終了します。');
  Deno.exit(result.error ? 1 : 0);
})();
