#!/bin/bash

# Downloads Folder Action - SSH keys, screenshots, and file cleanup
LOG_FILE="/tmp/downloads-folder-action.log"
PYTHON="/Users/takumi.aoki/.pyenv/shims/python"

if [ ! -f "$LOG_FILE" ]; then
  touch "$LOG_FILE"
fi

echo "$(date): Starting Downloads Folder Action" >> "$LOG_FILE"

# Move SSH keys to secure location
. "$HOME/commands/automator/ssh-key-handler.sh"

# Process Firefox screenshots and move to Desktop
"$PYTHON" "$HOME/commands/automator/screenshot-cleaner-firefox.py" >> "$LOG_FILE" 2>&1

# Clean up old downloads
"$PYTHON" "$HOME/commands/automator/downloads-cleaner.py" >> "$LOG_FILE" 2>&1

echo "$(date): Downloads Folder Action completed" >> "$LOG_FILE"
