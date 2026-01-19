-- Force Admin Access for the First User (Owner)

-- Insert an employee record for the first user if it doesn't exist
INSERT INTO public.employees (user_id, role, full_name, email, status)
SELECT 
  id, 
  'admin', 
  COALESCE(raw_user_meta_data->>'full_name', 'System Admin'), 
  email,
  'active'
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (email) DO UPDATE SET role = 'admin'; -- If exists, ensure they are admin

-- Also update user_id if it was null (double safety)
UPDATE public.employees
SET user_id = (SELECT id FROM auth.users WHERE email = employees.email)
WHERE user_id IS NULL;
