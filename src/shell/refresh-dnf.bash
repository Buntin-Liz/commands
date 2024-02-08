#!/bin/bash

# Refresh DNF
dnf check-update
dnf update -y
dnf upgrade -y
dnf autoremove -y
dnf clean all
dnf makecache