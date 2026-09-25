import { useEffect, useState } from 'react';
import { consent, setConsent } from '../lib/analytics';

export function AnalyticsConsent() {
  const [choice, setChoice] = useState(consent);
  const [settings, setSettings] = useState(false);
  useEffect(() => { const sync = () => setChoice(consent()); window.addEventListener('rally-consent', sync); return () => window.removeEventListener('rally-consent', sync); }, []);
  return <>
    {(!choice || settings) && <section role="region" aria-label="Analytics choice" className="fixed z-50 bottom-20 left-4 right-4 sm:bottom-4 sm:left-auto sm:right-6 sm:w-[420px] bg-surface-1 border border-hairline shadow-lg rounded-[8px] px-5 py-4 pb-safe">
      <h2 className="font-semibold text-[18px]">Help us improve Rallycademy?</h2>
      <p className="mt-1 text-[14px] text-newsprint">With your OK, we measure page visits and game actions. We don't send league codes or scout names. You can change this choice any time.</p>
      <div className="mt-3 flex gap-2"><button className="min-h-11 px-4 rounded-[6px] bg-flare text-paper font-semibold" onClick={() => { setConsent('yes'); setSettings(false); }}>Allow analytics</button><button className="min-h-11 px-4 rounded-[6px] border border-hairline font-semibold" onClick={() => { setConsent('no'); setSettings(false); }}>No thanks</button></div>
    </section>}
    {choice && !settings && <button className="fixed z-40 bottom-20 sm:bottom-1 right-2 min-h-11 px-3 text-[12px] text-newsprint underline bg-ink/90 rounded-md" onClick={() => setSettings(true)}>Analytics settings</button>}
  </>;
}
