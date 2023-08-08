# commands


自作したスクリプト類

一つにするまでもないなというスクリプトに関して、再利用性が高ければここに投下していきます。
何より自分が使うことを意識しているため、cloneしてから`cd commands && sh ./init.sh`するだけで全て使えます。

init.shなどは、yes/no形式でどれくらい深めにスクリプトを入れるか選べます。
また、pathは問答無用でcloneしたディレクトリが追加されます。

自分はおすすめは`/usr/local`ディレクトリをお勧めしてますが、どこに置いても動きます。


## 注意:node,python,bashを最低限インストールしてあること。voltaでnodeを入れる、については、スクリプトがあります。

#### suggested equipment(厳守)

- Python(python3) >= 3.10.12
- Node.js(node) >= 20.5.0
- Bash(bash) >= 5.1.16

nodeに関しては、zxというchild_processのラッパーを`npm install -g package_name`でインストールする必要があります。
