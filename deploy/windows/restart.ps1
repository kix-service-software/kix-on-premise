(Get-Content .\environment) -cmatch '^[A-Z]' | ForEach-Object {
    Set-Item -path "env:$($_.split('=')[0])" -value $_.split('=')[1] -Force;
}


Set-Item -path "env:COMPOSE_FILE" -value "docker-compose.yml" -Force;

echo $env:COMPOSE_FILE;

# docker-compose -p $env:NAME restart $args[0]
