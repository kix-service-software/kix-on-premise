#!/bin/bash

set -x 

export no_proxy=backend
export NODE_OPTIONS=${NODE_OPTIONS:---max-old-space-size=3072}

# create needed directories
for DIR in logs data; do 
    if [ ! -d /mnt/data/${DIR} ]; then
       mkdir -p /mnt/data/${DIR}

       rm -rf /opt/kix/${DIR}
       ln -s /mnt/data/${DIR} /opt/kix/${DIR}
    fi
done

# do not proceed until the required services are ready
waitfor "redis cache" 10 "redis-cli -h redis ping"
waitfor "frontend"    10 "test \`curl --noproxy '*' -s -o /dev/null -w ''%{http_code}'' http://frontend:3000/auth\` == 200"

# do not proceed until the required backend API token is provided
waitfor "api token"   10 "ls /mnt/shared/backend_api_token"

# get the valid backend API token before proceeding
export BACKEND_API_TOKEN=$(cat /mnt/shared/backend_api_token)

# force UTF-8 locale
export LANG=C.UTF-8

# start the application
npm start
