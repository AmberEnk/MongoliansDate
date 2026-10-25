/** Matches api/forum.ts EDIT_WINDOW_MINUTES. */
export const EDIT_WINDOW_MINUTES = 10;

export function isStillEditable(editableUntil: string | null | undefined): boolean {
  if (!editableUntil) return false;
  const t = new Date(editableUntil).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() < t;
}

export function minutesLeft(editableUntil: string | null | undefined): number {
  if (!editableUntil) return 0;
  const t = new Date(editableUntil).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.ceil((t - Date.now()) / 60_000));
}
