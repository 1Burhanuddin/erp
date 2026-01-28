-- Migration to fix deletion issues across multiple tables
-- This allows deleting records from master tables (stores, contacts, categories, brands, units, products) 
-- by automatically cascading the deletion to related records.

-- ==========================================
-- 1. STORES
-- ==========================================

-- Employees table
ALTER TABLE public.employees
DROP CONSTRAINT IF EXISTS employees_store_id_fkey;

ALTER TABLE public.employees
ADD CONSTRAINT employees_store_id_fkey
FOREIGN KEY (store_id)
REFERENCES public.stores(id)
ON DELETE CASCADE;

-- Bookings table
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_store_id_fkey;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_store_id_fkey
FOREIGN KEY (store_id)
REFERENCES public.stores(id)
ON DELETE CASCADE;


-- ==========================================
-- 2. CONTACTS (Suppliers/Customers)
-- ==========================================

-- Deals table
ALTER TABLE public.deals
DROP CONSTRAINT IF EXISTS deals_contact_id_fkey;

ALTER TABLE public.deals
ADD CONSTRAINT deals_contact_id_fkey
FOREIGN KEY (contact_id)
REFERENCES public.contacts(id)
ON DELETE CASCADE;

-- Purchase Orders table
ALTER TABLE public.purchase_orders
DROP CONSTRAINT IF EXISTS purchase_orders_supplier_id_fkey;

ALTER TABLE public.purchase_orders
ADD CONSTRAINT purchase_orders_supplier_id_fkey
FOREIGN KEY (supplier_id)
REFERENCES public.contacts(id)
ON DELETE CASCADE;

-- Sales Orders table
ALTER TABLE public.sales_orders
DROP CONSTRAINT IF EXISTS sales_orders_customer_id_fkey;

ALTER TABLE public.sales_orders
ADD CONSTRAINT sales_orders_customer_id_fkey
FOREIGN KEY (customer_id)
REFERENCES public.contacts(id)
ON DELETE CASCADE;


-- ==========================================
-- 3. EXPENSE CATEGORIES
-- ==========================================

-- Expenses table
ALTER TABLE public.expenses
DROP CONSTRAINT IF EXISTS expenses_category_id_fkey;

ALTER TABLE public.expenses
ADD CONSTRAINT expenses_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES public.expense_categories(id)
ON DELETE CASCADE;


-- ==========================================
-- 4. PRODUCT ATTRIBUTES (Categories, Brands, Units)
-- ==========================================

-- Products -> Categories
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_category_id_fkey;

ALTER TABLE public.products
ADD CONSTRAINT products_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES public.product_categories(id)
ON DELETE CASCADE;

-- Products -> Brands
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_brand_id_fkey;

ALTER TABLE public.products
ADD CONSTRAINT products_brand_id_fkey
FOREIGN KEY (brand_id)
REFERENCES public.product_brands(id)
ON DELETE CASCADE;

-- Products -> Units
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_unit_id_fkey;

ALTER TABLE public.products
ADD CONSTRAINT products_unit_id_fkey
FOREIGN KEY (unit_id)
REFERENCES public.product_units(id)
ON DELETE CASCADE;

-- Products -> Sub Categories
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_sub_category_id_fkey;

ALTER TABLE public.products
ADD CONSTRAINT products_sub_category_id_fkey
FOREIGN KEY (sub_category_id)
REFERENCES public.product_sub_categories(id)
ON DELETE CASCADE;


-- ==========================================
-- 5. PRODUCTS (Clean-up child references)
-- ==========================================

-- Purchase Items
ALTER TABLE public.purchase_items
DROP CONSTRAINT IF EXISTS purchase_items_product_id_fkey;

ALTER TABLE public.purchase_items
ADD CONSTRAINT purchase_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;

-- Sales Items
ALTER TABLE public.sales_items
DROP CONSTRAINT IF EXISTS sales_items_product_id_fkey;

ALTER TABLE public.sales_items
ADD CONSTRAINT sales_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;

-- Employee Tasks (Services)
ALTER TABLE public.employee_tasks
DROP CONSTRAINT IF EXISTS employee_tasks_service_id_fkey;

ALTER TABLE public.employee_tasks
ADD CONSTRAINT employee_tasks_service_id_fkey
FOREIGN KEY (service_id)
REFERENCES public.products(id)
ON DELETE CASCADE;
