#!/usr/bin/env bun

import path from 'node:path';
import { parseArgs } from 'node:util';
import { $ } from 'bun';
import Enquirer from 'enquirer';

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    config: { type: 'boolean', short: 'c' },
    no: { type: 'boolean', short: 'n' },
    help: { type: 'boolean', short: 'h' },
    info: { type: 'boolean', short: 'i' },
  },
  strict: true,
  allowPositionals: true,
});

const homeDir = Bun.env.HOME;
if (homeDir === undefined) {
  console.error('HOME environment variable is not set.');
  process.exit(1);
}

type GithubLoginEntry = {
  configname: string;
  username: string;
  gitconfigPath: string;
  secKeyPath: string;
  pubKeyPath: string;
};

if (Bun.env.COMMANDS_INSTALL === undefined) {
  throw new Error('COMMANDS_INSTALL is undefined');
}

const chghConfigFilePath = path.join(
  Bun.env.COMMANDS_INSTALL,
  'configs',
  'chgh.json',
);
const configPath = path.join(homeDir, '.ssh', 'config');

const getGithubLoginEntry = async () => {
  const loginEntryFile = Bun.file(chghConfigFilePath);
  if (await loginEntryFile.exists()) {
    const loginEntryJsonAry: GithubLoginEntry[] = await loginEntryFile.json();
    return loginEntryJsonAry;
  }
  return undefined;
};

const getCurrentSSHConfigContent = async (): Promise<string[]> =>
  (await Bun.file(configPath).text()).split('\n').map((line) => {
    if (line.trim() === '') {
      return '';
    }
    if (line.startsWith('Host ')) {
      return line.trim();
    }
    return `  ${line.trim()}`;
  });

const selectNewIndexWithoutPrompt = (currentIndex: number, max: number) => {
  if (max <= 1) {
    throw new Error(
      'There should be more than one GitHub login entry to choose a different one.',
    );
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
    console.error(
      `GitHubのログイン情報が設定されていないか、読み込めません。\n設定ファイル: $COMMANDS_INSTALL/config/chgh.json [${chghConfigFilePath}]`,
    );
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
    console.error(
      `以下のファイルが存在しません。\n${notExistFiles.join('\n')}\n設定ファイル: $COMMANDS_INSTALL/config/chgh.json [${chghConfigFilePath}]`,
    );
    process.exit(1);
  }
  return githubLoginEntries;
};

const showCurrentUser = async () => {
  console.log('現在のユーザー情報を確認します...');
  const githubLoginEntries = await checkGithubLoginEntries();
  const configContentLines = await getCurrentSSHConfigContent();
  
  const githubIdentityFileName = configContentLines.find(
    (line) => line.includes('IdentityFile') && line.includes('github'),
  );
  
  if (githubIdentityFileName === undefined) {
    console.error('GitHub用のSSH鍵が設定されていません。');
    return;
  }
  
  const githubIdentityFilePath = githubIdentityFileName.trim().split(' ')[1];
  const githubIdentityFileNameWithoutPath = path.basename(githubIdentityFilePath);
  const currentEntry = githubLoginEntries.find((entry) =>
    entry.secKeyPath.includes(githubIdentityFileNameWithoutPath),
  );
  
  if (currentEntry === undefined) {
    console.error('設定されているGitHub用のSSH鍵が見つかりません。');
    return;
  }
  
  console.log(`現在のGitHubユーザー: ${currentEntry.configname}`);
  console.log(`ユーザー名: ${currentEntry.username}`);
  console.log(`SSH鍵: ${currentEntry.secKeyPath}`);
  console.log(`Git設定: ${currentEntry.gitconfigPath}`);
};

const showHelp = () => {
  console.log('Usage: chgh [-c] [-n] [-h] [-i] or chgh [-cn]');
  console.log('Options:');
  console.log('  -c: format ssh config file');
  console.log('  -n: No prompt & slide ssh settings');
  console.log('  -h: Show help');
  console.log('  -i: Show current user information');
};

const migrateToNewConfig = async (newGithubLoginEntry: GithubLoginEntry) => {
  console.log(
    `Change Github Identity into [${newGithubLoginEntry.configname}]`,
  );
  console.log(
    `新しいGitHub用のSSH鍵を設定します。\nNew SSH key: ${newGithubLoginEntry.secKeyPath}`,
  );
  const newConfigContentLines = (await getCurrentSSHConfigContent()).map(
    (line) =>
      line.includes('IdentityFile') && line.includes('github')
        ? `  IdentityFile ${newGithubLoginEntry.secKeyPath}`
        : line,
  );
  await Bun.write(configPath, newConfigContentLines.join('\n'));
  console.log('gitconfigを差し替えます。');
  return $`cd ${homeDir} && unlink .gitconfig && ln -s ${newGithubLoginEntry.gitconfigPath} .gitconfig`;
};

(async () => {
  if (values.help) {
    showHelp();
    process.exit(0);
  }
  if (values.info) {
    await showCurrentUser();
    process.exit(0);
  }
  console.log('chgh設定情報を確認します...');
  const githubLoginEntries = await checkGithubLoginEntries();
  console.log('現在のSSH設定を確認します...');
  const configContentLines = await getCurrentSSHConfigContent();
  if (values.config) {
    console.log('SSH設定ファイルを整理します...');
    await Bun.write(configPath, configContentLines.join('\n'));
  }
  // githubの鍵を探すプログラムが薄い
  const githubIdentityFileName = configContentLines.find(
    (line) => line.includes('IdentityFile') && line.includes('github'),
  );
  if (githubIdentityFileName === undefined) {
    console.error('GitHub用のSSH鍵が設定されていません。');
    process.exit(1);
  }
  const githubIdentityFilePath = githubIdentityFileName.trim().split(' ')[1];
  const githubIdentityFileNameWithoutPath = path.basename(
    githubIdentityFilePath,
  );
  const indexOfCurrentGithubLoginEntry = githubLoginEntries.findIndex((entry) =>
    entry.secKeyPath.includes(githubIdentityFileNameWithoutPath),
  );
  if (indexOfCurrentGithubLoginEntry === -1) {
    console.error('設定されているGitHub用のSSH鍵が見つかりません。');
    process.exit(1);
  }

  let indexOfNewGithubLoginEntry = selectNewIndexWithoutPrompt(
    indexOfCurrentGithubLoginEntry,
    githubLoginEntries.length,
  );
  if (!values.no) {
    // enquirer
    const question = {
      type: 'select',
      name: 'target',
      message: '切り替え対象のGitHubアカウントを選択してください',
      choices: githubLoginEntries.map((entry) => entry.configname),
    };
    const { target } = (await Enquirer.prompt(question)) as { target: string };
    const indexOfSelectedGithubLoginEntry = githubLoginEntries.findIndex(
      (entry) => entry.configname === target,
    );
    indexOfNewGithubLoginEntry =
      indexOfSelectedGithubLoginEntry !== -1
        ? indexOfSelectedGithubLoginEntry
        : indexOfNewGithubLoginEntry;
  }
  const result = await migrateToNewConfig(
    githubLoginEntries[indexOfNewGithubLoginEntry],
  );
  if (result.exitCode !== 0) {
    console.error('gitconfigの差し替えに失敗しました。');
    process.exit(1);
  } else {
    console.log('gitconfigの差し替えに成功しました。');
  }
  console.log('SSH鍵の差し替えが完了しました。');
})();
