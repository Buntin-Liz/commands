#!/bin/sh

###
#
# SYNC
#
# https://github.com/Buntin-Liz/commands
# commands
# Newer version deployment script
# Caution: This script is not executable from Bun (Now)
#          Execute this from zsh or bash
###
# Check current directory is root of git repository

#Env

COMMANDS_BIN="$(pwd)/bin"
COMMANDS_INSTALL="$(pwd)/commands_install.sh"

# 1. Checking Location exec Deploy command at.
echo "1. Check PWD Location."

if [ "$(git rev-parse --show-toplevel 2> /dev/null)" = "$(pwd)" ]; then
  echo "$(pwd) is Repo root."
else
  echo "$(pwd) is not Repo root."
  exit 1
fi

# 2. Check User Shell Config.
echo "2. Check Shell & RC_File Config"

get_default_shell() {
  if command -v getent >/dev/null 2>&1; then
    USER_SHELL=$(getent passwd "$USER" | awk -F: '{print $7}')
  else
    if [ -f /etc/passwd ]; then
      USER_SHELL=$(grep "^$USER:" /etc/passwd | awk -F: '{print $7}')
    fi
  fi

  if [ -z "$USER_SHELL" ] && [ "$(uname)" = "Darwin" ]; then
    echo "$(uname)"
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
  bash)
    RC_FILE="$HOME/.bashrc"
    ;;
  zsh)
    RC_FILE="$HOME/.zshrc"
    ;;
  ksh)
    RC_FILE="$HOME/.kshrc"
    ;;
  csh)
    RC_FILE="$HOME/.cshrc"
    ;;
  tcsh)
    RC_FILE="$HOME/.tcshrc"
    ;;
  fish)
    RC_FILE="$HOME/.config/fish/config.fish"
    ;;
  sh)
    RC_FILE="$HOME/.shrc"
    ;;
  *)
    echo "unknown shell detected."
    exit 1
    ;;
esac

LINE_TO_ADD=". $COMMANDS_INSTALL"

if [ ! -f "$RC_FILE" ]; then
  echo "$RC_FILE is not exsists."
fi

echo "---"
echo "OS:      $(uname)"
echo "RC-File: $RC_FILE"
echo "Shell:   $SHELL_NAME"
echo "---"

bun run lib/gen-install.ts

if ! grep -Fxq "$LINE_TO_ADD" "$RC_FILE"; then
  echo -e "\n$LINE_TO_ADD\n\n" >> "$RC_FILE"
  echo "The line added to '$RC_FILE'"
else
  echo "The line already exists in '$RC_FILE'"
fi

# 4. bun, deno check
echo "4. Bun & Deno Checking"

if ! command -v deno >/dev/null 2>&1; then
  echo "Error: 'deno' is not found in PATH. Please install Deno before continuing."
  exit 1
else
  echo "'deno' is found in PATH. Continuing..."
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "Error: 'bun' is not found in PATH. Please install Deno before continuing."
  exit 1
else
  echo "'bun' is found in PATH. Continuing..."
fi

# 5. install dependences
echo "5. Install dependences"

bun install
rm -rf bin
cp -r ./template ./bin

# 6. deploy
echo "6. deploy into bin directory"

bun run ./bin/_auto.bun.ts

bun run src/deploy.bun.ts

