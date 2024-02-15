#!/usr/bin/env bun
import { $ } from 'bun';
import { parseArgs } from 'util';
const parsed = parseArgs({
  args: Bun.argv,
  options: {
    message: {
      type: 'string',
      short: 'm',
    },
  },
  strict: true,
  allowPositionals: true,
});
const questionCommitMessage = async () => {
  const prompt = 'Enter commit message: ';
  process.stdout.write(prompt);
  let message = '';
  for await (const line of console) {
    message = line;
    break;
  }
  return message;
};
(async () => {
  let cm = parsed.values.message;
  if (!cm) {
    cm = await questionCommitMessage();
  }
  $`git add . && git commit -S -m "${cm}" && git push`;
})();
