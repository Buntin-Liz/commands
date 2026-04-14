# launchd SOCKS Proxy 運用手順

このドキュメントは、SOCKS プロキシ用 `launchd` ジョブを一度きれいに削除し、
このリポジトリの定義を使って再登録するための手順をまとめたものです。

## 正式なジョブ定義

- ラベル: `local.commands.ssh.socks.bc2`
- 元の plist: `/Users/takumi.aoki/commands/launchd/agents/local.commands.ssh.socks.bc2.plist`
- 起動対象スクリプト: `/Users/takumi.aoki/commands/scripts/commands-45454-sock5-proxy.sh`

## 削除対象になりうる旧ジョブと関連ファイル

- 旧ラベル: `local.ssh.socks.bc2`
- 新ラベル: `local.commands.ssh.socks.bc2`
- 旧 plist の想定配置: `~/Library/LaunchAgents/local.ssh.socks.bc2.plist`
- 新 plist の想定配置: `~/Library/LaunchAgents/local.commands.ssh.socks.bc2.plist`
- stale PID ファイルの想定配置: `~/.local/run/commands-45454-sock5-proxy.pid`
- 旧ログの想定配置: `/tmp/local.ssh.socks.bc2.out.log`, `/tmp/local.ssh.socks.bc2.err.log`

## 完全削除してから再登録する手順

エージェントを所有している macOS ユーザーで、以下をそのまま実行してください。

```sh
set -eu

DOMAIN="gui/$(id -u)"
AGENT_DIR="$HOME/Library/LaunchAgents"
REPO_DIR="/Users/takumi.aoki/commands"
NEW_LABEL="local.commands.ssh.socks.bc2"
OLD_LABEL="local.ssh.socks.bc2"
NEW_PLIST_NAME="local.commands.ssh.socks.bc2.plist"
OLD_PLIST_NAME="local.ssh.socks.bc2.plist"
SOURCE_PLIST="$REPO_DIR/launchd/agents/$NEW_PLIST_NAME"
TARGET_PLIST="$AGENT_DIR/$NEW_PLIST_NAME"
OLD_TARGET_PLIST="$AGENT_DIR/$OLD_PLIST_NAME"
PID_FILE="$HOME/.local/run/commands-45454-sock5-proxy.pid"

mkdir -p "$AGENT_DIR"

launchctl bootout "$DOMAIN/$NEW_LABEL" 2>/dev/null || true
launchctl bootout "$DOMAIN/$OLD_LABEL" 2>/dev/null || true
launchctl bootout "$DOMAIN" "$TARGET_PLIST" 2>/dev/null || true
launchctl bootout "$DOMAIN" "$OLD_TARGET_PLIST" 2>/dev/null || true

rm -f "$TARGET_PLIST" "$OLD_TARGET_PLIST"
rm -f "$PID_FILE"
rm -f /tmp/local.ssh.socks.bc2.out.log /tmp/local.ssh.socks.bc2.err.log

cp "$SOURCE_PLIST" "$TARGET_PLIST"
chmod 644 "$TARGET_PLIST"

plutil -lint "$TARGET_PLIST"
launchctl bootstrap "$DOMAIN" "$TARGET_PLIST"
launchctl enable "$DOMAIN/$NEW_LABEL"
launchctl kickstart -k "$DOMAIN/$NEW_LABEL"
launchctl print "$DOMAIN/$NEW_LABEL"
```

## 確認方法

ジョブが正しくロードされているか確認する:

```sh
launchctl print "gui/$(id -u)/local.commands.ssh.socks.bc2"
```

ローカルの SOCKS リスナーが立っているか確認する:

```sh
lsof -nP -iTCP:45454 -sTCP:LISTEN
```

追跡している `ssh` プロセスを確認する:

```sh
ps -p "$(cat "$HOME/.local/run/commands-45454-sock5-proxy.pid")" -o pid=,command=
```

## 削除だけ行いたい場合

再登録せず、アンロードと関連ファイルの削除だけを行う場合は以下を実行してください。

```sh
set -eu

DOMAIN="gui/$(id -u)"
AGENT_DIR="$HOME/Library/LaunchAgents"

launchctl bootout "$DOMAIN/local.commands.ssh.socks.bc2" 2>/dev/null || true
launchctl bootout "$DOMAIN/local.ssh.socks.bc2" 2>/dev/null || true
launchctl bootout "$DOMAIN" "$AGENT_DIR/local.commands.ssh.socks.bc2.plist" 2>/dev/null || true
launchctl bootout "$DOMAIN" "$AGENT_DIR/local.ssh.socks.bc2.plist" 2>/dev/null || true

rm -f \
  "$AGENT_DIR/local.commands.ssh.socks.bc2.plist" \
  "$AGENT_DIR/local.ssh.socks.bc2.plist" \
  "$HOME/.local/run/commands-45454-sock5-proxy.pid" \
  /tmp/local.ssh.socks.bc2.out.log \
  /tmp/local.ssh.socks.bc2.err.log
```
