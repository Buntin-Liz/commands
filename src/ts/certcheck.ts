#!/usr/bin/env -S deno run -A
import $ from "https://deno.land/x/dax@0.35.0/mod.ts";
import parseArgs from "https://deno.land/x/deno_minimist@v1.0.2/mod.ts";

const args = parseArgs(Deno.args);
const getKeyType = async (keyPath: string) => {
  try {
    await $`openssl rsa -in ${ keyPath } -noout`;
    return 'RSA';
  } catch (_e) {
    try {
      await $`openssl ec -in ${ keyPath } -noout`;
      return 'EC';
    } catch (_e) {
      throw new Error('Unknown private key type.');
    }
  }
}
(async () => {
  if (args.help || args.h || !(args._.length === 3)) {
    console.error('Usage: certcheck [Private Key] [Cert File] [Chain File]');
    Deno.exit(1);
  }
  const key = args._[0].toString();
  const crt = args._[1].toString();
  const chain = args._[2].toString();
  const keyType = await getKeyType(key);
  try {
    await $`openssl x509 -noout -modulus -in ${ crt } | openssl md5`;
    if (keyType === 'RSA') {
      await $`openssl rsa -noout -modulus -in ${ key } | openssl md5`;
    } else if (keyType === 'EC') {
      await $`echo "test message" > /tmp/message.txt`;
      await $`openssl dgst -sha256 -sign ${ key } -out /tmp/signature.sig /tmp/message.txt`;
      await $`openssl dgst -sha256 -verify <(openssl x509 -in ${ crt } -pubkey -noout) -signature /tmp/signature.sig /tmp/message.txt`;
    }
  } catch (_e) {
    console.error('Error: Certificate and Private Key do not match.');
    Deno.exit(1);
  }
  // 証明書のチェーンを検証
  try {
    await $`openssl verify -CAfile ${ chain } ${ crt }`;
  } catch (_e) {
    console.error('Error: Certificate chain is invalid.');
    Deno.exit(1);
  }

  console.log('All checks passed successfully.');
  await $`rm -f /tmp/message.txt /tmp/signature.sig`;
})();


