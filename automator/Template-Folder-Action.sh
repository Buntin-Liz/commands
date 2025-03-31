#!/bin/bash

LOG_FILE="/tmp/Template-Folder-Action.log"
PYTHON="$HOME/.pyenv/shims/python"

if [ ! -f $LOG_FILE ]; then
  touch $LOG_FILE
fi

## template-folder-action.sh
. $HOME/__TEMPLATE_SH_REPO_DIR__/__TEMPLATE_FOLDER_ACTION_SH__ >>$LOG_FILE 2>&1

## Own Scripts allowed only python3.12 ( because of avast virus scanner )

# template-python-script.py
"$PYTHON" $HOME/__TEMPLATE__PYTHON_REPO_01__ >>$LOG_FILE 2>&1
