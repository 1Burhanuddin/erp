-- Refactor Employees Table to support Non-Auth Employees (and fix Email error)

-- 1. Add Email Column
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Add user_id column to link to Supabase Auth (Nullable)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 3. Backfill user_id with existing id (since we previously used id as auth_id)
UPDATE public.employees SET user_id = id WHERE user_id IS NULL;

-- 4. Drop the foreign key constraint on 'id' so we can have employees without auth users
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_id_fkey;

-- 5. Set 'id' to auto-generate if not provided
ALTER TABLE public.employees ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 6. Update is_admin function to check user_id instead of id
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.employees 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::public.employee_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Update RLS Policies to use user_id

-- Employees can read their own profile
DROP POLICY IF EXISTS "Employees can read their own profile" ON public.employees;
CREATE POLICY "Employees can read their own profile"
ON public.employees
FOR SELECT
USING (user_id = auth.uid());

-- Fix Tasks Policies (they reference employee_id, which is the internal ID, so these might be fine IF employee_id matches auth.id? NO.)
-- PREVIOUSLY: employee_id referenced employees.id, which WAS auth.id.
-- NOW: employees.id is INTERNAL UUID. user_id is AUTH.ID.
-- ISSUE: 'employee_tasks' references 'employees(id)'.
-- When an Employee logs in, their auth.uid() == employees.user_id.
-- To check their tasks (where employee_id = employees.id), we need to map auth.uid() -> user_id -> id.

-- Redefine: "Employees can view assigned tasks"
DROP POLICY IF EXISTS "Employees can view assigned tasks" ON public.employee_tasks;
CREATE POLICY "Employees can view assigned tasks"
ON public.employee_tasks
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- Redefine: "Employees can update assigned tasks"
DROP POLICY IF EXISTS "Employees can update assigned tasks" ON public.employee_tasks;
CREATE POLICY "Employees can update assigned tasks"
ON public.employee_tasks
FOR UPDATE
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- Redefine: "Employees can read own attendance"
DROP POLICY IF EXISTS "Employees can read own attendance" ON public.attendance;
CREATE POLICY "Employees can read own attendance"
ON public.attendance
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- Redefine: "Employees can insert own attendance"
DROP POLICY IF EXISTS "Employees can insert own attendance (Check In)" ON public.attendance;
CREATE POLICY "Employees can insert own attendance (Check In)"
ON public.attendance
FOR INSERT
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- Redefine: "Employees can update own attendance"
DROP POLICY IF EXISTS "Employees can update own attendance (Check Out)" ON public.attendance;
CREATE POLICY "Employees can update own attendance (Check Out)"
ON public.attendance
FOR UPDATE
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  ) 
  AND date = CURRENT_DATE
);
