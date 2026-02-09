# Comprehensive POS System Requirement Specification (SRS)

## 1. Project Introduction
This document outlines the functional and technical requirements for a versatile Point of Sale (POS) system designed to handle both **Wholesale** and **Retail** operations. The system allows for inventory sourcing from internal production and external vendors, providing a complete 360-degree management solution for any retail/wholesale business.

---

## 2. Business & Functional Requirements

### 2.1 Inventory & Product Management
* **Dual Pricing Model:** * Ability to set a "Retail Price" (per unit).
    * Ability to set "Wholesale Price" (based on bulk quantity or specific customer tiers).
* **Multi-Source Sourcing:**
    * **Vendor Sourcing:** Track products purchased from external suppliers.
    * **Own Production:** Track products manufactured or packaged in-house.
* **SKU & Barcode Management:** Generate and scan barcodes (EAN, UPC, or custom QR codes).
* **Stock Management:**
    * Real-time stock level tracking.
    * Low stock alerts (Automated notifications).
    * Batch/Expiry tracking for perishable goods.
* **Unit Conversion:** Support for selling in different units (e.g., Buy in Pallets/Boxes, Sell in Pieces).

### 2.2 Sales & Point of Sale (POS) Interface
* **Transaction Modes:** One-click toggle between **Wholesale Mode** and **Retail Mode**.
* **Dynamic Search:** Quick product lookup via name, SKU, or barcode.
* **Cart Management:**
    * Apply discounts (Percentage or Fixed amount).
    * Hold/Suspend cart functionality.
* **Payment Processing:**
    * Multi-mode payments (Cash, Credit Card, Mobile Wallets/QR).
    * Split payments (Part cash, part card).
* **Billing & Receipts:** * Generate professional invoices for wholesale.
    * Generate thermal receipts for retail.
    * Digital receipts via Email/SMS.

### 2.3 Vendor & Purchase Management (GRN)
* **Vendor Profiles:** Comprehensive database of suppliers (Contact, Tax ID, Address).
* **Goods Received Note (GRN):** Record new stock arrivals, verify against purchase orders, and auto-update inventory.
* **Supplier Credit:** Track outstanding balances owed to vendors and record payment history.

### 2.4 Customer Management (CRM)
* **Customer Profiles:** Track purchase history for both retail and wholesale clients.
* **Credit Sales (Arrears):** Manage "Buy now, pay later" accounts with credit limits.
* **Wholesale Loyalty:** Custom pricing tiers for high-volume wholesale buyers.

### 2.5 Reporting & Analytics
* **Daily Sales Summary:** Total sales, tax, and profit margins.
* **Inventory Valuation:** Current value of stock based on purchase price.
* **Vendor Performance:** Reports on which suppliers provide the best margins.
* **Profit/Loss:** Detailed breakdown by product category or time period.

---

## 3. Technical Requirements

### 3.1 Recommended Tech Stack
* **Frontend:** React.js or Next.js (Fast, responsive UI).
* **Backend:** Node.js (Express) or Laravel (Robust API handling).
* **Database:** PostgreSQL or MySQL (Relational data for complex inventory).
* **State Management:** Redux or Zustand (To handle complex cart states).

### 3.2 System Architecture
* **Hybrid Offline Mode:** Ability to process sales locally (using IndexedDB/SQLite) and sync to the cloud when the internet is available.
* **Multi-Terminal Support:** Multiple cashiers syncing to a single central database.
* **Role-Based Access Control (RBAC):**
    * **Admin:** Full access to reports and settings.
    * **Manager:** Stock management and price adjustments.
    * **Cashier:** Sales and billing only.

### 3.3 Hardware Integration
* **Printers:** Support for 80mm/58mm Thermal Printers (ESC/POS) and A4 Laser printers.
* **Scanners:** 1D/2D Barcode scanner integration.
* **Cash Drawer:** Automatic trigger on receipt print.
* **Customer Display:** Support for secondary screens to show totals.

### 3.4 Security & Data Integrity
* **Automated Backups:** Daily database backups to cloud storage (AWS S3 / Google Drive).
* **Audit Trails:** Log every action (price change, stock deletion, refund) with user timestamps.
* **Encryption:** SSL/TLS for all data transmissions.

---

## 4. Proposed Database Schema Logic (Key Tables)

| Table | Key Columns |
| :--- | :--- |
| **Products** | ID, Name, SKU, Category, Cost_Price, Retail_Price, Wholesale_Price, Min_Wholesale_Qty |
| **Inventory** | ID, Product_ID, Stock_Level, Vendor_ID, Expiry_Date, Source (Own/Vendor) |
| **Vendors** | ID, Company_Name, Contact_Person, Total_Balance_Owed |
| **Sales** | ID, Date, Customer_ID, Total_Amount, Type (Retail/Wholesale), Payment_Status |
| **Sale_Items** | ID, Sale_ID, Product_ID, Quantity, Sold_Price, Subtotal |

---

## 5. Execution Roadmap
1.  **Phase 1:** Core Inventory & Vendor Management.
2.  **Phase 2:** POS Interface (Retail logic) & Printing.
3.  **Phase 3:** Wholesale Logic (Bulk pricing/Credit sales).
4.  **Phase 4:** Reporting & Dashboard Analytics.
5.  **Phase 5:** Security hardening & Hardware testing.