<#
.SYNOPSIS
    Baiti Atelier (بيتي) - Lanceur Unifie Multi-Plateforme
    Permet de demarrer la suite Baiti Atelier sur le Web, Desktop et Mobile Windows.
#>

param(
    [ValidateSet("all", "web", "desktop", "mobile")]
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host "========================================================" -ForegroundColor DarkYellow
Write-Host "    BAITI ATELIER | بيتي - SUITE INDUSTRIELLE DE MENUISERIE" -ForegroundColor Yellow
Write-Host "    Conception CAD, Debitage & Chiffrage 58 Wilayas" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor DarkYellow

function Start-BaitiWeb {
    Write-Host "[1/3] Demarrage de l'Atelier Web (Port 5173)..." -ForegroundColor Green
    $webRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        try {
            $conn = Test-NetConnection -ComputerName "localhost" -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue
            return $conn
        } catch { return $false }
    }

    if (-not $webRunning) {
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$Root\web" -WindowStyle Hidden
        Start-Sleep -Seconds 2
    }
    Write-Host "  -> Web Studio actif sur http://localhost:5173" -ForegroundColor White
    Start-Process "http://localhost:5173"
}

function Start-BaitiDesktop {
    Write-Host "[2/3] Lancement de l'Application Desktop Native (Tauri v2)..." -ForegroundColor Green
    $desktopExe = "$Root\desktop\src-tauri\target\debug\baiti-desktop.exe"
    if (Test-Path $desktopExe) {
        Start-Process -FilePath $desktopExe
        Write-Host "  -> Baiti Desktop lance avec succes." -ForegroundColor White
    } else {
        Write-Warning "Binaire Desktop introuvable ($desktopExe). Lancez 'cargo build' dans desktop/src-tauri."
    }
}

function Start-BaitiMobile {
    Write-Host "[3/3] Lancement de l'Application Mobile Atelier (Windows Runner)..." -ForegroundColor Green
    $mobileExe = "$Root\mobile\build\windows\x64\runner\Debug\monyun_mobile.exe"
    if (Test-Path $mobileExe) {
        Start-Process -FilePath $mobileExe
        Write-Host "  -> Baiti Mobile lance avec succes." -ForegroundColor White
    } else {
        Write-Warning "Binaire Mobile introuvable ($mobileExe). Lancez 'flutter build windows --debug' dans mobile."
    }
}

switch ($Target) {
    "web"     { Start-BaitiWeb }
    "desktop" { Start-BaitiDesktop }
    "mobile"  { Start-BaitiMobile }
    "all" {
        Start-BaitiWeb
        Start-BaitiDesktop
        Start-BaitiMobile
    }
}

Write-Host "========================================================" -ForegroundColor DarkYellow
Write-Host "Baiti Atelier est pret a l'utilisation." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor DarkYellow
