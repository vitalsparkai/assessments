/**
 * VitalSpark Assessment Embed Script
 * Serve this from the same domain as player.html
 *
 * USAGE — Option A: Data attributes (zero config)
 * ──────────────────────────────────────────────────────
 * <div data-vs-assessment="YOUR_ASSESSMENT_ID"
 *      data-vs-redirect="https://yoursite.com/thank-you"
 *      data-vs-height="auto">   ← auto | fixed px value
 * </div>
 * <script src="https://player.yourdomain.com/embed.js" async></script>
 *
 *
 * USAGE — Option B: JavaScript API
 * ──────────────────────────────────────────────────────
 * <script src="https://player.yourdomain.com/embed.js"></script>
 * <script>
 *   VitalSpark.embed({
 *     container:    '#my-div',            // CSS selector or element
 *     assessmentId: 'abc123',
 *     redirect:     'https://...',         // optional: redirect on completion
 *     height:       'auto',               // 'auto' or fixed px e.g. '700px'
 *     onComplete:   (data) => { ... },    // optional callback
 *     onReady:      () => { ... },        // optional callback when iframe loads
 *   });
 * </script>
 *
 *
 * WORDPRESS SHORTCODE — if you build a small WP plugin:
 * ──────────────────────────────────────────────────────
 * [vitalspark id="abc123" redirect="https://..."]
 *
 * The plugin outputs:
 * <div data-vs-assessment="abc123" data-vs-redirect="https://..."></div>
 * <script src="https://player.yourdomain.com/embed.js" async></script>
 */

(function (global) {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────────
  // This URL is replaced at deploy time. It must match where
  // player.html is served from.
  var PLAYER_BASE = (typeof __PLAYER_BASE__ !== 'undefined' ? __PLAYER_BASE__ : '')
    || 'https://player.yourdomain.com'; // fallback — update this

  // ── INTERNAL ────────────────────────────────────────────────────
  var instances = {};

  function createIframe(container, assessmentId, redirect, opts) {
    var params = new URLSearchParams({ embed: '1' });
    if (redirect) params.set('redirect', redirect);

    var iframe = document.createElement('iframe');
    iframe.src         = PLAYER_BASE + '/a/' + assessmentId + '?' + params.toString();
    iframe.title       = 'Assessment';
    iframe.allow       = 'clipboard-write';
    iframe.setAttribute('scrolling', 'no');
    iframe.style.cssText = [
      'width:100%',
      'border:none',
      'display:block',
      opts.height === 'auto' ? 'min-height:500px' : 'height:' + (opts.height || '650px'),
      'transition:height 0.2s ease',
    ].join(';');

    // Track this instance
    instances[assessmentId] = instances[assessmentId] || [];
    instances[assessmentId].push({ iframe: iframe, opts: opts });

    iframe.addEventListener('load', function () {
      if (typeof opts.onReady === 'function') opts.onReady(iframe);
    });

    container.style.overflow = 'hidden';
    container.innerHTML = '';
    container.appendChild(iframe);
    return iframe;
  }

  // ── postMessage listener ────────────────────────────────────────
  window.addEventListener('message', function (e) {
    // Only accept messages from our player origin
    if (PLAYER_BASE && e.origin !== new URL(PLAYER_BASE).origin) return;

    var data = e.data;
    if (!data || typeof data !== 'object') return;

    // Resize event → update iframe height
    if (data.type === 'vs:resize' && data.assessmentId && data.height) {
      var items = instances[data.assessmentId] || [];
      items.forEach(function (item) {
        if (item.opts.height === 'auto') {
          item.iframe.style.height = (data.height + 32) + 'px'; // +32 buffer
        }
      });
    }

    // Complete event → redirect or callback
    if (data.type === 'vs:complete' && data.assessmentId) {
      var items = instances[data.assessmentId] || [];
      items.forEach(function (item) {
        if (typeof item.opts.onComplete === 'function') {
          item.opts.onComplete({ assessmentId: data.assessmentId });
        }
        if (data.redirect) {
          setTimeout(function () { window.location.href = data.redirect; }, 300);
        }
      });
    }
  });

  // ── PUBLIC API ──────────────────────────────────────────────────
  var VS = {
    /**
     * Programmatic embed
     * @param {Object} opts - { container, assessmentId, redirect, height, onComplete, onReady }
     */
    embed: function (opts) {
      var container = typeof opts.container === 'string'
        ? document.querySelector(opts.container)
        : opts.container;
      if (!container) { console.error('[VitalSpark] Container not found:', opts.container); return; }
      if (!opts.assessmentId) { console.error('[VitalSpark] assessmentId is required'); return; }
      return createIframe(container, opts.assessmentId, opts.redirect || '', opts);
    },

    /**
     * Get embed code snippet for copy-pasting into WordPress or any HTML
     * @param {string} assessmentId
     * @param {Object} opts - { redirect, height }
     * @returns {string} HTML snippet
     */
    embedCode: function (assessmentId, opts) {
      opts = opts || {};
      var attrs = ['data-vs-assessment="' + assessmentId + '"'];
      if (opts.redirect) attrs.push('data-vs-redirect="' + opts.redirect + '"');
      if (opts.height)   attrs.push('data-vs-height="'   + opts.height   + '"');
      return [
        '<div ' + attrs.join('\n     ') + '></div>',
        '<script src="' + PLAYER_BASE + '/embed.js" async><\/script>',
      ].join('\n');
    },

    /**
     * iFrame-only embed code (no JS required — simpler but no auto-resize)
     */
    iframeCode: function (assessmentId, opts) {
      opts = opts || {};
      var params = new URLSearchParams({ embed: '1' });
      if (opts.redirect) params.set('redirect', opts.redirect);
      var src = PLAYER_BASE + '/a/' + assessmentId + '?' + params.toString();
      var height = opts.height || '700';
      return '<iframe\n  src="' + src + '"\n  width="100%"\n  height="' + height + '"\n  style="border:none;display:block"\n  title="Assessment"\n  allow="clipboard-write">\n</iframe>';
    },
  };

  // ── AUTO-INIT data-vs-assessment elements ───────────────────────
  function initDataAttrs() {
    document.querySelectorAll('[data-vs-assessment]:not([data-vs-init])').forEach(function (el) {
      el.setAttribute('data-vs-init', '1');
      var id       = el.getAttribute('data-vs-assessment');
      var redirect = el.getAttribute('data-vs-redirect') || '';
      var height   = el.getAttribute('data-vs-height') || 'auto';
      if (!id) return;
      createIframe(el, id, redirect, { height: height });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDataAttrs);
  } else {
    initDataAttrs();
  }

  // Expose globally
  global.VitalSpark = VS;

})(typeof window !== 'undefined' ? window : this);
