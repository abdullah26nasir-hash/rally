import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Share2, Download } from 'lucide-react';
import { toBlob } from 'html-to-image';
import { useGame } from '../store';
import { playerById } from '../data/source';
import { Receipt } from '../components/Receipt';
import { Button } from '../components/Button';
import { StampCard } from '../components/StampCard';
import { stampsFor, STAMP_INFO } from '../game/stamps';
import { track } from '../lib/analytics';

export function ReceiptPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const isNew = params.get('new') === '1';
  const nav = useNavigate();
  const { picks, history, name } = useGame();
  const handle = name.toLowerCase().replace(/\s+/g, '');
  // Swapped-out players keep their receipt: it's the proof.
  const pick = picks.find((p) => p.playerId === id) ?? [...history].reverse().find((p) => p.playerId === id);
  const ref = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState('');
  const [showPoints, setShowPoints] = useState(true);
  const [showEarly, setShowEarly] = useState(true);
  // navigator.share only works inside the tap that triggered it, and rendering the
  // image takes longer than browsers allow. So render it ahead of time and keep it fresh.
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => { if (pick) track('receipt_viewed', { player_id: id, just_scouted: isNew }); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!pick) return;
    let live = true;
    setFile(null);
    const t = setTimeout(async () => {
      const f = await renderReceipt(ref.current!, id).catch(() => null);
      if (live) setFile(f);
    }, isNew ? 1500 : 300);
    return () => { live = false; clearTimeout(t); };
  }, [pick, id, isNew, showPoints, showEarly]);
  if (!pick) return <div className="py-20 text-center"><h1 className="display text-[32px]">No receipt for this player</h1><p className="text-graphite mt-1">Receipts are made when you scout someone.</p><Link to="/scout" className="inline-flex mt-4 min-h-11 items-center text-flare-ink font-semibold">Go to Scout</Link></div>;
  const p = playerById.get(id)!;

  async function getFile() { return file ?? renderReceipt(ref.current!, id); }
  async function share() {
    setMsg('');
    track('receipt_shared', { player_id: id });
    try {
      const f = await getFile();
      if (navigator.canShare?.({ files: [f] })) await navigator.share({ files: [f], text: `I scouted ${p.name} first. Here's the receipt.` });
      else { download(f); setMsg("Your browser can't share images, so it's saved instead."); }
    } catch (e) { if ((e as Error).name !== 'AbortError') setMsg("Couldn't share the image. Try Save image instead."); }
  }
  async function save() {
    setMsg('');
    track('receipt_save_tapped', { player_id: id });
    try {
      const f = await getFile();
      // iOS Safari ignores <a download> in some contexts; the share sheet is
      // the reliable way to get an image into Photos there.
      if (navigator.canShare?.({ files: [f] })) {
        try { await navigator.share({ files: [f] }); setMsg('Use the share sheet to save the image.'); return; }
        catch (e) { if ((e as Error).name === 'AbortError') return; }
      }
      download(f); setMsg('Saved as a PNG.');
    } catch (e) {
      track('receipt_save_failed', { player_id: id, error: String(e).slice(0, 120) });
      setMsg("Couldn't save the image. Try again.");
    }
  }

  return (
    <div className="max-w-[560px] mx-auto">
      <button onClick={() => (history.length > 1 ? nav(-1) : nav('/list'))} className="inline-flex items-center gap-1 min-h-11 -ml-1 px-1 font-medium text-[15px] text-ink"><ChevronLeft size={20} aria-hidden />Your list</button>
      {isNew ? <h1 className="mt-2 text-center display text-[32px] anim-fade">{p.name.split(' ')[0]} is on your list.</h1> : <h1 className="sr-only">Receipt for {p.name}</h1>}
      <div className="mt-6"><Receipt ref={ref} pick={pick} scoutName={handle} animate={isNew} showPoints={showPoints} showEarly={showEarly} /></div>
      <fieldset className="mt-8 mx-auto max-w-[340px] grid gap-1">
        <legend className="text-[14px] font-semibold mb-1">On the shared image</legend>
        <Toggle label="Show your points from him" on={showPoints} set={setShowPoints} />
        <Toggle label="Show your early call" on={showEarly} set={setShowEarly} />
      </fieldset>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" onClick={share} disabled={!file}><Share2 size={18} aria-hidden />{file ? "Share receipt" : "Getting image ready…"}</Button>
        <Button size="lg" variant="secondary" onClick={save} disabled={!file}><Download size={18} aria-hidden />Save image</Button>
      </div>
      <p role="status" className="mt-3 min-h-6 text-center text-[14px] text-graphite">{msg}</p>
      {isNew && (() => { const earned = stampsFor([...picks, ...history]).filter((s) => s.player.id === id && s.earnedAt === pick.scoutedAt); return earned.length ? (
        <div className="mt-6 flex flex-col items-center text-center anim-stage-2">
          <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-graphite">Stamp{earned.length > 1 ? 's' : ''} earned</div>
          <div className="mt-3 flex gap-3">{earned.map((s) => <StampCard key={s.id} stamp={s} size="sm" />)}</div>
          <p className="mt-2 text-[14px] text-graphite">+{earned.reduce((a, s) => a + STAMP_INFO[s.kind].xp, 0)} XP towards your scout level</p>
        </div>) : null; })()}
      {isNew && <div className="text-center"><Link to="/scout" className="inline-flex min-h-11 items-center font-semibold text-flare-ink hover:underline underline-offset-4">Keep scouting</Link></div>}
    </div>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)} className="flex items-center justify-between gap-4 min-h-11 text-left">
      <span className="text-[15px]">{label}</span>
      <span className={'relative h-6 w-10 rounded-full transition-colors border ' + (on ? 'bg-ink border-ink' : 'bg-well border-pencil')}><span className="absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-paper border transition-transform" style={{ transform: on ? 'translateX(16px)' : 'translateX(0)', borderColor: on ? '#0B0B0A' : '#5C5B55', transitionTimingFunction: 'cubic-bezier(.23,1,.32,1)' }} /></span>
    </button>
  );
}

async function renderReceipt(node: HTMLElement, id: string): Promise<File> {
  const pad = 24;
  const base = {
    backgroundColor: '#F7F8F5',
    width: node.offsetWidth + pad * 2,
    height: node.offsetHeight + pad * 2,
    style: { margin: '0', padding: `${pad}px`, boxSizing: 'content-box' as const },
  };
  // Mobile browsers (esp. iOS Safari) can fail canvas renders at high pixel
  // ratios, so step down until one succeeds.
  let lastErr: unknown = null;
  for (const pixelRatio of [3, 2, 1.5]) {
    try {
      const opts = { ...base, pixelRatio };
      await toBlob(node, opts); // Safari drops fonts on the first pass
      const blob = await toBlob(node, opts);
      if (blob && blob.size > 10_000) return new File([blob], `rally-receipt-${id}.png`, { type: 'image/png' });
      lastErr = new Error(blob ? 'render too small' : 'render failed');
    } catch (e) { lastErr = e; }
  }
  track('receipt_render_failed', { player_id: id, error: String(lastErr).slice(0, 120) });
  throw lastErr;
}

function download(file: File) {
  const url = URL.createObjectURL(file);
  const a = Object.assign(document.createElement('a'), { href: url, download: file.name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
