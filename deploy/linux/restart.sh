#!/bin/bash

# import environment for docker-compose
source ./environment
export $(cut -d= -f1 ./environment | egrep '^[A-Z]')

echo "setting permissions for config files to 664"
chmod -Rv 664 {backend,db}/*.conf

# restart KIX stack
if docker compose version &>/dev/null; then
  docker compose -p ${NAME} restart $1
else
  if docker-compose version &>/dev/null; then
    docker-compose -p ${NAME} restart $1
  else
    echo "docker compose is missing, see documentation: https://docs.kixdesk.com/start/de/administration/installation.html"
    exit 1
  fi
fi