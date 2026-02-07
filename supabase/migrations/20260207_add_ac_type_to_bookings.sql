-- Add ac_type column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS ac_type TEXT; -- 'Split', 'Window', 'Cassette', 'Tower', etc.
