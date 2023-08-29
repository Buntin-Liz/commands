#!/usr/bin/env zx

import { promises as fs } from 'fs';
import os from 'os';

const parseSSHConfig = async (data: string): Promise<any[]> => {
    const lines = data.split('\n').map(line => line.trim());
    const hosts: any[] = [];

    let currentHost: any = null;

    for (const line of lines) {
        if (line.startsWith('#') || line === '') {
            continue;
        }

        if (line.startsWith('Host ')) {
            if (currentHost) {
                hosts.push(currentHost);
            }

            const [, ...aliases] = line.split(/\s+/);
            currentHost = {
                Host: aliases[0],
                Aliases: aliases.slice(1)
            };
        } else if (currentHost) {
            const [key, ...valueParts] = line.split(/\s+/);
            const value = valueParts.join(' ');
            currentHost[key] = value;
        }
    }

    if (currentHost) {
        hosts.push(currentHost);
    }

    return hosts;
}

(async () => {
    try {
        const home = os.homedir();
        const data = await fs.readFile(`${home}/.ssh/config`, 'utf8');
        const parsed = await parseSSHConfig(data);
        parsed.forEach(host => {
            console.log(`${host.Host}  ${host.HostName}  ${host.User}`);
        }
        );
    } catch (error) {
        console.error(`Error reading or parsing SSH config: ${(error as any).message}`);
    }
})();


