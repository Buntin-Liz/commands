#!/usr/bin/env bun
import { parseArgs } from 'node:util';
import { $ } from 'bun';
const args = parseArgs({
  args: Bun.argv,
  options: {
    silent: {
      type: 'boolean',
      short: 's',
    },
  },
  strict: true,
  allowPositionals: true,
});

const generatePassword = (length: number): string => {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789___';
  let password = '';
  while (true) {
    password = '';
    for (let i = 0; i < length; i++) {
      const char = charset.charAt(Math.floor(Math.random() * charset.length));
      password += char;
    }
    const criteria = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[_]/.test(password),
    ];
    if (criteria.every((c) => c)) {
      break;
    }
  }
  return password;
};

(async () => {
  const inputPassLen = args.positionals[2];
  const count = Number.parseInt(args.positionals[3] || '1');

  const passLen = Number.parseInt(inputPassLen || '17');

  if (Number.isNaN(passLen) || passLen < 1) {
    console.error('length is not a valid number');
    return;
  }
  for (let i = 0; i < count; i++) {
    const pass = generatePassword(passLen);
    console.log(pass);
  }
})();
