-- SECURE STORE ISOLATION (Fix Multi-Tenancy Data Leaks)
-- Previous policies allowed any 'admin' to see all data. 
-- New policies restrict Admins to only see data from their own 'store_id'.

-- Helper function to get current user's store_id key (Optimization to avoid repeated lookups)
CREATE OR REPLACE FUNCTION public.get_my_store_id()
RETURNS UUID AS $$
  SELECT store_id FROM public.employees WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- 1. EMPLOYEES TABLE PROTECTION
DROP POLICY IF EXISTS "Admins can manage all employees" ON public.employees;

CREATE POLICY "Admins can manage store employees"
ON public.employees
FOR ALL
USING (
  -- Admin of the SAME store
  store_id = public.get_my_store_id()
  AND
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Note: "Employees can read their own profile" policy (created in previous migration) is still valid and safe.


-- 2. ATTENDANCE TABLE PROTECTION
DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;

CREATE POLICY "Admins can manage store attendance"
ON public.attendance
FOR ALL
USING (
  -- The attendance record belongs to an employee in MY store
  EXISTS (
    SELECT 1 FROM public.employees target_emp
    WHERE target_emp.id = attendance.employee_id
    AND target_emp.store_id = public.get_my_store_id()
  )
  AND
  -- I am an Admin
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Note: "Employees can read/insert/update own attendance" policies are already safe (check auth.uid).


-- 3. TASKS TABLE PROTECTION
DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.employee_tasks;

CREATE POLICY "Admins can manage store tasks"
ON public.employee_tasks
FOR ALL
USING (
  -- The task belongs to an employee in MY store
  EXISTS (
    SELECT 1 FROM public.employees target_emp
    WHERE target_emp.id = employee_tasks.employee_id
    AND target_emp.store_id = public.get_my_store_id()
  )
  AND
  -- I am an Admin
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Note: "Employees can view/update assigned tasks" policies are already safe.
