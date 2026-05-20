# SwiftRide ERP: Fleet Management Service

## Overview
This service is strictly responsible for managing the physical inventory of the company: the vehicles. It is a completely software-driven module where dispatchers manually update vehicle statuses.

## Technical Specifications
* **Framework:** Laravel 11
* **Database:** PostgreSQL (Isolated instance: `swiftride_fleet_db`)
* **Deployment:** Render Web Service

## Database Schema (Eloquent Models)
1. **Vehicle Model**
   * `id`, `make`, `model`, `year`, `license_plate`, `status` (Enum: Available, Rented, Maintenance), `daily_rate`, `timestamps`
2. **MaintenanceLog Model**
   * `id`, `vehicle_id`, `description`, `cost`, `date_logged`, `timestamps`

## Core API Endpoints
* `GET /api/fleet/vehicles` - List all vehicles (supports filtering by status).
* `POST /api/fleet/vehicles` - Add a new vehicle to the fleet.
* `PATCH /api/fleet/vehicles/{id}/status` - Manual toggle for dispatchers to update vehicle status.
* `GET /api/fleet/vehicles/{id}/availability` - Internal endpoint used by the Booking Service to verify if a car is available for specific dates.

## Frontend UI Interaction
* **Dispatcher Dashboard:** The React UI will display a kanban board or data table listing all vehicles.
* **Status Toggles:** Dispatchers can click buttons in the UI to move a vehicle from "Available" to "Maintenance" which triggers the `PATCH` endpoint.