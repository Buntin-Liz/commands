#!/bin/bash


user_name="$1"
#check user is root
if [ "$(id -u)" != "0" ]; then
  echo "このスクリプトはrootで実行してください。"
  exit 1
fi
echo "rootでの実行を確認"

# ユーザー名の存在確認
if id "$user_name" &>/dev/null; then
  echo "ユーザー名 $username は存在します。"
else
  echo "ユーザー名 $username は存在しません。"
  exit 1
fi

read -p "処理を続行しますか? (yes/no): " choice

if [ "$choice" != "yes" ]; then
  echo "処理を中止しました。"
  exit 1
fi

echo "$user_name ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/username

echo "処理を完了しました。"

