-- Run this in your Supabase SQL editor

create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  amount numeric(10, 2) not null check (amount > 0),
  date date not null,
  note text,
  category text not null,
  recurring_group_id uuid,
  created_at timestamptz default now()
);

-- If the table already exists, add the column with:
-- alter table expenses add column if not exists recurring_group_id uuid;

-- Index for fast monthly queries
create index if not exists expenses_date_idx on expenses (date);

-- Enable Row Level Security (allows public read/write since there's no auth)
alter table expenses enable row level security;

create policy "Allow all operations for everyone"
  on expenses
  for all
  using (true)
  with check (true);
