# SwiftRide ERP

![Microservices](https://img.shields.io/badge/Architecture-Microservices-blue)
![Laravel](https://img.shields.io/badge/Backend-Laravel_11-red)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Docker](https://img.shields.io/badge/Orchestration-Docker_Compose-2496ED)
![Render](https://img.shields.io/badge/Deployment-Render_Blueprints-000000)

**SwiftRide ERP** is a distributed Enterprise Resource Planning system specifically designed for a regional vehicle rental and logistics company. It was built as a capstone project for the *Microservices Architecture and Deployment* course.

The system utilizes a modern, strictly decoupled microservices architecture to manage the end-to-end business processes of fleet inventory, customer relationships, order bookings, and financial billing.

---

## 🏗️ Architecture Overview

The backend is decoupled into **five independent microservices**. Each service operates in its own container and connects to its own **dedicated PostgreSQL database**, strictly adhering to the microservices database-per-service pattern.

1. **API Gateway & Auth Service:** Centralized routing and identity management using JWT. Enforces Role-Based Access Control (RBAC).
2. **Fleet Management Service:** Vehicle tracking, lifecycle management, and maintenance logs.
3. **Customer Management Service (CRM):** Client profile management and strict driver's license verification.
4. **Booking Service:** Reservation orchestration. Communicates synchronously with Fleet and CRM services.
5. **Billing Service:** Automated invoice generation, tax calculation, and payment tracking.

---

## 📚 Project Documentation

All academic deliverables and deep-dive technical documentation can be found in the `/docs` directory:

- 🏢 **[Business Documentation](docs/business_documentation.md):** Company profile, organizational structure, Mermaid workflow diagrams, and pain-point traceability.
- ⚙️ **[Technical Documentation](docs/technical_documentation.md):** High-level architecture, ER data models, and justifications for technology choices.
- 🚀 **[Deployment Guide](docs/deployment.md):** Instructions for running the system locally and on Render.
- 👥 **[Team Roster](docs/team_roster.md):** Itemized breakdown of individual team contributions.
- 📜 **[Product Requirements (PRD)](docs/PRD.md):** The original product requirements and scope definitions.

### API Specifications
- [Gateway & Auth API](docs/gateway-auth-service.md)
- [Fleet API](docs/fleet-service.md)
- [CRM API](docs/crm-service.md)
- [Booking API](docs/booking-service.md)
- [Billing API](docs/billing-service.md)

---

## 💻 Local Development Setup

To run the entire suite locally, ensure you have **Docker Desktop** installed.

1. **Clone the repository**
   ```bash
   git clone https://github.com/jegs-sildora/swiftride.git
   cd ERP
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory mirroring the keys from the provided `.env.example`. Make sure the 5 separate PostgreSQL database connection URLs and Laravel APP_KEYs are populated.

3. **Launch the Containers**
   ```bash
   # Build images and start the orchestrated network
   docker compose up --build -d
   
   # Or, for live-reloading during frontend/backend development:
   docker compose watch
   ```

4. **Seed the Databases**
   To populate the system with functional data, roles, and dummy accounts:
   ```bash
   docker compose exec -T auth php artisan db:seed
   docker compose exec -T fleet php artisan db:seed
   docker compose exec -T crm php artisan db:seed
   docker compose exec -T booking php artisan db:seed
   docker compose exec -T billing php artisan db:seed
   ```

5. **Access the Application**
   - **Frontend UI:** `http://localhost:3000`
   - **API Gateway:** `http://localhost:8000`

---

## ☁️ Production Deployment

This architecture is **Render-deploy ready**. By importing the included `render.yaml` Blueprint into a Render.com dashboard, all 7 microservices (including the React frontend) are compiled, deployed, and networked in a single automated workflow. Databases are hosted using Neon Serverless Postgres.
