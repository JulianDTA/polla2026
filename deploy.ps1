# ============================================================
# Polla Mundialista 2026 — Deploy Script
# Corre esto desde PowerShell en C:\polla2026
# ============================================================

$ErrorActionPreference = "Stop"
$ROOT = "C:\polla2026"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Polla Mundialista 2026 — Deploy        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── PASO 1: Git push ─────────────────────────────────────────
Write-Host "[1/4] Subiendo código a GitHub..." -ForegroundColor Yellow
Set-Location $ROOT

# Eliminar lock si existe
if (Test-Path ".git\index.lock") {
    Remove-Item ".git\index.lock" -Force
    Write-Host "  Lock file eliminado." -ForegroundColor DarkGray
}

git add -A
$status = git status --porcelain
if ($status) {
    git -c user.email="joseandres.perezpe@gmail.com" -c user.name="Jose Perez" `
        commit -m "Deploy: Vercel config, cron endpoints, FIFA API fix"
    git push origin main
    Write-Host "  ✓ Código subido a GitHub." -ForegroundColor Green
} else {
    Write-Host "  Sin cambios para commitear." -ForegroundColor DarkGray
}

# ── PASO 2: Vercel CLI ───────────────────────────────────────
Write-Host ""
Write-Host "[2/4] Verificando Vercel CLI..." -ForegroundColor Yellow
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) {
    Write-Host "  Instalando Vercel CLI..." -ForegroundColor DarkGray
    npm install -g vercel
}
Write-Host "  ✓ Vercel CLI listo." -ForegroundColor Green

# ── PASO 3: Deploy backend ───────────────────────────────────
Write-Host ""
Write-Host "[3/4] Desplegando backend..." -ForegroundColor Yellow
Write-Host "  (Si es la primera vez, Vercel pedirá login y configuración)" -ForegroundColor DarkGray
Set-Location "$ROOT\backend"
$backendOut = vercel deploy --prod --yes --scope jandrezzzs-projects 2>&1
$backendUrl = ($backendOut | Select-String "https://[a-z0-9\-\.]+\.vercel\.app" -AllMatches |
              ForEach-Object { $_.Matches } | Select-Object -Last 1).Value

if ($backendUrl) {
    Write-Host "  ✓ Backend: $backendUrl" -ForegroundColor Green
} else {
    Write-Host $backendOut
    Write-Host "  ! No se detectó URL del backend. Revisa el output de arriba." -ForegroundColor Red
    $backendUrl = Read-Host "  Ingresa la URL del backend manualmente"
}

# ── PASO 4: Deploy frontend ──────────────────────────────────
Write-Host ""
Write-Host "[4/4] Desplegando frontend..." -ForegroundColor Yellow
Set-Location "$ROOT\frontend"

# Inyectar VITE_API_URL en el deploy (env var de Vercel, no en .env)
$frontendOut = vercel deploy --prod --yes --scope jandrezzzs-projects `
    --env VITE_API_URL=$backendUrl 2>&1
$frontendUrl = ($frontendOut | Select-String "https://[a-z0-9\-\.]+\.vercel\.app" -AllMatches |
               ForEach-Object { $_.Matches } | Select-Object -Last 1).Value

if ($frontendUrl) {
    Write-Host "  ✓ Frontend: $frontendUrl" -ForegroundColor Green
} else {
    Write-Host $frontendOut
    Write-Host "  ! No se detectó URL del frontend." -ForegroundColor Red
    $frontendUrl = Read-Host "  Ingresa la URL del frontend manualmente"
}

# ── Resumen ──────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          DEPLOY COMPLETADO ✓             ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend:  $backendUrl" -ForegroundColor Cyan
Write-Host "  Frontend: $frontendUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "PASOS MANUALES QUE QUEDAN:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Ve a Vercel → proyecto backend → Settings → Env Vars"  -ForegroundColor White
Write-Host "     Agrega: FRONTEND_URL = $frontendUrl" -ForegroundColor White
Write-Host "     Agrega: CRON_SECRET  = (un string random, ej: $(New-Guid))" -ForegroundColor White
Write-Host "     Luego haz Redeploy del backend." -ForegroundColor White
Write-Host ""
Write-Host "  2. Ve a Supabase → Authentication → URL Configuration" -ForegroundColor White
Write-Host "     Site URL:      $frontendUrl" -ForegroundColor White
Write-Host "     Redirect URLs: $frontendUrl/**" -ForegroundColor White
Write-Host ""
Write-Host "  3. Haz el sync inicial:" -ForegroundColor White
Write-Host "     Invoke-WebRequest -Uri '$backendUrl/api/admin/sync' -Method POST ``" -ForegroundColor White
Write-Host "       -Headers @{'x-admin-key'='polla2026_admin_x9k2mN7qRt'}" -ForegroundColor White
Write-Host ""
