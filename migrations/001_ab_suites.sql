-- White-label assessment suites: one row per client suite (multi-tenant by slug)
create table if not exists public.ab_suites (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null,
  name              text not null default 'Assessment Suite',
  intro             text default '',
  logo_url          text default '',
  primary_color     text default '#2563eb',
  accent_color      text default '#16a34a',
  webhook_url       text default '',
  webhook_headers   jsonb default '{"Content-Type":"application/json"}'::jsonb,
  redirect_url      text default '',
  assessment_ids    jsonb default '[]'::jsonb,   -- ordered list of ab_assessments.id
  folder_id         uuid,                         -- optional: the client folder it was built from
  require_team_code boolean default false,
  instance_id       text,
  owner_id          uuid default auth.uid(),
  tenant_id         uuid default my_tenant_id(),
  created_at        timestamptz default now()
);

-- Slugs are the public URL key (/s/{slug}); keep them globally unique, case-insensitive
create unique index if not exists ab_suites_slug_key on public.ab_suites (lower(slug));

alter table public.ab_suites enable row level security;

-- Builders manage suites within their own tenant (mirrors ab_assessments)
drop policy if exists "Builders manage their suites" on public.ab_suites;
create policy "Builders manage their suites" on public.ab_suites
  as permissive for all to public
  using (tenant_id = my_tenant_id())
  with check (tenant_id = my_tenant_id());

-- Public suite page reads config by slug with the anon key (mirrors "anon read assessments")
drop policy if exists "anon read suites" on public.ab_suites;
create policy "anon read suites" on public.ab_suites
  as permissive for select to anon
  using (true);
