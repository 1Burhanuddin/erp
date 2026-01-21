-- FINAL VISIBILITY FIX (Move Role to JWT + Fix Policy Recursion)

-- 1. Backfill 'role' into User Metadata (so we don't need to query DB to check if admin)
DO $$
DECLARE
  emp RECORD;
BEGIN
  FOR emp IN SELECT user_id, role FROM public.employees WHERE user_id IS NOT NULL LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', emp.role)
    WHERE id = emp.user_id;
  END LOOP;
END $$;


-- 2. Update Trigger to Sync 'role' on New User / Invite
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_employee_id UUID;
  v_store_id UUID;
  v_role text;
BEGIN
  -- 1. Check for existing invite
  SELECT id, store_id, role::text INTO v_employee_id, v_store_id, v_role
  FROM public.employees
  WHERE email = NEW.email
  LIMIT 1;

  IF v_employee_id IS NOT NULL THEN
    -- Link Auth ID
    UPDATE public.employees
    SET user_id = NEW.id
    WHERE id = v_employee_id;
    
    -- Sync store_id AND role to metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('store_id', v_store_id, 'role', v_role)
    WHERE id = NEW.id;
    
  ELSE
    -- 2. New Admin User
    -- Create Store
    INSERT INTO public.stores (name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'My ERP') || '''s Store')
    RETURNING id INTO v_store_id;

    -- Create Employee
    INSERT INTO public.employees (
      user_id,
      store_id,
      email,
      full_name,
      role,
      status
    ) VALUES (
      NEW.id,
      v_store_id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin User'),
      'admin',
      'active'
    );
    
    -- Sync store_id AND role to metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('store_id', v_store_id, 'role', 'admin')
    WHERE id = NEW.id;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Update 'is_admin' to read from JWT (Recursion Proof)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role text;
BEGIN
  -- Extract role from JWT app_metadata
  v_role := (auth.jwt() -> 'app_metadata' ->> 'role');
  
  IF v_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- 4. FIX POLICIES to use the Safe Function (No Subqueries)

-- EMPLOYEES
DROP POLICY IF EXISTS "Admins can manage store employees" ON public.employees;
CREATE POLICY "Admins can manage store employees"
ON public.employees
FOR ALL
USING (
  store_id = public.get_my_store_id()
  AND
  public.is_admin() -- Safe JWT check
);

-- ATTENDANCE
DROP POLICY IF EXISTS "Admins can manage store attendance" ON public.attendance;
CREATE POLICY "Admins can manage store attendance"
ON public.attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees target_emp
    WHERE target_emp.id = attendance.employee_id
    AND target_emp.store_id = public.get_my_store_id()
  )
  AND
  public.is_admin() -- Safe JWT check
);

-- TASKS
DROP POLICY IF EXISTS "Admins can manage store tasks" ON public.employee_tasks;
CREATE POLICY "Admins can manage store tasks"
ON public.employee_tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employees target_emp
    WHERE target_emp.id = employee_tasks.employee_id
    AND target_emp.store_id = public.get_my_store_id()
  )
  AND
  public.is_admin() -- Safe JWT check
);
