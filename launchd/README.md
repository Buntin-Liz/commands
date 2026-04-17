# launchd 定期実行ジョブ管理

このディレクトリは `~/Library/LaunchAgents` に配置する `.plist` ファイルを管理します。

## 管理ファイル一覧

| plist ファイル | Label | 用途 |
|---|---|---|
| `local.commands.ssh.socks.bc2.plist` | `local.commands.ssh.socks.bc2` | SOCKS5 プロキシ (bc2, port 45454) |

---

## local.commands.ssh.socks.bc2

- **ラベル**: `local.commands.ssh.socks.bc2`
- **plist**: `~/commands/launchd/local.commands.ssh.socks.bc2.plist`
- **起動スクリプト**: `~/commands/scripts/commands-45454-sock5-proxy.sh`

### 登録手順（クリーン再登録）

```sh
set -eu

DOMAIN="gui/$(id -u)"
AGENT_DIR="$HOME/Library/LaunchAgents"
REPO_DIR="/Users/takumi.aoki/commands"
NEW_LABEL="local.commands.ssh.socks.bc2"
OLD_LABEL="local.ssh.socks.bc2"
NEW_PLIST_NAME="local.commands.ssh.socks.bc2.plist"
OLD_PLIST_NAME="local.ssh.socks.bc2.plist"
SOURCE_PLIST="$REPO_DIR/launchd/$NEW_PLIST_NAME"
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

cp "$SOURCE_PLIST" "$TARGET_PLIST"
chmod 644 "$TARGET_PLIST"

plutil -lint "$TARGET_PLIST"
launchctl bootstrap "$DOMAIN" "$TARGET_PLIST"
launchctl enable "$DOMAIN/$NEW_LABEL"
launchctl kickstart -k "$DOMAIN/$NEW_LABEL"
launchctl print "$DOMAIN/$NEW_LABEL"
```

### 確認

```sh
# ジョブのロード確認
launchctl print "gui/$(id -u)/local.commands.ssh.socks.bc2"

# SOCKS リスナー確認
lsof -nP -iTCP:45454 -sTCP:LISTEN

# SSH プロセス確認
ps -p "$(cat "$HOME/.local/run/ssh-socks-bc2.pid")" -o pid=,command=
```

### 削除のみ

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
  "$HOME/.local/run/ssh-socks-bc2.pid"
```
