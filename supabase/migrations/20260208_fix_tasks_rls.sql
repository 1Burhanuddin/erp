-- FIX TASKS RLS FOR EMPLOYEES
-- Ensures that employees can view tasks assigned to their internal ID, mapping from their Auth ID.

-- 1. Redefine "Employees can view assigned tasks" to be robust
DROP POLICY IF EXISTS "Employees can view assigned tasks" ON public.employee_tasks;

CREATE POLICY "Employees can view assigned tasks"
ON public.employee_tasks
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- 2. Redefine "Employees can update assigned tasks"
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
