import { Link } from 'react-router-dom';
import { EARLY_CALL_TIERS, RULES, fmtMult } from '../game/scoring';
import { PageTitle, Card } from '../components/bits';

export function How() {
  const rows: Array<[string, string]> = [
    ['Plays under 60 minutes', `${RULES.appearance.under60} pt`], ['Plays 60 minutes or more', `${RULES.appearance.over60} pts`],
    ['Goal - goalkeeper or defender', `${RULES.goal.DEF} pts`], ['Goal - midfielder', `${RULES.goal.MID} pts`], ['Goal - forward', `${RULES.goal.FWD} pts`],
    ['Assist', `${RULES.assist} pts`], ['Clean sheet - goalkeeper or defender (60+ mins)', `${RULES.cleanSheet.DEF} pts`], ['Clean sheet - midfielder (60+ mins)', `${RULES.cleanSheet.MID} pt`],
    ['Big moment: senior debut, first call-up, first senior goal', `${RULES.moment} pts`],
  ];
  return (
    <div className="max-w-[760px]">
      <Link to="/" className="inline-flex min-h-11 items-center font-semibold text-graphite hover:text-ink">← Rally</Link>
      <PageTitle eyebrow="Rules" title="How scoring works">Rally takes about five minutes a week. Here's everything that counts.</PageTitle>
      <div className="grid gap-6">
        <Card className="p-5 sm:p-6"><h2 className="display text-[28px]">Your list</h2><ul className="mt-3 grid gap-2 list-disc pl-5 text-ink/85"><li>Five under-21 players, one per club.</li><li>Change freely until your first deadline. After that you get one swap a week.</li><li>A player scores for you from the first gameweek after you scout him.</li></ul></Card>
        <Card className="overflow-hidden"><h2 className="display text-[28px] px-5 sm:px-6 pt-5">Points</h2>
          <table className="w-full mt-2"><caption className="sr-only">Points table</caption><tbody>{rows.map(([k, v]) => <tr key={k} className="border-t border-rule"><td className="px-5 sm:px-6 py-3">{k}</td><td className="px-5 sm:px-6 py-3 text-right font-mono font-semibold whitespace-nowrap">{v}</td></tr>)}</tbody></table></Card>
        <Card className="overflow-hidden"><h2 className="display text-[28px] px-5 sm:px-6 pt-5">Early call</h2><p className="px-5 sm:px-6 mt-1 text-ink/80">Locked the moment you scout a player, based on the share of scouts who had him. It multiplies every point he scores for you. Swap him out and it's gone.</p>
          <table className="w-full mt-3"><caption className="sr-only">Early call multipliers</caption><tbody>{EARLY_CALL_TIERS.map((t) => <tr key={t.label} className="border-t border-rule"><td className="px-5 sm:px-6 py-3">{t.label}</td><td className="px-5 sm:px-6 py-3 text-right display text-[26px]">{fmtMult(t.multiplier)}</td></tr>)}</tbody></table></Card>
        <p className="text-[14px] text-graphite">Preview season: players, clubs, results and scout numbers are fictional and simulated. Rally is free. There is nothing to buy and no prizes with cash value.</p>
      </div>
    </div>
  );
}
