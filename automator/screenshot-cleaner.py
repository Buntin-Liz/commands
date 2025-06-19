import os
import shutil
import datetime
import zipfile
import re
from pathlib import Path

# Format for date-based directories
IMAGES_DIR_FORMAT = "%Y-%m-%d"

# Path definitions
DESKTOP_DIR = Path.home() / "Desktop"
DOWNLOADS_DIR = Path.home() / "Downloads"
ARCHIVE_DIR = DESKTOP_DIR / "archives"

# Regular expressions for different screenshot formats
MAC_SC_REGEX = re.compile(r"^スクリーンショット (\d{4}-\d{2}-\d{2}) (\d{2}).(\d{2}).(\d{2})(.*)\.png$")
FF_SC_REGEX = re.compile(r"^Screenshot (\d{4}-\d{2}-\d{2}) at (\d{2})-(\d{2})-(\d{2})(?: (.*))?\.png$")


def get_creation_time(file_path):
    """Get file creation time in a cross-platform way"""
    try:
        # macOS specific
        return datetime.datetime.fromtimestamp(file_path.stat().st_birthtime)
    except AttributeError:
        # Fallback for other platforms
        return datetime.datetime.fromtimestamp(file_path.stat().st_ctime)


def organize_screenshots():
    """Organize screenshots from Desktop into date-based folders"""
    try:
        # Create archive directory if it doesn't exist
        if not ARCHIVE_DIR.exists():
            ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

        today_midnight = datetime.datetime.combine(datetime.datetime.today(), datetime.time.min)
        print(f"Today midnight: {today_midnight}")

        # Process files on Desktop
        for item in DESKTOP_DIR.iterdir():
            if not item.is_file():
                continue

            # Check if file is a screenshot (either macOS or Firefox format)
            is_mac_screenshot = item.name.startswith("スクリーンショット ") and item.name.endswith(".png")
            is_ff_screenshot = FF_SC_REGEX.match(item.name) is not None

            if is_mac_screenshot or is_ff_screenshot:
                creation_time = get_creation_time(item)

                # Only move screenshots from previous days
                if creation_time < today_midnight:
                    date_folder = ARCHIVE_DIR / creation_time.strftime(IMAGES_DIR_FORMAT)
                    if not date_folder.exists():
                        date_folder.mkdir(parents=True, exist_ok=True)

                    # Move the file
                    target_path = date_folder / item.name
                    shutil.move(str(item), str(target_path))
                    print(f"Moved {item.name} to {date_folder}")

    except Exception as e:
        print(f"Error organizing screenshots: {e}")


def compress_old_directories():
    """Compress directories older than a week into zip files"""
    try:
        screenshots_archive_path = ARCHIVE_DIR
        if not screenshots_archive_path.exists():
            return

        one_week_ago = datetime.datetime.now() - datetime.timedelta(days=7)
        one_week_ago = datetime.datetime.combine(one_week_ago.date(), datetime.time.max)
        print(f"One week ago: {one_week_ago}")

        for folder in screenshots_archive_path.iterdir():
            if not folder.is_dir() or not folder.name[0].isdigit():
                continue

            try:
                # Parse the folder name as a date
                folder_date = datetime.datetime.strptime(folder.name, IMAGES_DIR_FORMAT)
                folder_date = datetime.datetime.combine(folder_date.date(), datetime.time.min)

                # Compress folders older than a week
                if folder_date < one_week_ago:
                    zip_filename = folder.with_suffix(".zip")

                    # Skip if zip file already exists
                    if zip_filename.exists():
                        print(f"Zip file already exists for {folder}, skipping")
                        continue

                    print(f"Compressing {folder} to {zip_filename}")

                    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
                        folder_path = folder.resolve()

                        # Add all files in the folder to the zip
                        for root, _, files in os.walk(folder):
                            for file in files:
                                file_path = Path(root) / file
                                # Store files with paths relative to the folder being compressed
                                arcname = file_path.relative_to(folder)
                                zipf.write(file_path, arcname)

                    # Verify zip file was created successfully before removing the folder
                    if zip_filename.exists() and zip_filename.stat().st_size > 0:
                        shutil.rmtree(folder)
                        print(f"Compressed and removed {folder}")
                    else:
                        print(f"Failed to create zip file for {folder}, not removing original")

            except ValueError:
                # Skip folders that don't match the date format
                print(f"Skipping folder with invalid date format: {folder}")
                continue

    except Exception as e:
        print(f"Error compressing directories: {e}")


if __name__ == "__main__":
    print(f"Starting screenshot organization at {datetime.datetime.now()}")
    organize_screenshots()
    compress_old_directories()
    print(f"Finished at {datetime.datetime.now()}")
