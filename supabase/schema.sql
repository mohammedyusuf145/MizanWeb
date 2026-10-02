-- ============================================================================
--  Proof — Supabase schema
--  Paste this whole file into: Supabase Dashboard → SQL Editor → New query → Run.
--  It is safe to run more than once (idempotent).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Shared trigger: updated_at with last-write-wins protection
-- ----------------------------------------------------------------------------
-- The app sends the time of the user's edit in updated_at (corrected for clock
-- drift). On UPDATE:
--   * a write older than the stored row loses (the update is skipped),
--   * a write with a sane timestamp keeps it,
--   * anything else gets now().
-- This is what makes offline edits replay safely after reconnecting.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.updated_at is not distinct from old.updated_at then
    new.updated_at := now();
  elsif new.updated_at < old.updated_at then
    return null;                                   -- stale write loses
  elsif new.updated_at > now() + interval '2 minutes' then
    new.updated_at := now();                       -- clock far in the future: clamp
  end if;
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. Tables
-- ----------------------------------------------------------------------------

-- profiles: id = auth.users.id
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  owner_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  display_name  text not null default '' check (char_length(display_name) <= 80),
  avatar_path   text,
  language      text not null default 'ar'  check (language in ('ar', 'en')),
  theme         text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  timezone      text not null default 'Asia/Bahrain',
  week_start    smallint not null default 0 check (week_start in (0, 1, 6)),  -- 0 Sun, 1 Mon, 6 Sat
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint profiles_owner_is_id check (owner_id = id)
);

create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 120),
  client       text not null default '' check (char_length(client) <= 120),
  type         text not null default 'other'
               check (type in ('poster', 'logo', 'social', 'branding', 'motion', 'ui', 'other')),
  description  text not null default '' check (char_length(description) <= 4000),
  cover_path   text,
  thumb_path   text,
  color        text not null default '#7C9CCB' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  priority     text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status       text not null default 'active'
               check (status in ('active', 'on_hold', 'completed', 'archived')),
  start_date   timestamptz,
  deadline     timestamptz,
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table if not exists public.stages (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  position    double precision not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.tasks (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects (id) on delete cascade,
  owner_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  stage_id        uuid references public.stages (id) on delete set null,
  title           text not null check (char_length(title) between 1 and 300),
  description     text not null default '' check (char_length(description) <= 8000),
  priority        text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  start_at        timestamptz,
  due_at          timestamptz,
  position        double precision not null default 0,
  completed_at    timestamptz,
  labels          text[] not null default '{}',
  auto_scheduled  boolean not null default false,   -- true when the due date was generated from the project dates
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create table if not exists public.subtasks (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks (id) on delete cascade,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 300),
  done        boolean not null default false,
  position    double precision not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.reminders (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  task_id       uuid references public.tasks (id) on delete cascade,
  project_id    uuid references public.projects (id) on delete cascade,
  fire_at       timestamptz not null,
  label         text not null default '' check (char_length(label) <= 300),   -- '@d7' style keys for automatic ones
  status        text not null default 'pending'
                check (status in ('pending', 'snoozed', 'done', 'dismissed')),
  auto          boolean not null default false,
  push_sent_at  timestamptz,                         -- set by the send-reminders Edge Function (Part B)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint    text not null,
  keys        jsonb not null,
  user_agent  text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (owner_id, endpoint)
);

-- ----------------------------------------------------------------------------
-- 3. Indexes
-- ----------------------------------------------------------------------------
create index if not exists projects_owner_idx        on public.projects (owner_id, deleted_at);
create index if not exists projects_deadline_idx     on public.projects (owner_id, deadline) where deleted_at is null;
create index if not exists stages_project_idx        on public.stages (project_id, position);
create index if not exists stages_owner_idx          on public.stages (owner_id);
create index if not exists tasks_project_idx         on public.tasks (project_id, stage_id, position);
create index if not exists tasks_owner_due_idx       on public.tasks (owner_id, due_at) where deleted_at is null;
create index if not exists subtasks_task_idx         on public.subtasks (task_id, position);
create index if not exists subtasks_owner_idx        on public.subtasks (owner_id);
create index if not exists reminders_owner_fire_idx  on public.reminders (owner_id, fire_at);
create index if not exists reminders_due_idx         on public.reminders (fire_at) where status in ('pending', 'snoozed');
create index if not exists reminders_task_idx        on public.reminders (task_id);
create index if not exists reminders_project_idx     on public.reminders (project_id);
create index if not exists push_subs_owner_idx       on public.push_subscriptions (owner_id);

-- ----------------------------------------------------------------------------
-- 4. updated_at triggers (every table)
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profiles','projects','stages','tasks','subtasks','reminders','push_subscriptions']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 5. New user → profile row
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, owner_id, display_name)
  values (
    new.id,
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'display_name',
                  new.raw_user_meta_data ->> 'full_name',
                  split_part(coalesce(new.email, ''), '@', 1)), 80)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Back-fill profiles for users who signed up before this script ran.
insert into public.profiles (id, owner_id, display_name)
select u.id, u.id, left(split_part(coalesce(u.email, ''), '@', 1), 80)
from auth.users u
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 6. Row Level Security — enabled on EVERY table
-- ----------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.projects           enable row level security;
alter table public.stages             enable row level security;
alter table public.tasks              enable row level security;
alter table public.subtasks           enable row level security;
alter table public.reminders          enable row level security;
alter table public.push_subscriptions enable row level security;

-- Tables that never need to be touched by anon.
revoke all on all tables in schema public from anon;

-- profiles: the row id IS the user id. Inserts come from the trigger above,
-- but a user may still insert their own row if it is missing.
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists profiles_delete on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid());
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = auth.uid() and owner_id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and owner_id = auth.uid());
create policy profiles_delete on public.profiles for delete to authenticated
  using (id = auth.uid());

-- projects
drop policy if exists projects_select on public.projects;
drop policy if exists projects_insert on public.projects;
drop policy if exists projects_update on public.projects;
drop policy if exists projects_delete on public.projects;
create policy projects_select on public.projects for select to authenticated
  using (owner_id = auth.uid());
create policy projects_insert on public.projects for insert to authenticated
  with check (owner_id = auth.uid());
create policy projects_update on public.projects for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy projects_delete on public.projects for delete to authenticated
  using (owner_id = auth.uid());

-- stages: must belong to one of the caller's projects
drop policy if exists stages_select on public.stages;
drop policy if exists stages_insert on public.stages;
drop policy if exists stages_update on public.stages;
drop policy if exists stages_delete on public.stages;
create policy stages_select on public.stages for select to authenticated
  using (owner_id = auth.uid());
create policy stages_insert on public.stages for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );
create policy stages_update on public.stages for update to authenticated
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );
create policy stages_delete on public.stages for delete to authenticated
  using (owner_id = auth.uid());

-- tasks: project (and stage, if any) must belong to the caller
drop policy if exists tasks_select on public.tasks;
drop policy if exists tasks_insert on public.tasks;
drop policy if exists tasks_update on public.tasks;
drop policy if exists tasks_delete on public.tasks;
create policy tasks_select on public.tasks for select to authenticated
  using (owner_id = auth.uid());
create policy tasks_insert on public.tasks for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
    and (stage_id is null
         or exists (select 1 from public.stages s where s.id = stage_id and s.owner_id = auth.uid()))
  );
create policy tasks_update on public.tasks for update to authenticated
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
    and (stage_id is null
         or exists (select 1 from public.stages s where s.id = stage_id and s.owner_id = auth.uid()))
  );
create policy tasks_delete on public.tasks for delete to authenticated
  using (owner_id = auth.uid());

-- subtasks
drop policy if exists subtasks_select on public.subtasks;
drop policy if exists subtasks_insert on public.subtasks;
drop policy if exists subtasks_update on public.subtasks;
drop policy if exists subtasks_delete on public.subtasks;
create policy subtasks_select on public.subtasks for select to authenticated
  using (owner_id = auth.uid());
create policy subtasks_insert on public.subtasks for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.tasks t where t.id = task_id and t.owner_id = auth.uid())
  );
create policy subtasks_update on public.subtasks for update to authenticated
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.tasks t where t.id = task_id and t.owner_id = auth.uid())
  );
create policy subtasks_delete on public.subtasks for delete to authenticated
  using (owner_id = auth.uid());

-- reminders
drop policy if exists reminders_select on public.reminders;
drop policy if exists reminders_insert on public.reminders;
drop policy if exists reminders_update on public.reminders;
drop policy if exists reminders_delete on public.reminders;
create policy reminders_select on public.reminders for select to authenticated
  using (owner_id = auth.uid());
create policy reminders_insert on public.reminders for insert to authenticated
  with check (
    owner_id = auth.uid()
    and (task_id is null or exists (select 1 from public.tasks t where t.id = task_id and t.owner_id = auth.uid()))
    and (project_id is null or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()))
  );
create policy reminders_update on public.reminders for update to authenticated
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and (task_id is null or exists (select 1 from public.tasks t where t.id = task_id and t.owner_id = auth.uid()))
    and (project_id is null or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()))
  );
create policy reminders_delete on public.reminders for delete to authenticated
  using (owner_id = auth.uid());

-- push_subscriptions
drop policy if exists push_subs_select on public.push_subscriptions;
drop policy if exists push_subs_insert on public.push_subscriptions;
drop policy if exists push_subs_update on public.push_subscriptions;
drop policy if exists push_subs_delete on public.push_subscriptions;
create policy push_subs_select on public.push_subscriptions for select to authenticated
  using (owner_id = auth.uid());
create policy push_subs_insert on public.push_subscriptions for insert to authenticated
  with check (owner_id = auth.uid());
create policy push_subs_update on public.push_subscriptions for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy push_subs_delete on public.push_subscriptions for delete to authenticated
  using (owner_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 7. Storage: private "covers" bucket, one folder per user
-- ----------------------------------------------------------------------------
-- Object paths look like  {user_id}/{project_id}/cover-123.jpg
--                         {user_id}/avatar-123.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('covers', 'covers', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists covers_select on storage.objects;
drop policy if exists covers_insert on storage.objects;
drop policy if exists covers_update on storage.objects;
drop policy if exists covers_delete on storage.objects;

create policy covers_select on storage.objects for select to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy covers_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy covers_update on storage.objects for update to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy covers_delete on storage.objects for delete to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);

-- ----------------------------------------------------------------------------
-- 8. Account deletion + 30-day purge
-- ----------------------------------------------------------------------------
-- The app removes the user's files through the Storage API first, then calls
-- this. Deleting the auth user cascades to every table above.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Permanently removes projects/tasks that have been in "Recently deleted" for
-- more than 30 days. Not callable from the client; schedule it (see bottom).
create or replace function public.purge_deleted_items()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.tasks    where deleted_at is not null and deleted_at < now() - interval '30 days';
  delete from public.projects where deleted_at is not null and deleted_at < now() - interval '30 days';
$$;
revoke all on function public.purge_deleted_items() from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 9. Realtime
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['projects','stages','tasks','subtasks','reminders','profiles']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then
      null;   -- already published
    end;
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 10. Safety check: fail loudly if any public table has RLS switched off
-- ----------------------------------------------------------------------------
do $$
declare bad text;
begin
  select string_agg(c.relname, ', ') into bad
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
  if bad is not null then
    raise exception 'RLS is disabled on: %', bad;
  end if;

  select string_agg(c.relname, ', ') into bad
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
    and not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname);
  if bad is not null then
    raise exception 'No policies on: %', bad;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 11. Optional: nightly purge (enable the pg_cron extension first:
--     Dashboard → Database → Extensions → pg_cron)
-- ----------------------------------------------------------------------------
-- select cron.schedule('proof-purge-deleted', '15 3 * * *', $$select public.purge_deleted_items()$$);
