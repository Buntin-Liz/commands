#!/usr/bin/env zx
import { argv } from 'process';
import { $, fs } from 'zx';

const getKeyType = async (keyPath: string) => {
  try {
    await $`openssl rsa -in ${ keyPath } -noout`;
    return 'RSA';
  } catch (error) {
    try {
      await $`openssl ec -in ${ keyPath } -noout`;
      return 'EC';
    } catch (error) {
      throw new Error('Unknown private key type.');
    }
  }
}

await (async () => {
  if (argv.length !== 6) {
    console.error('Usage: certcheck [Private Key] [Cert File] [Chain File]');
    process.exit(1);
  }

  const privateKeyPath = argv[3];
  const certificatePath = argv[4];
  const intermediateCertificatePath = argv[5];
  const keyType = await getKeyType(privateKeyPath);
  try {
    await $`openssl x509 -noout -modulus -in ${ certificatePath } | openssl md5`;
    if (keyType === 'RSA') {
      await $`openssl rsa -noout -modulus -in ${ privateKeyPath } | openssl md5`;
    } else if (keyType === 'EC') {
      await $`echo "test message" > /tmp/message.txt`;
      await $`openssl dgst -sha256 -sign ${ privateKeyPath } -out /tmp/signature.sig /tmp/message.txt`;
      await $`openssl dgst -sha256 -verify <(openssl x509 -in ${ certificatePath } -pubkey -noout) -signature /tmp/signature.sig /tmp/message.txt`;
    }
  } catch (error) {
    console.error('Error: Certificate and Private Key do not match.');
    process.exit(1);
  }

  // 証明書のチェーンを検証
  try {
    await $`openssl verify -CAfile ${ intermediateCertificatePath } ${ certificatePath }`;
  } catch (error) {
    console.error('Error: Certificate chain is invalid.');
    process.exit(1);
  }

  console.log('All checks passed successfully.');
  await $`rm -f /tmp/message.txt /tmp/signature.sig`;
})();

/* 
#!/usr/bin/env zx

import { $ } from 'zx';
import fs from 'fs';

const print = console.log;

// Variables
const SCRIPT_PATH: string = new URL('.', import.meta.url).pathname;
const SELF_PATH: string = process.cwd();
let KEY_FILE: string | undefined = process.argv[3];
let CERT_FILE: string | undefined = process.argv[4];
let CA_FILE: string | undefined = process.argv[5];
print('KEY_FILE:', KEY_FILE);
print('CERT_FILE:', CERT_FILE);
print('CA_FILE:', CA_FILE);

if (!KEY_FILE || !CERT_FILE || !CA_FILE) {
  console.error('Usage: script_name [Key File] [Cert File] [CA File]');
  process.exit(1);
}

if (![KEY_FILE, CERT_FILE, CA_FILE].every(file => fs.existsSync(file))) {
  console.error('Usage: script_name [Key File] [Cert File] [CA File]');
  process.exit(1);
}
// Integrity Check

// Cert - Key
const md5_cert: string = (await $`openssl x509 -noout -modulus -in ${ CERT_FILE } | md5sum`).stdout;
const md5_key: string = (await $`openssl rsa -noout -modulus -in ${ KEY_FILE } | md5sum`).stdout;

if (md5_cert === md5_key) {
  console.log('Integrity OK (Cert - Key)');
} else {
  console.error('[Error] Integrity NG (Cert - Key)');
  console.error('\\x1b[30;41;1mCertification Check Failed!\\x1b[0m');
  process.exit(1);
}

// Cert - CA
const hash_cert: string = (await $`openssl x509 -issuer_hash -noout -in ${ CERT_FILE }`).stdout;
const hash_ca: string = (await $`openssl x509 -subject_hash -noout -in ${ CA_FILE }`).stdout;
const subject_name: string = (await $`openssl x509 -subject -noout -in ${ CA_FILE }`).stdout;
const crt_subject_name: string = (await $`openssl x509 -noout -subject -in ${ CERT_FILE }`).stdout;

if (hash_cert === hash_ca) {
  console.log('Integrity OK (Cert - CA)');
  console.log('  IntermediateCert:', subject_name);
  console.log('  Crt Subject:', crt_subject_name);
} else {
  console.error('[Error] Integrity NG (Cert - CA)');
  console.error('\\x1b[30;41;1mCertification Check Failed!\\x1b[0m');
  process.exit(1);
}

// IntermediateCert reaches RootCerts Check
const result: string = (await $`openssl verify -CAfile ${ CA_FILE } ${ CERT_FILE }`).stdout;
if (result.includes('OK')) {
  console.log('IntermediateCert reaches RootCerts OK');
} else {
  console.error('[Error] IntermediateCert reaches RootCerts NG');
  console.error('\\x1b[30;41;1mCertification Check Failed!\\x1b[0m');
  process.exit(1);
}

// Certificate expiration check
const cert_dates: string = (await $`openssl x509 -noout -dates -in ${ CERT_FILE }`).stdout;
const cert_expiration_date_str: string | undefined = cert_dates.split('\\n').find(line => line.startsWith('notAfter='))?.replace('notAfter=', '');
const cert_before_date_str: string | undefined = cert_dates.split('\\n').find(line => line.startsWith('notBefore='))?.replace('notBefore=', '');

if (!cert_expiration_date_str || !cert_before_date_str) {
  console.error('[Error] Failed to retrieve certificate dates.');
  process.exit(1);
}

const cert_expiration_date: number = new Date(cert_expiration_date_str).getTime();
const cert_before_date: number = new Date(cert_before_date_str).getTime();
const today: number = Date.now();

if (cert_expiration_date > today) {
  console.log('Expiration Date OK');
  console.log('  START_DATE:', new Date(cert_before_date).toLocaleString());
  console.log('  END_DATE:', new Date(cert_expiration_date).toLocaleString());
} else {
  console.error('[Error] Expiration Date NG');
  console.log('  START_DATE:', new Date(cert_before_date).toLocaleString());
  console.log('  END_DATE:', new Date(cert_expiration_date).toLocaleString());
  console.error('\\x1b[30;41;1mCertification Check Failed!\\x1b[0m');
  process.exit(1);
}

// Check the expiration date of the current certificate

// Get only the common name from the certificate
const cert_text: string = (await $`openssl x509 -text -noout -in ${ CERT_FILE }`).stdout;
const COMMONNAME: string | undefined = cert_text.split('\\n').find(line => line.includes('Subject:'))?.match(/CN=([^/]+)/)?.[1];

if (!COMMONNAME) {
  console.error('[Error] Failed to retrieve Common Name.');
  process.exit(1);
}

console.log('##############');
console.log('COMMON NAME：', COMMONNAME);

// If the certificate is a wildcard certificate, output the corresponding message manually.
if (COMMONNAME.includes('*')) {
  console.log('ワイルドカード証明書です。');
  console.log('手動で対象URLから現在の証明書期限を確認してください');
  console.log('##############');
  process.exit(1);
}

// The rest of the script here...


*/