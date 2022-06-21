(Get-Content .\environment) -cmatch '^[A-Z]' | ForEach-Object {
    Set-Item -path "env:$($_.split('=')[0])" -value $_.split('=')[1] -Force;
}

docker pull $env:REGISTRY/ssp:$env:IMAGE_TAG 2>&1>$null
if($?) {
    Set-Item -path "env:COMPOSE_FILE" -value "docker-compose.yml:docker-compose_ssp.yml" -Force;
}
else {
  Set-Item -path "env:COMPOSE_FILE" -value "docker-compose.yml" -Force;
}

docker-compose -p $env:NAME down
