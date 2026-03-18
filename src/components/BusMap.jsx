import { useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#050505' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#050505' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#444455' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#121212' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#161616' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#222222' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#11111a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a12' }] },
];

const defaultCenter = { lat: 12.9716, lng: 77.5946 };

export default function BusMap({ selectedBus, selectedStop, height = '50vh' }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  const center = useMemo(() => {
    if (selectedBus && selectedBus.lat && selectedBus.lng) {
      if (selectedStop) {
         // Midpoint between bus and stop
         return { 
           lat: (selectedBus.lat + selectedStop.lat) / 2, 
           lng: (selectedBus.lng + selectedStop.lng) / 2 
         };
      }
      return { lat: selectedBus.lat, lng: selectedBus.lng };
    }
    return defaultCenter;
  }, [selectedBus, selectedStop]);

  const options = useMemo(() => ({
    styles: darkMapStyles,
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
  }), []);

  // Fallback map for when API key isn't set
  if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) {
    return (
      <div style={{ height }} className="relative w-full overflow-hidden bg-[#050505] animate-fade-in">
        <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(212, 160, 23, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 160, 23, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />

        {/* Selected stop marker */}
        {selectedStop && (
          <div className="absolute z-20" style={{ top: '65%', left: '40%', transform: 'translate(-50%, -50%)' }}>
            <div className="w-4 h-4 rounded-full border-2 border-white bg-zinc-800 shadow-lg" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{selectedStop.label}</span>
            </div>
          </div>
        )}

        {/* Selected bus marker */}
        {selectedBus && selectedBus.status !== 'offline' && (
          <div className="absolute z-20 transition-all duration-700" style={{ top: '35%', left: '60%', transform: 'translate(-50%, -50%)' }}>
            <div className="relative">
              <div className="absolute inset-0 w-16 h-16 -m-4 rounded-full bg-amber-500/20 animate-ping" />
              <div className="absolute inset-0 w-12 h-12 -m-2 rounded-full bg-amber-500/30 pulse-amber" />
              
              <div className="relative w-10 h-10 rounded-2xl bg-[#d4a017] flex items-center justify-center shadow-[0_0_25px_rgba(212,160,23,0.4)] z-10">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 z-20 glass-effect px-3 py-1.5 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 pulse-dot" />
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Live Tracking</span>
        </div>
      </div>
    );
  }

  if (loadError) return <div style={{ height }} className="w-full bg-[#050505] flex items-center justify-center text-red-500 font-bold uppercase tracking-widest text-[10px]">Map Error</div>;
  if (!isLoaded) return <div style={{ height }} className="w-full bg-[#050505] flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" /></div>;

  return (
    <div style={{ height }} className="w-full relative">
      <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={16}
        options={options}
      >
        {selectedStop && (
          <Marker
            position={{ lat: selectedStop.lat, lng: selectedStop.lng }}
            label={{
              text: selectedStop.label,
              className: 'text-white text-[10px] font-bold uppercase mb-10 tracking-widest',
            }}
          />
        )}
        {selectedBus && selectedBus.status !== 'offline' && (
          <Marker
            position={{ lat: selectedBus.lat, lng: selectedBus.lng }}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="28" fill="#d4a017" fill-opacity="0.15"/>
                  <circle cx="30" cy="30" r="12" fill="#d4a017" stroke="white" stroke-width="2"/>
                </svg>
              `)}`,
              scaledSize: { width: 60, height: 60 },
              anchor: { x: 30, y: 30 },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
