import { memo, useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';
import { calculateETA } from '../data';

function MapController({ busPos, destPos, userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const points = [];
    if (busPos) points.push([busPos.lat, busPos.lng]);
    if (destPos) points.push([destPos.lat, destPos.lng]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [map, busPos, destPos, userLocation]);
  return null;
}

const createBusIcon = () => L.divIcon({
  className: 'custom-bus-marker',
  html: `<div style="display: flex; align-items: center; justify-content: center; position: relative;">
           <div style="width: 24px; height: 24px; background: #d4a017; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const createDestIcon = () => L.divIcon({
  className: 'custom-dest-marker',
  html: `<div style="width: 24px; height: 24px; background: #ef4444; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);">
           <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const createUserIcon = () => L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="position: relative; display: flex; align-items: center; justify-content: center;">
           <div style="position: absolute; width: 40px; height: 40px; background: rgba(59, 130, 246, 0.15); border-radius: 50%; animation: pulse 2s infinite;"></div>
           <div style="width: 16px; height: 16px; background: #3b82f6; border: 2.5px solid white; border-radius: 50%; z-index: 10; box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);"></div>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const createStopIcon = (number) => L.divIcon({
  className: 'custom-stop-marker',
  html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 9px; font-weight: 900; box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);">
           ${number}
         </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const defaultCenter = [30.5162, 76.6597];

function BusMap({ selectedBus, destination, onRouteUpdate, height = '100%', routeStops = [], userLocation = null, isTracking = false, recordedPath = [] }) {
  const [roadPath, setRoadPath] = useState([]);
  const lastFetchedPos = useRef(null);
  const routeThrottleRef = useRef(null);

  const busPos = useMemo(() => {
    if (selectedBus?.lat && selectedBus?.lng) return { lat: Number(selectedBus.lat), lng: Number(selectedBus.lng) };
    return null;
  }, [selectedBus]);

  const destPos = useMemo(() => {
    if (!destination || typeof destination === 'string') return null;
    return { lat: Number(destination.lat), lng: Number(destination.lng) };
  }, [destination]);

  const getSimpleDist = (p1, p2) => {
    if (!p1 || !p2) return 999;
    return Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
  };

  const fetchRoadRoute = async () => {
    // If we have a recorded path, we don't need the API
    if (recordedPath && recordedPath.length > 0) return;
    
    if (!busPos || !destPos || !isTracking) return;

    if (lastFetchedPos.current && getSimpleDist(busPos, lastFetchedPos.current) < 0.0003) return;

    try {
      const apiKey = import.meta.env.VITE_OPENROUTE_SERVICE_KEY || 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjUxZDZlNjM2ZjI5ODQ1MjE5ZTY1YzBhMzk2MzgyMTlkIiwiaCI6Im11cm11cjY0In0=';
      
      console.log('🛰️ Fetching Road Geometry...');
      const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': apiKey
        },
        body: JSON.stringify({
          coordinates: [[busPos.lng, busPos.lat], [destPos.lng, destPos.lat]]
        })
      });

      if (!response.ok) throw new Error(`ORS API Status: ${response.status}`);
      
      const data = await response.json();
      if (!data.routes || data.routes.length === 0) return;

      const encodedGeometry = data.routes[0].geometry;
      if (!encodedGeometry) return;

      const decodedCoords = polyline.decode(encodedGeometry);
      if (decodedCoords.length >= 2) {
        setRoadPath(decodedCoords);
        lastFetchedPos.current = busPos;
      }
    } catch (e) {
      console.error('❌ ORS Geometry Decoding Failed:', e.message);
    }
  };

  useEffect(() => {
    // If recording, we don't call the API
    if (recordedPath && recordedPath.length > 0) {
      setRoadPath(recordedPath.map(p => [p.lat, p.lng]));
      return;
    }

    if (!isTracking) {
      setRoadPath([]);
      return;
    }
    if (routeThrottleRef.current) clearTimeout(routeThrottleRef.current);
    routeThrottleRef.current = setTimeout(fetchRoadRoute, 2000);
    return () => clearTimeout(routeThrottleRef.current);
  }, [busPos, destPos, isTracking, recordedPath]);

  useEffect(() => {
    if (busPos && destPos && onRouteUpdate) {
      const stats = calculateETA(busPos.lat, busPos.lng, destPos.lat, destPos.lng);
      if (stats) onRouteUpdate({ distance: `${stats.distance} km`, duration: stats.eta });
    }
  }, [busPos, destPos, onRouteUpdate]);

  return (
    <div style={{ height, background: '#ffffff', width: '100%', position: 'relative', zIndex: 0 }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        zoomControl={true}
        dragging={true}
        scrollWheelZoom={true}
        touchZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        <MapController busPos={busPos} destPos={destPos} userLocation={userLocation} />

        {isTracking && roadPath.length >= 2 && (
          <Polyline 
            positions={roadPath} 
            pathOptions={{
               color: "#d4a017",
               weight: 5,
               opacity: 0.8,
               lineJoin: 'round'
            }}
          />
        )}

        {busPos && <Marker position={[busPos.lat, busPos.lng]} icon={createBusIcon()} />}
        {destPos && <Marker position={[destPos.lat, destPos.lng]} icon={createDestIcon()} />}
        {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()} />}

        {routeStops.map((stop, idx) => (
          <Marker 
            key={`stop-${idx}`}
            position={[Number(stop.lat), Number(stop.lng)]} 
            icon={createStopIcon(idx + 1)} 
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default memo(BusMap);
