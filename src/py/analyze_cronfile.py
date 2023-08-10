#!/usr/bin/env python3
import os


def read_cron_file(file_path):
  with open(file_path, 'r') as file:
    return [line.strip() for line in file.readlines() if line.strip() and not line.startswith('#')]


def extract_scripts_with_shebang(cron_jobs):
  directories_with_shebang = set()
  shell_scripts = []
  for job in cron_jobs:
    parts = job.split()
    script_path = next(
        (part for part in parts[5:] if part.startswith('/')), None)
    if script_path:
      try:
        with open(script_path, 'r') as script_file:
          first_line = script_file.readline().strip()
          if first_line.startswith('#!'):
            directories_with_shebang.add(
                os.path.dirname(script_path))
          else:
            shell_scripts.append(script_path)
      except FileNotFoundError:
        pass  # Ignore files that cannot be found
  return sorted(directories_with_shebang), shell_scripts


def main():
  cron_file_path = 'cron.txt'
  cron_jobs = read_cron_file(cron_file_path)
  directories_with_shebang, shell_scripts = extract_scripts_with_shebang(
      cron_jobs)

  print("Directories containing scripts with shebang:")
  for directory in directories_with_shebang:
    print("  " + directory)

  print("\nShell-like scripts without shebang:")
  for script in shell_scripts:
    print("  " + script)


if __name__ == "__main__":
  main()

