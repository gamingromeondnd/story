-- Story app Supabase schema
-- Run this in the Supabase SQL editor after creating the project.
--
-- Important:
-- Admin reads and mutations are expected to run through server routes using
-- SUPABASE_SERVICE_ROLE_KEY. Browser clients should only read public content/settings
-- and access their own profile row.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text not null default '',
    plan_type text not null default 'guest',
    access_locked boolean not null default true,
    access_expires_at timestamptz,
    background_play_enabled boolean not null default false,
    screen_off_playback_enabled boolean not null default false,
    all_topics_unlocked boolean not null default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
add column if not exists access_locked boolean not null default true;

alter table public.profiles
alter column access_locked set default true;

alter table public.profiles
add column if not exists access_expires_at timestamptz;

-- Missing expiry now means "locked until admin unlocks".
-- If you need to preserve older unlocked users after introducing expiry tracking,
-- backfill `access_expires_at` manually before relying on the app logic.

-- To use realtime lock/unlock updates in the app, enable realtime for:
-- public.profiles
-- public.content
-- public.settings
-- Supabase Dashboard -> Database -> Replication

create table if not exists public.content (
    id uuid primary key default gen_random_uuid(),
    topic_name text not null default '',
    title text not null default '',
    image_url text not null default '',
    audio_url text not null default '',
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.settings (
    id text primary key,
    paypal_email text not null default '',
    updated_at timestamptz not null default timezone('utc', now())
);

-- Supabase Auth saves password hashes in auth.users.
-- Keep plaintext passwords out of public tables.
create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email)
    values (new.id, coalesce(new.email, ''))
    on conflict (id) do update
    set email = excluded.email;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.sync_profile_from_auth();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email on auth.users
for each row
execute function public.sync_profile_from_auth();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
before update on public.settings
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.content enable row level security;
alter table public.settings enable row level security;

drop policy if exists "profiles_public_read" on public.profiles;
drop policy if exists "profiles_public_write" on public.profiles;
drop policy if exists "profiles_self_read" on public.profiles;
drop policy if exists "profiles_self_insert" on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_read"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_self_insert"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_self_update"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "content_public_read" on public.content;
create policy "content_public_read"
on public.content
for select
using (true);

drop policy if exists "content_public_write" on public.content;

drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read"
on public.settings
for select
using (true);

drop policy if exists "settings_public_write" on public.settings;
