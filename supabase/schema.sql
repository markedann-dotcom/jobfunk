-- Run in Supabase SQL Editor. Anonymous users have no access to this table.
create table if not exists public.saved_jobs (
  user_id uuid not null references auth.users(id) on delete cascade,
  refnr text not null check (char_length(refnr) between 1 and 120),
  job jsonb not null,
  saved_at timestamptz not null default now(),
  primary key (user_id, refnr)
);

alter table public.saved_jobs enable row level security;

drop policy if exists "Read own jobs" on public.saved_jobs;
drop policy if exists "Insert own jobs" on public.saved_jobs;
drop policy if exists "Delete own jobs" on public.saved_jobs;
drop policy if exists "Update own jobs" on public.saved_jobs;

create policy "Read own jobs" on public.saved_jobs for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Insert own jobs" on public.saved_jobs for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Update own jobs" on public.saved_jobs for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Delete own jobs" on public.saved_jobs for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists saved_jobs_user_time_idx on public.saved_jobs(user_id, saved_at desc);
