import { useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0f0f17' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f17' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b80' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a1a28' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a28' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#252538' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e1e32' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a45' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a1a28' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d1a' }] },
];

const defaultCenter = { lat: 12.9716, lng: 77.5946 };

export default function BusMap({ selectedBus, height = '50vh' }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  const center = useMemo(() => {
    if (selectedBus && selectedBus.lat && selectedBus.lng) {
      return { lat: selectedBus.lat, lng: selectedBus.lng };
    }
    return defaultCenter;
  }, [selectedBus]);

  const options = useMemo(() => ({
    styles: darkMapStyles,
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  }), []);

  // Fallback map for when API key isn't set
  if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) {
    return (
      <div style={{ height }} className="relative w-full overflow-hidden bg-[#0f0f17]">
        {/* Animated grid background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />

        {/* Faux roads */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 right-0 h-[2px] bg-zinc-800/60" />
          <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-zinc-800/40" />
          <div className="absolute left-1/4 top-0 bottom-0 w-[2px] bg-zinc-800/60" />
          <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-zinc-800/40" />
          {/* Diagonal road */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute h-[1px] bg-zinc-800/30" style={{
              width: '141%', top: '20%', left: '-20%', transform: 'rotate(35deg)', transformOrigin: 'top left'
            }} />
          </div>
        </div>

        {/* Selected bus marker */}
        {selectedBus && selectedBus.status !== 'offline' && (
          <div className="absolute fade-in" style={{ top: '45%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="relative">
              {/* Pulsing ring */}
              <div className="absolute inset-0 w-12 h-12 -m-2 rounded-full bg-emerald-500/20 animate-ping" />
              {/* Bus icon */}
              <div className="relative w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                </svg>
              </div>
              {/* Label */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[10px] font-semibold text-emerald-400 bg-zinc-900/90 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {selectedBus.number}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* No bus selected state */}
        {!selectedBus && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <p className="text-zinc-500 text-xs font-medium">Select a bus to track</p>
            </div>
          </div>
        )}

        {/* Offline bus */}
        {selectedBus && selectedBus.status === 'offline' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <p className="text-zinc-400 text-sm font-medium">Bus not active</p>
              <p className="text-zinc-600 text-xs mt-1">This bus is currently offline</p>
            </div>
          </div>
        )}

        {/* Map label */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur px-2.5 py-1 rounded-full border border-zinc-800/50">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-dot" />
          <span className="text-[10px] text-zinc-500 font-medium">Demo Map</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ height }} className="w-full bg-[#0f0f17] flex items-center justify-center">
        <p className="text-red-400 text-sm">Failed to load map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ height }} className="w-full bg-[#0f0f17] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        options={options}
      >
        {selectedBus && selectedBus.status !== 'offline' && (
          <Marker
            position={{ lat: selectedBus.lat, lng: selectedBus.lng }}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="#22c55e" fill-opacity="0.2" stroke="#22c55e" stroke-width="2"/>
                  <circle cx="20" cy="20" r="8" fill="#22c55e"/>
                </svg>
              `)}`,
              scaledSize: { width: 40, height: 40 },
              anchor: { x: 20, y: 20 },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
