# ============================================================
# Polla Mundialista 2026 - Script de instalacion automatica
# Ejecuta desde PowerShell: .\instalar.ps1
# ============================================================

$ErrorActionPreference = "Continue"
$dest = "C:\polla2026"
$src  = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "  POLLA MUNDIALISTA 2026 - Setup" -ForegroundColor Cyan
Write-Host "  ================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Copiar a ruta corta ───────────────────────────────────
if ($src -ne $dest) {
    Write-Host "[1/3] Copiando proyecto a $dest ..." -ForegroundColor Yellow

    if (Test-Path $dest) {
        Write-Host "      Limpiando instalacion anterior..." -ForegroundColor Gray
        Get-ChildItem $dest -Exclude "backend\.env","frontend\.env.local" -Recurse -Force |
            Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.Name -notin @(".env",".env.local") } |
            Sort-Object FullName -Descending |
            Remove-Item -Force -ErrorAction SilentlyContinue
    }

    # Robocopy: copia todo excepto node_modules
    robocopy $src $dest /E /XD node_modules /XF "*.log" /NP /NFL /NDL | Out-Null

    Write-Host "      Copiado a $dest" -ForegroundColor Green
} else {
    Write-Host "[1/3] Ya estas en $dest, omitiendo copia." -ForegroundColor Green
}

Set-Location $dest

# ── 2. Instalar dependencias del backend ─────────────────────
Write-Host ""
Write-Host "[2/3] Instalando backend (Node.js / Express)..." -ForegroundColor Yellow
Set-Location "$dest\backend"

if (Test-Path "node_modules") {
    Write-Host "      Eliminando node_modules anterior..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install del backend fallo." -ForegroundColor Red
    exit 1
}
Write-Host "      Backend OK" -ForegroundColor Green

# ── 3. Instalar dependencias del frontend ────────────────────
Write-Host ""
Write-Host "[3/3] Instalando frontend (Vue 3 / Vite)..." -ForegroundColor Yellow
Set-Location "$dest\frontend"

if (Test-Path "node_modules") {
    Write-Host "      Eliminando node_modules anterior..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install del frontend fallo." -ForegroundColor Red
    exit 1
}
Write-Host "      Frontend OK" -ForegroundColor Green

# ── Siguiente paso: configurar .env ──────────────────────────
Write-Host ""
Write-Host "  INSTALACION COMPLETA!" -ForegroundColor Green
Write-Host "  =====================" -ForegroundColor Green
Write-Host ""
Write-Host "  Ahora configura tus variables de entorno:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Edita:  C:\polla2026\backend\.env" -ForegroundColor White
Write-Host "             (copia de backend\.env.example)" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Edita:  C:\polla2026\frontend\.env.local" -ForegroundColor White
Write-Host "             (copia de frontend\.env.example)" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Ejecuta el schema en Supabase SQL Editor" -ForegroundColor White
Write-Host ""
Write-Host "  4. Para correr el proyecto abre DOS terminales:" -ForegroundColor White
Write-Host "     Terminal 1:  cd C:\polla2026\backend  && npm run dev" -ForegroundColor Yellow
Write-Host "     Terminal 2:  cd C:\polla2026\frontend && npm run dev" -ForegroundColor Yellow
Write-Host ""

Set-Location $dest
