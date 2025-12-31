# Database Documentation

## Overview
The application uses Supabase (PostgreSQL) as the backend. The database schema focuses on core ERP entities and enforces multi-tenancy via Row Level Security (RLS).

## Schema Definitions

### Core Tables
-   **contacts**: Stores Supplier and Customer information.
-   **products**: Master inventory list (Items).
-   **product_categories**: Categories for organizing products.
-   **product_brands**: Brand names associated with products.
-   **product_units**: Measurement units (kg, pcs, etc.).

### Transaction Tables
-   **purchase_orders**: Headers for purchase transactions from suppliers.
-   **purchase_items**: Line items for purchase orders.
-   **sales_orders**: Headers for sales transactions to customers.
-   **sales_items**: Line items for sales orders.
-   **sales_payments**: Payment records against sales orders.
-   **expenses**: Operational expense records.
-   **stock_adjustments**: Manual inventory corrections.
-   **sales_returns**: Records of items returned by customers.

## Security Model (RLS)

### Multi-tenancy Strategy
The system uses a "Shared Database, Row-Level Isolation" model.
1.  **Identification**: Every table includes a `user_id` column (UUID).
2.  **Default Value**: `user_id` defaults to `auth.uid()` on INSERT.
3.  **Enforcement**: PostgreSQL RLS policies automatically filter rows.

### Standard Policies
For key tables (e.g., `contacts`, `products`), the following policies are applied:

-   **SELECT**: `user_id = auth.uid()` (Users can only see their own rows).
-   **INSERT**: `user_id = auth.uid()` (Users can only insert rows belonging to them).
-   **UPDATE**: `user_id = auth.uid()` (Users can only update their own rows).
-   **DELETE**: `user_id = auth.uid()` (Users can only delete their own rows).

## Migration Process
Database changes are managed via SQL migration files in `supabase/migrations`.
1.  Create a new file with a timestamp prefix (e.g., `20250104000000_description.sql`).
2.  Write idempotent SQL (use `IF NOT EXISTS`, `DO $$` blocks).
3.  Run migrations manually in the Supabase Dashboard SQL Editor or via CLI.

### Orphan Data Handling
If RLS is enabled after data creation, existing rows may have `user_id = NULL`.
Run a specialized update script to assign these rows to a valid `auth.users` ID to make them visible again.
