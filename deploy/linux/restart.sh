#!/bin/bash

# import environment for docker-compose
source ./environment
export $(cut -d= -f1 ./environment | egrep '^[A-Z]')

# check if SSP is available
RESULT=$(docker pull ${REGISTRY}/ssp:${IMAGE_TAG} 2>&1 > /dev/null)
if [ $? == 0 ]; then
   export COMPOSE_FILE=docker-compose.yml:docker-compose_ssp.yml
fi

docker-compose -p ${NAME} restart $1
