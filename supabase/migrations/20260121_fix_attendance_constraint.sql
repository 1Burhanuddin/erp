-- Add unique constraint to prevent multiple check-ins per day
ALTER TABLE public.attendance 
ADD CONSTRAINT attendance_employee_id_date_key UNIQUE (employee_id, date);

-- Ensure date is properly set to current date if null (though default handles it)
ALTER TABLE public.attendance 
ALTER COLUMN date SET DEFAULT CURRENT_DATE;

-- Policy Update Fix:
-- The Admin Policy in '20260120' referenced 'id = auth.uid()' which is no longer valid for Admins (id is internal).
-- We need to update it to use 'user_id = auth.uid()'.

DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;
CREATE POLICY "Admins can manage all attendance"
ON public.attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
