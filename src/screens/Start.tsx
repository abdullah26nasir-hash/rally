import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../store';
import { Button } from '../components/Button';
import { Wordmark } from '../components/Shell';
import { StampCard } from '../components/StampCard';
import { EARLY_CALL_TIERS, fmtMult } from '../game/scoring';
import { cn } from '../lib/cn';

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
        {step > 0 ? <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1.5 min-h-11 font-semibold text-graphite hover:text-ink"><ArrowLeft size={18} aria-hidden />Back</button> : <Wordmark />}
        <div className="flex gap-1.5" role="img" aria-label={`Step ${step + 1} of 3`}>{[0, 1, 2].map((i) => <span key={i} className={cn('h-1.5 w-8 rounded-full', i <= step ? 'bg-biro' : 'bg-rule')} />)}</div>
      </header>
      <main className="flex-1 max-w-[640px] w-full mx-auto px-5 pt-6 sm:pt-16 pb-10 flex flex-col">
        {step === 0 && (
          <form className="flex-1 flex flex-col anim-fade" onSubmit={(e) => { e.preventDefault(); if (valid) setStep(1); }}>
            <h1 className="display text-[48px] sm:text-[64px] leading-[0.9]">Every call you make gets your name on it.</h1>
            <p className="mt-3 text-[17px] text-ink/80">What should your receipts say?</p>
            <label className="mt-6 grid gap-1.5"><span className="text-[14px] font-medium">Scout name</span>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value.replace(/[^\w .-]/g, ''))} maxLength={20} placeholder="e.g. Abdullah" autoComplete="nickname" className="h-13 px-4 rounded-[12px] bg-card shadow-sm text-[18px] focus:outline-2 focus:outline-biro" /></label>
            <p className="mt-3 text-[14px] text-graphite">In the full game you'll sign in with Google, Apple or email so your list and leagues follow you to any device. This preview keeps everything on this device, no account needed.</p>
            <div className="mt-auto pt-8 sm:mt-10 sm:pt-0"><Button size="lg" className="w-full" type="submit" disabled={!valid}>Continue</Button></div>
          </form>
        )}
        {step === 1 && (
          <div className="flex-1 flex flex-col anim-fade">
            <h1 className="display text-[48px] sm:text-[64px] leading-[0.9]">The earlier you call it, the more it's worth.</h1>
            <p className="mt-3 text-[17px] text-ink/80">When you scout a player, we stamp how many scouts already had him. That sets your early call for the whole season.</p>
            <ul className="mt-6 bg-card rounded-[16px] shadow-md divide-y divide-rule">
              {EARLY_CALL_TIERS.map((t) => <li key={t.label} className="flex items-center justify-between px-5 py-3.5"><span>{t.label}</span><span className="display text-[28px]">{t.multiplier === 3 ? <span className="hl">{fmtMult(t.multiplier)}</span> : fmtMult(t.multiplier)}</span></li>)}
            </ul>
            <div className="mt-auto pt-8 sm:mt-10 sm:pt-0"><Button size="lg" className="w-full" onClick={() => setStep(2)}>Got it</Button></div>
          </div>
        )}
        {step === 2 && (
          <div className="flex-1 flex flex-col anim-fade">
            <h1 className="display text-[48px] sm:text-[64px] leading-[0.9]">Collect stamps. Climb the ladder.</h1>
            <p className="mt-3 text-[17px] text-ink/80">Spot a player before the crowd, see his debut, watch him get called up: each one is a stamp for your book, and XP towards your scout level. Sunday watcher to head of recruitment.</p>
            <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {(['first-call', 'under-radar', 'debut', 'called-it'] as const).map((k) => <StampCard key={k} kind={k} locked size="sm" />)}
            </div>
            <p className="mt-2 text-[14px] text-graphite">Your first stamp comes with your first call.</p>
            <div className="mt-auto pt-8 sm:mt-10 sm:pt-0"><Button size="lg" className="w-full" onClick={() => { startOwn(name); nav('/scout?first=1'); }}>Make my first call</Button></div>
          </div>
        )}
      </main>
    </div>
  );
}

export function Join() {
  const nav = useNavigate();
  const { mode, joinLeague } = useGame();
  const code = decodeURIComponent(location.pathname.split('/').pop() ?? '').toUpperCase();
  const [err, setErr] = useState('');
  const go = () => {
    if (mode === 'new') { useGame.getState().startSample(); }
    const l = joinLeague(code);
    if (l) nav(`/leagues/${l.id}`, { replace: true }); else setErr(`No league uses the code ${code}. Check the link with whoever sent it.`);
  };
  return (
    <div className="min-h-dvh grid place-items-center px-5">
      <div className="max-w-[420px] w-full text-center">
        <Wordmark />
        <h1 className="display text-[44px] mt-8 leading-[0.9]">You've been invited to a league</h1>
        <p className="mt-3 text-graphite">Code <span className="font-mono font-semibold text-ink">{code}</span>. One tap and you're in.</p>
        <Button size="lg" className="w-full mt-8" onClick={go}>Join league</Button>
        {err && <p role="alert" className="mt-4 text-stamp-deep">{err}</p>}
      </div>
    </div>
  );
}
