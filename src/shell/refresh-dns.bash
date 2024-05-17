#!/bin/bash
#
# refresh-dnf
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder


