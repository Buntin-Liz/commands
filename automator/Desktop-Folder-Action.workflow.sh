#!/bin/bash

# Desktop Folder Action - Screenshot cleaner
LOG_FILE="/tmp/desktop-folder-action.log"
PYTHON="/Users/takumi.aoki/.pyenv/shims/python"

if [ ! -f "$LOG_FILE" ]; then
  touch "$LOG_FILE"
fi

echo "$(date): Starting Desktop Folder Action" >> "$LOG_FILE"
"$PYTHON" "$HOME/commands/automator/screenshot-cleaner.py" >> "$LOG_FILE" 2>&1
echo "$(date): Desktop Folder Action completed" >> "$LOG_FILE"
