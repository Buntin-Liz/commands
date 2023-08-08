#!/bin/bash

SSH_CONFIG=$HOME/.ssh/config

echo "known hosts:"

if test -e $SSH_CONFIG; then
    for i in `grep "^Host " $SSH_CONFIG | sed s/"^Host "//`
    do
        echo "  ${i};"
    done
else
    echo "nothing ssh-lsconfig file"
fi
