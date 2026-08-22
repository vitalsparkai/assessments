// ─────────────────────────────────────────────────────────────────────────
// Suite SSR — serves /s/{slug} (and /suite/{slug}) with per-suite link-preview
// tags injected into the HTML <head>, so texting/social bots (which do NOT run
// JavaScript) show each client's own Open Graph image, title, and description.
//
// nginx proxies the suite routes here; if this process is down, nginx falls
// back to serving the static suite.html. Everything else stays on nginx.
// No dependencies — Node 18+ (built-in fetch).
// ─────────────────────────────────────────────────────────────────────────
const http = require('http');
const fs   = require('fs');

const PORT        = Number(process.env.SUITE_SSR_PORT || 8787);
const SUPA_URL    = process.env.SUPABASE_URL || 'https://owouiukkteoentgpbrlk.supabase.co';
const SUPA_KEY    = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93b3VpdWtrdGVvZW50Z3BicmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NjQxNzcsImV4cCI6MjA5NTM0MDE3N30.NOPj0iARb1bExfBv2t8KvFktLTisp2OPE95dM_C7TJw';
const SUITE_HTML  = process.env.SUITE_HTML || '/usr/share/nginx/html/suite.html';
// Fallback preview image for suites that have no share image or logo set.
// Swap for a proper 1200×630 card when you have one (or set DEFAULT_SHARE_IMAGE).
const DEFAULT_SHARE_IMAGE = process.env.DEFAULT_SHARE_IMAGE || 'https://vitalspark.ai/wp-content/uploads/2024/03/vitalspark-ss.png';

const BASE = fs.readFileSync(SUITE_HTML, 'utf8');

function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function slugFrom(url){ const m = String(url||'').match(/^\/s(?:uite)?\/([^/?#]+)/i); return m ? decodeURIComponent(m[1]) : ''; }

function inject(html, suite){
  const img   = esc(suite.share_image_url || suite.logo_url || DEFAULT_SHARE_IMAGE);
  const title = esc(suite.name || 'Assessment Suite');
  const desc  = esc(suite.intro || '');
  // Replacement FUNCTIONS so a '$' in any value can't be treated as a
  // special replacement pattern.
  const sub = (re, val) => { html = html.replace(re, (m, p1, p2) => p1 + val + p2); };
  sub(/(<title>)[^<]*(<\/title>)/,                            title);
  sub(/(<meta property="og:title" content=")[^"]*(">)/,        title);
  sub(/(<meta property="og:description" content=")[^"]*(">)/,  desc);
  sub(/(<meta property="og:image" content=")[^"]*(">)/,        img);
  sub(/(<meta name="twitter:title" content=")[^"]*(">)/,       title);
  sub(/(<meta name="twitter:description" content=")[^"]*(">)/, desc);
  sub(/(<meta name="twitter:image" content=")[^"]*(">)/,       img);
  return html;
}

async function fetchSuite(slug){
  const url = `${SUPA_URL}/rest/v1/ab_suites?select=name,intro,logo_url,share_image_url&slug=eq.${encodeURIComponent(slug.toLowerCase())}&limit=1`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2500);
  try {
    const r = await fetch(url, { headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY }, signal: ctrl.signal });
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch { return null; } finally { clearTimeout(t); }
}

const server = http.createServer(async (req, res) => {
  let html = BASE;
  try {
    const slug = slugFrom(req.url);
    if (slug) {
      const suite = await fetchSuite(slug);
      if (suite) html = inject(BASE, suite);
    }
  } catch { /* fall back to base HTML */ }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
  res.end(html);
});

// Only start listening when run directly (so tests can require this module).
if (require.main === module) {
  server.listen(PORT, '127.0.0.1', () => console.log(`suite SSR listening on 127.0.0.1:${PORT}`));
}

module.exports = { inject, slugFrom, esc, server };
