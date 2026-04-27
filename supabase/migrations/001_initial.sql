-- Entries
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  content text not null default '',
  template text,
  pinned boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector
);

-- Tags
create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

-- Entry <> Tags
create table entry_tags (
  entry_id uuid references entries(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (entry_id, tag_id)
);

-- Goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text not null default 'active', -- active | completed | abandoned
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Entry <> Goals
create table goal_entries (
  goal_id uuid references goals(id) on delete cascade,
  entry_id uuid references entries(id) on delete cascade,
  primary key (goal_id, entry_id)
);

-- Hobbies
create table hobbies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  started_at date not null default current_date,
  ended_at date,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Entry <> Hobbies
create table entry_hobbies (
  hobby_id uuid references hobbies(id) on delete cascade,
  entry_id uuid references entries(id) on delete cascade,
  primary key (hobby_id, entry_id)
);

-- Full-text search: auto-update search_vector on insert/update
create function entries_search_vector_update() returns trigger as $$
begin
  new.search_vector = to_tsvector('english', coalesce(new.content, ''));
  return new;
end;
$$ language plpgsql;

create trigger entries_search_vector_trigger
  before insert or update on entries
  for each row execute function entries_search_vector_update();

-- Indexes
create index entries_search_idx on entries using gin(search_vector);
create index entries_user_created_idx on entries(user_id, created_at desc) where deleted_at is null;

-- updated_at triggers
create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger entries_updated_at before update on entries
  for each row execute function set_updated_at();
create trigger goals_updated_at before update on goals
  for each row execute function set_updated_at();
create trigger hobbies_updated_at before update on hobbies
  for each row execute function set_updated_at();

-- Row Level Security
alter table entries enable row level security;
alter table tags enable row level security;
alter table entry_tags enable row level security;
alter table goals enable row level security;
alter table goal_entries enable row level security;
alter table hobbies enable row level security;
alter table entry_hobbies enable row level security;

create policy "owner" on entries for all using (auth.uid() = user_id);
create policy "owner" on tags for all using (auth.uid() = user_id);
create policy "owner" on entry_tags for all using (
  exists (select 1 from entries where id = entry_id and user_id = auth.uid())
);
create policy "owner" on goals for all using (auth.uid() = user_id);
create policy "owner" on goal_entries for all using (
  exists (select 1 from entries where id = entry_id and user_id = auth.uid())
);
create policy "owner" on hobbies for all using (auth.uid() = user_id);
create policy "owner" on entry_hobbies for all using (
  exists (select 1 from entries where id = entry_id and user_id = auth.uid())
);
