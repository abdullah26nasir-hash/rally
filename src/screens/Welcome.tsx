import { useNavigate } from 'react-router-dom';
import { useGame } from '../store';
import { Button } from '../components/Button';
import { Receipt } from '../components/Receipt';
import { Eyebrow } from '../components/bits';
import { Wordmark } from '../components/Shell';
import { sampleList } from '../data/scouts';
import { EARLY_CALL_TIERS, fmtMult } from '../game/scoring';
import { PLAYERS, playerById, ownershipNow } from '../data/pool';

export function Welcome() {
  const nav = useNavigate();
  const { startOwn, startSample } = useGame();
  const heroPick = sampleList().reduce((best, pk) => (ownershipNow(playerById.get(pk.playerId)!) / pk.ownershipAtPick > ownershipNow(playerById.get(best.playerId)!) / best.ownershipAtPick ? pk : best));

  return (
    <div className="min-h-dvh">
      <header className="max-w-[1180px] mx-auto flex items-center justify-between px-5 sm:px-8 h-16">
        <Wordmark />
        <button onClick={() => nav('/how')} className="text-[15px] font-medium text-graphite hover:text-ink min-h-11 px-2">How scoring works</button>
      </header>

      <section className="max-w-[1180px] mx-auto px-5 sm:px-8 pt-6 sm:pt-12 pb-16 grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-8 items-center">
        <div>
          <Eyebrow className="mb-5">Free scouting game · U21 football</Eyebrow>
          <h1 className="display text-[64px] sm:text-[88px] lg:text-[112px] leading-[0.86]">
            Call them<br />before they<br /><span className="hl">blow up.</span>
          </h1>
          <p className="mt-6 text-[18px] sm:text-[20px] max-w-[34ch] text-ink/80">
            Pick five young footballers. Score from what they do on the pitch. When one breaks out, you've got the timestamped receipt.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={() => { startOwn(); nav('/scout'); }}>Pick my five</Button>
            <Button size="lg" variant="secondary" onClick={() => { startSample(); nav('/'); }}>Try a sample season</Button>
          </div>
          <p className="mt-4 text-[14px] text-graphite">No sign-up. No money, ever. Takes about five minutes a week.</p>
        </div>
        <div className="lg:pl-6">
          <Receipt pick={heroPick} scoutName="you" animate />
          <p className="mt-5 text-center text-[13px] text-graphite font-mono">Straight from the sample season</p>
        </div>
      </section>

      <section className="bg-card border-y border-rule">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 lg:py-20">
          <h2 className="display text-[40px] sm:text-[52px] max-w-[18ch]">One list. One swap a week. Your name on the call.</h2>
          <ol className="mt-10 grid md:grid-cols-3 gap-8 md:gap-10">
            {[
              ['Scout five', `Choose five U21 players from a pool of ${PLAYERS.length} across three divisions. One per club, so you have to know more than one team.`],
              ['Score every week', 'Minutes, goals, assists and clean sheets earn points. Big moments do too: a senior debut or a first call-up is worth 5.'],
              ['Keep the receipt', 'Every pick is stamped with the time you made it and how many scouts had him then. When he breaks out, share the proof.'],
            ].map(([t, d], i) => (
              <li key={t} className="border-t-2 border-ink pt-4">
                <div className="font-mono text-[13px] text-graphite">Step {i + 1}</div>
                <h3 className="display text-[30px] mt-1">{t}</h3>
                <p className="mt-2 text-ink/80">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="display text-[40px] sm:text-[52px]">The earlier you call it, the more it's worth.</h2>
          <p className="mt-4 text-[18px] text-ink/80 max-w-[42ch]">Your early-call multiplier is locked the moment you scout a player, based on how many scouts had him. Pick him at 0.8% and every point he scores counts triple for you, all season.</p>
        </div>
        <div className="bg-card rounded-[16px] shadow-md overflow-hidden">
          <table className="w-full text-left">
            <caption className="sr-only">Early call multipliers</caption>
            <thead><tr className="border-b border-rule text-[13px] font-mono text-graphite"><th className="font-normal px-5 py-3">When you scouted him</th><th className="font-normal px-5 py-3 text-right">His points count</th></tr></thead>
            <tbody>
              {EARLY_CALL_TIERS.map((t) => (
                <tr key={t.label} className="border-b last:border-0 border-rule">
                  <td className="px-5 py-4">{t.label}</td>
                  <td className="px-5 py-4 text-right display text-[30px] num">{t.multiplier === 3 ? <span className="hl">{fmtMult(t.multiplier)}</span> : fmtMult(t.multiplier)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="max-w-[1180px] mx-auto px-5 sm:px-8 pb-12 text-[14px] text-graphite border-t border-rule pt-6 flex flex-col sm:flex-row gap-2 justify-between">
        <span>Preview season: every player, club and result here is fictional.</span>
        <span>Rally is a free game. There is nothing to buy.</span>
      </footer>
    </div>
  );
}
