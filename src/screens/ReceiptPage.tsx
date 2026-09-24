import { useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Share2, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useGame } from '../store';
import { playerById } from '../data/pool';
import { Receipt } from '../components/Receipt';
import { Button } from '../components/Button';

export function ReceiptPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const isNew = params.get('new') === '1';
  const nav = useNavigate();
  const { picks } = useGame();
  const pick = picks.find((p) => p.playerId === id);
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
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
      <div className="mt-6"><Receipt ref={ref} pick={pick} scoutName="you" animate={isNew} /></div>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" onClick={share} disabled={busy}><Share2 size={18} aria-hidden />Share receipt</Button>
        <Button size="lg" variant="secondary" onClick={save} disabled={busy}><Download size={18} aria-hidden />Save image</Button>
      </div>
      <p role="status" className="mt-3 min-h-6 text-center text-[14px] text-graphite">{msg}</p>
      {isNew && <div className="text-center"><Link to="/scout" className="inline-flex min-h-11 items-center font-semibold text-biro hover:underline underline-offset-4">Keep scouting</Link></div>}
    </div>
  );
}
