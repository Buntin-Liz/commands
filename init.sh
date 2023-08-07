#!/usr/bin/env sh

CURRENT_DIR=$(cd $(dirname $0); pwd)

if [ -e "init.sh" ]; then
    echo "dir is healthful."
else
    echo "run in commands dir"
    exit 1
fi


SCRIPT_DIR=$CURRENT_DIR/scripts
if [ ! -d "scripts" ]; then
    mkdir scripts
fi

cd scripts

# import testssl.sh
if [ ! -d "testssl" ]; then
    mkdir testssl
fi
cd testssl
wget https://testssl.sh/testssl.sh
chmod +x testssl.sh
cd $CURRENT_DIR
ln -s $SCRIPT_DIR/testssl/testssl.sh testssl

#TODO:path通し自動化