import os
import shutil
import datetime
import zipfile
from pathlib import Path

IMAGES_DIR_FORMAT = "%Y-%m-%d"

DESKTOP_DIR = Path.home() / "Desktop"
DOWNLOADS_DIR = Path.home() / "Downloads"
ARCHIVE_DIR = DESKTOP_DIR / "archives"


def organize_screenshots():
    if not ARCHIVE_DIR.exists():
        ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    today_midnight = datetime.datetime.combine(datetime.datetime.today(), datetime.time.min)
    print(today_midnight)
    for item in DESKTOP_DIR.iterdir():
        if item.is_file() and item.name.startswith("スクリーンショット ") and item.name.endswith(".png"):
            creation_time = datetime.datetime.fromtimestamp(item.stat().st_birthtime)
            if creation_time < today_midnight:
                date_folder = ARCHIVE_DIR / creation_time.strftime(IMAGES_DIR_FORMAT)
                if not date_folder.exists():
                    date_folder.mkdir(parents=True, exist_ok=True)
                shutil.move(str(item), str(date_folder / item.name))
                print(f"Moved {item.name} to {date_folder}")


def compress_old_directories():
    screenshots_archive_path = ARCHIVE_DIR
    if not screenshots_archive_path.exists():
        return
    one_week_ago = datetime.datetime.combine((datetime.datetime.now() - datetime.timedelta(days=7)).date(), datetime.time.max)
    print(one_week_ago)
    for folder in screenshots_archive_path.iterdir():
        if folder.is_dir():
            folder_date = datetime.datetime.combine(datetime.datetime.strptime(folder.name, IMAGES_DIR_FORMAT), datetime.time.min)
            if folder_date < one_week_ago:
                zip_filename = folder.with_suffix(".zip")
                with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for root, _, files in os.walk(folder):
                        for file in files:
                            file_path = Path(root) / file
                            zipf.write(file_path, file_path.relative_to(folder.parent))
                shutil.rmtree(folder)
                print(f"Compressed and removed {folder}")


if __name__ == "__main__":
    organize_screenshots()
    # compress_old_directories()
