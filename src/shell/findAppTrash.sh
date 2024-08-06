#!/bin/bash

# 引数が指定されていない場合はエラーを表示して終了
if [ -z "$1" ]; then
  echo "Usage: $0 search_string"
  exit 1
fi

search_string="$1"

# 検索するディレクトリのリスト
directories=(
  "/Applications"
  "/Library/Application Support"
  "/Library/Caches"
  "/Library/Preferences"
  "/Library/Logs"
  "$HOME/Library/Application Support"
  "$HOME/Library/Caches"
  "$HOME/Library/Preferences"
  "$HOME/Library/Logs"
  "$HOME/Library/Containers"
  "$HOME/Library/Saved Application State"
)

# 各ディレクトリ内を検索
for dir in "${directories[@]}"; do
  if [ -d "$dir" ]; then
    echo "Searching in: $dir"
    find "$dir" -name "*$search_string*"
  fi
done
