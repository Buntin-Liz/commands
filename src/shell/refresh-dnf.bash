#!/bin/bash

# Refresh DNF
sudo dnf check-update
sudo dnf update -y
sudo dnf upgrade -y
sudo dnf autoremove -y
sudo dnf clean all
sudo dnf makecache

