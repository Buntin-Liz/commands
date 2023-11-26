# 🐚 zx

```js
#!/usr/bin/env zx

await $`cat package.json | grep name`;

let branch = await $`git branch --show-current`;
await $`dep deploy --branch=${branch}`;

await Promise.all([$`sleep 1; echo 1`, $`sleep 2; echo 2`, $`sleep 3; echo 3`]);

let name = 'foo bar';
await $`mkdir /tmp/${name}`;
```

Bashは素晴らしいですが、より複雑なスクリプトを書く際には、
多くの人々がより便利なプログラミング言語を好むことがあります。
JavaScriptは完璧な選択ですが、Node.jsの標準ライブラリを
使用する前に追加の手間が必要です。`zx`パッケージは、`child_process`の周りに
便利なラッパーを提供し、引数をエスケープし、適切なデフォルトを提供します。

## Install

```bash
npm i -g zx
```

**Requirement**: Node version >= 16.0.0

## Goods

[$](#command-) · [cd()](#cd) · [fetch()](#fetch) · [question()](#question) · [sleep()](#sleep) · [echo()](#echo) · [stdin()](#stdin) · [within()](#within) · [retry()](#retry) · [spinner()](#spinner) ·
[chalk](#chalk-package) · [fs](#fs-package) · [os](#os-package) · [path](#path-package) · [glob](#globby-package) · [yaml](#yaml-package) · [minimist](#minimist-package) · [which](#which-package) ·
[\_\_filename](#__filename--__dirname) · [\_\_dirname](#__filename--__dirname) · [require()](#require)

## Documentation

トップレベルで`await`を使用するためには、スクリプトを`.mjs`拡張子のファイルに書き込んでください。
もし`.js`拡張子を好む場合は、スクリプトを`void async function () {...}()`のようにラップしてください。

`zx`スクリプトの先頭に以下のシェバングを追加してください：

```bash
#!/usr/bin/env zx
```

これで、以下のようにスクリプトを実行できるようになります：

```bash
chmod +x ./script.mjs
./script.mjs
```

または、`zx`実行可能ファイルを使用して：

```bash
zx ./script.mjs
```

すべての関数（`# 🐚 zx

```js
#!/usr/bin/env zx

await $`cat package.json | grep name`;

let branch = await $`git branch --show-current`;
await $`dep deploy --branch=${branch}`;

await Promise.all([$`sleep 1; echo 1`, $`sleep 2; echo 2`, $`sleep 3; echo 3`]);

let name = 'foo bar';
await $`mkdir /tmp/${name}`;
```

Bashは素晴らしいですが、より複雑なスクリプトを書く際には、
多くの人々がより便利なプログラミング言語を好むことがあります。
JavaScriptは完璧な選択ですが、Node.jsの標準ライブラリを
使用する前に追加の手間が必要です。`zx`パッケージは、`child_process`の周りに
便利なラッパーを提供し、引数をエスケープし、適切なデフォルトを提供します。

## Install

```bash
npm i -g zx
```

**Requirement**: Node version >= 16.0.0

## Goods

[$](#command-) · [cd()](#cd) · [fetch()](#fetch) · [question()](#question) · [sleep()](#sleep) · [echo()](#echo) · [stdin()](#stdin) · [within()](#within) · [retry()](#retry) · [spinner()](#spinner) ·
[chalk](#chalk-package) · [fs](#fs-package) · [os](#os-package) · [path](#path-package) · [glob](#globby-package) · [yaml](#yaml-package) · [minimist](#minimist-package) · [which](#which-package) ·
[\_\_filename](#__filename--__dirname) · [\_\_dirname](#__filename--__dirname) · [require()](#require)

## Documentation

トップレベルで`await`を使用するためには、スクリプトを`.mjs`拡張子のファイルに書き込んでください。
もし`.js`拡張子を好む場合は、スクリプトを`void async function () {...}()`のようにラップしてください。

`zx`スクリプトの先頭に以下のシェバングを追加してください：

```bash
#!/usr/bin/env zx
```

これで、以下のようにスクリプトを実行できるようになります：

```bash
chmod +x ./script.mjs
./script.mjs
```

または、`zx`実行可能ファイルを使用して：

```bash
zx ./script.mjs
```

、`cd`、`fetch`など）は、インポートなしで
すぐに利用可能です。

または、グローバル変数を明示的にインポートすることもできます（VS Codeでのオートコンプリートを向上させるため）。

```js
import 'zx/globals';
```

### `` $`command`  ``

Executes a given command using the `spawn` func
and returns [`ProcessPromise`](#processpromise).

Everything passed through `${...}` will be automatically escaped and quoted.

```js
let name = 'foo & bar';
await $`mkdir ${name}`;
```

**There is no need to add extra quotes.** Read more about it in
[quotes](docs/quotes.md).

必要に応じて引数の配列を渡すことができます：

```js
let flags = ['--oneline', '--decorate', '--color'];
await $`git log ${flags}`;
```

If the executed program returns a non-zero exit code,
[`ProcessOutput`](#processoutput) will be thrown.

```js
try {
  await $`exit 1`;
} catch (p) {
  console.log(`Exit code: ${p.exitCode}`);
  console.log(`Error: ${p.stderr}`);
}
```

### `ProcessPromise`

```ts
class ProcessPromise extends Promise<ProcessOutput> {
  stdin: Writable;
  stdout: Readable;
  stderr: Readable;
  exitCode: Promise<number>;

  pipe(dest): ProcessPromise;

  kill(): Promise<void>;

  nothrow(): this;

  quiet(): this;
}
```

[ProcessPromise](docs/process-promise.md)についての詳細はこちらを参照してください。

### `ProcessOutput`

```ts
class ProcessOutput {
  readonly stdout: string;
  readonly stderr: string;
  readonly signal: string;
  readonly exitCode: number;

  toString(): string; // Combined stdout & stderr.
}
```

The output of the process is captured as-is. Usually, programs print a new
line `\n` at the end.
If `ProcessOutput` is used as an argument to some other `$` process,
**zx** will use stdout and trim the new line.

```js
let date = await $`date`;
await $`echo Current date is ${date}.`;
```

## Functions

### `cd()`

現在の作業ディレクトリを変更します。

```js
cd('/tmp');
await $`pwd`; // => /tmp
```

Like `echo`, in addition to `string` arguments, `cd` accepts and trims
trailing newlines from `ProcessOutput` enabling common idioms like:

```js
cd(await $`mktemp -d`);
```

### `fetch()`

A wrapper around the [node-fetch](https://www.npmjs.com/package/node-fetch)
package.

```js
let resp = await fetch('https://medv.io');
```

### `question()`

[readline](https://nodejs.org/api/readline.html)パッケージのラッパーです。

```js
let bear = await question('What kind of bear is best? ');
```

### `sleep()`

`setTimeout`関数のラッパーです。

```js
await sleep(1000);
```

### `echo()`

[ProcessOutput](#processoutput)を取ることができる`console.log()`の代替です。

```js
let branch = await $`git branch --show-current`;

echo`Current branch is ${branch}.`;
// or
echo('Current branch is', branch);
```

### `stdin()`

stdinを文字列として返します。

```js
let content = JSON.parse(await stdin());
```

### `within()`

新しい非同期コンテキストを作成します。

```js
await $`pwd`; // => /home/path

within(async () => {
  cd('/tmp');

  setTimeout(async () => {
    await $`pwd`; // => /tmp
  }, 1000);
});

await $`pwd`; // => /home/path
```

```js
await $`node --version`; // => v20.2.0

let version = await within(async () => {
  $.prefix += 'export NVM_DIR=$HOME/.nvm; source $NVM_DIR/nvm.sh; nvm use 16;';

  return $`node --version`;
});

echo(version); // => v16.20.0
```

### `retry()`

Retries a callback for a few times. Will return after the first
successful attempt, or will throw after specifies attempts count.

```js
let p = await retry(10, () => $`curl https://medv.io`);

// With a specified delay between attempts.
let p = await retry(20, '1s', () => $`curl https://medv.io`);

// With an exponential backoff.
let p = await retry(30, expBackoff(), () => $`curl https://medv.io`);
```

### `spinner()`

シンプルなCLIスピナーを開始します。

```js
await spinner(() => $`long-running command`);

// With a message.
await spinner('working...', () => $`sleep 99`);
```

## Packages

以下のパッケージは、スクリプト内でインポートせずに利用できます。

### `chalk` package

[chalk](https://www.npmjs.com/package/chalk)パッケージ。

```js
console.log(chalk.blue('Hello world!'));
```

### `fs` package

[fs-extra](https://www.npmjs.com/package/fs-extra)パッケージ。

```js
let { version } = await fs.readJson('./package.json');
```

### `os` package

[os](https://nodejs.org/api/os.html)パッケージ。

```js
await $`cd ${os.homedir()} && mkdir example`;
```

### `path` package

[path](https://nodejs.org/api/path.html)パッケージ。

```js
await $`mkdir ${path.join(basedir, 'output')}`;
```

### `globby` package

[globby](https://github.com/sindresorhus/globby)パッケージ。

```js
let packages = await glob(['package.json', 'packages/*/package.json']);
```

### `yaml` package

[yaml](https://www.npmjs.com/package/yaml)パッケージ。

```js
console.log(YAML.parse('foo: bar').foo);
```

### `minimist` package

[minimist](https://www.npmjs.com/package/minimist)パッケージ。

```js
let myCustomArgv = minimist(process.argv.slice(2), {
  boolean: ['force', 'help'],
});
```

`argv`としてのプロセス引数のminimist解析バージョン（設定なしで解析）。

```js
if (argv.someFlag) {
  echo('yes');
}
```

### `which` package

[which](https://github.com/npm/node-which)パッケージ。

```js
let node = await which('node');
```

## Configuration

### `$.shell`

使用されるシェルを指定します。デフォルトは`which bash`です。

```js
$.shell = '/usr/bin/bash';
```

または、CLI引数を使用してください: `--shell=/bin/bash`

### `$.spawn`

`spawn` APIを指定します。デフォルトは`require('child_process').spawn`です。

### `$.prefix`

Specifies the command that will be prefixed to all commands run.

Default is `set -euo pipefail;`.

または、CLI引数を使用してください: `--prefix='set -e;'`

### `$.quote`

Specifies a function for escaping special characters during
command substitution.

### `$.verbose`

詳細度を指定します。デフォルトは`true`です。

In verbose mode, `zx` prints all executed commands alongside with their
outputs.

または、CLI引数`--quiet`を使用して`$.verbose = false`に設定してください。

### `$.env`

Specifies an environment variables map.

Defaults to `process.env`.

### `$.cwd`

`# 🐚 zx

```js
#!/usr/bin/env zx

await $`cat package.json | grep name`;

let branch = await $`git branch --show-current`;
await $`dep deploy --branch=${branch}`;

await Promise.all([$`sleep 1; echo 1`, $`sleep 2; echo 2`, $`sleep 3; echo 3`]);

let name = 'foo bar';
await $`mkdir /tmp/${name}`;
```

Bashは素晴らしいですが、より複雑なスクリプトを書く際には、
多くの人々がより便利なプログラミング言語を好むことがあります。
JavaScriptは完璧な選択ですが、Node.jsの標準ライブラリを
使用する前に追加の手間が必要です。`zx`パッケージは、`child_process`の周りに
便利なラッパーを提供し、引数をエスケープし、適切なデフォルトを提供します。

## Install

```bash
npm i -g zx
```

**Requirement**: Node version >= 16.0.0

## Goods

[$](#command-) · [cd()](#cd) · [fetch()](#fetch) · [question()](#question) · [sleep()](#sleep) · [echo()](#echo) · [stdin()](#stdin) · [within()](#within) · [retry()](#retry) · [spinner()](#spinner) ·
[chalk](#chalk-package) · [fs](#fs-package) · [os](#os-package) · [path](#path-package) · [glob](#globby-package) · [yaml](#yaml-package) · [minimist](#minimist-package) · [which](#which-package) ·
[\_\_filename](#__filename--__dirname) · [\_\_dirname](#__filename--__dirname) · [require()](#require)

## Documentation

トップレベルで`await`を使用するためには、スクリプトを`.mjs`拡張子のファイルに書き込んでください。
もし`.js`拡張子を好む場合は、スクリプトを`void async function () {...}()`のようにラップしてください。

`zx`スクリプトの先頭に以下のシェバングを追加してください：

```bash
#!/usr/bin/env zx
```

これで、以下のようにスクリプトを実行できるようになります：

```bash
chmod +x ./script.mjs
./script.mjs
```

または、`zx`実行可能ファイルを使用して：

```bash
zx ./script.mjs
```

すべての関数（`# 🐚 zx

```js
#!/usr/bin/env zx

await $`cat package.json | grep name`;

let branch = await $`git branch --show-current`;
await $`dep deploy --branch=${branch}`;

await Promise.all([$`sleep 1; echo 1`, $`sleep 2; echo 2`, $`sleep 3; echo 3`]);

let name = 'foo bar';
await $`mkdir /tmp/${name}`;
```

Bashは素晴らしいですが、より複雑なスクリプトを書く際には、
多くの人々がより便利なプログラミング言語を好むことがあります。
JavaScriptは完璧な選択ですが、Node.jsの標準ライブラリを
使用する前に追加の手間が必要です。`zx`パッケージは、`child_process`の周りに
便利なラッパーを提供し、引数をエスケープし、適切なデフォルトを提供します。

## Install

```bash
npm i -g zx
```

**Requirement**: Node version >= 16.0.0

## Goods

[$](#command-) · [cd()](#cd) · [fetch()](#fetch) · [question()](#question) · [sleep()](#sleep) · [echo()](#echo) · [stdin()](#stdin) · [within()](#within) · [retry()](#retry) · [spinner()](#spinner) ·
[chalk](#chalk-package) · [fs](#fs-package) · [os](#os-package) · [path](#path-package) · [glob](#globby-package) · [yaml](#yaml-package) · [minimist](#minimist-package) · [which](#which-package) ·
[\_\_filename](#__filename--__dirname) · [\_\_dirname](#__filename--__dirname) · [require()](#require)

## Documentation

トップレベルで`await`を使用するためには、スクリプトを`.mjs`拡張子のファイルに書き込んでください。
もし`.js`拡張子を好む場合は、スクリプトを`void async function () {...}()`のようにラップしてください。

`zx`スクリプトの先頭に以下のシェバングを追加してください：

```bash
#!/usr/bin/env zx
```

これで、以下のようにスクリプトを実行できるようになります：

```bash
chmod +x ./script.mjs
./script.mjs
```

または、`zx`実行可能ファイルを使用して：

```bash
zx ./script.mjs
```

、`cd`、`fetch`など）は、インポートなしで
すぐに利用可能です。

または、グローバル変数を明示的にインポートすることもできます（VS Codeでのオートコンプリートを向上させるため）。

```js
import 'zx/globals';
```

### `` $`command`  ``

Executes a given command using the `spawn` func
and returns [`ProcessPromise`](#processpromise).

Everything passed through `${...}` will be automatically escaped and quoted.

```js
let name = 'foo & bar';
await $`mkdir ${name}`;
```

**There is no need to add extra quotes.** Read more about it in
[quotes](docs/quotes.md).

必要に応じて引数の配列を渡すことができます：

```js
let flags = ['--oneline', '--decorate', '--color'];
await $`git log ${flags}`;
```

If the executed program returns a non-zero exit code,
[`ProcessOutput`](#processoutput) will be thrown.

```js
try {
  await $`exit 1`;
} catch (p) {
  console.log(`Exit code: ${p.exitCode}`);
  console.log(`Error: ${p.stderr}`);
}
```

### `ProcessPromise`

```ts
class ProcessPromise extends Promise<ProcessOutput> {
  stdin: Writable;
  stdout: Readable;
  stderr: Readable;
  exitCode: Promise<number>;

  pipe(dest): ProcessPromise;

  kill(): Promise<void>;

  nothrow(): this;

  quiet(): this;
}
```

[ProcessPromise](docs/process-promise.md)についての詳細はこちらを参照してください。

### `ProcessOutput`

```ts
class ProcessOutput {
  readonly stdout: string;
  readonly stderr: string;
  readonly signal: string;
  readonly exitCode: number;

  toString(): string; // Combined stdout & stderr.
}
```

The output of the process is captured as-is. Usually, programs print a new
line `\n` at the end.
If `ProcessOutput` is used as an argument to some other `$` process,
**zx** will use stdout and trim the new line.

```js
let date = await $`date`;
await $`echo Current date is ${date}.`;
```

## Functions

### `cd()`

現在の作業ディレクトリを変更します。

```js
cd('/tmp');
await $`pwd`; // => /tmp
```

Like `echo`, in addition to `string` arguments, `cd` accepts and trims
trailing newlines from `ProcessOutput` enabling common idioms like:

```js
cd(await $`mktemp -d`);
```

### `fetch()`

A wrapper around the [node-fetch](https://www.npmjs.com/package/node-fetch)
package.

```js
let resp = await fetch('https://medv.io');
```

### `question()`

[readline](https://nodejs.org/api/readline.html)パッケージのラッパーです。

```js
let bear = await question('What kind of bear is best? ');
```

### `sleep()`

`setTimeout`関数のラッパーです。

```js
await sleep(1000);
```

### `echo()`

[ProcessOutput](#processoutput)を取ることができる`console.log()`の代替です。

```js
let branch = await $`git branch --show-current`;

echo`Current branch is ${branch}.`;
// or
echo('Current branch is', branch);
```

### `stdin()`

stdinを文字列として返します。

```js
let content = JSON.parse(await stdin());
```

### `within()`

新しい非同期コンテキストを作成します。

```js
await $`pwd`; // => /home/path

within(async () => {
  cd('/tmp');

  setTimeout(async () => {
    await $`pwd`; // => /tmp
  }, 1000);
});

await $`pwd`; // => /home/path
```

```js
await $`node --version`; // => v20.2.0

let version = await within(async () => {
  $.prefix += 'export NVM_DIR=$HOME/.nvm; source $NVM_DIR/nvm.sh; nvm use 16;';

  return $`node --version`;
});

echo(version); // => v16.20.0
```

### `retry()`

Retries a callback for a few times. Will return after the first
successful attempt, or will throw after specifies attempts count.

```js
let p = await retry(10, () => $`curl https://medv.io`);

// With a specified delay between attempts.
let p = await retry(20, '1s', () => $`curl https://medv.io`);

// With an exponential backoff.
let p = await retry(30, expBackoff(), () => $`curl https://medv.io`);
```

### `spinner()`

シンプルなCLIスピナーを開始します。

```js
await spinner(() => $`long-running command`);

// With a message.
await spinner('working...', () => $`sleep 99`);
```

## Packages

以下のパッケージは、スクリプト内でインポートせずに利用できます。

### `chalk` package

[chalk](https://www.npmjs.com/package/chalk)パッケージ。

```js
console.log(chalk.blue('Hello world!'));
```

### `fs` package

[fs-extra](https://www.npmjs.com/package/fs-extra)パッケージ。

```js
let { version } = await fs.readJson('./package.json');
```

### `os` package

[os](https://nodejs.org/api/os.html)パッケージ。

```js
await $`cd ${os.homedir()} && mkdir example`;
```

### `path` package

[path](https://nodejs.org/api/path.html)パッケージ。

```js
await $`mkdir ${path.join(basedir, 'output')}`;
```

### `globby` package

[globby](https://github.com/sindresorhus/globby)パッケージ。

```js
let packages = await glob(['package.json', 'packages/*/package.json']);
```

### `yaml` package

[yaml](https://www.npmjs.com/package/yaml)パッケージ。

```js
console.log(YAML.parse('foo: bar').foo);
```

### `minimist` package

[minimist](https://www.npmjs.com/package/minimist)パッケージ。

```js
let myCustomArgv = minimist(process.argv.slice(2), {
  boolean: ['force', 'help'],
});
```

`argv`としてのプロセス引数のminimist解析バージョン（設定なしで解析）。

```js
if (argv.someFlag) {
  echo('yes');
}
```

### `which` package

[which](https://github.com/npm/node-which)パッケージ。

```js
let node = await which('node');
```

## Configuration

### `$.shell`

使用されるシェルを指定します。デフォルトは`which bash`です。

```js
$.shell = '/usr/bin/bash';
```

または、CLI引数を使用してください: `--shell=/bin/bash`

### `$.spawn`

`spawn` APIを指定します。デフォルトは`require('child_process').spawn`です。

### `$.prefix`

Specifies the command that will be prefixed to all commands run.

Default is `set -euo pipefail;`.

または、CLI引数を使用してください: `--prefix='set -e;'`

### `$.quote`

Specifies a function for escaping special characters during
command substitution.

### `$.verbose`

詳細度を指定します。デフォルトは`true`です。

In verbose mode, `zx` prints all executed commands alongside with their
outputs.

または、CLI引数`--quiet`を使用して`$.verbose = false`に設定してください。

### `$.env`

Specifies an environment variables map.

Defaults to `process.env`.

### `$.cwd`

で作成されたすべてのプロセスの現在の作業ディレクトリを指定します。

The [cd()](#cd) func changes only `process.cwd()` and if no `$.cwd` specified,
all `$` processes use `process.cwd()` by default (same as `spawn` behavior).

### `$.log`

[ログ関数](src/core.ts)を指定します。

```ts
import { LogEntry, log } from 'zx/core';

$.log = (entry: LogEntry) => {
  switch (entry.kind) {
    case 'cmd':
      // for example, apply custom data masker for cmd printing
      process.stderr.write(masker(entry.cmd));
      break;
    default:
      log(entry);
  }
};
```

## Polyfills

### `__filename` & `__dirname`

In [ESM](https://nodejs.org/api/esm.html) modules, Node.js does not provide
`__filename` and `__dirname` globals. As such globals are really handy in
scripts,
`zx` provides these for use in `.mjs` files (when using the `zx` executable).

### `require()`

In [ESM](https://nodejs.org/api/modules.html#modules_module_createrequire_filename)
modules, the `require()` function is not defined.
The `zx` provides `require()` function, so it can be used with imports in `.mjs`
files (when using `zx` executable).

```js
let { version } = require('./package.json');
```

## FAQ

### Passing env variables

```js
process.env.FOO = 'bar';
await $`echo $FOO`;
```

### Passing array of values

When passing an array of values as an argument to `$`, items of the array will
be escaped
individually and concatenated via space.

例：

```js
let files = [...]
await $`tar cz ${files}`
```

### Importing into other scripts

や他の関数を使用することができます：

```js
#!/usr/bin/env node
import { $ } from 'zx';

await $`date`;
```

### Scripts without extensions

If script does not have a file extension (like `.git/hooks/pre-commit`), zx
assumes that it is
an [ESM](https://nodejs.org/api/modules.html#modules_module_createrequire_filename)
module.

### Markdown scripts

The `zx` can execute [scripts written as markdown](docs/markdown.md):

```bash
zx docs/markdown.md
```

### TypeScript scripts

```ts
import { $ } from 'zx';
// Or
import 'zx/globals';

void (async function () {
  await $`ls -la`;
})();
```

Set [`"type": "module"`](https://nodejs.org/api/packages.html#packages_type)
in **package.json**
and [`"module": "ESNext"`](https://www.typescriptlang.org/tsconfig/#module)
in **tsconfig.json**.

### Executing remote scripts

If the argument to the `zx` executable starts with `https://`, the file will be
downloaded and executed.

```bash
zx https://medv.io/game-of-life.js
```

### Executing scripts from stdin

`zx`はstdinからのスクリプトの実行をサポートしています。

```js
zx << 'EOF';
await $`pwd`;
EOF;
```

### Executing scripts via --eval

次の引数をスクリプトとして評価します。

```bash
cat package.json | zx --eval 'let v = JSON.parse(await stdin()).version; echo(v)'
```

### Installing dependencies via --install

```js
// script.mjs:
import sh from 'tinysh';

sh.say('Hello, world!');
```

Add `--install` flag to the `zx` command to install missing dependencies
automatically.

```bash
zx --install script.mjs
```

You can also specify needed version by adding comment with `@` after
the import.

```js
import sh from 'tinysh'; // @^1
```

### Executing commands on remote hosts

The `zx` uses [webpod](https://github.com/webpod/webpod) to execute commands on
remote hosts.

```js
import { ssh } from 'zx';

await ssh('user@host')`echo Hello, world!`;
```

### Attaching a profile

By default `child_process` does not include aliases and bash functions.
But you are still able to do it by hand. Just attach necessary directives
to the `$.prefix`.

```js
$.prefix += 'export NVM_DIR=$HOME/.nvm; source $NVM_DIR/nvm.sh; ';
await $`nvm -v`;
```

### Using GitHub Actions

デフォルトのGitHub Actionランナーには`npx`がインストールされています。

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build
        env:
          FORCE_COLOR: 3
        run: |
          npx zx <<'EOF'
          await $`...`
          EOF
```

### Canary / Beta / RC builds

Impatient early adopters can try the experimental zx versions.
But keep in mind: these builds are ⚠️️**beta** in every sense.

```bash
npm i zx@dev
npx zx@dev --install --quiet <<< 'import _ from "lodash" /* 4.17.15 */; console.log(_.VERSION)'
```

## License

[Apache-2.0](LICENSE)

Disclaimer: _This is not an officially supported Google product._
