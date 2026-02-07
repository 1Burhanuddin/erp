
-- Enable RLS on bookings if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can manage their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anon Insert Bookings" ON public.bookings;
-- Drop policies that we are about to create to ensure idempotency
DROP POLICY IF EXISTS "Staff can view store bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can update store bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can delete store bookings" ON public.bookings;

-- 1. Public can CREATE bookings (for the external form)
CREATE POLICY "Public can create bookings" ON public.bookings
    FOR INSERT
    WITH CHECK (true);

-- 2. Staff can VIEW bookings belonging to their store
-- Relies on auth.uid() mapping to an employee record with a store_id
CREATE POLICY "Staff can view store bookings" ON public.bookings
    FOR SELECT
    USING (
        store_id IN (
            SELECT store_id FROM employees WHERE user_id = auth.uid()
        )
        OR 
        auth.role() = 'service_role'
    );

-- 3. Staff can UPDATE bookings belonging to their store
CREATE POLICY "Staff can update store bookings" ON public.bookings
    FOR UPDATE
    USING (
        store_id IN (
            SELECT store_id FROM employees WHERE user_id = auth.uid()
        )
    );

-- 4. Staff can DELETE bookings belonging to their store
CREATE POLICY "Staff can delete store bookings" ON public.bookings
    FOR DELETE
    USING (
        store_id IN (
            SELECT store_id FROM employees WHERE user_id = auth.uid()
        )
    );
