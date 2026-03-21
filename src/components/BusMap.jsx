import { memo, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';
import { calculateETA } from '../data';

/* ─────────────────────────────────────────────
   MapController — only fits bounds on FIRST load
   or when key data (bus/dest existence) changes.
   Does NOT fight user manual zoom/pan.
   ───────────────────────────────────────────── */
function MapController({ busPos, destPos, userLocation, recordedPath }) {
  const map = useMap();
  const hasFittedRef = useRef(false);
  const prevKeyRef = useRef('');

  useEffect(() => {
    if (!map) return;

    // Build a "key" from whether bus/dest/user exist — only re-fit when this key changes
    const key = `${busPos ? 'b' : ''}${destPos ? 'd' : ''}${userLocation ? 'u' : ''}${recordedPath?.length > 0 ? 'r' : ''}`;
    
    // Only auto-fit when the key changes (e.g., bus appears, dest is set) or first time
    if (key === prevKeyRef.current && hasFittedRef.current) return;
    prevKeyRef.current = key;
    hasFittedRef.current = true;

    const points = [];
    if (busPos && busPos.lat) points.push([busPos.lat, busPos.lng]);
    if (destPos && destPos.lat) points.push([destPos.lat, destPos.lng]);
    if (userLocation && userLocation.lat) points.push([userLocation.lat, userLocation.lng]);
    
    if (recordedPath && recordedPath.length > 0) {
      // Only add first and last point of recorded path for bounds (performance)
      points.push([recordedPath[0].lat, recordedPath[0].lng]);
      points.push([recordedPath[recordedPath.length - 1].lat, recordedPath[recordedPath.length - 1].lng]);
    }

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [map, busPos, destPos, userLocation, recordedPath]);

  return null;
}

/* ─────────────────────────────────────────────
   MapRefSetter — captures map instance into a ref
   (returns null, so it's a valid Leaflet child)
   ───────────────────────────────────────────── */
function MapRefSetter({ mapRef }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

/* ─────────────────────────────────────────────
   Bus Icon — an actual bus SVG
   ───────────────────────────────────────────── */
const createBusIcon = () => L.divIcon({
  className: 'custom-bus-marker',
  html: `<div style="display:flex;align-items:center;justify-content:center;position:relative;">
    <div style="position:absolute;width:52px;height:52px;background:rgba(212,160,23,0.15);border-radius:50%;animation:pulse 2s infinite;"></div>
    <div style="width:36px;height:36px;background:#d4a017;border-radius:10px;border:2.5px solid #000;box-shadow:0 4px 20px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="14" rx="3" fill="#000"/>
        <rect x="5" y="5" width="6" height="5" rx="1" fill="#d4a017" opacity="0.6"/>
        <rect x="13" y="5" width="6" height="5" rx="1" fill="#d4a017" opacity="0.6"/>
        <rect x="3" y="17" width="18" height="2" rx="1" fill="#000"/>
        <circle cx="7" cy="20" r="2" fill="#000" stroke="#d4a017" stroke-width="1"/>
        <circle cx="17" cy="20" r="2" fill="#000" stroke="#d4a017" stroke-width="1"/>
      </svg>
    </div>
  </div>`,
  iconSize: [52, 52],
  iconAnchor: [26, 26]
});

const createDestIcon = () => L.divIcon({
  className: 'custom-dest-marker',
  html: `<div style="display:flex;flex-direction:column;align-items:center;">
    <div style="width:30px;height:30px;background:#ef4444;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid #fff;box-shadow:0 4px 15px rgba(239,68,68,0.4);display:flex;align-items:center;justify-content:center;">
      <div style="width:10px;height:10px;background:#fff;border-radius:50%;transform:rotate(45deg);"></div>
    </div>
    <div style="width:2px;height:6px;background:rgba(239,68,68,0.5);margin-top:-2px;border-radius:0 0 2px 2px;"></div>
  </div>`,
  iconSize: [30, 38],
  iconAnchor: [15, 38]
});

const createUserIcon = () => L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;width:36px;height:36px;background:rgba(59,130,246,0.25);border-radius:50%;animation:pulse 3s infinite;"></div>
    <div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;z-index:10;box-shadow:0 0 15px rgba(59,130,246,0.6);"></div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const createStopIcon = (number) => L.divIcon({
  className: 'custom-stop-marker',
  html: `<div style="width:24px;height:24px;background:#111;border:2px solid #d4a017;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#d4a017;font-size:11px;font-weight:900;box-shadow:0 4px 12px rgba(0,0,0,0.4);">
    ${number}
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const defaultCenter = [30.5162, 76.6597];

function BusMap({ selectedBus, destination, onRouteUpdate, height = '100%', routeStops = [], userLocation = null, isTracking = false, recordedPath = [], locateButtonOffset = 20, origin = null, mapRef }) {
  const [roadPath, setRoadPath] = useState([]);
  const lastFetchedPos = useRef(null);
  const routeThrottleRef = useRef(null);

  const busPos = useMemo(() => {
    if (selectedBus?.lat && selectedBus?.lng) {
      return { lat: Number(selectedBus.lat), lng: Number(selectedBus.lng) };
    }
    return null;
  }, [selectedBus?.lat, selectedBus?.lng]);

  const destPos = useMemo(() => {
    if (!destination || typeof destination === 'string') return null;
    return { lat: Number(destination.lat), lng: Number(destination.lng) };
  }, [destination?.lat, destination?.lng]);

  const startPos = useMemo(() => {
    if (origin?.lat && origin?.lng) return { lat: Number(origin.lat), lng: Number(origin.lng) };
    return busPos;
  }, [origin?.lat, origin?.lng, busPos]);

  const getSimpleDist = (p1, p2) => {
    if (!p1 || !p2) return 999;
    return Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
  };

  const fetchRoadRoute = useCallback(async (start, end) => {
    try {
      const apiKey = import.meta.env.VITE_OPENROUTE_SERVICE_KEY || 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjUxZDZlNjM2ZjI5ODQ1MjE5ZTY1YzBhMzk2MzgyMTlkIiwiaCI6Im11cm11cjY0In0=';
      
      const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Authorization': apiKey },
        body: JSON.stringify({ coordinates: [[start.lng, start.lat], [end.lng, end.lat]] })
      });

      if (!response.ok) return;
      const data = await response.json();
      if (!data.routes?.length) return;

      const encodedGeometry = data.routes[0].geometry;
      if (!encodedGeometry) return;

      const decodedCoords = polyline.decode(encodedGeometry);
      if (decodedCoords.length >= 2) {
        setRoadPath(decodedCoords);
        lastFetchedPos.current = start;
      }
    } catch (e) {
      console.error('ORS Route Fetch Error:', e.message);
    }
  }, []);

  const EMPTY_PATH = useMemo(() => [], []);
  const lastRecordedPathStr = useRef('');
  useEffect(() => {
    if (recordedPath && recordedPath.length > 0) {
      const pathStr = JSON.stringify(recordedPath);
      if (pathStr !== lastRecordedPathStr.current) {
        lastRecordedPathStr.current = pathStr;
        setRoadPath(recordedPath.map(p => [p.lat, p.lng]));
      }
      return;
    }
    if (!isTracking || !startPos || !destPos) {
      if (roadPath.length > 0) {
        lastRecordedPathStr.current = '';
        setRoadPath(EMPTY_PATH);
      }
      return;
    }

    if (lastFetchedPos.current && getSimpleDist(startPos, lastFetchedPos.current) < 0.0003) return;

    if (routeThrottleRef.current) clearTimeout(routeThrottleRef.current);
    routeThrottleRef.current = setTimeout(() => fetchRoadRoute(startPos, destPos), 2000);
    return () => clearTimeout(routeThrottleRef.current);
  }, [startPos, destPos, isTracking, recordedPath, fetchRoadRoute, roadPath.length, EMPTY_PATH]);

  const lastRouteStats = useRef(null);
  useEffect(() => {
    if (startPos?.lat && destPos?.lat && onRouteUpdate) {
      const stats = calculateETA(startPos.lat, startPos.lng, destPos.lat, destPos.lng);
      if (stats) {
        const newDist = `${stats.distance} km`;
        const newDur = stats.eta;
        if (lastRouteStats.current?.distance !== newDist || lastRouteStats.current?.duration !== newDur) {
          lastRouteStats.current = { distance: newDist, duration: newDur };
          onRouteUpdate(lastRouteStats.current);
        }
      }
    }
  }, [startPos?.lat, startPos?.lng, destPos?.lat, destPos?.lng, onRouteUpdate]);

  const locatePos = userLocation || busPos;
  const internalMapRef = useRef(null);
  const activeMapRef = mapRef || internalMapRef;

  const handleLocate = () => {
    const map = activeMapRef.current;
    if (!map) return;
    if (locatePos && locatePos.lat) {
      map.flyTo([locatePos.lat, locatePos.lng], 16, { duration: 1 });
    } else {
      navigator.geolocation?.getCurrentPosition(
        (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1 }),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  return (
    <div style={{ height, background: 'transparent', width: '100%', position: 'relative', zIndex: 0 }}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        zoomControl={false}
        dragging={true}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController busPos={busPos} destPos={destPos} userLocation={userLocation} recordedPath={recordedPath} />
        <MapRefSetter mapRef={activeMapRef} />

        {roadPath.length >= 2 && (
          <Polyline 
            positions={roadPath} 
            pathOptions={{ color: "#d4a017", weight: 6, opacity: 0.85, lineJoin: 'round', lineCap: 'round' }}
          />
        )}

        {isTracking && recordedPath.length >= 2 && (
          <Polyline 
            positions={recordedPath.map(p => [p.lat, p.lng])} 
            pathOptions={{ color: "#ef4444", weight: 3, opacity: 0.5, dashArray: '8, 8' }}
          />
        )}

        {busPos && <Marker position={[busPos.lat, busPos.lng]} icon={createBusIcon()} />}
        {destPos && <Marker position={[destPos.lat, destPos.lng]} icon={createDestIcon()} />}
        {userLocation && userLocation !== busPos && <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()} />}

        {routeStops.map((stop, idx) => (
          <Marker 
            key={`stop-${idx}-${stop.lat}-${stop.lng}`}
            position={[Number(stop.lat), Number(stop.lng)]} 
            icon={createStopIcon(idx + 1)} 
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default memo(BusMap);
