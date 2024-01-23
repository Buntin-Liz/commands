#!/bin/bash
#
#GPGキーの生成
gpg --full-generate-key
# GPGキーIDの取得
GPG_KEY_ID=$(gpg --list-secret-keys --keyid-format LONG | grep sec | awk '{print $2}' | cut -d'/' -f2)
echo "GPG Key ID: $GPG_KEY_ID"

# Git設定
git config --global user.signingkey $GPG_KEY_ID
git config --global commit.gpgsign true

# GPGキーの公開キーを表示（GitHubに手動で登録するため）
gpg --armor --export $GPG_KEY_ID
