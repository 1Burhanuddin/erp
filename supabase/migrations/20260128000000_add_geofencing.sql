-- Add Geo-Fencing support to Stores
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS geofence_radius INTEGER DEFAULT 10; -- meters

-- Comment on columns
COMMENT ON COLUMN public.stores.latitude IS 'Store latitude for geo-fencing';
COMMENT ON COLUMN public.stores.longitude IS 'Store longitude for geo-fencing';
COMMENT ON COLUMN public.stores.geofence_radius IS 'Allowed radius in meters for check-in';
