#!/bin/bash

# import environment for docker-compose
source ./environment
export $(cut -d= -f1 ./environment | egrep '^[A-Z]')

# check which compose v2 is available
COMPOSE_V2_NOT_FOUND=$(docker compose version 2>&1 | grep -ci "'compose' is not a docker command")

# stop KIX stack
if [ "$COMPOSE_V2_NOT_FOUND" -eq "0" ]; then
  docker compose -p ${NAME} down
else
  docker-compose -p ${NAME} down
fi
