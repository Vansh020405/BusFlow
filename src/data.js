// Dummy bus data — used before Firebase is connected
export const DUMMY_BUSES = [
  { id: 'bus_1', number: 'KA-01-1234', route: 'Campus → Station', lat: 12.9716, lng: 77.5946, status: 'running', lastUpdated: Date.now() },
  { id: 'bus_2', number: 'KA-01-5678', route: 'Campus → Mall', lat: 12.9756, lng: 77.5906, status: 'running', lastUpdated: Date.now() },
  { id: 'bus_3', number: 'KA-01-9012', route: 'Hostel → Campus', lat: 12.9696, lng: 77.5986, status: 'parked', lastUpdated: Date.now() },
  { id: 'bus_4', number: 'KA-01-3456', route: 'Campus → Airport', lat: 12.9776, lng: 77.5866, status: 'offline', lastUpdated: Date.now() },
  { id: 'bus_5', number: 'KA-01-7890', route: 'Campus → City Center', lat: 12.9736, lng: 77.5926, status: 'running', lastUpdated: Date.now() },
  { id: 'bus_6', number: 'KA-01-2345', route: 'Library → Hostel', lat: 12.9686, lng: 77.6006, status: 'parked', lastUpdated: Date.now() },
  { id: 'bus_7', number: 'KA-01-6789', route: 'Campus → Bus Stand', lat: 12.9746, lng: 77.5876, status: 'running', lastUpdated: Date.now() },
  { id: 'bus_8', number: 'KA-01-0123', route: 'Gate 2 → Lab Block', lat: 12.9706, lng: 77.5956, status: 'offline', lastUpdated: Date.now() },
];

export const BUS_IDS = DUMMY_BUSES.map(b => b.id);

export function getStatusColor(status) {
  switch (status) {
    case 'running': return '#22c55e';
    case 'parked': return '#f59e0b';
    case 'offline': return '#ef4444';
    default: return '#71717a';
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case 'running': return 'Running';
    case 'parked': return 'Parked';
    case 'offline': return 'Offline';
    default: return 'Unknown';
  }
}

export function formatTime(timestamp) {
  if (!timestamp) return '—';
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function calculateETA(busLat, busLng, destLat = 12.9716, destLng = 77.5946) {
  // Simple haversine distance → rough ETA
  const R = 6371;
  const dLat = ((destLat - busLat) * Math.PI) / 180;
  const dLng = ((destLng - busLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((busLat * Math.PI) / 180) * Math.cos((destLat * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c; // in km
  const avgSpeed = 25; // km/h
  const etaMin = Math.round((dist / avgSpeed) * 60);
  return { distance: dist.toFixed(1), eta: etaMin < 1 ? '< 1 min' : `${etaMin} min` };
}
