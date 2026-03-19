// Shared utilities — single source of truth
export const calculateETA = (busLat, busLng, destLat, destLng) => {
  if (!busLat || !busLng || !destLat || !destLng) return null;
  const R = 6371;
  const dLat = ((destLat - busLat) * Math.PI) / 180;
  const dLng = ((destLng - busLng) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((busLat * Math.PI) / 180) * Math.cos((destLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  const etaMin = Math.round((dist / 25) * 60);
  return { distance: dist.toFixed(1), eta: etaMin < 1 ? '< 1 min' : `${etaMin} min` };
};
