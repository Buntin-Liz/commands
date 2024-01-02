#!/usr/bin/env -S deno run -A
import $ from "https://deno.land/x/dax@0.35.0/mod.ts";
import parseArgs from "https://deno.land/x/deno_minimist@v1.0.2/mod.ts";
import { join } from "https://deno.land/std@0.201.0/path/join.ts";
import { existsSync } from "https://deno.land/std@0.208.0/fs/exists.ts";

const existsInPath = async (command: string) => {
  try {
    await $`which ${ command }`;
    return true;
  } catch (_) {
    return false;
  }
};
const updateKeysPermission = async (keyDir: string) => {
  const result = await $`chmod 600 ${ keyDir }/*`;
  return result.code === 0;
}

const appendStringToFile = (filepath: string, context: string) => Deno.writeTextFile(filepath, context, { append: true });

const args = parseArgs(Deno.args);

(async () => {
  if (args.help || args.h) {
    console.log('Usage: ssh-add');
    console.log('対話形式だから安心！');
    Deno.exit(0);
  }
  const sshDir = join(Deno.env.get('HOME')!, '.ssh');
  const keyDir = join(sshDir, 'keys');
  const sshConfigPath = join(sshDir, 'config');
  const aliasName = await $.prompt('Enter alias name: ');
  const host = await $.prompt('Enter host: ');
  const user = await $.prompt('Enter user: ');
  const port = await $.prompt('Enter port: ');
  const keyName = await $.prompt('Enter key name: ');
  const keyPath = join(keyDir, keyName);
  if (!existsSync(keyPath)) {
    console.log(`Key ${ keyName } does not exist.`);
    return;
  }
  //permisson update
  if (!(await updateKeysPermission(keyDir))) {
    console.log('Failed to update the permission of the key files.');
    return;
  }

  const configEntry = `
Host ${ aliasName }
  HostName ${ host }
  User ${ user }
  Port ${ port }
  IdentityFile ${ keyPath }

`;
  try {
    await appendStringToFile(sshConfigPath, configEntry);
    console.log(`Added ${ aliasName } to SSH config.`);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.log(e);
    }
  }

  // ssh-copy-id
  const useSSHCOPYID = await $.confirm('Do you want to set The SSH key to the remote host?');
  if (!useSSHCOPYID) return;
  if (!(await existsInPath('ssh-copy-id'))) {
    console.log('ssh-copy-id command not found.');
    return;
  }
  if (!(await existsInPath('sshpass'))) {
    console.log('sshpass command not found.');
    return;
  }
  const password = await $.prompt('Enter password for the remote host: ');
  const formattedPort = port.trim();
  const formattedUser = user.trim();
  const formattedHost = host.trim();
  try {
    await $`SSHPASS=${ password } sshpass -e ssh-copy-id -i "${ keyPath }.pub" -p "${ formattedPort }" "${ formattedUser }@${ formattedHost }"`;
  } catch (error) {
    console.error('Failed to copy the SSH key to the remote host.', error);
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
