#!/usr/bin/env bun

import { $ } from 'bun';
import { parseArgs } from 'util';
import path from 'node:path';

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    config: { type: 'boolean', short: 'c' },
    no: { type: 'boolean', short: 'n' },
    help: { type: 'boolean', short: 'h' },
  },
  strict: true,
  allowPositionals: true,
});

const homeDir = Bun.env.HOME;

type GithubLoginEntry = {
  configname: string;
  username: string;
  gitconfigPath: string;
  secKeyPath: string;
  pubKeyPath: string;
};

const chghConfigFilePath = path.join(Bun.env.COMMANDS_INSTALL!, 'configs', 'chgh.json');

const getGithubLoginEntry = async () => {
  const loginEntryFile = Bun.file(chghConfigFilePath);
  if (await loginEntryFile.exists()) {
    const loginEntryJsonAry: GithubLoginEntry[] = await loginEntryFile.json();
    return loginEntryJsonAry;
  }
  return undefined;
};

const selectNewIndex = (currentIndex: number, max: number) => {
  if (max <= 1) {
    throw new Error('There should be more than one GitHub login entry to choose a different one.');
  }
  let newIndex = Math.floor(Math.random() * (max - 1));
  if (newIndex >= currentIndex) {
    newIndex++;
  }
  return newIndex;
};

const checkGithubLoginEntries = async (): Promise<GithubLoginEntry[]> => {
  const githubLoginEntries = await getGithubLoginEntry();
  if (githubLoginEntries === undefined) {
    console.error(`GitHubのログイン情報が設定されていないか、読み込めません。\n設定ファイル: $COMMANDS_INSTALL/config/chgh.json [${chghConfigFilePath}]`);
    process.exit(1);
  }
  const notExistFiles: string[] = [];
  for (const entry of githubLoginEntries) {
    if (!(await Bun.file(entry.gitconfigPath).exists())) {
      notExistFiles.push(entry.gitconfigPath);
    }
    if (!(await Bun.file(entry.secKeyPath).exists())) {
      notExistFiles.push(entry.secKeyPath);
    }
    if (!(await Bun.file(entry.pubKeyPath).exists())) {
      notExistFiles.push(entry.pubKeyPath);
    }
  }
  if (notExistFiles.length !== 0) {
    console.error(`以下のファイルが存在しません。\n${notExistFiles.join('\n')}\n設定ファイル: $COMMANDS_INSTALL/config/chgh.json [${chghConfigFilePath}]`);
    process.exit(1);
  }
  return githubLoginEntries;
};

const showHelp = () => {
  console.log('Usage: chgh [-c] [-n] [-h] or chgh [-cn]');
  console.log('Options:');
  console.log('  -c: format ssh config file');
  console.log('  -n: No prompt & slide ssh settings');
  console.log('  -h: Show help');
};

(async () => {
  if (values.help) {
    showHelp();
    process.exit(0);
  }
  if (homeDir === undefined) {
    console.error('HOME environment variable is not set.');
    process.exit(1);
  }
  console.log('chgh設定情報を確認します...');
  const githubLoginEntries = await checkGithubLoginEntries();
  const configPath = path.join(homeDir, '.ssh', 'config');
  console.log('現在のSSH設定を確認します...');
  const configContentLines = (await Bun.file(configPath).text()).split('\n').map((line) => {
    if (line.trim() === '') {
      return '';
    } else if (line.startsWith('Host ')) {
      return line.trim();
    } else {
      return '  ' + line.trim();
    }
  });
  if (values.config) {
    console.log('SSH設定ファイルを整理します...');
    await Bun.write(configPath, configContentLines.join('\n'));
  }

  // githubの鍵を探すプログラムが薄い
  const githubIdentityFileName = configContentLines.find((line) => line.includes('IdentityFile') && line.includes('github'));
  if (githubIdentityFileName === undefined) {
    console.error('GitHub用のSSH鍵が設定されていません。');
    process.exit(1);
  }
  const githubIdentityFilePath = githubIdentityFileName.trim().split(' ')[1];
  const githubIdentityFileNameWithoutPath = path.basename(githubIdentityFilePath);
  const indexOfCurrentGithubLoginEntry = githubLoginEntries.findIndex((entry) => entry.secKeyPath.includes(githubIdentityFileNameWithoutPath));
  if (indexOfCurrentGithubLoginEntry === -1) {
    console.error('設定されているGitHub用のSSH鍵が見つかりません。');
    process.exit(1);
  }
  const indexOfNewGithubLoginEntry = selectNewIndex(indexOfCurrentGithubLoginEntry, githubLoginEntries.length);
  const newGithubLoginEntry = githubLoginEntries[indexOfNewGithubLoginEntry];
  console.log(`Change Github Identity into [${newGithubLoginEntry.configname}]`);
  console.log(`新しいGitHub用のSSH鍵を設定します。\nNew SSH key: ${newGithubLoginEntry.secKeyPath}`);
  const newConfigContentLines = configContentLines.map((line) => {
    // githubの鍵を探すプログラムが薄い
    if (line.includes('IdentityFile') && line.includes('github')) {
      return `  IdentityFile ${newGithubLoginEntry.secKeyPath}`;
    }
    return line;
  });
  await Bun.write(configPath, newConfigContentLines.join('\n'));

  console.log('gitconfigを差し替えます。');
  const newConfigFile = Bun.file(newGithubLoginEntry.gitconfigPath);
  const result1 = await $`cd ${homeDir} && unlink .gitconfig && ln -s ${newGithubLoginEntry.gitconfigPath} .gitconfig`;
  if (result1.exitCode !== 0) {
    console.error('gitconfigの差し替えに失敗しました。');
    process.exit(1);
  } else {
    console.log('gitconfigの差し替えに成功しました。');
  }
  console.log('SSH鍵の差し替えが完了しました。');
})();
