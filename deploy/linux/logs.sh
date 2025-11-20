#!/bin/bash

# import environment for docker-compose
source ./environment
export $(cut -d= -f1 ./environment | egrep '^[A-Z]')

# stop KIX stack
if docker compose version &>/dev/null; then
  docker compose -p ${NAME} logs --follow
else
  if docker-compose version &>/dev/null; then
    docker-compose -p ${NAME} logs --follow
  else
    echo "docker compose is missing, see documentation: https://docs.kixdesk.com/start/de/administration/installation.html"
    exit 1
  fi
fi
