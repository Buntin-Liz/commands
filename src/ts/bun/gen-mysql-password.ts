#!/usr/bin/env bun
import { $ } from 'bun';
import { parseArgs } from 'util';
const args = parseArgs({
  args: Bun.argv,
  options: {},
  strict: true,
  allowPositionals: true,
});
const generatePassword = (length: number): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}|:<>?';
  let password = '';
  const criteria = [false, false, false, false]; // 小文字、大文字、数字、特殊文字

  while (!criteria.every(Boolean) || password.length < length) {
    const char = charset.charAt(Math.floor(Math.random() * charset.length));
    password += char;
    if (!criteria[0] && /[a-z]/.test(char)) criteria[0] = true;
    if (!criteria[1] && /[A-Z]/.test(char)) criteria[1] = true;
    if (!criteria[2] && /[0-9]/.test(char)) criteria[2] = true;
    if (!criteria[3] && /[^a-zA-Z0-9]/.test(char)) criteria[3] = true;
  }
  return password;
};

(async () => {
  // 引数に基づいて何かする（例）
  const inputPassLen = args.positionals.slice(2)[0];
  if (!inputPassLen) {
    console.error('set password length (gen-mysql-password 10)');
    return;
  }
  const passLen = Number(inputPassLen);
  if (Number.isNaN(passLen)) {
    console.error('length is not number');
    return;
  }
  const pass = generatePassword(passLen);
  console.log(pass);
})();
