import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLanding, type LandingPayload } from '../lib/feedback';
import { fmtDate } from '../lib/format';

// design.md landing slice: read-only window on the board. Renders nothing below threshold or on fetch failure.
export function FeedbackLanding() {
  const [data, setData] = useState<LandingPayload | null>(null);
  useEffect(() => { getLanding().then(setData); }, []);
  if (!data) return null;
  const rows = data.rows.slice(0, 3);
  if (rows.length < 3) return null;
  if (rows.reduce((a, r) => a + r.votes, 0) < 20) return null;
  const chip = (s: string) => s === 'under_review' ? 'Under review' : s === 'planned' ? 'Planned' : s === 'shipped' ? 'Shipped' : '';
  return (
    <section className="border-t border-ink" aria-label="What players are asking for">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-24 lg:py-32">
        <h2 className="display text-[40px] sm:text-[52px] max-w-[22ch]">{data.totalVotes.toLocaleString('en-GB')} votes cast on what we build next.</h2>
        <div className="mt-10 max-w-[640px] bg-paper rounded-lg border border-card-edge overflow-hidden">
          <ul className="divide-y divide-hairline">
            {rows.map((r) => (
              <li key={r.id} className="relative">
                <Link to={`/feedback/${r.id}`}
                  className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 min-h-16 transition-all duration-140 hover:bg-ink/[0.04] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ink">
                  <span className="min-w-0">
                    <span className="block font-semibold text-[17px] text-ink line-clamp-2">{r.title}</span>
                    <span className="mt-2 inline-flex items-center gap-3">
                      {chip(r.status) && <span className="rounded-[5px] bg-well px-2 py-0.5 text-[12px] font-medium text-graphite">{chip(r.status)}</span>}
                      {r.status === 'shipped' && <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-pencil">{fmtDate(r.createdAt).toUpperCase()}</span>}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-[20px] font-semibold text-ink num">{r.votes}</span>
                    <span className="block font-mono text-[12px] uppercase tracking-[0.08em] text-pencil">votes</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/feedback" className="mt-4 inline-flex min-h-11 items-center text-ink underline underline-offset-4">See all {data.openCount} requests</Link>
      </div>
    </section>
  );
}
