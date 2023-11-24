#!/usr/bin/env -S deno run -A
import $ from "https://deno.land/x/dax/mod.ts";
import parseArgs from 'https://deno.land/x/deno_minimist/mod.ts';

//
const args = parseArgs(Deno.args);

type Host = {
  alias: string[];
  hostname: string;
  user: string;
  port: number;
  identityfile: string;
  password?: string;
  keys: string[],
  contents: string[]
}

const parseHost = (hostsection: string): Host => {
  const lines = hostsection.split('\n');
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
}

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
}

const calculateMaxLengths = (hosts: Host[]) => {
  let maxAliasLength = 0;
  let maxHostnameLength = 0;
  let maxPortLength = 0;
  let maxUserLength = 0;
  hosts.forEach(host => {
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
    maxUserLength
  };
}

const printHostInfo = (host: Host, args: string[], lengths: any) => {
  const showAll = args.includes('-a');
  const showPort = args.includes('-p') || showAll;
  const showUser = args.includes('-u') || showAll;
  const showOps = args.includes('-o') || showAll;
  let opdata = '';
  if (host.keys.length !== 0) {
    opdata = host.keys.map((key, index) => `${ key }:${ host.contents[index] }`).join('|')
  }
  const aliasSecondary = host.alias.length === 1 ? host.alias[0] : JSON.stringify(host.alias);
  const aliasStr = aliasSecondary.padEnd(lengths.maxAliasLength);
  const hostnameStr = host.hostname.padEnd(lengths.maxHostnameLength);
  const portStr = showPort ? `:${ host.port.toString().padEnd(lengths.maxPortLength) }` : '';
  const userStr = showUser ? host.user.padEnd(lengths.maxUserLength) : '';
  const opsStr = showOps ? opdata : '';
  echo(`${ aliasStr } ${ hostnameStr }${ portStr } ${ userStr }${ opsStr }`);
}

(async () => {
  try {
    const homedir = Deno.env.get("HOME");
    if (!homedir) {
      throw new Error("ホームディレクトリが見つかりません");
    }
    const data = await Deno.readTextFile(`${ Deno.env.get('HOME') }/.ssh/config`);
    const hostSections = splitByHosts(data);
    const hosts = hostSections.map(parseHost);
    const lengths = calculateMaxLengths(hosts);
    hosts.forEach(host => printHostInfo(host, args, lengths));
  } catch (error) {
    console.error(`Error reading or parsing SSH config: ${ (error as any).message }`);
  }
})();

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
