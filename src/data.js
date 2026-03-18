// Dummy bus data
export const DUMMY_BUSES = [
  { id: 'bus_1', number: 'KA-01-1234', route: 'Campus → Station', lat: 12.9716, lng: 77.5946, status: 'running', driver: 'Rahul S.', contact: '+91 98765-43210' },
  { id: 'bus_2', number: 'KA-01-5678', route: 'Campus → Mall', lat: 12.9756, lng: 77.5906, status: 'running', driver: 'Amit K.', contact: '+91 87654-32109' },
  { id: 'bus_3', number: 'KA-01-9012', route: 'Hostel → Campus', lat: 12.9696, lng: 77.5986, status: 'parked', driver: 'Sandeep V.', contact: '+91 76543-21098' },
  { id: 'bus_4', number: 'KA-01-3456', route: 'Campus → Airport', lat: 12.9776, lng: 77.5866, status: 'offline', driver: 'Vikram J.', contact: '+91 65432-10987' },
];

export const STOP_COORDS = {
  gate_1: { label: 'Gate 1', lat: 12.9730, lng: 77.5930 },
  hostel: { label: 'Hostel', lat: 12.9700, lng: 77.5990 },
  library: { label: 'Library', lat: 12.9740, lng: 77.5910 },
  block_a: { label: 'Block A', lat: 12.9710, lng: 77.5950 },
};

export const PARKING_ZONES = [
  { id: 'zone_a', label: 'Block A Parking', lat: 12.9710, lng: 77.5950, radius: 0.0005 },
  { id: 'zone_b', label: 'Parking Lot 1', lat: 12.9690, lng: 77.5980, radius: 0.0005 },
  { id: 'zone_c', label: 'Gate Area', lat: 12.9725, lng: 77.5935, radius: 0.0005 },
];

export const STOP_BUS_MAPPING = {
  gate_1: 'bus_1',
  hostel: 'bus_2',
  library: 'bus_3',
  block_a: 'bus_4',
};

export const BUS_IDS = DUMMY_BUSES.map(b => b.id);

export function getStatusColor(status) {
  switch (status) {
    case 'running': return '#22c55e';
    case 'parked': return '#d4a017';
    case 'offline': return '#6b7280';
    default: return '#3f3f46';
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
