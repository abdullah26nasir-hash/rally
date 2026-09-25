import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../store';
import { Button } from '../components/Button';
import { Wordmark } from '../components/Shell';
import { StampCard } from '../components/StampCard';
import { EARLY_CALL_TIERS, fmtMult } from '../game/scoring';
import { cn } from '../lib/cn';
import { joinSharedLeague, localLeague } from '../lib/leagues';
import { track } from '../lib/analytics';

/** First-run journey: who you are, how it works, then straight into your first call. */
export function Start() {
  const nav = useNavigate();
  const startOwn = useGame((s) => s.startOwn);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const valid = name.trim().length >= 2;

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="max-w-[640px] w-full mx-auto flex items-center justify-between px-5 h-16">
        {step > 0 ? <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1.5 min-h-11 font-semibold text-newsprint hover:text-paper"><ArrowLeft size={18} aria-hidden />Back</button> : <Wordmark />}
        <div className="flex gap-1.5" role="img" aria-label={`Step ${step + 1} of 3`}>{[0, 1, 2].map((i) => <span key={i} className={cn('h-1.5 w-8 rounded-full', i <= step ? 'bg-flare' : 'bg-surface-3')} />)}</div>
      </header>
      <main className="flex-1 max-w-[640px] w-full mx-auto px-5 pt-6 sm:pt-16 pb-10 flex flex-col">
        {step === 0 && (
          <form className="flex-1 flex flex-col anim-fade" onSubmit={(e) => { e.preventDefault(); if (valid) setStep(1); }}>
            <h1 className="display text-[48px] sm:text-[64px] leading-[0.9]">Every call you make gets your name on it.</h1>
            <p className="mt-3 text-[17px] text-newsprint">What should your receipts say?</p>
            <label className="mt-6 grid gap-1.5"><span className="text-[14px] font-medium">Scout name</span>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value.replace(/[^\w .-]/g, ''))} maxLength={20} placeholder="e.g. Abdullah" autoComplete="nickname" className="h-13 px-4 rounded-[8px] bg-surface-1 shadow-sm text-[18px] focus:outline-2 focus:outline-flare" /></label>
            <p className="mt-3 text-[14px] text-newsprint">No account needed in this preview. Your list stays on this device; shared leagues let mates join with a code from their own phones.</p>
            <div className="mt-auto pt-8 sm:mt-10 sm:pt-0"><Button size="lg" className="w-full" type="submit" disabled={!valid}>Continue</Button></div>
          </form>
        )}
        {step === 1 && (
          <div className="flex-1 flex flex-col anim-fade">
            <h1 className="display text-[48px] sm:text-[64px] leading-[0.9]">The earlier you call it, the more it's worth.</h1>
            <p className="mt-3 text-[17px] text-newsprint">When you scout a player, we stamp how many scouts already had him. That sets your early call for the whole season.</p>
            <ul className="mt-6 bg-surface-1 rounded-[8px] shadow-md divide-y divide-rule">
              {EARLY_CALL_TIERS.map((t) => <li key={t.label} className="flex items-center justify-between px-5 py-3.5"><span>{t.label}</span><span className="display text-[28px]">{t.multiplier === 3 ? <span className="hl">{fmtMult(t.multiplier)}</span> : fmtMult(t.multiplier)}</span></li>)}
            </ul>
            <div className="mt-auto pt-8 sm:mt-10 sm:pt-0"><Button size="lg" className="w-full" onClick={() => setStep(2)}>Got it</Button></div>
          </div>
        )}
        {step === 2 && (
          <div className="flex-1 flex flex-col anim-fade">
            <h1 className="display text-[48px] sm:text-[64px] leading-[0.9]">Collect stamps. Climb the ladder.</h1>
            <p className="mt-3 text-[17px] text-newsprint">Spot a player before the crowd, see his debut, watch him get called up: each one is a stamp for your book, and XP towards your scout level. Sunday watcher to head of recruitment.</p>
            <div tabIndex={0} role="region" aria-label="Stamps you can earn" className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {(['first-call', 'under-radar', 'debut', 'called-it'] as const).map((k) => <StampCard key={k} kind={k} locked size="sm" />)}
            </div>
            <p className="mt-2 text-[14px] text-newsprint">Your first stamp comes with your first call.</p>
            <div className="mt-auto pt-8 sm:mt-10 sm:pt-0"><Button size="lg" className="w-full" onClick={() => { startOwn(name); nav('/scout?first=1'); }}>Make my first call</Button></div>
          </div>
        )}
      </main>
    </div>
  );
}

export function Join() {
  const nav = useNavigate();
  const { mode, joinLeague, saveSharedLeague } = useGame();
  const [scoutName, setScoutName] = useState('');
  const raw = (location.pathname.split('/').pop() ?? '').toUpperCase();
  const code = /^[A-Z0-9]{4,8}$/.test(raw) ? raw : '';
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    if (busy || !code) return; setBusy(true); setErr('');
    try {
      if (mode === 'new') { if (scoutName.trim().length < 2) { setErr('Enter a scout name to join.'); return; } useGame.getState().startOwn(scoutName); }
      const state = useGame.getState();
      if (code === 'LADS26') { const demo = joinLeague(code); if (demo) { nav(`/leagues/${demo.id}`, { replace: true }); return; } }
      const { league } = await joinSharedLeague(code, state.name, state.picks, state.history);
      const l = localLeague(league); saveSharedLeague(l); track('league_joined'); nav(`/leagues/${l.id}`, { replace: true });
    } catch (x) { setErr(x instanceof Error ? x.message : 'Could not join league.'); } finally { setBusy(false); }
  };
  return (
    <div className="min-h-dvh grid place-items-center px-5">
      <div className="max-w-[420px] w-full text-center">
        <Wordmark />
        <h1 className="display text-[44px] mt-8 leading-[0.9]">You've been invited to a league</h1>
        <p className="mt-3 text-newsprint">{code ? <>Code <span className="font-mono font-semibold text-paper">{code}</span>. One tap and you're in.</> : "This invite link looks broken. Ask whoever sent it for the league code."}</p>
        {mode === 'new' && <label className="mt-5 grid gap-1 text-left text-[14px] font-medium">Scout name<input value={scoutName} onChange={(e) => setScoutName(e.target.value.replace(/[^\w .-]/g, ''))} maxLength={20} placeholder="e.g. Sam" className="h-12 px-3 rounded-[6px] bg-surface-1 border border-hairline text-[16px]" /></label>}
        <p className="mt-3 text-[14px] text-newsprint">Your league starts with an empty list. Scout your five after joining.</p>
        <Button size="lg" className="w-full mt-8" onClick={go} disabled={!code || busy || (mode === 'new' && scoutName.trim().length < 2)}>{busy ? 'Joining...' : 'Join league'}</Button>
        {err && <p role="alert" className="mt-4 text-flare">{err}</p>}
      </div>
    </div>
  );
}
