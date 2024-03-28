#!/usr/bin/env bun
import { $ } from 'bun';
import { parseArgs } from 'util';
import path from 'node:path';
const args = parseArgs({
  args: Bun.argv,
  options: {},
  strict: true,
  allowPositionals: true,
});

const homeDir = Bun.env.HOME;

type GithubLoginEntry = {
  configname: string;
  username: string;
  secKeyPath: string;
  pubKeyPath: string;
};

const githubSSHKeys: GithubLoginEntry[] = [
  {
    configname: 'buntinjp',
    username: 'BuntinJP',
    secKeyPath: '/Users/takumi.aoki/ssh/keys/github_buntinjp',
    pubKeyPath: '/Users/takumi.aoki/ssh/keys/github_buntinjp.pub',
  },
  {
    configname: 'buntinliz',
    username: 'Buntin-Liz',
    secKeyPath: '/Users/takumi.aoki/ssh/keys/github_buntinliz',
    pubKeyPath: '/Users/takumi.aoki/ssh/keys/github_buntinliz.pub',
  },
];

const selectRandomNumberInRange = (shouldNotBe: number, max: number) => {
  let random = Math.floor(Math.random() * max);
  while (random === shouldNotBe) {
    random = Math.floor(Math.random() * max);
  }
  return random;
};

(async () => {
  if (homeDir === undefined) {
    console.error('HOME environment variable is not set.');
    process.exit(1);
  }
  const configPath = path.join(homeDir, '.ssh', 'config');
  console.log('SSH鍵を差し替えます。');
  const configContentLines = (await Bun.file(configPath).text()).split('\n').map((line) => line.trim());
  const githubIdentityFileName = configContentLines.find((line) => line.includes('IdentityFile') && line.includes('github_'));
  if (githubIdentityFileName === undefined) {
    console.error('GitHub用のSSH鍵が設定されていません。');
    process.exit(1);
  }
  const githubIdentityFilePath = githubIdentityFileName.split(' ')[1];
  const githubIdentityFileNameWithoutPath = path.basename(githubIdentityFilePath);
  const indexOfCurrentGithubLoginEntry = githubSSHKeys.findIndex((entry) => entry.secKeyPath.includes(githubIdentityFileNameWithoutPath));
  if (indexOfCurrentGithubLoginEntry === -1) {
    console.error('設定されているGitHub用のSSH鍵が見つかりません。');
    process.exit(1);
  }
  const indexOfNewGithubLoginEntry = selectRandomNumberInRange(indexOfCurrentGithubLoginEntry, githubSSHKeys.length);
  const newGithubLoginEntry = githubSSHKeys[indexOfNewGithubLoginEntry];
  console.log(`Change Github Identity into ${newGithubLoginEntry.configname}`);
  console.log(`新しいGitHub用のSSH鍵を設定します。\nNew SSH key: ${newGithubLoginEntry.secKeyPath}`);
  const newConfigContentLines = configContentLines.map((line) => {
    if (line.includes('IdentityFile') && line.includes('github_')) {
      return `  IdentityFile ${newGithubLoginEntry.secKeyPath}`;
    }
    return line;
  });
  console.log(await Bun.write(configPath, newConfigContentLines.join('\n')));

  console.log('gitconfigを差し替えます。');
  const newConfigPath = path.join(homeDir, `.gitconfig.${newGithubLoginEntry.configname}`);
  const newConfigFile = Bun.file(newConfigPath);
  if (await newConfigFile.exists()) {
    console.log(`[.gitconfig.${newGithubLoginEntry.configname}] 存在確認: OK`);
  } else {
    console.log('gitconfig not found.');
    process.exit(1);
  }
  const result1 = await $`cd ${homeDir} && unlink .gitconfig && ln -s ${newConfigPath} .gitconfig`;
  if (result1.exitCode !== 0) {
    console.error('gitconfigの差し替えに失敗しました。');
    process.exit(1);
  } else {
    console.log('gitconfigの差し替えに成功しました。');
  }
  console.log('SSH鍵の差し替えが完了しました。');
  const result2 = await $`ssh -T git@github.com`.text();
  console.log(result2);
})();
