const UNIT_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
};

export function parseDurationToSeconds(value: string, fallback = 3600): number {
  const match = /^(\d+)([smhd])?$/i.exec(value.trim());
  if (!match) {
    return fallback;
  }

  const amount = Number(match[1]);
  const unit = (match[2] ?? 's').toLowerCase();
  return amount * (UNIT_SECONDS[unit] ?? 1);
}
