#!/bin/sh

LOG_FILE="/tmp/Template-Folder-Action.log"


if [ ! -f "$LOG_FILE" ]; then
  touch "$LOG_FILE"
fi

echo "----------------------------------------" >> "$LOG_FILE"
echo "Running at $(date)" >> "$LOG_FILE"

PYTHON="$HOME/.pyenv/shims/python"


SCRIPTS="
__SCRIPTS__
"

for script in $SCRIPTS
do
  "$PYTHON" "$script" >>"$LOG_FILE" 2>&1
done

echo "" >> "$LOG_FILE"
echo "----------------------------------------" >> "$LOG_FILE"
