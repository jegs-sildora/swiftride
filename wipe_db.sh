#!/bin/bash

# ==============================================================================
# SwiftRide ERP — Database Wipe Script (Bash for macOS/Linux/GitBash)
# This script truncates all transactional and domain tables across all
# microservice databases, while preserving the 'users' tables intact.
# ==============================================================================

echo "====================================================================="
echo "💥 Wiping all ERP domain data (excluding 'users' tables) 💥"
echo "====================================================================="

# Check if postgres container is running
if ! docker ps --filter "name=swiftride_postgres" --format "{{.Names}}" | grep -q "swiftride_postgres"; then
  echo "❌ Error: swiftride_postgres container is not running."
  echo "Please start the services first using: docker compose up -d"
  exit 1
fi

DB_USER="swiftride"

# 1. Billing Service Tables
echo "🧹 Wiping Billing database..."
docker exec -i swiftride_postgres psql -U "$DB_USER" -d swiftride_billing_db -c "TRUNCATE TABLE payments, invoices CASCADE;"

# 2. Booking Service Tables
echo "🧹 Wiping Booking database..."
docker exec -i swiftride_postgres psql -U "$DB_USER" -d swiftride_booking_db -c "TRUNCATE TABLE schedules, bookings CASCADE;"

# 3. CRM Service Tables
echo "🧹 Wiping CRM database..."
docker exec -i swiftride_postgres psql -U "$DB_USER" -d swiftride_crm_db -c "TRUNCATE TABLE driver_licenses, customers CASCADE;"

# 4. Fleet Service Tables
echo "🧹 Wiping Fleet database..."
docker exec -i swiftride_postgres psql -U "$DB_USER" -d swiftride_fleet_db -c "TRUNCATE TABLE maintenance_logs, vehicles CASCADE;"

echo "====================================================================="
echo "✅ Database data successfully wiped (users and gateway accounts preserved)!"
echo "====================================================================="
