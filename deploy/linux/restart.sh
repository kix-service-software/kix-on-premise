#!/bin/bash

# import environment for docker-compose
source ./environment
export $(cut -d= -f1 ./environment | egrep '^[A-Z]')

# check if SSP is available
RESULT=$(docker pull ${REGISTRY}/ssp:${IMAGE_TAG} 2>&1 >/dev/null)
if [ $? == 0 ]; then
  export COMPOSE_FILE=docker-compose.yml:docker-compose_ssp.yml
fi

# check which compose v2 is available
COMPOSE_V2_NOT_FOUND=$(docker compose version 2>&1 | grep -ci "'compose' is not a docker command")

# restart KIX stack
if [ "$COMPOSE_V2_NOT_FOUND" -eq "0" ]; then
  docker compose -p ${NAME} restart $1
else
  docker-compose -p ${NAME} restart $1
fi
