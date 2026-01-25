-- ⚠️ WARNING: THIS WILL DELETE ALL DATA FROM YOUR DATABASE ⚠️
-- Run this in Supabase SQL Editor

-- 1. Truncate all public tables (Data)
-- Using IF EXISTS to avoid errors if some tables were renamed or don't exist yet
TRUNCATE TABLE 
  public.audit_logs,
  public.notifications,
  public.attendance,
  public.employee_tasks,
  public.sales_items,
  public.sales_payments,
  public.sales_orders,
  public.purchase_items,
  public.purchase_orders,
  public.expenses,
  public.products,
  public.contacts,
  public.deals,
  public.employees,
  public.stores,
  public.product_brands,
  public.product_categories,
  public.product_sub_categories,
  public.product_units,
  public.tax_rates,
  public.business_profiles -- Corrected from business_profile
RESTART IDENTITY CASCADE;

-- 2. To delete Auth Users (Users from Authentication Tab)
-- Manually go to Supabase Dashboard > Authentication > Users > Select All > Delete.
