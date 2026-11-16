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
Write-Host "[2/3] Ejecutando sincronización y caché en el VPS..." -ForegroundColor Yellow
$remoteScript = @'
set -e
cd /home/wwsapi/sapius2
git config core.filemode false
git pull origin master
/opt/cpanel/composer/bin/composer dump-autoload -o --no-interaction
/usr/local/bin/ea-php83 artisan storage:link --force || true
/usr/local/bin/ea-php83 artisan optimize:clear
/usr/local/bin/ea-php83 artisan config:cache
/usr/local/bin/ea-php83 artisan route:cache
/usr/local/bin/ea-php83 artisan view:cache
mkdir -p public/updates
chown -R wwsapi:wwsapi storage bootstrap/cache public/build public/updates
chmod -R 775 storage bootstrap/cache public/updates
'@

$normalizedScript = $remoteScript -replace "`r`n", "`n"
$b64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($normalizedScript))
ssh sapius-vps "echo $b64 | base64 -d | bash"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Fallo en la ejecución remota en el VPS."
}

# 3. Comprobación de salud HTTP
Write-Host "[3/3] Verificando salud del servidor https://test.sapius.com.mx..." -ForegroundColor Yellow
$response = curl.exe -sI https://test.sapius.com.mx | Select-String "HTTP/"
Write-Host "Respuesta: $response" -ForegroundColor Green
if (-not ($response -match "\b200\b")) {
    Write-Error "La comprobación de salud HTTP falló. Se esperaba HTTP 200 y se recibió: $response"
}

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Despliegue finalizado exitosamente!    " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
