#!/usr/bin/env bun
import os from 'os';
import { parseArgs } from 'util';

const HOME_DIR = os.homedir();

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    all: { type: 'boolean', short: 'a' },
    port: { type: 'boolean', short: 'p' },
    user: { type: 'boolean', short: 'u' },
    option: { type: 'boolean', short: 'o' },
    short: { type: 'boolean', short: 's' },
    help: { type: 'boolean', short: 'h' },
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
  help: boolean;
};

const parseOptions = (values: any): Ops => {
  return {
    all: !!values.all,
    port: !!values.all || !!values.port,
    user: !!values.all || !!values.user,
    option: !!values.all || !!values.option,
    short: !!values.short,
    help: !!values.help,
  };
};

const parseLine = (host: Host, line: string): void => {
  const actions: { [key: string]: () => void } = {
    Host: () => (host.alias = line.replace('Host ', '').split(' ')),
    HostName: () => (host.hostname = line.replace('HostName ', '').trim()),
    Hostname: () => (host.hostname = line.replace('Hostname ', '').trim()),
    User: () => (host.user = line.replace('User ', '').trim()),
    Port: () => (host.port = Number.parseInt(line.replace('Port ', ''), 10)),
    IdentityFile: () =>
      (host.identityFile = line.replace('IdentityFile ', '').trim()),
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
    if (line.startsWith('Host ') && currentSection.trim() !== '') {
      hostSections.push(currentSection.trim());
      currentSection = '';
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
    maxAliasLength = Math.max(
      maxAliasLength,
      JSON.stringify(host.alias).length,
    );
    maxHostnameLength = Math.max(maxHostnameLength, host.hostname.length);
    maxPortLength = Math.max(maxPortLength, host.port.toString().length);
    maxUserLength = Math.max(maxUserLength, host.user.length);
  });
  return [maxAliasLength, maxHostnameLength, maxPortLength, maxUserLength];
};

const printHostInfo = (host: Host, lengths: number[], options: Ops) => {
  let optionInfoData = '';
  if (host.keys.length !== 0) {
    optionInfoData = host.keys
      .map((key, index) => `${key}:${host.contents[index]}`)
      .join('|');
  }
  const aliasSecondary =
    host.alias.length === 1 ? host.alias[0] : JSON.stringify(host.alias);
  const aliasStr = aliasSecondary.padEnd(lengths[0]);
  const hostnameStr = host.hostname.padEnd(lengths[1]);
  const portStr = options.port
    ? `:${host.port.toString().padEnd(lengths[2])}`
    : '';
  const userStr = options.user ? host.user.padEnd(lengths[3]) : '';
  const opsStr = options.option ? optionInfoData : '';
  if (options.short) {
    console.log(`${aliasStr}`);
  } else {
    console.log(`${aliasStr} ${hostnameStr} ${portStr} ${userStr}${opsStr}`);
  }
};

(async () => {
  try {
    const options = parseOptions(values);
    if (options.help) {
      console.log('Usage: sshls [-a] [-p] [-u] [-o] [-s] [-h]');
      console.log('Options:');
      console.log('  -a: Show all information');
      console.log('  -p: Show port information');
      console.log('  -u: Show user information');
      console.log('  -o: Show option information');
      console.log('  -s: Show short information');
      console.log('  -h: Show help');
    } else {
      if (!HOME_DIR) {
        throw new Error('ホームディレクトリが見つかりません');
      }
      const data = Bun.file(`${HOME_DIR}/.ssh/config`);
      if (!(await data.exists())) {
        throw new Error('SSH設定ファイルが見つかりません');
      }
      const query = positionals.slice(2);
      const content = await data.text();
      const hostSections = splitByHosts(content);
      const hosts = hostSections.map(parseHost);
      const lengths = calculateMaxLengths(hosts);
      for (const host of hosts) {
        if (
          query.length === 0 ||
          host.alias.some((alias) => alias.includes(query[0]))
        ) {
          printHostInfo(host, lengths, options);
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.log('エラーが発生しました。');
    }
  }
})();
