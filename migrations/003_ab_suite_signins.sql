-- Records when someone signs into a suite (enters identity on the gate), so the
-- builder can count "in progress" people who haven't submitted an assessment yet.
create table if not exists public.ab_suite_signins (
  id          uuid primary key default gen_random_uuid(),
  suite_slug  text not null,
  email       text not null,
  first_name  text,
  last_name   text,
  team_code   text,
  instance_id text,
  tenant_id   uuid,
  created_at  timestamptz default now()
);
create index if not exists ab_suite_signins_slug_idx on public.ab_suite_signins (suite_slug);

alter table public.ab_suite_signins enable row level security;

-- Public suite page records sign-ins with the anon key
drop policy if exists "anon insert signins" on public.ab_suite_signins;
create policy "anon insert signins" on public.ab_suite_signins
  for insert to anon with check (true);

-- Builders read their own tenant's sign-ins (mirrors other ab_ tables)
drop policy if exists "Builders read their signins" on public.ab_suite_signins;
create policy "Builders read their signins" on public.ab_suite_signins
  for select to public using (tenant_id = my_tenant_id());
