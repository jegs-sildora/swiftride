# ==============================================================================
# SwiftRide ERP — Database Wipe Script (PowerShell for Windows)
# This script truncates all transactional and domain tables across all
# microservice databases, while preserving the 'users' tables intact.
# ==============================================================================

Write-Host "=====================================================================" -ForegroundColor Yellow
Write-Host "💥 Wiping all ERP domain data (excluding 'users' tables) 💥" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Yellow

# Check if postgres container is running
$container = docker ps --filter "name=swiftride_postgres" --format "{{.Names}}"
if (-not $container) {
    Write-Host "❌ Error: swiftride_postgres container is not running." -ForegroundColor Red
    Write-Host "Please start the services first using: docker compose up -d" -ForegroundColor Cyan
    exit 1
}

$DB_USER = "swiftride"

# 1. Billing Service Tables
Write-Host "🧹 Wiping Billing database..." -ForegroundColor Cyan
docker exec -i swiftride_postgres psql -U $DB_USER -d swiftride_billing_db -c "TRUNCATE TABLE payments, invoices CASCADE;"

# 2. Booking Service Tables
Write-Host "🧹 Wiping Booking database..." -ForegroundColor Cyan
docker exec -i swiftride_postgres psql -U $DB_USER -d swiftride_booking_db -c "TRUNCATE TABLE schedules, bookings CASCADE;"

# 3. CRM Service Tables
Write-Host "🧹 Wiping CRM database..." -ForegroundColor Cyan
docker exec -i swiftride_postgres psql -U $DB_USER -d swiftride_crm_db -c "TRUNCATE TABLE driver_licenses, customers CASCADE;"

# 4. Fleet Service Tables
Write-Host "🧹 Wiping Fleet database..." -ForegroundColor Cyan
docker exec -i swiftride_postgres psql -U $DB_USER -d swiftride_fleet_db -c "TRUNCATE TABLE maintenance_logs, vehicles CASCADE;"

Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "✅ Database data successfully wiped (users and gateway accounts preserved)!" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
