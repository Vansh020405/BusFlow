import { useState, useCallback, memo, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Polyline } from '@react-google-maps/api';
import AdvancedMarker from './AdvancedMarker';

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 30.7333, lng: 76.7794 }; // Chandigarh
const collegeCoords = { lat: 30.7673, lng: 76.5744 }; // CU (Pb)

// FIX: Declare libraries as a static constant outside the component 
// to prevent unintentional re-loads (Performance Warning fix)
const LIBRARIES = ['marker'];

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0d0d' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#333333' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] }
];

function BusMap({ selectedBus, selectedStop, routeStops = [], height = '100%', showRoute = false }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    libraries: LIBRARIES // Using the static constant here
  });

  const mapRef = useRef(null);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const busPos = useMemo(() => {
    if (selectedBus?.lat && selectedBus?.lng) {
      return { lat: Number(selectedBus.lat), lng: Number(selectedBus.lng) };
    }
    return null;
  }, [selectedBus]);

  const polylinePath = useMemo(() => {
    let paths = [];
    if (routeStops.length > 0) {
      paths = routeStops.map(s => ({ lat: Number(s.lat), lng: Number(s.lng) }));
    }
    if (busPos) {
      if (paths.length > 0) {
        paths = [busPos, ...paths];
      } else if (showRoute) {
        paths = [busPos, collegeCoords];
      }
    }
    return paths;
  }, [routeStops, busPos, showRoute]);

  useEffect(() => {
    if (mapRef.current && busPos) {
      mapRef.current.panTo(busPos);
    }
  }, [busPos]);

  const mapOptions = useMemo(() => ({
    styles: darkMapStyle,
    disableDefaultUI: true,
    zoomControl: false,
    gestureHandling: 'greedy',
    clickableIcons: false,
    mapId: 'bf_premium_dark_map' 
  }), []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-[#0a0a0a]" style={{ height }}>
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-900 animate-pulse">
           Optimizing Vector Stream...
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={busPos || defaultCenter}
        zoom={14}
        onLoad={onLoad}
        options={mapOptions}
      >
        {busPos && (
          <AdvancedMarker position={busPos} title="Bus Location">
            <div className="relative flex items-center justify-center">
              {/* Pulse effect */}
              <div className="absolute w-6 h-6 bg-[#d4a017] rounded-full animate-ping opacity-20" />
              {/* Solid center dot */}
              <div className="w-3.5 h-3.5 bg-[#d4a017] rounded-full border border-white/20 shadow-lg" />
            </div>
          </AdvancedMarker>
        )}

        {selectedStop && (
          <AdvancedMarker 
            position={{ lat: Number(selectedStop.lat), lng: Number(selectedStop.lng) }}
            title="Selected Stop"
          >
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-zinc-950">
              <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />
            </div>
          </AdvancedMarker>
        )}

        {routeStops.map((stop, idx) => (
          <AdvancedMarker
            key={`stop-${idx}-${stop.lat}-${stop.lng}`}
            position={{ lat: Number(stop.lat), lng: Number(stop.lng) }}
            title={`Stop ${idx + 1}`}
          >
            <div className="relative group">
              <div className="w-5 h-5 bg-white border-2 border-[#d4a017] rounded-full shadow-md flex items-center justify-center font-black text-black text-[9px] transition-transform duration-200 group-hover:scale-110">
                {idx + 1}
              </div>
            </div>
          </AdvancedMarker>
        ))}


        {polylinePath.length > 1 && (
          <Polyline
            path={polylinePath}
            options={{
              strokeColor: '#d4a017',
              strokeOpacity: 0,
              strokeWeight: 2,
              icons: [
                {
                  icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.4, scale: 2, strokeColor: '#d4a017' },
                  offset: '0',
                  repeat: '20px'
                }
              ]
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}

export default memo(BusMap);
