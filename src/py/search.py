#!/usr/bin/env python3

import os
import argparse

parser = argparse.ArgumentParser(
    description='Search for a string in all files and directories.')
parser.add_argument('search_string', help='The string to search for.')
args = parser.parse_args()

for dirpath, dirnames, filenames in os.walk('.'):
  for filename in filenames:
    filepath = os.path.join(dirpath, filename)
    try:
      with open(filepath, 'r') as file:
        if args.search_string in file.read():
          print(filepath)
    except:
      pass
