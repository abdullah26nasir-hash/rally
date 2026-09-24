const tz = 'Europe/London';
export const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: tz });
export const fmtStamp = (d: Date | string) => {
  const x = new Date(d);
  const day = x.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: tz }).replace(/,/g, '');
  const time = x.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz });
  return { day: day.toUpperCase(), time };
};
export const fmtDeadline = (d: Date) => d.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: tz });
export const ordinal = (n: number) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n.toLocaleString('en-GB') + (s[(v - 20) % 10] || s[v] || s[0]); };
