import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card } from './bits';
import { getBoard } from '../lib/feedback';

// design.md board spec: Ticket panel row in How, 56px min height, title + data Pencil open count + chevron
export function FeedbackRow() {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => { getBoard('all', 'top').then((d) => setOpen(d.openCount)).catch(() => setOpen(null)); }, []);
  return (
    <Card>
      <Link to="/feedback" className="flex min-h-14 items-center gap-3 px-5 sm:px-6 py-3 hover:bg-ink/[0.04] transition-colors">
        <span className="font-semibold text-[16px] text-ink">Feedback board</span>
        {open !== null && <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-pencil">{open} open</span>}
        <ChevronRight size={20} className="ml-auto text-ink" aria-hidden />
      </Link>
    </Card>
  );
}
