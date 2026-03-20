#!/bin/sh
API_UPSTREAM="${API_UPSTREAM:-http://ragtech:4470}"
sed "s|__API_UPSTREAM__|${API_UPSTREAM}|g" /tmp/proxy.conf.template \
  > /usr/local/apache2/conf/extra/supervise-proxy.conf
exec httpd-foreground
