#!/bin/sh

###
#
# DEPLOY
#
# https://github.com/Buntin-Liz/commands
# commands - デプロイスクリプト
# シンボリックリンクの作成、パーミッション設定、シェル設定ファイルへの登録を行う
#
###

COMMANDS_DIR="$(pwd)"
COMMANDS_BIN="$COMMANDS_DIR/bin"
COMMANDS_INSTALL="$COMMANDS_DIR/commands_install.sh"

# 1. リポジトリルートチェック
echo "1. リポジトリルートの確認"

if [ "$(git rev-parse --show-toplevel 2>/dev/null)" = "$COMMANDS_DIR" ]; then
  echo "  OK: $COMMANDS_DIR はリポジトリルートです。"
else
  echo "  Error: $COMMANDS_DIR はリポジトリルートではありません。"
  exit 1
fi

# 2. シェル / RC ファイルの特定
echo "2. シェル設定ファイルの確認"

get_default_shell() {
  if command -v getent >/dev/null 2>&1; then
    USER_SHELL=$(getent passwd "$USER" | awk -F: '{print $7}')
  else
    if [ -f /etc/passwd ]; then
      USER_SHELL=$(grep "^$USER:" /etc/passwd | awk -F: '{print $7}')
    fi
  fi

  if [ -z "$USER_SHELL" ] && [ "$(uname)" = "Darwin" ]; then
    USER_SHELL=$(dscl . -read /Users/"$USER" UserShell | awk '{print $2}')
  fi

  if [ -z "$USER_SHELL" ]; then
    USER_SHELL="$SHELL"
  fi

  if [ -z "$USER_SHELL" ]; then
    USER_SHELL="/bin/sh"
  fi

  echo "$USER_SHELL"
}

USER_SHELL=$(get_default_shell)
SHELL_NAME=$(basename "$USER_SHELL")

case "$SHELL_NAME" in
  bash) RC_FILE="$HOME/.bashrc" ;;
  zsh)  RC_FILE="$HOME/.zshrc"  ;;
  ksh)  RC_FILE="$HOME/.kshrc"  ;;
  csh)  RC_FILE="$HOME/.cshrc"  ;;
  tcsh) RC_FILE="$HOME/.tcshrc" ;;
  fish) RC_FILE="$HOME/.config/fish/config.fish" ;;
  sh)   RC_FILE="$HOME/.shrc"   ;;
  *)
    echo "  Error: 未知のシェル '$SHELL_NAME' が検出されました。"
    exit 1
    ;;
esac

echo "  ---"
echo "  OS:      $(uname)"
echo "  Shell:   $SHELL_NAME"
echo "  RC-File: $RC_FILE"
echo "  ---"

# 3. RC ファイルへの source 行追加
echo "3. RC ファイルへの登録"

LINE_TO_ADD=". $COMMANDS_INSTALL"

if [ ! -f "$RC_FILE" ]; then
  echo "  Warning: $RC_FILE が存在しません。"
fi

if ! grep -Fxq "$LINE_TO_ADD" "$RC_FILE" 2>/dev/null; then
  printf "\n%s\n\n" "$LINE_TO_ADD" >> "$RC_FILE"
  echo "  OK: '$LINE_TO_ADD' を '$RC_FILE' に追記しました。"
else
  echo "  Skip: '$RC_FILE' には既に登録済みです。"
fi

# 4. bun チェック
echo "4. Bun の確認"

if ! command -v bun >/dev/null 2>&1; then
  echo "  Error: bun が見つかりません。Bun をインストールしてから再実行してください。"
  exit 1
else
  echo "  OK: bun が見つかりました。"
fi

# 5. 依存パッケージのインストール
echo "5. 依存パッケージのインストール"
bun install

# 6. bin ディレクトリの初期化
echo "6. bin ディレクトリの初期化"
rm -rf "$COMMANDS_BIN"
cp -r "$COMMANDS_DIR/template" "$COMMANDS_BIN"
echo "  OK: template → bin をコピーしました。"

# 7. _auto.bun.ts フックの実行
echo "7. 初期化フック (_auto.bun.ts) の実行"
bun run "$COMMANDS_BIN/_auto.bun.ts"

# 8. シンボリックリンクの作成 (deploy.bun.ts)
echo "8. シンボリックリンクの作成"
bun run "$COMMANDS_DIR/src/deploy.bun.ts"

echo ""
echo "デプロイ完了。"
