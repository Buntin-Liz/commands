#!/bin/bash

# 現在のディレクトリのアクセス権をチェック
if [ -r . ] && [ -x . ]; then
  echo "現在のディレクトリにはアクセス可能です。"
else
  echo "現在のディレクトリにはアクセスできません。"
fi

# 引数で指定されたファイルのアクセス権をチェック
if [ $# -eq 0 ]; then
  echo "ファイルが指定されていません。"
  exit 1
fi

file="$1"

# www-dataユーザーとしてファイルアクセス権を確認
if sudo -u www-data [ -r "$file" ] && [ -x "$file" ]; then
  echo "$file には 'www-data' ユーザーからアクセス可能です。"
else
  echo "$file には 'www-data' ユーザーからアクセスできません。"
fi
