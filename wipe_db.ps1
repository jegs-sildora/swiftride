# ==============================================================================
# SwiftRide ERP — Database Reset & Seeding Script (PowerShell for Windows)
# This script performs a complete, fresh database migration and seeding
# across all 5 active microservice containers, supporting both local and cloud databases.
# ==============================================================================

Write-Host "=====================================================================" -ForegroundColor Yellow
Write-Host "💥 Performing Fresh Migration & Seeding across all 5 Microservices 💥" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Yellow

function Reset-Service {
    param (
        [string]$ContainerName,
        [string]$DisplayName
    )
    
    Write-Host "🧹 Resetting and seeding database for $DisplayName ($ContainerName)..." -ForegroundColor Cyan
    $container = docker ps --filter "name=swiftride_$ContainerName" --format "{{.Names}}"
    if ($container) {
        docker compose exec -T $ContainerName php artisan migrate:fresh --seed
        Write-Host "✅ $DisplayName successfully reset and seeded!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Warning: Container swiftride_$ContainerName is not running. Skipping." -ForegroundColor Orange
    }
    Write-Host "---------------------------------------------------------------------"
}

# 1. Auth Service
Reset-Service -ContainerName "auth" -DisplayName "Auth Microservice"

# 2. Fleet Service
Reset-Service -ContainerName "fleet" -DisplayName "Fleet Microservice"

# 3. CRM Service
Reset-Service -ContainerName "crm" -DisplayName "CRM Microservice"

# 4. Booking Service
Reset-Service -ContainerName "booking" -DisplayName "Booking Microservice"

# 5. Billing Service
Reset-Service -ContainerName "billing" -DisplayName "Billing Microservice"

Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "🎉 All databases successfully reset and seeded with sample data!" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
