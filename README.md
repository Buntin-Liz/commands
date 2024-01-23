# commands

自作したスクリプト類

一つにするまでもないなというスクリプトに関して、再利用性が高ければここに投下していきます。
まずは、commands 下で、`./deploy`してください。エラーが出たら bin ディレクトリを作ってください。

\_から始まるファイル名のスクリプトは、`./deploy`で無視されます。

PATH の設定もできます。(prompt で y を選択した場合)
パーミッションの設定は勝手に行われます。

![](https://raw.buntin.xyz/tools/data/RESULT.png)

commands の中に含めたいが、deploy で失われたくない、という場合、`archive/template`ディレクトリが使えます。
この中のスクリプトは、deploy で bin の雛形となるため、スクリプトの変更の影響を受けず、一度追加するだけで済みます。

どこに置いても動きますが、おすすめは`/opt/local`ディレクトリかホームです。

# PATH -> commands/bin

## 注意:deno,python,bash,bun を最低限インストールしてあること。

#### suggested equipment(厳守)

- Python(python3) >= 3.10.12
- Deno(deno) >= 1.38.3
- Bash(bash) >= 5.1.16
- Bun(bun) >= 1.0.26
