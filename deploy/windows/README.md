# How to Deploy KIX on-premise on Windows

## Prerequisites
- Install Docker Desktop on your host system
  - see https://docs.docker.com/install/
- install Docker-Compose on your host system
  - Docker Desktop for Windows includes Docker-Compose.
- Enable shared drives in Docker Desktop settings
  - see https://docs.docker.com/docker-for-windows/#shared-drives

### Minimal System requirements
- Dual Core CPU
- 4 GB RAM

## Get Docker Environment Configuration
- create directory for your kix-on-premise installation
- get initial docker environment setup
  - download and unzip
      - `https://download.kixdesk.com/kix-on-premise.tar.gz`
  - option b) clone from github
      - `git clone https://github.com/cape-it/kix-on-premise.git`
- change to extracted directory
  - `cd kix-on-premise`

## Configuration (optional)
- see file `environment`
- you may change the default ports under which you connect to KIX
  - `BACKEND_PORT` (Default: 20000)
  - `FRONTEND_PORT` (Default: 20001)
  - `BACKEND_PORT_SSL` (Default: 20443)
  - `FRONTEND_PORT_SSL` (Default: 20444)

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
- execute start script
 - `start.ps1`

## Stop KIX
- execute stop script
 - `stop.ps1`

## Update KIX
- execute update script
 - `update.ps1`

## Restart Services
- execute restart script without any parameter to restart all services
 - `restart.ps1`
- execute restart script with the desired service to restart
 - `restart.ps1 backend`

## Accessing Stack Logs
In case you need to monitor your stack, you can do so with the following script. All Information are printed to `STDOUT`.
- execute logging script
 - `logs.ps1`

To exit, just hit `Ctrl+C`

# Data Persistence
Docker on Windows requires shared drives for Linux containers!
The following services use volumes created on the first startup to store their persistent data. These volumes will be created in the docker volumes directory (usually `%PROGRAMDATA%/DockerDesktop/vm-data`). If you want to change the location, you have to change the volumes definition in the file `docker-compose.yml`.
- frontend
- backend
- db
- shared
