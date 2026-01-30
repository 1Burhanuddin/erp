-- FIX EMPLOYEE RLS (Final Robust Solution)
-- Replaces fragile 'get_my_store_id' with 'is_admin_of_store' for proper multi-store security.

-- 1. Helper Function: Check if current user is admin of a SPECIFIC store
CREATE OR REPLACE FUNCTION public.is_admin_of_store(_store_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.employees 
    WHERE user_id = auth.uid() 
    AND store_id = _store_id 
    AND role = 'admin'::public.employee_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. EMPLOYEES TABLE
DROP POLICY IF EXISTS "Admins can manage store employees" ON public.employees;

CREATE POLICY "Admins can manage store employees"
ON public.employees
FOR ALL
USING (
  public.is_admin_of_store(store_id)
)
WITH CHECK (
  public.is_admin_of_store(store_id)
);


-- 3. ATTENDANCE TABLE
DROP POLICY IF EXISTS "Admins can manage store attendance" ON public.attendance;

CREATE POLICY "Admins can manage store attendance"
ON public.attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees target_emp
    WHERE target_emp.id = attendance.employee_id
    AND public.is_admin_of_store(target_emp.store_id)
  )
);


-- 4. TASKS TABLE
DROP POLICY IF EXISTS "Admins can manage store tasks" ON public.employee_tasks;

CREATE POLICY "Admins can manage store tasks"
ON public.employee_tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees target_emp
    WHERE target_emp.id = employee_tasks.employee_id
    AND public.is_admin_of_store(target_emp.store_id)
  )
);
