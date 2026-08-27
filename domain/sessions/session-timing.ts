export function elapsedSeconds(startTime: number, currentTime: number) {
  return Math.max(0, Math.floor((currentTime - startTime) / 1000));
}

export function isValidSessionTime(start: number, end: number, currentTime: number) {
  return Number.isFinite(start) && Number.isFinite(end) && end > start && end <= currentTime;
}

export function isCatchWithinSession(caughtAt: number, start: number, end: number) {
  return caughtAt >= start && caughtAt <= end;
}
