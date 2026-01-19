-- Create Enums
CREATE TYPE public.employee_role AS ENUM ('admin', 'employee');
CREATE TYPE public.task_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.payment_status_enum AS ENUM ('pending', 'partial', 'paid');
CREATE TYPE public.payment_mode_enum AS ENUM ('cash', 'online', 'mixed');
CREATE TYPE public.attendance_status AS ENUM ('present', 'late', 'half_day', 'absent');

-- Create Employees Table
CREATE TABLE public.employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role public.employee_role DEFAULT 'employee',
    full_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    shift_start TIME DEFAULT '09:00:00',
    store_id UUID REFERENCES public.stores(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policies for Employees
CREATE POLICY "Admins can manage all employees"
ON public.employees
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Employees can read their own profile"
ON public.employees
FOR SELECT
USING (id = auth.uid());

-- Create Employee Tasks Table
CREATE TABLE public.employee_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id),
    title TEXT NOT NULL,
    description TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    status public.task_status DEFAULT 'pending',
    payment_status public.payment_status_enum DEFAULT 'pending',
    payment_amount NUMERIC(10, 2) DEFAULT 0,
    amount_collected NUMERIC(10, 2) DEFAULT 0,
    payment_mode public.payment_mode_enum,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Tasks
ALTER TABLE public.employee_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for Tasks
CREATE POLICY "Admins can manage all tasks"
ON public.employee_tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Employees can view assigned tasks"
ON public.employee_tasks
FOR SELECT
USING (employee_id = auth.uid());

CREATE POLICY "Employees can update assigned tasks"
ON public.employee_tasks
FOR UPDATE
USING (employee_id = auth.uid())
WITH CHECK (employee_id = auth.uid());

-- NOTE: We will handle the "Hide sensitive data after completion" logic in the Application Layer (API) 
-- for simplicity, or we can use a View/Functions if strict DB security is required. 
-- For now, RLS allows SELECT of own tasks.

-- Create Attendance Table
CREATE TABLE public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id),
    date DATE DEFAULT CURRENT_DATE,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status public.attendance_status DEFAULT 'present',
    location_check_in JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Policies for Attendance
CREATE POLICY "Admins can manage all attendance"
ON public.attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Employees can read own attendance"
ON public.attendance
FOR SELECT
USING (employee_id = auth.uid());

CREATE POLICY "Employees can insert own attendance (Check In)"
ON public.attendance
FOR INSERT
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own attendance (Check Out)"
ON public.attendance
FOR UPDATE
USING (employee_id = auth.uid() AND date = CURRENT_DATE);

-- Auto Update Triggers for `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_employee_tasks_updated_at BEFORE UPDATE ON public.employee_tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
