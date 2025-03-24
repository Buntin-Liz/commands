#!/bin/bash

LOG_FILE="/tmp/Downloads-Folder-Action.log"
PYTHON="/Users/takumi.aoki/.pyenv/shims/python"

if [ ! -f $LOG_FILE ]; then
  touch $LOG_FILE
fi

## move keys(*.pem) files into ssh key folder (~/.ssh/keys)
. /Users/takumi.aoki/commands/automator/ssh-key-auto.sh

## Own Scripts allowed only python3.12 ( because of avast virus scanner )

# firefox-sc-cleaner. moving firefox screenshot into ~/Downloads/screenshots.
"$PYTHON" /Users/takumi.aoki/commands/automator/screenshot_cleaner_ff.py >>$LOG_FILE 2>&1

"$PYTHON" /Users/takumi.aoki/commands/automator/dl.py >>$LOG_FILE 2>&1
