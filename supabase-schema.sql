-- Items table
create table public.items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('link', 'email', 'command', 'note')),
  title text not null,
  content text default '',
  tags text[] default '{}',
  reminder_at timestamptz,
  reminder_sent boolean default false,
  is_done boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.items enable row level security;

create policy "Users manage own items"
  on public.items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger items_updated_at
  before update on public.items
  for each row execute procedure public.handle_updated_at();

create index items_user_id_idx on public.items(user_id);
create index items_reminder_idx on public.items(reminder_at) where reminder_at is not null and reminder_sent = false;
