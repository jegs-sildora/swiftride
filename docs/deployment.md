# **SwiftRide ERP — Enterprise Deployment & Orchestration Guide**
**Course Module:** ITSAR2 — Enterprise Systems & Architecture  
**Document Type:** Technical Deployment Guide  

---

## **1. Architectural Topology Overview**

SwiftRide ERP is built on a modular, secure, and distributed microservices architecture consisting of **7 distinct containerized layers** orchestrating together under a shared virtual network bridge.

```
                  ┌───────────────────────────────┐
                  │      React SPA Frontend       │
                  │   (Nginx Server - Port 3000)  │
                  └───────────────┬───────────────┘
                                  │ (REST Requests via HTTPS)
                  ┌───────────────▼───────────────┐
                  │      Reverse API Gateway      │
                  │     (Port 8000 Catch-All)     │
                  └───────────────┬───────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┬──────────────────────┐
          ▼                       ▼                       ▼                      ▼
  ┌───────────────┐       ┌───────────────┐       ┌───────────────┐      ┌───────────────┐
  │ Auth Service  │       │ Fleet Service │       │  CRM Service  │      │Booking Service│
  │  (Port 8005)  │       │  (Port 8001)  │       │  (Port 8002)  │      │  (Port 8003)  │
  └───────┬───────┘       └───────┬───────┘       └───────┬───────┘      └───────┬───────┘
          │                       │                       │                      │
          │               ┌───────┼───────────────────────┼──────────────┐       │
          │               │       │                       │              │       │
          ▼               ▼       ▼                       ▼              ▼       ▼
  ┌───────────────┐       ┌───────────────┐       ┌───────────────┐      ┌───────────────┐
  │ Billing Serv  │       │   PostgreSQL  │       │   PostgreSQL  │      │  PostgreSQL   │
  │  (Port 8004)  │       │ (Dedicated DB)│       │ (Dedicated DB)│      │(Dedicated DB) │
  └───────┬───────┘       └───────────────┘       └───────────────┘      └───────────────┘
          │
          ▼
  ┌───────────────┐
  │   PostgreSQL  │
  │ (Dedicated DB)│
  └───────────────┘
```

* **Frontend Presentation Layer (`frontend`):** Served via Nginx, compiling the React Single Page Application (SPA). All API routes are directed straight to the API Gateway.
* **API Gateway Routing Layer (`gateway`):** Acts as the single entry point. Captures simulated roles, processes JSON Web Token (JWT) verification, and proxies requests downstream.
* **Microservices Layer (`auth`, `fleet`, `crm`, `booking`, `billing`):** Independently deployable PHP Laravel containers. Downstream microservice communication occurs securely via Docker's internal DNS network.
* **Database Layer (Neon PostgreSQL / Local Postgres):** Microservices are bound to dedicated database instances. Sharing databases between services is strictly prohibited.

---

## **2. Local Deployment (Docker Compose)**

To run the entire suite locally, verify your system has **Docker Desktop** installed and follow the orchestration guide below.

### **Step 2.1: Clone and Configure Environment**
Create a `.env` file in the root directory of the project, mirroring the keys from the `.env.example`:
```bash
# General setup
APP_ENV=local
APP_DEBUG=true

# Database Connection URLs (Neon Serverless PostgreSQL Defaults)
AUTH_DATABASE_URL=postgresql://neondb_owner:npg_qY9iI0yalXzB@ep-sweet-wind-aqp2o8vv.c-8.us-east-1.aws.neon.tech/swiftride_auth_db?sslmode=require
FLEET_DATABASE_URL=postgresql://neondb_owner:npg_qY9iI0yalXzB@ep-sweet-wind-aqp2o8vv.c-8.us-east-1.aws.neon.tech/swiftride_fleet_db?sslmode=require
CRM_DATABASE_URL=postgresql://neondb_owner:npg_qY9iI0yalXzB@ep-sweet-wind-aqp2o8vv.c-8.us-east-1.aws.neon.tech/swiftride_crm_db?sslmode=require
BOOKING_DATABASE_URL=postgresql://neondb_owner:npg_qY9iI0yalXzB@ep-sweet-wind-aqp2o8vv.c-8.us-east-1.aws.neon.tech/swiftride_booking_db?sslmode=require
BILLING_DATABASE_URL=postgresql://neondb_owner:npg_qY9iI0yalXzB@ep-sweet-wind-aqp2o8vv.c-8.us-east-1.aws.neon.tech/swiftride_billing_db?sslmode=require

# Application Encryption Keys
GATEWAY_APP_KEY=base64:/0BMvvQ7EOI6wnn16i2e7TmzKF2CL2h8GknF6ipg66g=
FLEET_APP_KEY=base64:5ZaZykrMggdGqiAh9ssJz8pmNIXeXQSo1GuwTEVqRSo=
CRM_APP_KEY=base64:OWWqnMcSzlO2ydaDffbz0toNiRtAT7Q99MMJuKwHgFs=
BOOKING_APP_KEY=base64:9/z0vQFnBX4Op4J0CDoVJMYdZoAooshCNWrMOzyH7wM=
BILLING_APP_KEY=base64:zN5c6LGqxTziFUSpWkWjLFYGwLsdjkL+GX3Mu354Zx8=

# JWT Sign-off secret key
JWT_SECRET=hGLkZNBmkqqREnwGUyT+d7JiaJU8oLcXjKA/BtZZOH4=

# Frontend environment target
VITE_API_GATEWAY_URL=http://localhost:8000/api
```

### **Step 2.2: Launch Orchestration Containers**
From your terminal, run Docker Compose inside the project root:
```bash
# Build layers and launch containers in detached mode
docker compose up --build -d

# For local development with live-reloading and hot-syncing, run:
docker compose watch
```
Docker will pull standard Alpine and PHP base images, compile the code layers, run the custom entrypoint scripts, and bind ports `8000` (Gateway), `3000` (Frontend), and `8005` (Auth) to your local loopback.

### **Step 2.3: Seeding Sample Role Accounts**
To seed the unified database registers and populate active logins:
```bash
# Seed the central authentication database (Admin, Dispatcher, Mechanic, Accountant accounts)
docker compose exec -T auth php artisan db:seed

# Seed functional microservice records (Vehicles, Customers, Invoices, Add-ons)
docker compose exec -T fleet php artisan db:seed
docker compose exec -T crm php artisan db:seed
docker compose exec -T booking php artisan db:seed
docker compose exec -T billing php artisan db:seed
```

---

## **3. Production Deployment (Cloud - Render Blueprint)**

To make SwiftRide ERP public, we utilize **Render Blueprints**. Render parses our `render.yaml` file, compiling, deploying, and networking the 7 microservices in a single, automated workflow.

### **Step 3.1: Commit Code to GitHub**
Ensure all configurations are pushed to your GitHub group repository:
```bash
git add .
git commit -m "chore: optimize docker compose configurations and prepare Render Blueprint"
git push origin main
```

### **Step 3.2: Create a Blueprint Instance on Render**
1. Navigate to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top right and select **Blueprint**.
3. Link your GitHub repository.
4. Render will parse the `render.yaml` file and list all 7 services (`auth`, `gateway`, `fleet`, `crm`, `booking`, `billing`, and `swiftride` frontend).
5. Click **Apply**.

### **Step 3.3: Neon Serverless PostgreSQL Database Creation (Self-Service)**
By default, the Blueprint is configured to connect to our shared student databases hosted on Neon Serverless Postgres. If you want to deploy a dedicated Postgres instance for your team:
1. Register a free account on [Neon](https://neon.tech).
2. Create a new project named **SwiftRide ERP**.
3. Create five individual databases:
   - `swiftride_auth_db`
   - `swiftride_fleet_db`
   - `swiftride_crm_db`
   - `swiftride_booking_db`
   - `swiftride_billing_db`
4. Copy the connection string URLs and update the environment parameters inside your Render Blueprint Dashboard (or edit them directly inside `render.yaml` before linking).

---

## **4. Troubleshooting and Best Practices**

* **Microservice Connection Check:**
  If the API Gateway returns `Proxy Error (500)`, it indicates that the Gateway cannot contact a downstream container. Check the container status:
  ```bash
  docker compose ps
  ```
  Ensure all microservices are running. If a microservice crashes during start, inspect its startup logs:
  ```bash
  docker compose logs <service-name>
  ```
* **Configuration Caching Problems:**
  When changing `.env` variables, Laravel containers might cache obsolete values. Clear caches inside the target container:
  ```bash
  docker compose exec -T <service-name> php artisan config:clear
  docker compose exec -T <service-name> php artisan route:clear
  ```
