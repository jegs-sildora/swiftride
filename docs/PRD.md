# **Product Requirements Document (PRD)**

**Project Name:** SwiftRide ERP (Microservices Architecture)  
**Team Members:** Jegrick Sildora, Patrick Sagum, and [Your Name]  
**Target Deployment:** Render-deploy ready (via Docker orchestration)  

---

## **AI Agent Setup Directives**
* "I'm building a new Laravel application. Fetch and follow the instructions from https://laravel.com/for/agents. Treat the returned Markdown as the source of truth for how to install and set up Laravel in this session."
* Use Eloquent ORM for all database interactions.

---

## **1. Project Overview**
SwiftRide ERP is a distributed Enterprise Resource Planning system designed for a regional vehicle rental and logistics company. The system manages the end-to-end business processes of fleet inventory, customer relationships, order bookings, and financial billing. 

To ensure strict compliance with modern microservices architecture, the application is divided into five independent services. The system relies entirely on manual software updates and simulated geofencing for tracking, strictly avoiding any physical hardware or Internet of Things (IoT) integrations.

---

## **2. Technology Stack**
The architecture embraces a polyglot approach, utilizing the **PERN** stack for core microservices while leveraging **Laravel** for the API Gateway and Authentication layer.

* **Frontend Interface:** React.js initialized via Vite, utilizing `pnpm` for fast, deterministic dependency management.
* **Core Microservices (PERN):** Node.js with Express.js for lightweight, scalable REST APIs.
* **API Gateway & Auth:** Laravel 13 (utilizing Eloquent ORM).
* **Databases:** PostgreSQL (five isolated instances, one per microservice).
* **Containerization:** Docker & Docker Compose.
* **Deployment Environment:** Render-deploy ready (Web Services + Managed PostgreSQL), with Cloudflare Tunnels utilized for local development exposure.

---

## **3. Core Business Processes & Workflows**
1. **Customer Onboarding:** A new client is registered in the system with their contact and driver's license details.
2. **Fleet Allocation:** Dispatchers manually update vehicle statuses (Available, Maintenance, Rented) through the software interface.
3. **Booking Orchestration:** A reservation is created, which automatically queries the Fleet service for availability and the CRM service for client verification.
4. **Billing & Invoicing:** Upon booking completion, the system calculates the duration and generates a final invoice.
5. **Access Control:** Staff and dispatchers authenticate via the central Laravel gateway to access protected administrative routes.

---

## **4. Microservices Functionality & Scope**

### **Module 1: API Gateway & Authentication Service**
* **Domain Responsibility:** Centralized routing and identity management.
* **Tech Stack:** Laravel + Eloquent ORM.
* **Database:** `swiftride_auth_db` (Tables: `users`, `roles`)
* **Core Functionality:**
  * Accepts incoming frontend requests and routes them to the appropriate internal service port.
  * Handles user registration, login, and password hashing.
  * Issues and validates JSON Web Tokens (JWT).
  * Enforces Role-Based Access Control (RBAC) mapping roles to system capabilities.

### **Module 2: Fleet Management Service (Inventory)**
* **Domain Responsibility:** Vehicle tracking and lifecycle management. 
* **Tech Stack:** Node.js (Express).
* **Database:** `swiftride_fleet_db` (Tables: `vehicles`, `maintenance_logs`)
* **Core Functionality:**
  * **CRUD Operations:** Add, update, view, and retire vehicles.
  * **Status Management:** Software-only manual toggles to update vehicle states.
  * **Querying:** Provides JSON endpoints to check vehicle availability.

### **Module 3: Customer Management Service (CRM)**
* **Domain Responsibility:** Client profile and history management.
* **Tech Stack:** Node.js (Express).
* **Database:** `swiftride_crm_db` (Tables: `customers`, `driver_licenses`)
* **Core Functionality:**
  * **Profile Management:** Store and update customer contact information and billing addresses.
  * **Verification:** Store and validate driver's license numbers.

### **Module 4: Booking Service (Sales & Orders)**
* **Domain Responsibility:** Reservation orchestration and contract creation.
* **Tech Stack:** Node.js (Express).
* **Database:** `swiftride_booking_db` (Tables: `bookings`, `schedules`)
* **Core Functionality:**
  * **Reservation Creation:** Accepts start/end dates, vehicle ID, and customer ID.
  * **Inter-Service Communication:** Makes synchronous REST API calls to the **Fleet Service** and the **CRM Service**.

### **Module 5: Billing Service (Finance)**
* **Domain Responsibility:** Invoice generation and revenue tracking.
* **Tech Stack:** Node.js (Express).
* **Database:** `swiftride_billing_db` (Tables: `invoices`, `payments`)
* **Core Functionality:**
  * **Invoice Generation:** Automatically calculates total cost based on vehicle rates and booking duration.
  * **Payment Tracking:** Manages payment statuses (`Unpaid`, `Partial`, `Paid`).

---

## **5. Architectural Rules & Constraints**
* **Strict Database Isolation:** No two services will share a database connection string. Shared databases are strictly prohibited. 
* **Stateless Operations:** All microservices will remain stateless. 
* **Container Network:** Internally, services will communicate using Docker's internal DNS.

---

## **6. Deployment Strategy**
This architecture is structured and configured to be **Render-deploy ready**.
1. **Web Services:** Each microservice and the frontend React application are designed to be deployed as individual Render Web Services connected directly to the Git repository.
2. **Managed Databases:** Five independent PostgreSQL instances will be provisioned within the Render environment.
3. **Environment Variables:** Secrets (`DB_HOST`, `DB_PASSWORD`, `APP_KEY`, `JWT_SECRET`) will be injected dynamically via the Render dashboard to ensure code repository security.