#!/bin/bash

# import environment for docker-compose
source ./environment
export $(cut -d= -f1 ./environment | egrep '^[A-Z]')

# check which compose v2 is available
COMPOSE_V2_NOT_FOUND=$(docker compose version 2>&1 | grep -ci "'compose' is not a docker command")

# stop update and start KIX stack
if [ "$COMPOSE_V2_NOT_FOUND" -eq "0" ]; then

  ./stop.sh
  docker compose -p ${NAME} pull
  ./start.sh

else
  ./stop.sh
  docker-compose -p ${NAME} pull
  ./start.sh
fi
