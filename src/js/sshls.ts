#!/usr/bin/env zx

import { promises as fs } from 'fs';
import os from 'os';

type Host = {
    alias: string[];
    hostname: string;
    user: string;
    port: number;
    identityfile: string;
    password?: string;
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
        password: undefined
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



(async () => {
    try {
        const home = os.homedir();
        const data = await fs.readFile(`${home}/.ssh/config`, 'utf8');
        const hostSections = splitByHosts(data);
        const hosts = hostSections.map(parseHost);
        const lengths = calculateMaxLengths(hosts);

        hosts.forEach(host => {
            const aliasStr = JSON.stringify(host.alias).padEnd(lengths.maxAliasLength);
            const hostnameStr = host.hostname.padEnd(lengths.maxHostnameLength);
            const portStr = host.port.toString().padEnd(lengths.maxPortLength);
            const userStr = host.user.padEnd(lengths.maxUserLength);
            echo(`${aliasStr} ${hostnameStr}:${portStr} ${userStr}`);
        });
    } catch (error) {
        console.error(`Error reading or parsing SSH config: ${(error as any).message}`);
    }
})();


