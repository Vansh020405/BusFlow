import { useState, useEffect, useRef, useCallback } from 'react';
import { ref, update, onValue, set, remove } from 'firebase/database';
import { db } from '../firebase';

export function useTracking(busId, initialMetadata = {}, tripMode = 'arrival') {
  const [isTracking, setIsTracking] = useState(false);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedPath, setRecordedPath] = useState([]);
  const [pointsCaptured, setPointsCaptured] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  
  const wakeLock = useRef(null);
  const lastKnownPos = useRef(null);
  const metadataRef = useRef(initialMetadata || {});
  const recordingPathRef = useRef([]);

  // Calculate distance between two points in meters
  const getDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Screen Wake Lock logic
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && navigator.wakeLock) {
      try {
        wakeLock.current = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.warn('Wake Lock error:', err.message);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLock.current) {
      wakeLock.current.release();
      wakeLock.current = null;
    }
  }, []);

  // ─── Unified Geolocation Watcher ───
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    const onSuccess = (pos) => {
      const { latitude, longitude, speed, heading } = pos.coords;
      const timestamp = Date.now();
      
      const currentPos = { 
        lat: latitude, 
        lng: longitude, 
        timestamp, 
        status: isTracking ? 'running' : 'standby',
        speed: speed || 0,
        heading: heading || 0
      };

      // Always update global position for UI
      setPosition(prev => {
        if (!prev || prev.lat !== latitude || prev.lng !== longitude || prev.status !== currentPos.status) {
          return currentPos;
        }
        return prev;
      });
      lastKnownPos.current = currentPos;

      // Handle Path Recording (Independent of full tracking)
      if (isRecording && busId) {
          const lastPt = recordingPathRef.current[recordingPathRef.current.length - 1];
          // Sample point every 10 meters for efficient pathing
          if (!lastPt || getDistance(latitude, longitude, lastPt.lat, lastPt.lng) > 10) {
              const newPoint = { lat: latitude, lng: longitude, timestamp };
              recordingPathRef.current.push(newPoint);
              setPointsCaptured(recordingPathRef.current.length);
              setRecordedPath([...recordingPathRef.current]);
          }
      }

      // Handle Live Tracking updates to Firebase
      if (isTracking && busId) {
        const busRef = ref(db, `buses/${busId}`);
        const liveRef = ref(db, `buses/${busId}/live`);

        update(busRef, { 
          lat: latitude, 
          lng: longitude, 
          status: 'running', 
          lastUpdated: timestamp,
          driverName: metadataRef.current?.name || 'Driver',
          driverPhone: metadataRef.current?.phone || '--',
          tripMode
        });
        update(liveRef, currentPos);
      }
    };

    const onError = (err) => {
      let errorMsg = "GPS Error: " + err.message;
      switch(err.code) {
        case 1: errorMsg = "📍 Location access blocked."; break;
        case 2: errorMsg = "🌐 Location information is unavailable."; break;
        case 3: errorMsg = "⏳ GPS request timed out."; break;
      }
      setError(errorMsg);
    };

    const id = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    });

    return () => navigator.geolocation.clearWatch(id);
  }, [isTracking, isRecording, busId, tripMode, getDistance]);

  // Link driver identity to the route
  useEffect(() => {
    metadataRef.current = initialMetadata || {};
    if (busId && initialMetadata?.name) {
      const busRef = ref(db, `buses/${busId}`);
      update(busRef, {
        driverName: initialMetadata.name,
        driverPhone: initialMetadata.phone || '--',
        tripMode: tripMode
      });
    }
  }, [initialMetadata, busId, tripMode]);

  // Firebase listeners
  useEffect(() => {
    if (!busId) return;

    const busStatusRef = ref(db, `buses/${busId}/status`);
    const routeFinalizedRef = ref(db, `buses/${busId}/route_finalized_${tripMode}`);
    const busRouteRef = ref(db, `buses/${busId}/route`);
    const pathRef = ref(db, `routes/${busId}/${tripMode}/path`);

    const unsubStatus = onValue(busStatusRef, (snap) => {
      if (snap.val() === 'running') setIsTracking(true);
    });

    const unsubBus = onValue(busRouteRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const stops = Object.values(val).sort((a, b) => a.order - b.order);
        setRouteStops(stops);
      } else {
        setRouteStops([]);
      }
    });

    const unsubRoute = onValue(routeFinalizedRef, (snapshot) => {
      setIsFinalized(!!snapshot.val());
    });

    const unsubPath = onValue(pathRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const path = Object.values(val);
        setRecordedPath(path);
        recordingPathRef.current = path;
        setPointsCaptured(path.length);
      } else {
        setRecordedPath([]);
        recordingPathRef.current = [];
        setPointsCaptured(0);
      }
    });

    return () => { unsubBus(); unsubRoute(); unsubStatus(); unsubPath(); };
  }, [busId, tripMode]);

  const startTracking = useCallback(async () => {
    if (!busId) { setError('No route selected'); return; }
    setIsTracking(true);
    await requestWakeLock();
  }, [busId, requestWakeLock]);

  const stopTracking = useCallback(() => {
    releaseWakeLock();
    setIsTracking(false);
    if (!busId) return;
    const timestamp = Date.now();
    const finalUpdate = { status: 'parked', lastUpdated: timestamp };
    if (lastKnownPos.current) {
      finalUpdate.parkingLat = lastKnownPos.current.lat;
      finalUpdate.parkingLng = lastKnownPos.current.lng;
    }
    update(ref(db, `buses/${busId}`), finalUpdate);
    update(ref(db, `buses/${busId}/live`), { status: 'parked', timestamp });
  }, [busId, releaseWakeLock]);

  const startRecording = useCallback(async () => {
    if (!busId) return;
    setIsRecording(true);
    recordingPathRef.current = [];
    setRecordedPath([]);
    setPointsCaptured(0);
    await remove(ref(db, `routes/${busId}/${tripMode}/path`));
  }, [busId, tripMode]);

  const stopRecording = useCallback(async () => {
    if (!isRecording || !busId) return;
    setIsRecording(false);
    
    const pathRef = ref(db, `routes/${busId}/${tripMode}/path`);
    const pathObj = {};
    recordingPathRef.current.forEach((pt, idx) => {
      pathObj[`p_${idx}`] = pt;
    });
    
    await update(ref(db, `routes/${busId}/${tripMode}`), { 
      path: pathObj,
      finalized: true,
      lastUpdated: Date.now()
    });
    
    await set(ref(db, `buses/${busId}/route_finalized_${tripMode}`), true);
    setIsFinalized(true);
    setLastSaved(new Date().toLocaleTimeString());
  }, [isRecording, busId, tripMode]);

  const markStop = useCallback((stopData) => {
    if (!busId) return Promise.resolve(null);
    if (lastKnownPos.current) {
        const newStop = {
            name: stopData?.name || `Checkpoint ${routeStops.length + 1}`,
            lat: lastKnownPos.current.lat,
            lng: lastKnownPos.current.lng,
            timestamp: Date.now(),
            order: routeStops.length + 1
        };
        const stopRef = ref(db, `buses/${busId}/route/stop_${newStop.order}`);
        const masterStopRef = ref(db, `routes/${busId}/${tripMode}/stops/stop_${newStop.order}`);
        return Promise.all([
          set(stopRef, newStop),
          set(masterStopRef, newStop)
        ]).then(() => newStop);
    }
    return Promise.reject(new Error('GPS Position not acquired yet'));
  }, [busId, tripMode, routeStops.length]);

  return { 
    position, error, isTracking, routeStops, isFinalized, 
    isRecording, recordedPath, pointsCaptured, lastSaved,
    startTracking, stopTracking, markStop, 
    startRecording, stopRecording 
  };
}
