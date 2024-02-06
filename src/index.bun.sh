###
# https://github.com/Buntin-Liz/commands
# commands
# Newer version deployment script
# This script target is completely transparent about sshls.ts of Deno version
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

bun run src/deploy.bun.ts
