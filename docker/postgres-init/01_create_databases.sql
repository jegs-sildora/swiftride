-- SwiftRide ERP — Single Postgres instance, multiple databases
-- This script runs once when the container is first created.
-- The default DB (POSTGRES_DB) is swiftride_gateway_db; create the rest here.

CREATE DATABASE swiftride_fleet_db;
CREATE DATABASE swiftride_crm_db;
CREATE DATABASE swiftride_booking_db;
CREATE DATABASE swiftride_billing_db;
