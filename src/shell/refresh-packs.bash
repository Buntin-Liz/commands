#!/bin/bash

echo "npm のキャッシュをクリア中..."
npm cache clean --force

echo "cargo のキャッシュをクリア中..."
cargo clean
rm -rf ~/.cargo/registry
rm -rf ~/.cargo/git

echo "pip のキャッシュをクリア中..."
pip cache purge

echo "bun のキャッシュをクリア中..."
bun cache clean

echo "pnpm のキャッシュをクリア中..."
pnpm store prune

echo "すべてのキャッシュをクリアしました。"
