#!/bin/bash

# import environment for docker-compose
source ./environment
export $(cut -d= -f1 ./environment | egrep '^[A-Z]')

docker stack rm ${NAME}

sleep 10

echo "setting permissions for config files to 664"
chmod -Rv 664 {backend,db,redis}/*.conf

docker stack deploy -c $(pwd)/docker-compose.yml --resolve-image always --with-registry-auth ${NAME}

