-- Run this once in Supabase → SQL Editor → New query → Run.
-- It creates the tables, locks them so only the website's server can read or write,
-- and adds small functions for counters and stats.

create extension if not exists pgcrypto;

-- Stories ---------------------------------------------------------------
create table if not exists public.stories (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null check (char_length(title) between 3 and 140),
  category     text not null check (category in ('Healing','Provision','Marriage','Deliverance','Salvation')),
  city         text not null default '',
  paper        text not null default 'Ledger' check (paper in ('Ledger','Adire','Dawn','Plain')),
  author_name  text not null default 'Anonymous',
  language     text not null default 'English',
  struggle     text not null default '',
  prayer       text not null default '',
  turning      text not null default '',
  now          text not null default '',
  pull_quote   text,
  amen_count   integer not null default 0,
  status       text not null default 'pending' check (status in ('pending','published','rejected','withdrawn')),
  contact      text,              -- private: phone or email, only the team sees it
  consent      boolean not null default false,
  admin_note   text,              -- private notes from the review call
  created_at   timestamptz not null default now(),
  published_at timestamptz
);
create index if not exists stories_public_idx on public.stories (status, published_at desc);
create index if not exists stories_category_idx on public.stories (category) where status = 'published';

-- Prayer wall -----------------------------------------------------------
create table if not exists public.prayers (
  id         uuid primary key default gen_random_uuid(),
  body       text not null check (char_length(body) between 5 and 600),
  name       text not null default 'Someone',
  city       text,
  contact    text,                -- private
  pray_count integer not null default 0,
  status     text not null default 'pending' check (status in ('pending','published','answered','hidden')),
  created_at timestamptz not null default now()
);
create index if not exists prayers_public_idx on public.prayers (status, created_at desc);

-- Sunday email ----------------------------------------------------------
create table if not exists public.subscribers (
  email      text primary key check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

-- Lock everything down: no public access at all. The website's server uses the
-- service role key, which bypasses these rules; browsers never get a key.
alter table public.stories     enable row level security;
alter table public.prayers     enable row level security;
alter table public.subscribers enable row level security;
revoke all on public.stories, public.prayers, public.subscribers from anon, authenticated;

-- Counters --------------------------------------------------------------
create or replace function public.add_amen(story_id uuid) returns integer
language sql security definer set search_path = public as $$
  update stories set amen_count = amen_count + 1
  where id = story_id and status = 'published'
  returning amen_count;
$$;

create or replace function public.add_prayed(prayer_id uuid) returns integer
language sql security definer set search_path = public as $$
  update prayers set pray_count = pray_count + 1
  where id = prayer_id and status in ('published','answered')
  returning pray_count;
$$;

create or replace function public.category_counts()
returns table (category text, n bigint)
language sql stable security definer set search_path = public as $$
  select category, count(*) from stories where status = 'published' group by category;
$$;

create or replace function public.site_stats()
returns table (stories bigint, prayers bigint, answered bigint, cities bigint)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from stories where status = 'published'),
    (select coalesce(sum(pray_count),0) from prayers where status in ('published','answered')),
    (select count(*) from prayers where status = 'answered'),
    (select count(distinct lower(trim(city))) from stories where status = 'published' and city <> '');
$$;

revoke execute on function public.add_amen(uuid), public.add_prayed(uuid), public.category_counts(), public.site_stats() from anon, authenticated, public;
