
-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Contacts table
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  birthdate date,
  email text,
  phone text,
  street1 text,
  street2 text,
  city text,
  state_province text,
  postal_code text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_user_id_idx on public.contacts(user_id);

alter table public.contacts enable row level security;

create policy "contacts_select_own" on public.contacts for select using (auth.uid() = user_id);
create policy "contacts_insert_own" on public.contacts for insert with check (auth.uid() = user_id);
create policy "contacts_update_own" on public.contacts for update using (auth.uid() = user_id);
create policy "contacts_delete_own" on public.contacts for delete using (auth.uid() = user_id);

-- User settings (buggy mode)
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  buggy_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.user_settings for update using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger contacts_set_updated_at before update on public.contacts
  for each row execute function public.tg_set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();
create trigger settings_set_updated_at before update on public.user_settings
  for each row execute function public.tg_set_updated_at();
