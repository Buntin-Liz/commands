###
# https://github.com/Buntin-Liz/commands
# commands
# Newer version deployment script
# This script target is completely transparent about sshls.ts of Deno version\
# Caution: This script is not executable from Bun (Now)
#          Execute this from zsh or bash
###
# Check current directory is root of git repository
if [ "$(git rev-parse --show-toplevel 2> /dev/null)" = "$(pwd)" ]; then
  echo "現在のディレクトリはGitリポジトリのルートです。"
else
  echo "現在のディレクトリはGitリポジトリのルートではありません。"
fi

# Bun install
bun install
rm -rf bin
cp -r ./template ./bin

# [ADVANCED] deployment automation scripts fields(Bun,Node,Deno,Python,Bash,etc...)
# Hooks
# bun run ./bin/_auto.bun.ts

bun run src/deploy.bun.ts

