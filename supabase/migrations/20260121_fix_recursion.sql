-- Fix Infinite Recursion in Employees RLS

-- 1. Create a secure function to check admin status
-- SECURITY DEFINER means it runs with the privileges of the creator (postgres/admin), bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.employees 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policy on employees
DROP POLICY IF EXISTS "Admins can manage all employees" ON public.employees;

-- 3. Re-create the policy using the secure function
CREATE POLICY "Admins can manage all employees"
ON public.employees
FOR ALL
USING (public.is_admin());

-- 4. Update other policies to use is_admin() for consistency and performance (optional but cleanliness)
DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.employee_tasks;
CREATE POLICY "Admins can manage all tasks"
ON public.employee_tasks
FOR ALL
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;
CREATE POLICY "Admins can manage all attendance"
ON public.attendance
FOR ALL
USING (public.is_admin());
