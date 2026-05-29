# SwiftRide ERP — Live Demo Presentation Script

This script is structured for a **5-to-10 minute presentation/demo video** matching your course evaluation rubric. It covers the business domain, architecture design, and a step-by-step walk-through of the user interface.

---

## 🎙️ Section 1: Introduction (1 Minute)
* **Goal**: Introduce the team, the company profile, and core pain points.

> **What to Say**:  
> *"Good day, instructor. We are Team SwiftRide, and today we are excited to present **SwiftRide ERP**—a distributed Enterprise Resource Planning system designed for regional vehicle rentals and logistics operations.  
>   
> In the rental industry, businesses suffer from fragmented data, duplicate customer records, scheduling conflicts, and unsynchronized invoices. SwiftRide ERP solves these pain points by offering a modern, unified platform built on a scalable **microservices architecture**."*

---

## ⚙️ Section 2: Technical Architecture (1.5 Minutes)
* **Goal**: Show architectural rigor and compliance with the project guidelines.

> **What to Say**:  
> *"Compliance with microservices principles is at the heart of our engineering choices:  
> 1. **Technology Stack**: We utilized a unified **Laravel** framework for our backend microservices and API Gateway, paired with a modern **React.js** frontend interface built using Vite and Tailwind CSS.  
> 2. **API Gateway**: A single gateway routes all frontend requests to their respective backend services, ensuring that the client interface only ever exposes a single public endpoint.  
> 3. **Strict Database Isolation**: We have five completely isolated databases hosted on **Neon Serverless Postgres**—one for each microservice (`auth`, `fleet`, `crm`, `booking`, and `billing`). Shared database access is strictly prohibited.  
> 4. **Inter-Service Communication**: The services communicate synchronously via REST APIs to run business verification flows (e.g. checking driver eligibility and vehicle schedules during booking orchestration)."*

---

## 🖥️ Section 3: Live System Walkthrough (4-5 Minutes)
* **Goal**: Walk through the core business processes step-by-step in the UI.

### Scene 1: Login & Theme Options
> **Action**: Navigate to `https://swiftride-0tti.onrender.com/login`, type in the credentials (`john.doe@swiftride.com` / `Admin2026!`), and click Log In. Once loaded, click the Sun/Moon icon in the top-right to toggle themes.  
>   
> **What to Say**:  
> *"Let's log in to the ERP as an Administrator. You will notice our modern glassmorphic dashboard interface which supports dynamic theme toggling between light and dark modes to suit different working conditions."*

### Scene 2: Customer Onboarding & Driver's License Validation (CRM)
> **Action**: Click **Customer Directory** -> **+ Add Customer** -> Fill out dummy details -> Click **Save Customer**. Locate the new customer -> Click Actions -> **Add Driver's License** -> Fill details -> Click **Save**. Click **Verify Customer**.  
>   
> **What to Say**:  
> *"Our first workflow is **Customer Onboarding**. We register a new client in our CRM module. To ensure road safety and compliance, we must attach their driver's license. When we click **Verify Customer**, the system automatically queries the CRM microservice to validate that the driver possesses a current, eligible class license before they can rent any vehicle."*

### Scene 3: Fleet Management (Fleet)
> **Action**: Click **Fleet Manager** -> **+ Add Vehicle** -> Enter Make (Toyota), Model (Fortuner), Daily Rate (3500) -> Click **Save Vehicle**.  
>   
> **What to Say**:  
> *"Next is our **Fleet Manager** module. Here, dispatchers and mechanics manually manage our physical inventory. We can register new vehicles and dynamically toggle their operational status between Available, Rented, and Maintenance."*

### Scene 4: Booking Orchestration (Booking)
> **Action**: Click **Bookings** -> **+ Create Booking** -> Select your new customer, select the Fortuner, set dates (e.g., 3 days), check Premium GPS -> Click **Create Booking**.  
>   
> **What to Say**:  
> *"Now we orchestrate a reservation. In the **Bookings** tab, we create a booking. Behind the scenes, the Booking service coordinates an API call to the CRM service to verify client eligibility, calls the Fleet service to check vehicle availability and locks its calendar schedule, and then alerts the Billing service to generate an invoice based on the daily rate and duration."*

### Scene 5: Invoicing & Payment Settlement (Billing)
> **Action**: Click **Billing & Accounts** -> Locate the generated invoice -> Click Actions -> **Record Payment** -> Enter a partial amount first, then record full payment -> Click Actions -> **View Receipt**.  
>   
> **What to Say**:  
> *"In our **Billing** module, we see the generated invoice reflecting the correct duration calculations and add-on fees. We support partial and full payments. Once paid in full, the invoice status changes to 'Paid' and we can render a detailed itemized receipt."*

### Scene 6: Role Simulation (RBAC Defense)
> **Action**: Click the User Profile in the top-right -> Select **Accountant**. Show that only Overview and Billing tabs remain. Switch to **Mechanic**, showing only Overview and Fleet.  
>   
> **What to Say**:  
> *"To support operational security, we implement strict Role-Based Access Control. As you can see, when we simulate switching from Administrator to Accountant, the UI dynamically locks down and removes access to Fleet, CRM, and Bookings. Switching to Mechanic isolates their workspace purely to vehicle maintenance, protecting sensitive business domains."*

---

## 🛡️ Section 4: Architecture Defense Prep (Q&A Tips)
* **Goal**: Be prepared to answer questions your instructor might ask during the defense.

* **Q: How are your services deployed?**  
  * **Answer**: All 5 services, the API Gateway, and the React frontend are deployed as containerized Docker applications on Render's Web Services, connected to Neon Serverless Postgres databases.
* **Q: How did you handle sequence/identity conflicts with seeded database data?**  
  * **Answer**: We noticed PostgreSQL primary key sequence mismatch errors on fresh insert (`POST`) calls due to seeders using hardcoded IDs. We resolved this by building a dedicated sequence reset script that dynamically aligns the sequence values (`nextval()`) to the highest `MAX(id)` in each table.
* **Q: Why does the Gateway not have a database?**  
  * **Answer**: The API Gateway functions as a stateless reverse proxy and JWT validator. To ensure performance and microservices integrity, we removed all database components and migrations from its entrypoint so it boots cleanly and with maximum speed.
