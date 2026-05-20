# SwiftRide ERP: API Gateway & Authentication Service

## Overview
This service acts as the central entry point for the SwiftRide ERP system. It handles user identity, role-based access control (RBAC), and routes all incoming frontend requests to the appropriate protected backend microservice.

## Technical Specifications
* **Framework:** Laravel 11
* **Authentication:** Laravel Sanctum (Token-based)
* **Database:** PostgreSQL (Isolated instance: `swiftride_auth_db`)
* **Deployment:** Render Web Service

## Database Schema (Eloquent Models)
1. **User Model**
   * `id`, `name`, `email`, `password`, `role_id`, `timestamps`
2. **Role Model**
   * `id`, `name` (Admin, Dispatcher, Customer), `permissions` (JSON), `timestamps`

## Core API Endpoints
* `POST /api/v1/auth/register` - Create a new staff or customer account.
* `POST /api/v1/auth/login` - Authenticate and issue a Sanctum JWT.
* `GET /api/v1/auth/me` - Retrieve current user profile and role permissions.
* `POST /api/v1/auth/logout` - Revoke current token.

## Gateway Proxy Routes
Using Laravel routing and the HTTP facade, this service intercepts requests and forwards them with the validated authorization headers:
* `ANY /api/v1/fleet/*` -> Proxies to `http://fleet-service:8000/*`
* `ANY /api/v1/crm/*` -> Proxies to `http://crm-service:8000/*`
* `ANY /api/v1/booking/*` -> Proxies to `http://booking-service:8000/*`
* `ANY /api/v1/billing/*` -> Proxies to `http://billing-service:8000/*`

## Frontend UI Interaction
* **Login/Register View:** The React UI will render forms that hit the auth endpoints. The returned Sanctum token is stored locally (or in an HttpOnly cookie) and attached to all subsequent API calls.
* **Role-Based Navigation:** The UI will read the user's role from `/auth/me` and dynamically hide or show sidebar navigation (e.g., hiding "Billing" from a standard Customer).