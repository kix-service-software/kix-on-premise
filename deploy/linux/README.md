# How to Deploy KIX on-premise on Linux

## Prerequisites
- Install Docker on your host system
  - see https://docs.docker.com/install/
- install Docker-Compose on your host system
  - see https://docs.docker.com/compose/install/

### Minimal System Requirements
- Dual Core CPU
- 4 GB RAM

## Get Docker Environment Configuration
- create directory for your kix-on-premise installation
  - `cd /opt && mkdir kix-on-premise && cd ./kix-on-premise`
- get initial docker environment setup - 
  - `cd /opt`
  - `git clone https://github.com/cape-it/kix-on-premise.git`
- change to extracted directory
  - `cd kix-on-premise`

## Configuration (optional)
- see file `environment`
- you may change the default ports under which you connect to KIX
  - `BACKEND_PORT` (Default: 20000)
  - `FRONTEND_PORT` (Default: 20001)
  - `SSP_PORT_SSL` (Default: 20002) (Self Service Portal - only for KIX Pro)
  - `BACKEND_PORT_SSL` (Default: 20443)
  - `FRONTEND_PORT_SSL` (Default: 20444)
  - `SSP_PORT_SSL` (Default: 20445) (Self Service Portal - only for KIX Pro)
- in case you want to use KIX Pro, change the docker-registry to
  - `REGISTRY=docker-registry.kixdesk.com/customers/<YOURREPOSITORYIDHERE>`


### SSL
If you want to use SSL **instead** of non-SSL just do the following
- comment out everything in `proxy/non-ssl.conf`
- uncomment everything in `proxy/ssl.conf`
- copy your certificate, key and ca-bundle into the directory `proxy/ssl/certs`

If you want to use SSL **additionally** to non-SSL please do the following
- uncomment everything in `proxy/ssl.conf`
- change the port setting in `proxy/ssl.conf` from `80` to `443` and from `8080` to `8443`
- copy your certificate, key and ca-bundle into the directory `proxy/ssl/certs`


## Start KIX
- change to extracted directory
  - `cd /opt/kix-on-premise`
- execute start script
 - `./start.sh`

## Stop KIX
- change to extracted directory
  - `cd /opt/kix-on-premise`
- execute stop script
 - `./stop.sh`

## Update KIX
- change to extracted directory
  - `cd /opt/kix-on-premise`
- execute update script
 - `./update.sh`

## Restart Services
- change to extracted directory
  - `cd /opt/kix-on-premise`
- execute restart script without any parameter to restart all services
 - `./restart.sh`
- execute restart script with the desired service to restart
 - `./restart.sh backend`


## Accessing Stack Logs
In case you need to monitor your stack, you can do so with the following script. All Information are printed to `STDOUT`.
- change to extracted directory
  - `cd /opt/kix-on-premise`
- execute logging script
 - `./logs.sh`

To exit, just hit `Ctrl+C`

# Data Persistence
The following services use volumes created on the first startup to store their persistent data. These volumes will be created in the docker volumes directory (usually `/var/lib/docker/volumes`). If you want to change the location, you have to change the volumes definition in the file `docker-compose.yml`.
- frontend
- backend
- db
- shared
