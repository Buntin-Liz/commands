#!/usr/bin/env python3

import os
import argparse

# コマンドライン引数を処理するためのパーサを作成します。
parser = argparse.ArgumentParser(description='Search for a string in all files and directories.')
parser.add_argument('search_string', help='The string to search for.')
args = parser.parse_args()

# 現在のディレクトリから検索を開始します。
for dirpath, dirnames, filenames in os.walk('.'):
    for filename in filenames:
        filepath = os.path.join(dirpath, filename)
        try:
            with open(filepath, 'r') as file:
                if args.search_string in file.read():
                    print(filepath)
        except:
            # バイナリファイルなど、開くことができないファイルは無視します。
            pass

