#!/bin/bash

LOG_FILE="/tmp/Downloads-Folder-Action.log"

if [ ! -f $LOG_FILE ]; then
  touch $LOG_FILE
fi

## move keys(*.pem) files into ssh key folder (~/.ssh/keys)
. /Users/takumi.aoki/commands/automator/ssh-key-auto.sh

# firefox-sc-cleaner. moving firefox screenshot into ~/Downloads/screenshots.
/Users/takumi.aoki/commands/automator/firefox-sc-cleaner.ts >>$LOG_FILE 2>&1

/Users/takumi.aoki/.pyenv/shims/python /Users/takumi.aoki/commands/automator/dl.py >>$LOG_FILE 2>&1
