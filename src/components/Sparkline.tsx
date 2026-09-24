export function Sparkline({ values, width = 64, height = 22, label }: { values: number[]; width?: number; height?: number; label: string }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pts = values.map((v, i) => [ (i / (values.length - 1)) * (width - 4) + 2, height - 2 - ((v - min) / (max - min || 1)) * (height - 4) ]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="shrink-0">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill="currentColor" />
    </svg>
  );
}
