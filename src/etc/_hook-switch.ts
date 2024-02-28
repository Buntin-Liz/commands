import fs from 'fs/promises';
import { parseArgs } from 'util';
import { $ } from 'bun';
import path from 'node:path';

const switchSymlinkResult = async (target: string, newPath: string): Promise<boolean> => {
  try {
    try {
      await fs.access(target);
      await fs.unlink(target);
    } catch (error) {
    }

    await fs.symlink(newPath, target);
    console.log(`Symlink created: ${target} -> ${newPath}`);
    return true;
  } catch (error) {
    console.error(`Error creating symlink: ${error}`);
    return false;
  }
};

const main = async () => {
  const { positionals } = parseArgs({
    args: Bun.argv,
    strict: true,
    allowPositionals: true,
  });
  const paths = positionals.slice(2);
  if (positionals.length < 4) {
    console.log("Usage: script <target> <newPath>");
    return;
  }
  const absTarget = path.resolve(paths[0]);
  const absNewPath = path.resolve(paths[1]);
  const newPathDir = path.dirname(absNewPath);
  console.log({
    absTarget,
    absNewPath,
    newPathDir
  })
  $.cwd(newPathDir);
  console.log(`Target: ${absTarget}`);
  console.log(`New Path: ${absNewPath}`);
  const result = await switchSymlinkResult(absTarget, absNewPath);
  console.log(`Operation result: ${result}`);
};

main().catch(console.error);
