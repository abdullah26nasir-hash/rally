// PostHog product analytics. Off unless VITE_POSTHOG_KEY is set at build time,
// so local runs and tests send nothing. Loaded lazily to keep it off the first paint.
type Props = Record<string, string | number | boolean | undefined>;
type PH = { capture: (e: string, p?: Props) => void };

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com';

let ph: PH | null = null;
const queue: [string, Props?][] = [];
let loading = false;

function load() {
  if (loading || !KEY) return;
  loading = true;
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(KEY, {
      api_host: HOST,
      persistence: 'localStorage',
      person_profiles: 'identified_only',
      capture_pageview: false, // sent on route change below
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: true,
      disable_surveys: true,
      disable_external_dependency_loading: true, // no third-party scripts, so the CSP stays tight
      respect_dnt: true,
      before_send: scrub,
    });
    posthog.register({ app: 'rally' });
    ph = posthog;
    queue.splice(0).forEach(([e, p]) => posthog.capture(e, p));
  }).catch(() => { /* blocked by an ad blocker: carry on without analytics */ });
}

export function track(event: string, props?: Props) {
  if (!KEY) return;
  if (ph) ph.capture(event, props);
  else { queue.push([event, props]); load(); }
}

export function pageview() { track('$pageview'); }

// League codes act like passwords, so they never leave the device: not in URLs,
// not in clicked-button text, not anywhere in an event.
function leagueCodes(): string[] {
  const codes = new Set<string>();
  const m = location.pathname.match(/^\/join\/([^/?#]+)/);
  if (m) codes.add(decodeURIComponent(m[1]));
  try {
    const saved = JSON.parse(localStorage.getItem('rally-v1') || '{}');
    for (const l of saved?.state?.leagues ?? []) if (typeof l?.code === 'string') codes.add(l.code);
  } catch { /* nothing saved */ }
  return [...codes].filter((c) => /^[A-Za-z0-9]{4,12}$/.test(c));
}
function scrub<T>(event: T): T {
  if (!event) return event;
  let s = JSON.stringify(event).replace(/\/join\/[A-Za-z0-9%]+/gi, '/join/:code');
  for (const c of leagueCodes()) s = s.split(c).join('[code]');
  return JSON.parse(s);
}
