-- FIX INFINITE RECURSION IN RLS
-- The previous policy caused a 500 error because checking "Am I an admin?" required querying the 'employees' table,
-- which triggered the RLS policy again, creating an infinite loop.

-- 1. Create a secure function to check admin status (Bypasses RLS loop)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- This SELECT runs with the privileges of the function creator (superuser),
  -- effectively bypassing RLS on the 'employees' table for this specific check.
  RETURN EXISTS (
    SELECT 1 
    FROM public.employees 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update Profile Policy to use the function
DROP POLICY IF EXISTS "Employees can read their own profile" ON public.employees;

CREATE POLICY "Employees can read their own profile"
ON public.employees
FOR SELECT
USING (
  user_id = auth.uid() -- Can read own profile
  OR 
  public.is_admin()    -- Or is Admin (uses secure function)
);

-- 3. Update Tasks Policy
DROP POLICY IF EXISTS "Employees can view assigned tasks" ON public.employee_tasks;

CREATE POLICY "Employees can view assigned tasks"
ON public.employee_tasks
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
  OR
  public.is_admin()
);

-- 4. Update Attendance Policy
DROP POLICY IF EXISTS "Employees can read own attendance" ON public.attendance;

CREATE POLICY "Employees can read own attendance"
ON public.attendance
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
  OR
  public.is_admin()
);
