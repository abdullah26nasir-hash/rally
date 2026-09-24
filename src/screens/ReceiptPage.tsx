import { useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Share2, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useGame } from '../store';
import { playerById } from '../data/pool';
import { Receipt } from '../components/Receipt';
import { Button } from '../components/Button';
import { StampCard } from '../components/StampCard';
import { stampsFor, STAMP_INFO } from '../game/stamps';

export function ReceiptPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const isNew = params.get('new') === '1';
  const nav = useNavigate();
  const { picks, name } = useGame();
  const handle = name.toLowerCase().replace(/\s+/g, '');
  const pick = picks.find((p) => p.playerId === id);
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [showPoints, setShowPoints] = useState(true);
  const [showEarly, setShowEarly] = useState(true);
  if (!pick) return <div className="py-20 text-center"><p className="display text-[32px]">No receipt for this player</p><p className="text-graphite mt-1">Receipts are made when you scout someone.</p><Link to="/scout" className="inline-flex mt-4 min-h-11 items-center text-biro font-semibold">Go to Scout</Link></div>;
  const p = playerById.get(id)!;

  async function image() {
    const node = ref.current!;
    return toPng(node, { pixelRatio: 3, backgroundColor: '#F7F8F5', style: { padding: '24px' } });
  }
  async function share() {
    setBusy(true); setMsg('');
    try {
      const url = await image();
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], `rally-receipt-${p.name.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: `I scouted ${p.name} first. Here's the receipt.` });
      else { download(url); setMsg('Saved as an image. Share it wherever you like.'); }
    } catch (e) { if ((e as Error).name !== 'AbortError') setMsg("Couldn't make the image. Try again, or screenshot the receipt."); }
    setBusy(false);
  }
  async function save() { setBusy(true); try { download(await image()); setMsg('Saved.'); } catch { setMsg("Couldn't save the image. Try again."); } setBusy(false); }
  function download(url: string) { const a = document.createElement('a'); a.href = url; a.download = `rally-receipt-${p.id}.png`; a.click(); }

  return (
    <div className="max-w-[560px] mx-auto">
      <button onClick={() => (history.length > 1 ? nav(-1) : nav('/list'))} className="inline-flex items-center gap-1.5 min-h-11 -ml-1 px-1 font-semibold text-graphite hover:text-ink"><ArrowLeft size={18} aria-hidden />Back</button>
      {isNew && <p className="mt-2 text-center display text-[32px] anim-fade">{p.name.split(' ')[0]} is on your list.</p>}
      <div className="mt-6"><Receipt ref={ref} pick={pick} scoutName={handle} animate={isNew} showPoints={showPoints} showEarly={showEarly} /></div>
      <fieldset className="mt-8 mx-auto max-w-[340px] grid gap-1">
        <legend className="text-[14px] font-semibold mb-1">On the shared image</legend>
        <Toggle label="Show your points from him" on={showPoints} set={setShowPoints} />
        <Toggle label="Show your early call" on={showEarly} set={setShowEarly} />
      </fieldset>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" onClick={share} disabled={busy}><Share2 size={18} aria-hidden />Share receipt</Button>
        <Button size="lg" variant="secondary" onClick={save} disabled={busy}><Download size={18} aria-hidden />Save image</Button>
      </div>
      <p role="status" className="mt-3 min-h-6 text-center text-[14px] text-graphite">{msg}</p>
      {isNew && (() => { const earned = stampsFor(picks).filter((s) => s.player.id === id && s.earnedAt === pick.scoutedAt); return earned.length ? (
        <div className="mt-6 flex flex-col items-center text-center anim-stage-2">
          <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-graphite">Stamp{earned.length > 1 ? 's' : ''} earned</div>
          <div className="mt-3 flex gap-3">{earned.map((s) => <StampCard key={s.id} stamp={s} size="sm" />)}</div>
          <p className="mt-2 text-[14px] text-graphite">+{earned.reduce((a, s) => a + STAMP_INFO[s.kind].xp, 0)} XP towards your scout level</p>
        </div>) : null; })()}
      {isNew && <div className="text-center"><Link to="/scout" className="inline-flex min-h-11 items-center font-semibold text-biro hover:underline underline-offset-4">Keep scouting</Link></div>}
    </div>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)} className="flex items-center justify-between gap-4 min-h-11 text-left">
      <span className="text-[15px]">{label}</span>
      <span className={'relative h-7 w-12 rounded-full transition-colors ' + (on ? 'bg-biro' : 'bg-ink/20')}><span className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform" style={{ transform: on ? 'translateX(24px)' : 'translateX(4px)', transitionTimingFunction: 'cubic-bezier(.23,1,.32,1)' }} /></span>
    </button>
  );
}
