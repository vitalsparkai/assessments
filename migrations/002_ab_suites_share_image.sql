-- Per-suite social/link-preview image (Open Graph). Shown when a suite link
-- is texted or shared. Requires server-side injection to appear per-slug in
-- SMS/iMessage previews (crawlers don't run JS); see suite SSR notes.
alter table public.ab_suites add column if not exists share_image_url text default '';
