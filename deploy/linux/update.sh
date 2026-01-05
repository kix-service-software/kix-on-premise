#!/bin/bash

# import environment for docker-compose
source ./environment
export $(cut -d= -f1 ./environment | egrep '^[A-Z]')

# update KIX stack
if docker compose version &>/dev/null; then
  ./stop.sh
  docker compose -p ${NAME} pull
  ./start.sh
else
  if docker-compose version &>/dev/null; then
    ./stop.sh
    docker-compose -p ${NAME} pull
   ./start.sh
  else
    echo "docker compose is missing, see documentation: https://docs.kixdesk.com/start/de/administration/installation.html"
    exit 1
  fi
fi