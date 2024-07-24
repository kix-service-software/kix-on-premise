(Get-Content .\environment) -cmatch '^[A-Z]' | ForEach-Object {
    Set-Item -path "env:$($_.split('=')[0])" -value $_.split('=')[1] -Force;
}

Set-Item -path "env:COMPOSE_FILE" -value "docker-compose.yml" -Force;

docker-compose -p $env:NAME pull
docker-compose -p $env:NAME up -d
docker-compose -p $env:NAME restart proxy
