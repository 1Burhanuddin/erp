-- FIX RLS POLICIES FOR EMPLOYEES
-- The previous policy likely checked 'id = auth.uid()'.
-- This works for legacy users where id matched auth.uid, but fails for new users where they are different.
-- We must check 'user_id = auth.uid()'.

-- 1. Enable RLS (just in case)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- 2. Fix Profile Reading Policy
DROP POLICY IF EXISTS "Employees can read their own profile" ON public.employees;
DROP POLICY IF EXISTS "Users can read own profile" ON public.employees;

CREATE POLICY "Employees can read their own profile"
ON public.employees
FOR SELECT
USING (
  -- Allow users to read their own profile via user_id
  user_id = auth.uid()
  -- OR allow Admins to read everything (optional, but good practice here if not covered globally)
  OR 
  EXISTS (
    SELECT 1 FROM public.employees e2 
    WHERE e2.user_id = auth.uid() AND e2.role = 'admin'
  )
);

-- 3. Fix Task Reading Policy (Indirect reference)
DROP POLICY IF EXISTS "Employees can view assigned tasks" ON public.employee_tasks;

CREATE POLICY "Employees can view assigned tasks"
ON public.employee_tasks
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.employees e2 
    WHERE e2.user_id = auth.uid() AND e2.role = 'admin'
  )
);

-- 4. Fix Attendance Policy
DROP POLICY IF EXISTS "Employees can read own attendance" ON public.attendance;

CREATE POLICY "Employees can read own attendance"
ON public.attendance
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.employees e2 
    WHERE e2.user_id = auth.uid() AND e2.role = 'admin'
  )
);
