# ERP Master Roadmap & Technical Guide

**Version:** 2.0 (Re-prioritized)  
**Status:** Active Development  
**Objective:** Build a comprehensive Enterprise Resource Planning system.

---

## 🛠 Project Standards (Mandatory)
*Every developer must read and follow these standards.*

1.  **Frameworks**: React (Vite) + Supabase + Tailwind + Shadcn/UI.
2.  **Data Fetching**: Use `React Query` (TanStack Query). Hooks go in `src/api/`.
3.  **Global State**: `Redux Toolkit` in `src/store/` (Cart, User Settings, etc.).
4.  **Database**: RLS (Row Level Security) must be enabled on all tables.
5.  **Git**: Clean descriptive commit messages. One feature per branch if possible.

---

## 📅 Phase 1: Comprehensive Reporting Suite
**Priority:** High | **Target:** Financial Visibility

### 1.1 Financial Reports (P&L, Cashflow)
*   **Technical Guide**: Create a unified view that aggregates `sales_orders`, `purchase_orders`, and `expenses`. 
*   **Calculations**:
    *   `Gross Profit` = Total Sales - Total Purchase Cost of items sold.
    *   `Net Profit` = Gross Profit - Expenses.
*   **UI**: Date range filters + Summary cards + Detailed tables.

### 1.2 India Tax Compliance (GST)
*   **Technical Guide**: Generate reports matching GSTR-1 (Sales) and GSTR-3B (Summary) formats. Support CSV/Excel export.
*   **Columns**: GSTIN, Taxable Value, IGST, CGST, SGST, Cess.

### 1.1 - 1.2 Task Log
- [ ] Profit & Loss Dashboard. `[ ] Done by: ______`
- [ ] Tax Report (GST Sales/Purchase). `[ ] Done by: ______`
- [ ] Stock Report (Current valuation). `[ ] Done by: ______`
- [ ] Expense Breakdown Report. `[ ] Done by: ______`

---

## 🛡 Phase 2: Security, Roles & Ops
**Priority:** High | **Target:** System Safety & Access Control

### 2.1 Role-Based Access Control (RBAC)
*   **Technical Guide**: 
    1. Update `employees` table to include `roles` (admin, manager, staff).
    2. Implement Supabase Custom Claims or use a metadata-based role check.
    3. Create a `RoleGate` component to wrap sensitive UI elements.
*   **Example**: Only 'admin' or 'manager' can see "Profit" data.

### 2.2 Audit & Activity Logs
*   **Technical Guide**: Ensure every `INSERT`, `UPDATE`, `DELETE` action is logged with the User ID, Timestamp, and Old/New values.
*   **UI**: A searchable list of actions for admins to review.

### 2.1 - 2.2 Task Log
- [ ] Schema Update for Roles. `[ ] Done by: ______`
- [ ] RoleGate & Permission Logic. `[ ] Done by: ______`
- [ ] Activity Log Viewer UI. `[ ] Done by: ______`
- [ ] Database Backup Automation. `[ ] Done by: ______`

---

## 📦 Phase 3: WMS & CRM Evolution
**Priority:** Medium | **Target:** Operational Efficiency

### 3.1 Warehouse Management (WMS)
*   **Technical Guide**: Extend "Storage Boxes" into a full location-based system. Add "Transfer" logic between stores/locations.
*   **Feature**: Stock adjustment with reason codes (Damage, Expiry, Theft).

### 3.2 CRM & Customer Engagement
*   **Technical Guide**: Build the Customer Portal where clients can see their orders, invoices, and payment status.
*   **Feature**: Quotation management (Draft -> Approved -> Invoice).

### 3.3 Task Log
- [ ] Stock Transfer Flow (Store A to Store B). `[ ] Done by: ______`
- [ ] Quotation Module (Add/List/PDF). `[ ] Done by: ______`
- [ ] Customer Portal Layout & Auth. `[ ] Done by: ______`

---

## 🛒 Phase 4: Advanced Sales & POS
**Priority:** Lower | **Target:** Retail Scalability

### 4.1 POS (Point of Sale)
*   **Technical Guide**: A specialized UI for high-speed checkout.
*   **Features**: Keyboard shortcuts, Barcode scanner support, Multi-payment (Cash + UPI), Thermal printing.

### 4.2 Task Log
- [ ] POS Full-screen Interface. `[ ] Done by: ______`
- [ ] Barcode Integration. `[ ] Done by: ______`
- [ ] Thermal Printer Template (ESC/POS). `[ ] Done by: ______`

---

## 📝 Maintenance & Logs (Update this section as you work)
*Developers: Please sign off here when completing a major milestone.*

| Date | Task | Developer | Notes |
| :--- | :--- | :--- | :--- |
| 2026-01-28 | Master Roadmap Reset | Antigravity | Reordered phases as per user request. |
