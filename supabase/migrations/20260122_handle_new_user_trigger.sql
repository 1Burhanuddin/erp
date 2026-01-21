-- Trigger to handle New User Signups
-- 1. Checks if user was invited (exists in employees by email) -> Links Auth ID
-- 2. If valid new user -> Creates a new Store and assigns them as Admin

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_employee_id UUID;
  v_store_id UUID;
BEGIN
  -- 1. Check if an employee record already exists with this email (Invite Case)
  -- We assume emails are unique per employee for this lookup
  SELECT id, store_id INTO v_employee_id, v_store_id
  FROM public.employees
  WHERE email = NEW.email
  LIMIT 1;

  IF v_employee_id IS NOT NULL THEN
    -- Found exiting employee invite: Link their Auth ID
    UPDATE public.employees
    SET user_id = NEW.id
    WHERE id = v_employee_id;
  ELSE
    -- 2. No employee record: New Business Owner (Admin)
    
    -- Create a default store for them
    INSERT INTO public.stores (name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'My ERP') || '''s Store')
    RETURNING id INTO v_store_id;

    -- Create Employee (Admin) Record linked to the new store
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow clean re-creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
