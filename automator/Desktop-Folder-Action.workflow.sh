#!/bin/bash

LOG_FILE="/tmp/Desktop-Folder-Action.log"
PYTHON="/Users/takumi.aoki/.pyenv/shims/python"

if [ ! -f $LOG_FILE ]; then
  touch $LOG_FILE
fi

## Own Scripts allowed only python3.12 ( because of avast virus scanner )

## screenshot cleaner
"$PYTHON" $HOME/commands/automator/screenshot_cleaner.py >>$LOG_FILE 2>&1
