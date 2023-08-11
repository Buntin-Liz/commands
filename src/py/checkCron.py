#!/usr/bin/env python3
import subprocess
from pathlib import Path

def get_cron_jobs(user):
    try:
        cron_list = subprocess.check_output(['crontab', '-l', '-u', user], stderr=subprocess.DEVNULL).decode().strip().split('\n')
        return [line for line in cron_list if line and not line.startswith('#')]
    except subprocess.CalledProcessError:
        return []

def extract_paths_and_schedule(cron_jobs):
    paths = set()
    schedules = {}
    for job in cron_jobs:
        parts = job.split()
        schedule = " ".join(parts[:5])
        script_path = next((part for part in parts[5:] if part.startswith('/')), None)
        if script_path:
            dir_path = str(Path(script_path).parent)
            paths.add(dir_path)
            schedules[script_path] = schedule
    return paths, schedules

def main():
    # システムのユーザーを取得
    users = subprocess.check_output(['cut', '-f1', '-d:', '/etc/passwd']).decode().strip().split('\n')

    unique_directories = set()
    schedules_by_user = {}

    for user in users:
        cron_jobs = get_cron_jobs(user)
        paths, schedules = extract_paths_and_schedule(cron_jobs)
        unique_directories.update(paths)
        if schedules:
            schedules_by_user[user] = schedules

    print("Unique Directories:")
    for directory in sorted(unique_directories):
        print(directory)

    print("\nSchedules:")
    for user, schedules in schedules_by_user.items():
        print(f"User: {user}")
        for script, schedule in schedules.items():
            print(f"  {schedule} -> {script}")

if __name__ == "__main__":
    main()

