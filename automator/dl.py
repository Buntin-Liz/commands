#!/usr/bin/env python3
import os
import shutil
from datetime import datetime, timedelta

downloadsFileRetention = 500

home = os.environ.get("HOME")
if not home:
    raise EnvironmentError("HOME not found in environment variables")
downloads = os.path.join(home, "Downloads")
dl_dir = os.path.join(home, "Desktop", "dl")


def cleanup_downloads(all_clean):
    """
    downloadsディレクトリ内のファイルのうち、ファイル作成日時が
    本日00:00:00からdownloadsFileRetention日分前より古いもの（または
    all_cleanがTrueの場合はすべて）をdl_dirに移動します。
    """
    skip_files = []
    moved_files = []
    skipped_directories = []

    now = datetime.now()
    today_start = datetime(now.year, now.month, now.day, 0, 0, 0)
    threshold_date = today_start - timedelta(days=downloadsFileRetention)

    with os.scandir(downloads) as entries:
        for entry in entries:
            if entry.is_file():
                file_path = os.path.join(downloads, entry.name)
                stat_info = os.stat(file_path)
                creation_time = datetime.fromtimestamp(stat_info.st_birthtime)
                print("cdate:", creation_time)
                print("tdate:", threshold_date)

                if creation_time < threshold_date or all_clean:
                    destination_path = os.path.join(dl_dir, entry.name)
                    shutil.move(file_path, destination_path)
                    moved_files.append(destination_path)
                else:
                    skip_files.append(file_path)
            elif entry.is_dir():
                skipped_directories.append(entry.name)
    print('---')
    print('skipFiles')
    for f in skip_files:
        print(f)
    print('---')
    print('movedFiles')
    for f in moved_files:
        print(f)
    print('---')
    return skip_files, moved_files, skipped_directories


if __name__ == "__main__":
    if not os.path.exists(dl_dir):
        os.makedirs(dl_dir, exist_ok=True)

    cleanup_downloads(all_clean=False)
