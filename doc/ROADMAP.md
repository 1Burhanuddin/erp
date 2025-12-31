# Project Roadmap and Status

## Current Status (Completed)

### Core Architecture
-   **Authentication**: Implemented (Login/Signup).
-   **Security**: RLS enabled for complete data isolation.
-   **Navigation**: Responsive Sidebar with Mobile Sheet.

### Modules
-   **Contacts**: Management of Suppliers and Customers.
-   **Products**: Management of Items, Brands, Categories, Units.
-   **Purchasing**: POs, GRNs, Returns.
-   **Sales**: Quotations, Orders, Invoices, Returns.
-   **Stock**: Automatic updates and manual adjustments.
-   **Expenses**: Basic tracking.

## Future Plans (Roadmap)

### Immediate Priorities
1.  **Reports Module**:
    -   Connect charts and tables to real database metrics.
    -   Implement date range filtering for reports.
2.  **Settings Page**:
    -   Implement User Profile management (Edit Name/Avatar).
    -   Implement Application Settings (Timezone, Currency, Tax Rates).
3.  **CRM Features**:
    -   Enhance `Deals.tsx` with a proper drag-and-drop Kanban board.
    -   Link Deals to Contacts.

### Mid-term Goals
1.  **E-commerce Integration**:
    -   Build connectors for external platforms or a simple internal storefront.
2.  **User Roles & Permissions**:
    -   Expand RLS to support multiple users per "Organization" (Team features).
    -   Implement "Admin" vs "Staff" roles within an organization.
3.  **Data Import/Export**:
    -   Support CSV import for Products and Contacts.
    -   Export Reports to PDF/Excel.

### Technical Improvements
-   **Audit Logging**: Track who changed what and when.
-   **Testing**: Implement Unit and Integration tests (Jest/Vitest).
-   **CI/CD**: specific pipelines for automated testing and deployment.
