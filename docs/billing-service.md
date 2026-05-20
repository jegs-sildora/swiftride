# SwiftRide ERP: Billing Service

## Overview
The financial module responsible for generating invoices, tracking payments, and calculating overall system revenue based on completed bookings.

## Technical Specifications
* **Framework:** Laravel 11
* **Database:** PostgreSQL (Isolated instance: `swiftride_billing_db`)
* **Deployment:** Render Web Service

## Database Schema (Eloquent Models)
1. **Invoice Model**
   * `id`, `booking_id`, `total_amount`, `issue_date`, `due_date`, `status` (Enum: Unpaid, Paid, Overdue), `timestamps`
2. **Payment Model**
   * `id`, `invoice_id`, `amount_paid`, `payment_method` (Cash, Card, Transfer), `transaction_date`, `timestamps`

## Core API Endpoints
* `POST /api/billing/invoices` - Generate an invoice. This can be triggered manually by staff, or automatically when a booking is marked "Completed".
* `GET /api/billing/invoices/{id}` - Retrieve a specific invoice for rendering/printing.
* `POST /api/billing/payments` - Record a customer's payment against an invoice.
* `GET /api/billing/reports/revenue` - Aggregate daily/weekly/monthly revenue totals.

## Frontend UI Interaction
* **Invoicing Dashboard:** A React data table showing all open and overdue invoices. Staff can click an invoice to open a "Record Payment" modal.
* **Customer Portal:** Customers can view their past invoices and see outstanding balances.
* **Analytics Widgets:** Dashboard charts built with a library like Recharts or Chart.js that pull data from the `/revenue` endpoint to show financial health.