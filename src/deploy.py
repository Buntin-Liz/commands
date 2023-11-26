#!/usr/bin/env python3
import os

deno_dir = "src/ts"


def create_symlinks(target_path, directory, extension_filter=None):
  if not os.path.exists(target_path):
    print(f"'{target_path}'は存在しません。")
    return
  if not os.path.exists(directory):
    print(f"'{directory}'は存在しません。")
    return

  for file in os.listdir(directory):
    if extension_filter is None or file.endswith(extension_filter):
      full_file_path = os.path.join(directory, file)
      symlink_path = os.path.join(target_path, os.path.splitext(file)[0])
      try:
        os.symlink(full_file_path, symlink_path)
        print(f"Created symlink for {file} at {symlink_path}")
      except OSError as e:
        print(f"Error creating symlink for {file}: {e}")


if __name__ == "__main__":
  target_path = os.getcwd()
  script_path = os.path.dirname(os.path.realpath(__file__))
  print(f"OK?: \n'{target_path}'に、'{script_path}'のcommandsスクリプトを配置してよろしいですか？ (y/ or )")
  if input() != "y":
    print("終了します。")
    exit(1)
  directory = script_path
  extension_filter = (".py", ".sh", ".ts", ".js", ".bash")

  create_symlinks(target_path, directory, extension_filter)
