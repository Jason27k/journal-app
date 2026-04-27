create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  frequency text not null default 'daily', -- daily | weekly
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  user_id uuid references auth.users not null,
  completed_date date not null,
  created_at timestamptz not null default now(),
  unique(habit_id, completed_date)
);

alter table habits enable row level security;
alter table habit_completions enable row level security;

create policy "owner" on habits for all using (auth.uid() = user_id);
create policy "owner" on habit_completions for all using (auth.uid() = user_id);

create index habit_completions_habit_idx on habit_completions(habit_id, completed_date desc);
