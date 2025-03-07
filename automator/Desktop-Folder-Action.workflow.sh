#!/bin/bash

LOG_FILE="/tmp/Desktop-Folder-Action.log"

if [ ! -f $LOG_FILE ]; then
  touch $LOG_FILE
fi

## screenshot cleaner
/Users/takumi.aoki/.pyenv/shims/python /Users/takumi.aoki/commands/automator/screenshot_cleaner.py >>$LOG_FILE 2>&1
