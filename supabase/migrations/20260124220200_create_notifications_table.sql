-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);

-- (Optional) Policy for system to insert notifications? 
-- Usually inserts happen via Postgres Triggers or Edge Functions with service_role key. 
-- For client-side testing, if authorized users need to create notifications:
CREATE POLICY "Users can insert their own notifications" 
    ON public.notifications FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
