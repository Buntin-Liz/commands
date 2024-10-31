###
# https://github.com/Buntin-Liz/commands
# commands
# Newer version deployment script
# Caution: This script is not executable from Bun (Now)
#          Execute this from zsh or bash
###
# Check current directory is root of git repository

if [ "$(git rev-parse --show-toplevel 2> /dev/null)" = "$(pwd)" ]; then
  echo "$(pwd) is Repo root."
else
  echo "$(pwd) is not Repo root."
  exit(1)
fi

# Bun install
bun install
rm -rf bin
cp -r ./template ./bin

# [ADVANCED] deployment automation scripts fields(Bun,Node,Deno,Python,Bash,etc...)
# Hooks
bun run ./bin/_auto.bun.ts

bun run src/deploy.bun.ts
# bun run src/deploy.python.ts
