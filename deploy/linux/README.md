# How to Deploy KIX on-premises on Linux

## Prerequisites
- Install Docker on your host system
  - see https://docs.docker.com/install/
- install Docker-Compose on your host system
  - see https://docs.docker.com/compose/install/

### Minimal System Requirements
- Dual Core CPU
- 4 GB RAM

### Recommended System Sizing
Assuming following key indicators
- ticket growth of 1k per month
- 20-30 agent users, 10-15 concurrent
- up to 10000 assets
- 500 organisations and  5000 contacts

We recommend a docker host with
- RAM: 8GB
- CPU: min. 4 cores
- some well performing storage (please, no single SATA)
- Debian or Ubuntu LTS with a lean server installation (as Docker host)

---

## Get Docker Environment Configuration
- get initial docker environment setup
  - `cd /opt`
  - `git clone https://github.com/cape-it/kix-on-premise.git`
- change to extracted directory
  - `cd kix-on-premise`

**NOTE**: Keep in mind, that updating the docker environment might be recommended or even required with upcoming releases of KIX. Creating a copy of your `environment`, `non-ssl.conf` and `ssl.conf` file is recommended in order to prevent loss upon updates of the docker environment setup.


---

## Configuration for **KIX Pro**
In case you want to use KIX Pro, change the docker-registry in file `environment` to
```
REGISTRY=docker-registry.kixdesk.com/customers/<YOURREPOSITORYIDHERE>
```

The repository ID is sent to you by E-mail, after your subscribed to KIX Pro.

**NOTE**: create a copy of your `environment` file to prevent loss upon later updates of the docker environment setup.


## Configuration (optional)
- see file `environment`
- you may change the default ports under which you connect to KIX
  - `BACKEND_PORT` (Default: 20000)
  - `FRONTEND_PORT` (Default: 20001)
  - `SSP_PORT` (Default: 20002) (Self Service Portal - only for KIX Pro)
  - `BACKEND_PORT_SSL` (Default: 20443)
  - `FRONTEND_PORT_SSL` (Default: 20444)
  - `SSP_PORT_SSL` (Default: 20445) (Self Service Portal - only for KIX Pro)


### SSL-Setup
(1) Start with placing your certificate information into the docker environment structure
- copy your certificate to file `proxy/ssl/certs/server.crt`
- copy your key to file `proxy/ssl/certs/server.key`
- in case you need a ca-bundle
  - create directory `proxy/ssl/certs/ca-bundle` and copy your ca-bundle files into it
  - uncomment line with `ssl_trusted_certificate` from config `proxy/ssl/ssl.conf`

(2a) Using SSL **instead** of non-SSL
- disable all server entries in `proxy/non-ssl.conf` (by comment `#`)
- enable all server entries in `proxy/ssl.conf` (by removing `#`)

Choosing this setup uses application ports defined in `BACKEND_PORT`, `FRONTEND_PORT`, `SSP_PORT` as drop-in replacement.

(2b) Using SSL **additionally** to non-SSL
- enable all server entries in `proxy/ssl.conf` (by removing `#`)
- change the port setting in `proxy/ssl.conf`
  - from `80` to `443`
  - from `8080` to `8443`
  - from `9080` to `9443`

---
## Running KIX

### Start KIX
- change to extracted directory
  - `cd /opt/kix-on-premise/deploy/linux`
- execute start script
 - `./start.sh`

### Stop KIX
- change to extracted directory
  - `cd /opt/kix-on-premise/deploy/linux`
- execute stop script
 - `./stop.sh`

### Update KIX
- change to extracted directory
  - `cd /opt/kix-on-premise/deploy/linux`
- execute update script
 - `./update.sh`

### Restart Services
- change to extracted directory
  - `cd /opt/kix-on-premise/deploy/linux`
- execute restart script without any parameter to restart all services
 - `./restart.sh`
- execute restart script with the desired service to restart
 - `./restart.sh backend`


### Accessing Stack Logs
In case you need to monitor your stack, you can do so with the following script. All Information are printed to `STDOUT`.
- change to extracted directory
  - `cd /opt/kix-on-premise/deploy/linux`
- execute logging script
 - `./logs.sh`

**NOTE**: logs are only shown if KIX docker services are running.

To exit, just hit `Ctrl+C`


---

# Data Persistence
The following services use volumes created on the first startup to store their persistent data. These volumes will be created in the docker volumes directory (usually `/var/lib/docker/volumes`). If you want to change the location, you have to change the volumes definition in the file `docker-compose.yml`.
- frontend
- backend
- db
- shared

---

...one more thing: how about joining the KIX user community via https://forum.kixdesk.com ? :-)
