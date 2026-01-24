-- Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  title text not null,
  message text not null,
  type text check (type in ('info', 'warning', 'success', 'error')) default 'info',
  read boolean default false,
  link text
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policy: Users can view their own notifications
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Policy: System/Admin can insert notifications (for now allow authenticated to create for testing)
create policy "Authenticated users can create notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');
