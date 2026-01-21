# Project Roadmap & Technical Analysis

**Created**: 2026-01-21
**Status**: Active

## 1. System Analysis (Current State)
The ERP system has a strong foundation with:
*   **Core Modules**: Products, Contacts, Sales, Purchases, Expenses.
*   **Role-Based Access**: Clear separation between 'Admin' (Web ERP) and 'Employee' (Mobile App).
*   **Mobile Operations**: GPS Attendance, Task Management, Payment Collection.

### 🚨 Critical Gaps Identified
1.  **Inventory De-synchronization**
    *   **Problem**: Stock levels (`products.current_stock`) do not update automatically when Sales or Purchases occur.
    *   **Risk**: selling out-of-stock items; inaccurate assets.
    *   **Solution**: Database Triggers on `sales_items` and `purchase_items`.

2.  **Mobile App is not a PWA**
    *   **Problem**: The "Employee App" runs in a browser tab. No offline support, no home screen icon, address bar is visible.
    *   **Risk**: Poor user experience for field staff; requires constant internet for UI loading.
    *   **Solution**: Implement Web Manifest and Service Worker (Vite PWA Plugin).

3.  **Onboarding Experience**
    *   **Problem**: New signups land on an empty dashboard with no guidance.
    *   **Solution**: Implement a "Setup Wizard" (Tax rates, Bank details, Logo).

---

## 2. Implementation Plan

### Phase 4.1: Inventory Automation (High Priority)
**Goal**: Ensure `products.current_stock` is always accurate.

*   [ ] **Database Triggers**:
    *   `trg_update_stock_on_sale`: Decrement stock when `sales_items` are created/updated.
    *   `trg_update_stock_on_purchase`: Increment stock when `purchase_items` are created/updated.
    *   `trg_update_stock_on_delete`: Reverse effects if items are deleted.
*   **Constraints**:
    *   Only apply to `products.type = 'Product'`.
    *   Ignore `type = 'Service'`.

### Phase 4.2: Progressive Web App (PWA)
**Goal**: Make the mobile app installable.

*   [ ] **Vite PWA Plugin**: Install and configure `vite-plugin-pwa`.
*   [ ] **Manifest**: Define name, icons, and theme colors.
*   [ ] **Service Worker**: Cache static assets (JS, CSS, Images) for faster loading and basic offline shell.

---

## 3. Progress Log

### Session: 2026-01-21
*   **Analysis**: Completed full project review.
*   **Plan**: Created this roadmap.
*   **Next Action**: Implementing Inventory Sync Triggers.
