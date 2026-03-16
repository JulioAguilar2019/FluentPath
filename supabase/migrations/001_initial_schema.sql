set check_function_bodies = off;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  preferred_locale text not null default 'en' check (preferred_locale in ('en', 'es')),
  default_timer_mode text not null default 'free' check (default_timer_mode in ('free', 'pomodoro')),
  pomodoro_focus_minutes integer not null default 25 check (pomodoro_focus_minutes > 0),
  pomodoro_short_break_minutes integer not null default 5 check (pomodoro_short_break_minutes > 0),
  pomodoro_long_break_minutes integer not null default 15 check (pomodoro_long_break_minutes > 0),
  pomodoro_long_break_interval integer not null default 4 check (pomodoro_long_break_interval > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.task_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null,
  name_en text not null,
  name_es text not null,
  color text not null default '#4f46e5',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, slug)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid references public.task_categories (id) on delete set null,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  target_minutes integer not null default 25 check (target_minutes > 0),
  timer_mode_preference text check (timer_mode_preference in ('free', 'pomodoro')),
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  mode text not null check (mode in ('free', 'pomodoro')),
  status text not null default 'completed' check (status in ('completed', 'cancelled', 'abandoned')),
  started_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  focus_minutes integer check (focus_minutes is null or focus_minutes >= 0),
  break_minutes integer check (break_minutes is null or break_minutes >= 0),
  pomodoro_cycles integer not null default 0 check (pomodoro_cycles >= 0),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists task_categories_user_id_idx on public.task_categories (user_id, sort_order);
create index if not exists tasks_user_id_idx on public.tasks (user_id, status, created_at desc);
create index if not exists tasks_category_id_idx on public.tasks (category_id);
create index if not exists study_sessions_user_id_idx on public.study_sessions (user_id, started_at desc);
create index if not exists study_sessions_task_id_idx on public.study_sessions (task_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    preferred_locale,
    default_timer_mode
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.raw_user_meta_data->>'preferred_locale', 'en'),
    'free'
  )
  on conflict (id) do nothing;

  insert into public.task_categories (user_id, slug, name_en, name_es, color, sort_order)
  values
    (new.id, 'vocabulary', 'Vocabulary', 'Vocabulario', '#2563eb', 1),
    (new.id, 'grammar', 'Grammar', 'Gramatica', '#7c3aed', 2),
    (new.id, 'listening', 'Listening', 'Escucha', '#0f766e', 3),
    (new.id, 'speaking', 'Speaking', 'Habla', '#ea580c', 4),
    (new.id, 'reading', 'Reading', 'Lectura', '#ca8a04', 5),
    (new.id, 'writing', 'Writing', 'Escritura', '#db2777', 6)
  on conflict (user_id, slug) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_task_categories_updated_at on public.task_categories;
create trigger set_task_categories_updated_at
  before update on public.task_categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

drop trigger if exists set_study_sessions_updated_at on public.study_sessions;
create trigger set_study_sessions_updated_at
  before update on public.study_sessions
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.task_categories enable row level security;
alter table public.tasks enable row level security;
alter table public.study_sessions enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "task_categories_select_own" on public.task_categories;
create policy "task_categories_select_own"
  on public.task_categories
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "task_categories_insert_own" on public.task_categories;
create policy "task_categories_insert_own"
  on public.task_categories
  for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "task_categories_update_own" on public.task_categories;
create policy "task_categories_update_own"
  on public.task_categories
  for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "task_categories_delete_own" on public.task_categories;
create policy "task_categories_delete_own"
  on public.task_categories
  for delete
  using ((select auth.uid()) = user_id);

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
  on public.tasks
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
  on public.tasks
  for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
  on public.tasks
  for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
  on public.tasks
  for delete
  using ((select auth.uid()) = user_id);

drop policy if exists "study_sessions_select_own" on public.study_sessions;
create policy "study_sessions_select_own"
  on public.study_sessions
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "study_sessions_insert_own" on public.study_sessions;
create policy "study_sessions_insert_own"
  on public.study_sessions
  for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "study_sessions_update_own" on public.study_sessions;
create policy "study_sessions_update_own"
  on public.study_sessions
  for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "study_sessions_delete_own" on public.study_sessions;
create policy "study_sessions_delete_own"
  on public.study_sessions
  for delete
  using ((select auth.uid()) = user_id);
