# commands

自作したスクリプト類

一つにするまでもないなというスクリプトに関して、再利用性が高ければここに投下していきます。

まずは、commands 下で、`bun run deploy`してください。

どうしてもbunを入れたくない場合、`rm -rf bin && cp -r ./template ./bin && deno run -A src/deploy.deno.ts`を実行してください。Denoでデプロイされます。

それが嫌なら、消えてください。

\_から始まるファイル名のスクリプトは、デプロイ時で無視されます。

PATH の設定もできます。(prompt で y を選択した場合)
パーミッションの設定は勝手に行われます。

![](https://raw.buntin.xyz/tools/data/RESULT.png)

commands の中に含めたいが、deploy で失われたくない、という場合、`commands/template`ディレクトリが使えます。
この中のスクリプトは、deploy で bin の雛形となるため、スクリプトの変更の影響を受けず、一度追加するだけで済みます。

どこに置いても動きますが、おすすめはホームディレクトリ(`~/commands`)か、`/opt/local/commands`ディレクトリです。

# PATH -> commands/bin

## 注意:bun,deno,python(python3),bash を最低限インストールしてあること。
