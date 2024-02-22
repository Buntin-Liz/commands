#!/usr/bin/env bun
import os from 'os';
import { parseArgs } from 'util';

const HOME_DIR = os.homedir();

const parsed = parseArgs({
  args: Bun.argv,
  options: {
    all: {
      type: 'boolean',
      short: 'a',
    },
    port: {
      type: 'boolean',
      short: 'p',
    },
    user: {
      type: 'boolean',
      short: 'u',
    },
    option: {
      type: 'boolean',
      short: 'o',
    },
    short: {
      type: 'boolean',
      short: 's',
    },
  },
  strict: true,
  allowPositionals: true,
});

type Host = {
  alias: string[];
  hostname: string;
  user: string;
  port: number;
  identityFile: string;
  keys: string[];
  contents: string[];
};

type Ops = {
  all: boolean;
  port: boolean;
  user: boolean;
  option: boolean;
  short: boolean;
};

const parseOptions = (): Ops => {
  const options = {
    all: !!parsed.values.all,
    port: !!parsed.values.port,
    user: !!parsed.values.user,
    option: !!parsed.values.option,
    short: !!parsed.values.short,
  };
  options.port = options.port || options.all;
  options.user = options.user || options.all;
  options.option = options.option || options.all;
  return options;
};

const parseLine = (host: Host, line: string): void => {
  const actions: { [key: string]: () => void } = {
    Host: () => (host.alias = line.replace('Host ', '').split(' ')),
    HostName: () => (host.hostname = line.replace('HostName ', '').trim()),
    Hostname: () => (host.hostname = line.replace('Hostname ', '').trim()),
    User: () => (host.user = line.replace('User ', '').trim()),
    Port: () => (host.port = parseInt(line.replace('Port ', ''), 10)),
    IdentityFile: () => (host.identityFile = line.replace('IdentityFile ', '').trim()),
    '#': () => {
      const [key, value] = line.replace('#', '').split(' ');
      host.keys.push(key);
      host.contents.push(value);
    },
  };

  const command = line.split(' ')[0];
  if (actions[command]) {
    actions[command]();
  }
};

const parseHost = (hostSection: string): Host => {
  const lines = hostSection.split('\n').map((line) => line.trim());
  const host: Host = {
    alias: [],
    hostname: '',
    user: '',
    port: 22,
    identityFile: '',
    keys: [],
    contents: [],
  };
  lines.forEach((line) => parseLine(host, line));
  return host;
};

const splitByHosts = (data: string): string[] => {
  const lines = data.split('\n');
  const hostSections: string[] = [];
  let currentSection = '';
  for (const line of lines) {
    if (line.startsWith('Host ')) {
      if (currentSection.trim() !== '') {
        hostSections.push(currentSection.trim());
        currentSection = '';
      }
    }
    currentSection += line + '\n';
  }
  if (currentSection.trim() !== '') {
    hostSections.push(currentSection.trim());
  }
  return hostSections;
};

const calculateMaxLengths = (hosts: Host[]) => {
  let maxAliasLength = 0;
  let maxHostnameLength = 0;
  let maxPortLength = 0;
  let maxUserLength = 0;
  hosts.forEach((host) => {
    if (JSON.stringify(host.alias).length > maxAliasLength) {
      maxAliasLength = JSON.stringify(host.alias).length;
    }
    if (host.hostname.length > maxHostnameLength) {
      maxHostnameLength = host.hostname.length;
    }
    if (host.port.toString().length > maxPortLength) {
      maxPortLength = host.port.toString().length;
    }
    if (host.user.length > maxUserLength) {
      maxUserLength = host.user.length;
    }
  });
  return [maxAliasLength, maxHostnameLength, maxPortLength, maxUserLength];
};

const printHostInfo = (host: Host, lengths: number[], options: Ops) => {
  let optionInfoData = '';
  if (host.keys.length !== 0) {
    optionInfoData = host.keys.map((key, index) => `${key}:${host.contents[index]}`).join('|');
  }
  const aliasSecondary = host.alias.length === 1 ? host.alias[0] : JSON.stringify(host.alias);
  const aliasStr = aliasSecondary.padEnd(lengths[0]);
  const hostnameStr = host.hostname.padEnd(lengths[1]);
  const portStr = options.port ? `:${host.port.toString().padEnd(lengths[2])}` : '';
  const userStr = options.user ? host.user.padEnd(lengths[3]) : '';
  const opsStr = options.option ? optionInfoData : '';
  if (options.short) {
    console.log(`${aliasStr}`);
  } else {
    console.log(`${aliasStr} ${hostnameStr}${portStr} ${userStr}${opsStr}`);
  }
};

(async () => {
  try {
    const options = parseOptions();
    if (!HOME_DIR) {
      throw new Error('ホームディレクトリが見つかりません');
    }
    const data = Bun.file(`${HOME_DIR}/.ssh/config`);
    if (!(await data.exists())) {
      throw new Error('SSH設定ファイルが見つかりません');
    }
    const content = await data.text();
    const hostSections = splitByHosts(content);
    const hosts = hostSections.map(parseHost);
    const lengths = calculateMaxLengths(hosts);
    for (const host of hosts) {
      printHostInfo(host, lengths, options);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.log('エラーが発生しました。');
    }
  }
})();
