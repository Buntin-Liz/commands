import os
import re
import datetime
import shutil

HOME = os.getenv("HOME", "")
DOWNLOADS_DIR = os.path.join(HOME, "Downloads")
DESKTOP_DIR = os.path.join(HOME, "Desktop")

MAX_FILENAME_LENGTH = 100
BASH_RESERVED_CHARS = "',|~`;^$<>*?#!=:"

FF_SC_REGEX = re.compile(r"^Screenshot (\d{4}-\d{2}-\d{2}) at (\d{2})-(\d{2})-(\d{2})(?: (.*))?\.png$")
UNIV_SC_REGEX = re.compile(r"^スクリーンショット (\d{4}-\d{2}-\d{2}) (\d{2}).(\d{2}).(\d{2})(.*)\.png$")


def sanitize_filename(filename: str) -> str:
    """Bashで問題を起こす可能性のある特殊文字を削除"""
    return filename.translate(str.maketrans("", "", BASH_RESERVED_CHARS))


def rename_firefox_screenshot(file: str) -> str:
    """Firefoxのスクリーンショットをリネームする"""
    match = FF_SC_REGEX.match(file)
    if not match:
        return file

    date, hh, mm, ss, title = match.groups()
    title = title or "no-title"
    sanitized_title = sanitize_filename(title)

    base_name = f"スクリーンショット {date} {hh}.{mm}.{ss}_firefox_{sanitized_title}"
    new_name = (base_name[:MAX_FILENAME_LENGTH - 4] if len(base_name) + 4 > MAX_FILENAME_LENGTH else base_name) + ".png"

    old_path = os.path.join(DOWNLOADS_DIR, file)
    new_path = os.path.join(DOWNLOADS_DIR, new_name)
    os.rename(old_path, new_path)
    print_log(f"Renamed: {file} -> {new_name}")

    return new_name


def move_screenshot(file: str):
    """スクリーンショットをデスクトップへ移動"""
    match = UNIV_SC_REGEX.match(file)
    if match:
        old_path = os.path.join(DOWNLOADS_DIR, file)
        new_path = os.path.join(DESKTOP_DIR, file)
        shutil.move(old_path, new_path)
        print_log(f"Moved: {old_path} -> {new_path}")


def print_log(message: str):
    """ログ出力"""
    timestamp = datetime.datetime.now().isoformat()
    print(f"{timestamp}: {message}")


def main():
    try:
        files = os.listdir(DOWNLOADS_DIR)
        for file in files:
            renamed_file = rename_firefox_screenshot(file)
            move_screenshot(renamed_file)
    except Exception as e:
        print_log(f"Error: {e}")


if __name__ == "__main__":
    main()
