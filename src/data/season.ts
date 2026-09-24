// Preview season calendar. Real fixtures replace this when the live feed is wired in.
export const SEASON = '2026/27';
export const GW1_DATE = new Date('2026-08-15T11:00:00+01:00');
export const LAST_COMPLETE_GW = 6;
export const NEXT_GW = LAST_COMPLETE_GW + 1;

export function deadlineFor(gw: number): Date {
  return new Date(GW1_DATE.getTime() + (gw - 1) * 7 * 24 * 3600 * 1000);
}

export const TOTAL_SCOUTS = 18_420; // preview-season population used for ranks
