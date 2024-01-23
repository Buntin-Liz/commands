#!/usr/bin/env -S deno run -A
import $ from "https://deno.land/x/dax@0.35.0/mod.ts";
import parseArgs from "https://deno.land/x/deno_minimist@v1.0.2/mod.ts";

// 引数の解析
const args = parseArgs(Deno.args, {
  alias: {
    n: 'nginx',
    apache: 'httpd'
  },
  default: {
    format: 'nginx'
  }
});

// 証明書を取得するドメインを取得
const domains = args._;
const format = args.format;

// 各ドメインに対して証明書を取得
for (const domain of domains) {
  try {
    // Certbotコマンドを使用して証明書を取得
    await $(`certbot certonly --standalone -d ${ domain } --preferred-challenges http`);

    // 設定ファイルのフォーマットに応じた処理
    if (format === 'nginx') {
      // Nginx用の設定を適用
      // ...
    } else if (format === 'httpd' || format === 'apache') {
      // Apache用の設定を適用
      // ...
    }

    console.log(`証明書の取得と設定が完了しました: ${ domain }`);
  } catch (error) {
    console.error(`証明書の取得に失敗しました: ${ domain }`, error);
  }
}
