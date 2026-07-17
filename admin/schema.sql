-- CREATE BOOKINGS TABLE
create table bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  plan_name text not null,
  vehicle_type text not null,
  addons text[],
  grand_total integer not null,
  selected_date text,
  selected_time text,
  emirate text not null,
  address text not null,
  status text default 'pending'
);

-- SET UP ROW LEVEL SECURITY (RLS)
-- 1. Enable RLS
alter table bookings enable row level security;

-- 2. Allow anonymous users to INSERT bookings (from the public website)
create policy "Allow anonymous inserts"
  on bookings for insert
  with check (true);

-- 3. Allow authenticated users to SELECT bookings (admin panel)
create policy "Allow authenticated select"
  on bookings for select
  using (auth.role() = 'authenticated');

-- 4. Allow authenticated users to UPDATE bookings (admin panel status changes)
create policy "Allow authenticated update"
  on bookings for update
  using (auth.role() = 'authenticated');

-- OPTIONAL: Set up Realtime
-- This tells Supabase to broadcast changes to this table
alter publication supabase_realtime add table bookings;
