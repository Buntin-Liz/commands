#!/usr/bin/env python3

import os
import shutil
import datetime
from pathlib import Path


def organize_screenshots():
    desktop_path = Path.home() / "Desktop"
    screenshots_path = desktop_path / "screenshots"
    if not screenshots_path.exists():
        screenshots_path.mkdir(parents=True, exist_ok=True)
    today_midnight = datetime.datetime.combine(datetime.datetime.today(), datetime.time.min)
    for item in desktop_path.iterdir():
        if item.is_file() and item.name.startswith("スクリーンショット "):
            creation_time = datetime.datetime.fromtimestamp(item.stat().st_birthtime)
            if creation_time < today_midnight:
                date_folder = screenshots_path / creation_time.strftime("%Y-%m-%d")
                if not date_folder.exists():
                    date_folder.mkdir(parents=True, exist_ok=True)
                shutil.move(str(item), str(date_folder / item.name))
                print(f"Moved {item.name} to {date_folder}")


if __name__ == "__main__":
    organize_screenshots()
