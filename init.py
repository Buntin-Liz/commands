#!/usr/bin/env python3

import os
import glob

# スクリプト拡張子(これがトリガー)
EXTENSIONS = ["py", "sh", "bash", "mjs"]
# 除外ファイル(パスのプレフィックスを削除)
EXCLUDE_FILES = ["py/Client.py"]


def create_symlinks():
  for extension in EXTENSIONS:
    for filepath in glob.iglob(f"./src/**/*.{extension}", recursive=True):
      relative_path = os.path.relpath(filepath, './src')
      if relative_path in EXCLUDE_FILES:
        continue
      filename_without_extension = os.path.splitext(os.path.basename(filepath))[0]
      link_name = f"./{filename_without_extension}"
      if os.path.islink(link_name):
        os.unlink(link_name)
      os.symlink(filepath, link_name)
      print(f"created: {filename_without_extension}")


if __name__ == "__main__":
  create_symlinks()
