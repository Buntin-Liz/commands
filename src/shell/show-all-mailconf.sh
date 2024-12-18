#!/bin/bash

echo "postfix"
echo "---"
egrep -v "#|^$" /etc/postfix/main.cf                                            
egrep -v "#|^$" /etc/postfix/master.cf
egrep -v "#|^$" /etc/postfix/transport
echo "---"
echo "dovecot"
echo "---"
egrep -v "#|^$" /etc/dovecot/dovecot.conf
egrep -v "#|^$" /etc/dovecot/conf.d/*.conf
egrep -v "#|^$" /etc/dovecot/conf.d/auth-passwdfile.conf.ext
echo "---"
