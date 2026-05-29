#!/bin/bash

# ==============================================================================
# SwiftRide ERP — Database Reset & Seeding Script (Bash)
# This script performs a complete, fresh database migration and seeding
# across all 5 active microservice containers, supporting both local and cloud databases.
# ==============================================================================

echo "====================================================================="
echo "💥 Performing Fresh Migration & Seeding across all 5 Microservices 💥"
echo "====================================================================="

# Function to run fresh migration and seed in a container
reset_service() {
  local container_name=$1
  local display_name=$2
  
  echo "🧹 Resetting and seeding database for $display_name ($container_name)..."
  if docker ps --filter "name=swiftride_$container_name" --format "{{.Names}}" | grep -q "swiftride_$container_name"; then
    docker compose exec -T "$container_name" php artisan migrate:fresh --seed
    echo "✅ $display_name successfully reset and seeded!"
  else
    echo "⚠️ Warning: Container swiftride_$container_name is not running. Skipping."
  fi
  echo "---------------------------------------------------------------------"
}

# 1. Auth Service
reset_service "auth" "Auth Microservice"

# 2. Fleet Service
reset_service "fleet" "Fleet Microservice"

# 3. CRM Service
reset_service "crm" "CRM Microservice"

# 4. Booking Service
reset_service "booking" "Booking Microservice"

# 5. Billing Service
reset_service "billing" "Billing Microservice"

echo "====================================================================="
echo "🎉 All databases successfully reset and seeded with sample data!"
echo "====================================================================="
