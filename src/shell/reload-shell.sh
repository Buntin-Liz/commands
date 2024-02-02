#!/bin/bash

if [ -n "$BASH_VERSION" ]; then
  echo "Running in Bash"
  SHELL_CONFIG_FILE=~/.bashrc
elif [ -n "$ZSH_VERSION" ]; then
  echo "Running in Zsh"
  SHELL_CONFIG_FILE=~/.zshrc
else
  echo "Unknown shell"
  exit 1
fi

echo "Reloading shell config file: $SHELL_CONFIG_FILE"
source $SHELL_CONFIG_FILE
#ls ~/*.rs

