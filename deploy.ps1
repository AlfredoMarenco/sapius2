param (
    [switch]$SkipPush = $false
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SAPIUS 2 - Despliegue Automatizado VPS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Empujar cambios a GitHub
if (-not $SkipPush) {
    Write-Host "[1/3] Enviando cambios a GitHub..." -ForegroundColor Yellow
    git push origin master
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Fallo al enviar cambios con git push. Deteniendo despliegue."
    }
} else {
    Write-Host "[1/3] Omitiendo git push (--SkipPush activo)..." -ForegroundColor DarkGray
}

# 2. Comandos en el servidor VPS
Write-Host "[2/3] Ejecutando sincronización y caché en el VPS (test.sapius.com.mx y v2.sapius.com.mx)..." -ForegroundColor Yellow
$remoteScript = @'
set -e

deploy_app() {
    local APP_DIR="$1"
    local IS_V2="$2"

    echo "--- Desplegando en $APP_DIR ---"
    cd "$APP_DIR"
    git config core.filemode false
    git pull origin master
    COMPOSER_ALLOW_SUPERUSER=1 /usr/local/bin/ea-php83 /opt/cpanel/composer/bin/composer dump-autoload -o --no-interaction

    if [ "$IS_V2" = "true" ]; then
        ln -sfn /home/wwsapi/SapiusProduction/storage/app/public "$APP_DIR/storage/app/public"
        ln -sfn /home/wwsapi/SapiusProduction/storage/app/files "$APP_DIR/storage/app/files"
        ln -sfn /home/wwsapi/SapiusProduction/storage/app/images "$APP_DIR/storage/app/images"
        ln -sfn /home/wwsapi/SapiusProduction/storage/app/documentos "$APP_DIR/storage/app/documentos"
        ln -sfn /home/wwsapi/SapiusProduction/storage/app/uploads "$APP_DIR/storage/app/uploads"
        ln -sfn /home/wwsapi/SapiusProduction/storage/app/tareas "$APP_DIR/storage/app/tareas"
        ln -sfn /home/wwsapi/SapiusProduction/storage/app/config "$APP_DIR/storage/app/config"
        ln -sfn /home/wwsapi/SapiusProduction/storage/app/public "$APP_DIR/public/storage"
        mkdir -p "$APP_DIR/public/updates"
        ln -sfn /home/wwsapi/public_html/updates/detector "$APP_DIR/public/updates/detector"
    else
        /usr/local/bin/ea-php83 artisan storage:link --force || true
        mkdir -p public/updates
    fi

    /usr/local/bin/ea-php83 artisan optimize:clear
    /usr/local/bin/ea-php83 artisan config:cache
    /usr/local/bin/ea-php83 artisan route:cache
    /usr/local/bin/ea-php83 artisan view:cache
    chown -R wwsapi:wwsapi storage bootstrap/cache public/build public/updates
    chmod -R 775 storage bootstrap/cache public/updates
}

deploy_app "/home/wwsapi/sapius2" "false"
if [ -d "/home/wwsapi/v2.sapius.com.mx" ]; then
    deploy_app "/home/wwsapi/v2.sapius.com.mx" "true"
fi
'@

$normalizedScript = $remoteScript -replace "`r`n", "`n"
$b64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($normalizedScript))
ssh sapius-vps "echo $b64 | base64 -d | bash"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo en la ejecución remota en el VPS."
}

# 3. Comprobación de salud HTTP
Write-Host "[3/3] Verificando salud de los servidores..." -ForegroundColor Yellow
foreach ($url in @("https://test.sapius.com.mx", "https://v2.sapius.com.mx")) {
    $response = curl.exe -sI $url | Select-String "HTTP/"
    Write-Host "$url -> $response" -ForegroundColor Green
    if (-not ($response -match "\b200\b")) {
        Write-Error "La comprobación de salud HTTP falló en $url. Se esperaba HTTP 200 y se recibió: $response"
    }
}

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Despliegue finalizado exitosamente!    " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
