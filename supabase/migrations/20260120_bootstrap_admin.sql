-- Bootstrapping logic to ensure the main user is an Admin

DO $$
DECLARE
  v_user_id UUID;
  v_store_id UUID;
  v_email TEXT;
BEGIN
  -- 1. identifying the main user (Admin)
  -- In local dev, usually the first user. Or we can match by email if known.
  -- We'll just take the most recently created user or the first one.
  SELECT id, email INTO v_user_id, v_email FROM auth.users ORDER BY created_at ASC LIMIT 1;

  -- 2. Identify the store (First store found)
  SELECT id INTO v_store_id FROM public.stores LIMIT 1;

  -- 3. Insert/Update the employee record
  IF v_user_id IS NOT NULL THEN
    
    -- If no store exists yet, we can't link it, but we can still make them admin (store_id is nullable? checking schemas...)
    -- Ideally we want a store. If not, we might create one or leave null.
    
    INSERT INTO public.employees (id, role, full_name, status, store_id)
    VALUES (
        v_user_id, 
        'admin', 
        COALESCE(v_email, 'System Admin'), 
        'active', 
        v_store_id
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
        role = 'admin',
        status = 'active', 
        store_id = COALESCE(public.employees.store_id, excluded.store_id);

    RAISE NOTICE 'Bootstrapped User % as Admin', v_email;
  ELSE
    RAISE NOTICE 'No users found in auth.users to bootstrap.';
  END IF;

END $$;
