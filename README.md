# commands

自作したスクリプト類

一つにするまでもないなというスクリプトに関して、再利用性が高ければここに投下していきます。
まずは、commands 下で、`./deploy`してください。エラーが出たら bin ディレクトリを作ってください。

PATHの設定もできます。(promptでyを選択した場合)

自分はおすすめは`/usr/local`ディレクトリをお勧めしてますが、どこに置いても動きます。

# PATH -> commands/bin

## 注意:deno,python,bash を最低限インストールしてあること。

#### suggested equipment(厳守)

- Python(python3) >= 3.10.12
- Deno(deno) >= 1.38.3
- Bash(bash) >= 5.1.16

node に関しては、zx という child_process のラッパーを`npm install -g package_name`でインストールする必要があります。
