#!/bin/bash

# Zigのバージョンを指定
ZIG_VERSION="0.12.0"

# Zigのアーカイブをダウンロード
wget "https://ziglang.org/download/${ZIG_VERSION}/zig-linux-x86_64-${ZIG_VERSION}.tar.xz"

# アーカイブを解凍
tar -xf "zig-linux-x86_64-${ZIG_VERSION}.tar.xz"

# 解凍したディレクトリに移動
cd "zig-linux-x86_64-${ZIG_VERSION}"

# Zigの実行可能ファイルを/usr/local/binに移動
sudo mv zig /usr/local/bin

# インストールが完了したか確認
zig version

