#!/bin/bash

# ユーザーにバーチャルホストのURLとプロキシ先、ポートを入力してもらう
echo "リバースプロキシの設定を行います。"
read -p "設定するバーチャルホストのURLを入力してください: " domain
read -p "プロキシ先のホスト名を入力してください（空白の場合はlocalhostとします）: " proxy_host
read -p "プロキシ先のポート番号を入力してください: " proxy_port

# ユーザーがプロキシ先のホスト名を空白にした場合はlocalhostを使用する
if [ -z "$proxy_host" ]
then
  proxy_host="localhost"
fi

# Nginx設定ファイルの生成
config_file="/etc/nginx/conf.d/${domain}.conf"

echo "server {" > $config_file
echo "    listen 80;" >> $config_file
echo "    server_name $domain;" >> $config_file
echo "    location / {" >> $config_file
echo "        proxy_pass http://$proxy_host:$proxy_port;" >> $config_file
echo "        proxy_http_version 1.1;" >> $config_file
echo "        proxy_set_header Upgrade \$http_upgrade;" >> $config_file
echo "        proxy_set_header Connection \"upgrade\";" >> $config_file
echo "        proxy_set_header Host \$host;" >> $config_file
echo "    }" >> $config_file
echo "}" >> $config_file

# 設定の確認
nginx_result=$(nginx -t 2>&1)

if echo $nginx_result | grep -q "test is successful"; then
    echo "Nginx設定のテストが成功しました。Nginxをリスタートします。"
    systemctl restart nginx
else
    echo "Nginx設定のテストが失敗しました。以下のエラーメッセージを確認してください:"
    echo $nginx_result
    exit 1
fi

