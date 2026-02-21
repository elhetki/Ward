-- Ward (وَرْد) — Quran Habit App
-- Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Goals
create table goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  target_date date not null,
  daily_pages integer not null,
  sessions_per_day integer not null default 2,
  session_times text[] not null default array['07:00', '21:00'],
  created_at timestamptz default now()
);

-- Reading progress
create table reading_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade unique,
  current_page integer not null default 1,
  current_surah integer not null default 1,
  current_ayah integer not null default 1,
  total_pages_read integer not null default 0,
  last_read_at timestamptz default now()
);

-- Daily sessions
create table daily_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  date date not null default current_date,
  session_number integer not null default 1,
  target_pages integer not null,
  pages_read integer not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  unique(user_id, date, session_number)
);

-- Streaks
create table streaks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade unique,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_completed_date date,
  freeze_available boolean not null default true,
  freeze_used_at date
);

-- Bookmarks
create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  surah_number integer not null,
  ayah_number integer not null,
  page_number integer not null,
  created_at timestamptz default now(),
  unique(user_id, surah_number, ayah_number)
);

-- RLS Policies
alter table profiles enable row level security;
alter table goals enable row level security;
alter table reading_progress enable row level security;
alter table daily_sessions enable row level security;
alter table streaks enable row level security;
alter table bookmarks enable row level security;

-- Users can only access their own data
create policy "users_own_profile" on profiles for all using (auth.uid() = id);
create policy "users_own_goals" on goals for all using (auth.uid() = user_id);
create policy "users_own_progress" on reading_progress for all using (auth.uid() = user_id);
create policy "users_own_sessions" on daily_sessions for all using (auth.uid() = user_id);
create policy "users_own_streaks" on streaks for all using (auth.uid() = user_id);
create policy "users_own_bookmarks" on bookmarks for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
