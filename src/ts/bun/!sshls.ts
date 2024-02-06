#!/usr/bin/env bun
import { $ } from 'bun';
import os from 'os';
import { parseArgs } from 'util';

const HOME_DIR = os.homedir();

const args = parseArgs({
  args: Bun.argv,
  options: {},
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

const parseLine = (host: Host, line: string): void => {
  const actions: { [key: string]: () => void } = {
    Host: () => (host.alias = line.replace('Host ', '').split(' ')),
    HostName: () => (host.hostname = line.replace('HostName ', '').trim()),
    Hostname: () => (host.hostname = line.replace('Hostname ', '').trim()),
    User: () => (host.user = line.replace('User ', '').trim()),
    Port: () => (host.port = parseInt(line.replace('Port ', ''), 10)),
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

/* const parseHost = (hostSection: string): Host => {
  const lines = hostSection.split('\n');
  //if line has "Host " then host is alias
  let host: Host = {
    alias: [],
    hostname: '',
    user: '',
    port: 22,
    identityfile: '',
    password: undefined,
    keys: [],
    contents: [],
  };
  lines.map((line) => line.trim()).forEach((line) => {
    if (line.startsWith('Host ')) {
      host.alias = line.replace('Host ', '').split(' ');
    }
    if (line.startsWith('HostName ')) {
      host.hostname = line.replace('HostName ', '').trim();
    }
    if (line.startsWith('Hostname ')) {
      host.hostname = line.replace('Hostname ', '').trim();
    }
    if (line.startsWith('User ')) {
      host.user = line.replace('User ', '').trim();
    }
    if (line.startsWith('Port ')) {
      host.port = parseInt(line.replace('Port ', ''));
    }
    if (line.startsWith('IdentityFile ')) {
      host.identityfile = line.replace('IdentityFile ', '').trim();
    }
    //parse options
    if (line.startsWith('#')) {
      const key_value_pair = line.replace('#', '');
      const [key, value] = key_value_pair.split(' ');
      host.keys.push(key);
      host.contents.push(value);
    }
  });
  return host;
} */

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
  return {
    maxAliasLength,
    maxHostnameLength,
    maxPortLength,
    maxUserLength,
  };
};

const printHostInfo = (host: Host, args: any, lengths: any) => {
  const showAll = args.a;
  const showPort = args.p || showAll;
  const showUser = args.u || showAll;
  const showOps = args.o || showAll;
  let optionInfoData = '';
  if (host.keys.length !== 0) {
    optionInfoData = host.keys
      .map((key, index) => `${key}:${host.contents[index]}`)
      .join('|');
  }
  const aliasSecondary =
    host.alias.length === 1 ? host.alias[0] : JSON.stringify(host.alias);
  const aliasStr = aliasSecondary.padEnd(lengths.maxAliasLength);
  const hostnameStr = host.hostname.padEnd(lengths.maxHostnameLength);
  const portStr = showPort
    ? `:${host.port.toString().padEnd(lengths.maxPortLength)}`
    : '';
  const userStr = showUser ? host.user.padEnd(lengths.maxUserLength) : '';
  const opsStr = showOps ? optionInfoData : '';
  console.log(`${aliasStr} ${hostnameStr}${portStr} ${userStr}${opsStr}`);
};

(async () => {
  try {
    if (!HOME_DIR) {
      throw new Error('ホームディレクトリが見つかりません');
    }
    const data = Bun.file(`${HOME_DIR}/.ssh/config`);
    if ((await data.exists()) === false) {
      throw new Error('SSH設定ファイルが見つかりません');
    }
    const content = await data.text();
    const hostSections = splitByHosts(content);
    const hosts = hostSections.map(parseHost);
    const lengths = calculateMaxLengths(hosts);
    for (const host of hosts) {
      printHostInfo(host, args, lengths);
    }
  } catch (error) {
    console.error(
      `Error reading or parsing SSH config: ${(error as any).message}`
    );
  }
})();
