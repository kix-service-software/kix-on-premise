# How to Deploy KIX on-premise on Windows

## Prerequisites
- Install Docker on your host system
  - see https://docs.docker.com/engine/install/
- install Docker-Compose on your host system
  - see https://docs.docker.com/compose/install/

### Recommended System Sizing

for a new setup we recommend a docker host with
- RAM: 8GB
- CPU: 4 cores
- some well performing storage (please, no single low rpm SATA HDD)
- Debian or Ubuntu LTS with a lean server installation (as Docker host)

Assuming following key indicators
- ticket growth of 1k per month
- 20-30 agent users, 10-15 concurrent
- up to 10000 assets
- 500 organisations and  5000 contacts

We recommend a docker host with
- RAM: 16GB
- CPU: min. 4 cores
- some well performing storage (i.e. no single, low rpm SATA HDD)
- Debian or Ubuntu LTS with a lean server installation (as Docker host)

---

## Get Docker Environment Configuration
- get initial docker environment setup
  - `git clone https://github.com/cape-it/kix-on-premise.git`
- change to extracted directory
  - `cd kix-on-premise/deploy/windows`

**RECOMMENDATION**
Updating the docker environment might be recommended or even required in future releases of KIX. Therefore, creating a backup of your `environment`, `non-ssl.conf` and `ssl.conf` files is recommended.

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
  - `cd /kix-on-premise/windows`
- execute start script
 - `start.ps1`

### Stop KIX
- change to extracted directory
  - `cd /kix-on-premise/windows`
- execute stop script
 - `stop.ps1`

### Update KIX
- change to extracted directory
  - `cd /kix-on-premise/windows`
- execute stop script
 - `stop.ps1`
- execute stop script
 - `update.ps1`


### Restart Services
- change to extracted directory
  - `cd /kix-on-premise/windows`
- execute restart script without any parameter to restart all services
 - `restart.ps1`
- execute restart script with the desired service to restart
 - `restart.ps1 backend`


### Using KIX
You may now connect to KIX via Browser to `http://your.docker.host:20001` or to the REST-API using `curl` (e.g) on `http://your.docker.host:20000`.

The initial user account is usr `admin` with password `Passw0rd`. Please change that immediately after installation.

For user and administration manuals checkout `https://docs.kixdesk.com`.


### Accessing Stack Logs
- change to extracted directory
  - `cd /kix-on-premise/windows`
In case you need to monitor your stack, you can do so with the following script. All Information are printed to `STDOUT`.
- execute logging script
 - `logs.ps1`

**NOTE**: logs are only shown if KIX docker services are running.

To exit, just hit `Ctrl+C`


---

# Data Persistence
Docker on Windows requires shared drives for Linux containers!

The following services use volumes created on the first startup to store their persistent data. These volumes will be created in the docker volumes directory (usually `%PROGRAMDATA%/DockerDesktop/vm-data`). If you want to change the location, you have to change the volumes definition in the file `docker-compose.yml`.
- frontend
- backend
- db
- shared

---

# Using Another Data Base System

If you prefer using KIX with another database or an existing DB-Server, than the provided in this setup you may do so. In order to use another DBMS following settings in your `environment` file must be changed according to your needs **before KIX ist started the first time** (!). During the first startup the DB-connection is written permanently into the backend service. If you missed that point, just remove alle existing containers (which includes data as well) and start over.

```
KIXDB_DBMS=postgresql
KIXDB_USER=<kixdbuser>
KIXDB_DATABASE=<kixdbname>
KIXDB_PASSWORD=<kixdbuserpw>
KIXDB_HOST=<dbhost>
```

The data base `<kixdbname>` must be pre-created using utf8 encoding, empty, owned by DB-user `<kixdbuser>` with password `<kixdbuserpw>`. Furthermore DB-user `<kixdbuser>` must have Superuser role assigned in order to activate the pg_trgm extension.

**NOTE** using another DBMS than PostgreSQL in version 12 or 13 is **NOT** recommended. Although `mysql` is yet a valid selection for param `KIXDB_DBMS` it may be removed in future releases.


## Preparing PostgreSQL DBMS

Connect to your PostgreSQL DBMS using the default database postgres, create the kixdbuser with password and create the KIX-DB:

```
postgres=# CREATE ROLE kixdbuser WITH LOGIN PASSWORD 'kixdbuserpw';
postgres=# ALTER ROLE kixdbuser CREATEDB;
postgres=# ALTER USER kixdbuser WITH SUPERUSER;
postgres=# CREATE DATABASE kixdbname OWNER kixdbuser;
```

Take care of adding the new users account to your `pg_hba.conf`, e.g.
```
host    all             kixdbuser             0.0.0.0/0            md5
```

Also do not forget to enable `port 5432` and `listen_addresses` in your `postgresql.conf`.


---



...one more thing: how about joining the KIX user community via https://forum.kixdesk.com ? :-)
