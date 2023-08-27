#!/usr/bin/env zx

import 'zx/globals';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';

const existsInPath = async (command: string) => {
  try {
    await $`which ${ command }`;
    return true;
  } catch (error) {
    return false;
  }
};


await (async () => {
  //?? = process.argv[xxxx]
  //node zx script argv[3] argv[4] ...

  if (process.argv[3] === '-h' || process.argv[3] === '--help') {
    console.log('Usage: ssh-add');
    console.log('対話形式だから安心！');
    process.exit(0);
  }
  const sshDir = join(process.env.HOME || '', '.ssh');
  const keyDir = join(sshDir, 'keys');
  const sshConfigPath = join(sshDir, 'config');

  //taiwakeisiki
  const aliasName = await question('Enter alias name: ');
  const host = await question('Enter host: ');
  const user = await question('Enter user: ');
  const port = await question('Enter port: ');
  const keyName = await question('Enter key name: ');

  const keyPath = join(keyDir, keyName);

  //kagi ga aruka douka
  if (!existsSync(keyPath)) {
    console.log(`Key ${ keyName } does not exist.`);
    return;
  }

  //kagi permission
  const keyStats = await fs.stat(keyPath);
  const desiredMode = 0o600; // -rw-------
  if (keyStats.mode !== desiredMode) {
    try {
      await fs.chmod(keyPath, desiredMode);
      console.log(`Changed permissions of ${ keyName } to be more restrictive.`);
    } catch (error) {
      console.log(`Failed to change permissions of ${ keyName }.`, error);
      return;
    }
  }

  const now = new Date().toISOString();
  const configEntry = `
# Added by script on ${ now }
Host ${ aliasName }
    HostName ${ host }
    User ${ user }
    Port ${ port }
    IdentityFile ${ keyPath }
`;

  await fs.appendFile(sshConfigPath, configEntry);
  console.log(`Added ${ aliasName } to SSH config.`);

  // ssh-copy-id
  const useSSHCOPYID = await question('Do you want to use ssh-copy-id? [y/n] (default: No): ');
  if (useSSHCOPYID.toLowerCase() !== 'y') {
    return;
  }

  if (!(await existsInPath('ssh-copy-id'))) {
    console.log('ssh-copy-id command not found.');
    return;
  }

  if (!(await existsInPath('sshpass'))) {
    console.log('sshpass command not found.');
    return;
  }

  const password = await question('Enter password for the remote host: ');
  try {
    const formattedPort = port.trim();
    const formattedUser = user.trim();
    const formattedHost = host.trim();
    await $`SSHPASS=${ password } sshpass -e ssh-copy-id -i "${ keyPath }.pub" -p "${ formattedPort }" "${ formattedUser }@${ formattedHost }"`;
  } catch (error) {
    console.error('Failed to copy the SSH key to the remote host.', error);
  }

})().catch((e) => {
  console.error(e);
  process.exit(1);
});