-- Enable ON DELETE CASCADE for Employee related tables so deleting an employee deletes their data

-- 1. Attendance Table
ALTER TABLE public.attendance
DROP CONSTRAINT IF EXISTS attendance_employee_id_fkey;

ALTER TABLE public.attendance
ADD CONSTRAINT attendance_employee_id_fkey
FOREIGN KEY (employee_id)
REFERENCES public.employees(id)
ON DELETE CASCADE;

-- 2. Employee Tasks Table
ALTER TABLE public.employee_tasks
DROP CONSTRAINT IF EXISTS employee_tasks_employee_id_fkey;

ALTER TABLE public.employee_tasks
ADD CONSTRAINT employee_tasks_employee_id_fkey
FOREIGN KEY (employee_id)
REFERENCES public.employees(id)
ON DELETE CASCADE;
