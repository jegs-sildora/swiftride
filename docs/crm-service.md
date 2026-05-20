# SwiftRide ERP: Customer Management Service (CRM)

## Overview
This module handles all client data, ensuring that customer profiles and driving credentials are valid before they can rent a vehicle.

## Technical Specifications
* **Framework:** Laravel 11
* **Database:** PostgreSQL (Isolated instance: `swiftride_crm_db`)
* **Deployment:** Render Web Service

## Database Schema (Eloquent Models)
1. **Customer Model**
   * `id`, `user_id` (Mapped to Auth DB), `first_name`, `last_name`, `phone`, `address`, `account_status` (Enum: Active, Suspended), `timestamps`
2. **DriverLicense Model**
   * `id`, `customer_id`, `license_number`, `issue_date`, `expiry_date`, `is_verified` (Boolean), `timestamps`

## Core API Endpoints
* `GET /api/crm/customers` - List all customers (Admin/Dispatcher only).
* `POST /api/crm/customers` - Create a detailed customer profile.
* `POST /api/crm/customers/{id}/license` - Upload/record driver's license details.
* `GET /api/crm/customers/{id}/verify` - Internal endpoint used by the Booking Service to ensure the customer has an active account and valid license.

## Frontend UI Interaction
* **Customer Profile Page:** A React view where customers can update their contact info and input their license details.
* **Staff Directory:** A searchable table view for dispatchers to look up client history and manually suspend accounts if needed.