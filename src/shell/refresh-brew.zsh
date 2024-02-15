#!/usr/bin/env zsh
echo "Refreshing Homebrew"
echo "Updating Homebrew"
brew update
echo "Upgrading Homebrew"
brew upgrade
echo "Cleaning up Homebrew"
brew cleanup
echo "Removing old versions"
brew autoremove