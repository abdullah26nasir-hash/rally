// Optional analytics: never load the SDK or send events before explicit consent.
type Props = Record<string, string | number | boolean | undefined>;
type PH = { capture: (e: string, p?: Props) => void; register: (p: Props) => void; opt_out_capturing: () => void };
const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com';
const CONSENT = 'rally-analytics-consent';
let ph: PH | null = null;
let loading = false;
const queue: [string, Props?][] = [];
export function consent(): 'yes' | 'no' | null {
  try { const v = localStorage.getItem(CONSENT); return v === 'yes' || v === 'no' ? v : null; } catch { return null; }
}
export function setConsent(value: 'yes' | 'no') {
  try { localStorage.setItem(CONSENT, value); } catch { return; /* no storage means no durable consent: keep analytics off */ }
  if (value === 'yes') { load(); pageview(); }
  else { queue.length = 0; if (ph) { ph.opt_out_capturing(); ph = null; } try { for (const k of Object.keys(localStorage)) if (k.startsWith('ph_') || k.startsWith('posthog_')) localStorage.removeItem(k); } catch { /* unavailable */ } if (loading) location.reload(); }
  window.dispatchEvent(new Event('rally-consent'));
}
function load() {
  if (loading || !KEY || consent() !== 'yes') return;
  loading = true;
  import('posthog-js').then(({ default: posthog }) => {
    // A changed decision before the import resolved must not start analytics.
    if (consent() !== 'yes') { loading = false; queue.length = 0; return; }
    posthog.init(KEY, {
      api_host: HOST,
      persistence: 'localStorage',
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: false, // explicit events only; do not capture names, league fields or links
      disable_session_recording: true,
      disable_surveys: true,
      disable_external_dependency_loading: true,
      respect_dnt: true,
      before_send: scrub,
    });
    posthog.register({ app: 'rally' });
    ph = posthog;
    queue.splice(0).forEach(([e, p]) => posthog.capture(e, p));
  }).catch(() => { loading = false; queue.length = 0; });
}
export function track(event: string, props?: Props) {
  if (!KEY || consent() !== 'yes') return;
  if (ph) ph.capture(event, props);
  else { queue.push([event, props]); load(); }
}
export function pageview() { track('$pageview'); }
function leagueCodes(): string[] {
  const codes = new Set<string>();
  const m = location.pathname.match(/^\/join\/([^/?#]+)/);
  if (m) { try { codes.add(decodeURIComponent(m[1])); } catch { /* bad URL */ } }
  try { const saved = JSON.parse(localStorage.getItem('rally-v1') || '{}'); for (const l of saved?.state?.leagues ?? []) if (typeof l?.code === 'string') codes.add(l.code); } catch { /* nothing saved */ }
  return [...codes].filter((c) => /^[A-Za-z0-9]{4,12}$/.test(c));
}
function scrub<T>(event: T): T {
  if (!event) return event;
  let s = JSON.stringify(event).replace(/\/join\/[A-Za-z0-9%]+/gi, '/join/:code');
  for (const c of leagueCodes()) s = s.split(c).join('[code]');
  return JSON.parse(s);
}
