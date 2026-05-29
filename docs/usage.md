# SwiftRide ERP — Step-by-Step User Guide

Welcome to the **SwiftRide ERP** system user guide. This document provides step-by-step instructions on how to use the deployed ERP system for managing vehicle rentals, customer directory, reservation bookings, and invoicing.

---

## 1. Accessing the System

1. Open your browser and navigate to the live site:  
   👉 **[swiftride-0tti.onrender.com](https://swiftride-0tti.onrender.com)**
2. Log in using the seeded Administrator account:
   * **Email**: `john.doe@swiftride.com`
   * **Password**: `Admin2026!`
3. **Theme Customization**: You can toggle between **Dark Mode** and **Light Mode** by clicking the theme icon (sun/moon) in the top-right corner of the header.

---

## 2. Testing Role Simulation (RBAC)

The SwiftRide ERP enforces strict **Role-Based Access Control (RBAC)** across its microservices. To make testing and grading easy without logging out, we have built a **Simulated Role Selector** into the header:

1. Click on the user profile dropdown in the top-right corner.
2. Select one of the simulated roles:
   * **Administrator (Default)**: Full system access; sees all tabs.
   * **Dispatcher**: Accesses **Overview**, **Fleet Manager**, **Customer Directory**, and **Bookings**.
   * **Accountant**: Accesses **Overview** and **Billing & Accounts**.
   * **Mechanic**: Accesses **Overview** and **Fleet Manager** (specifically for vehicle maintenance checks).
3. The sidebar navigation will dynamically update to reflect the permissions of the selected role.

---

## 3. Step-by-Step Business Workflows

To test the system fully from customer registration to booking completion and billing, follow this end-to-end operational flow:

### Step 1: Onboard a New Customer (CRM Module)
1. Go to the **Customer Directory** tab in the sidebar.
2. Click **+ Add Customer** in the top-right.
3. Fill out the customer details:
   * *Example*: Bruce Wayne, `bruce.wayne@waynecorp.com`, +639171234567, 1007 Mountain Drive, Gotham City.
4. Click **Save Customer**.
5. Locate the newly created customer in the list, click the **Three Dots (Actions)** menu on the right, and select **Add Driver's License**.
6. Enter license details (e.g., Number: `DL-12345678`, Class: `B`, Expiry Date in the future) and click **Save License**.
7. In the Actions menu for that customer, click **Verify Customer** to run eligibility checks (which queries the CRM microservice to ensure they have a valid, unexpired driver's license). The status indicator will update to show eligibility.

### Step 2: Manage Fleet Inventory (Fleet Module)
1. Go to the **Fleet Manager** tab.
2. Click **+ Add Vehicle** to register a new vehicle.
3. Fill out the vehicle specifications:
   * *Example*: Make: `Toyota`, Model: `Fortuner`, Year: `2024`, Color: `Black`, Plate Number: `XYZ-7890`, Daily Rate: `3500` PHP.
4. Click **Save Vehicle**. The vehicle will appear in the directory with an **Available** status badge.
5. *(Optional)* Click the Actions menu next to a vehicle and choose **Update Status** to manually transition the vehicle between **Available**, **Rented**, and **Maintenance** (useful for mechanics).

### Step 3: Create a Reservation Booking (Booking Module)
1. Go to the **Bookings** tab.
2. Click **+ Create Booking**.
3. Fill out the reservation details:
   * **Customer**: Select the customer you created in Step 1.
   * **Vehicle**: Select the vehicle you registered in Step 2.
   * **Dates**: Choose a start and end date (e.g., a 3-day rental).
   * **Premium Add-ons**: Check options like Premium GPS, WiFi Router, or Personal Driver.
4. Click **Create Booking**.
5. Behind the scenes, the Booking service queries the Fleet service to confirm vehicle availability, validates the customer's CRM status, blocks the calendar schedule, and triggers invoice creation.

### Step 4: Invoice Settlement & Financials (Billing Module)
1. Go to the **Billing & Accounts** tab.
2. Locate the invoice automatically generated for your new booking (formatted as `INVOICE-XXXX`). It will show the correct total calculated by multiplying the vehicle's daily rate by the rental duration, plus any selected add-on fees.
3. Click the Actions menu on the invoice and select **Record Payment**.
4. Enter the amount to pay:
   * *For Partial Payments*: Enter a value less than the total. The invoice status will update to **Partial**.
   * *For Full Payments*: Enter the exact remaining amount. The invoice status will transition to **Paid**.
   * Choose a payment method (Cash, Bank Transfer, GCash).
5. Click **Record Payment**.
6. Select **View Receipt** in the Actions menu to display a generated receipt detailing the breakdown of charges and payment history.
7. Select **Issue Refund** to process refunds for paid invoices (Accountant or Admin privileges required).

---

## 4. System Health & Performance Note (Cold Starts)

This system is deployed on **Render's Free Tier**. Under free tier rules, Web Services spin down after 15 minutes of inactivity:
* **Initial Delay**: When you first load the page or log in after a period of idle time, you may experience a **30-50 second delay** while Render wakes up the underlying Docker containers (cold start).
* Once the services are active, the application responds instantly.
