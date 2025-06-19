#!/bin/bash

# Template Folder Action - Customizable folder action template
LOG_FILE="/tmp/template-folder-action.log"
PYTHON="$HOME/.pyenv/shims/python"

if [ ! -f "$LOG_FILE" ]; then
  touch "$LOG_FILE"
fi

echo "$(date): Starting Template Folder Action" >> "$LOG_FILE"

# Execute shell script template
if [ -f "$HOME/__TEMPLATE_SH_REPO_DIR__/__TEMPLATE_FOLDER_ACTION_SH__" ]; then
  . "$HOME/__TEMPLATE_SH_REPO_DIR__/__TEMPLATE_FOLDER_ACTION_SH__" >> "$LOG_FILE" 2>&1
fi

# Execute Python script template
if [ -f "$HOME/__TEMPLATE__PYTHON_REPO_01__" ]; then
  "$PYTHON" "$HOME/__TEMPLATE__PYTHON_REPO_01__" >> "$LOG_FILE" 2>&1
fi

echo "$(date): Template Folder Action completed" >> "$LOG_FILE"
