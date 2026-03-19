import { useState, useEffect, useRef } from 'react';
import { ref, update, onValue, set, remove } from 'firebase/database';
import { db } from '../firebase';

export function useTracking(busId, initialMetadata = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedPath, setRecordedPath] = useState([]);
  const [pointsCaptured, setPointsCaptured] = useState(0);
  
  const watchId = useRef(null);
  const wakeLock = useRef(null);
  const lastKnownPos = useRef(null);
  const metadataRef = useRef(initialMetadata);
  const recordingPathRef = useRef([]);

  // Screen Wake Lock logic
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLock.current = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.warn('Wake Lock error:', err.message);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLock.current) {
      wakeLock.current.release();
      wakeLock.current = null;
    }
  };

  // Link driver identity to the route (persistent even when parked)
  useEffect(() => {
    metadataRef.current = initialMetadata;
    if (busId && initialMetadata.name) {
      const busRef = ref(db, `buses/${busId}`);
      update(busRef, {
        driverName: initialMetadata.name,
        driverPhone: initialMetadata.phone || '--'
      });
    }
  }, [initialMetadata, busId]);

  // Calculate distance between two points in meters
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Sync existing route, status, AND recorded path from Firebase
  useEffect(() => {
    if (!busId) return;
    const busRef = ref(db, `buses/${busId}`);
    const routeRef = ref(db, `buses/${busId}/route`);
    const statusRef = ref(db, `buses/${busId}/route_finalized`);
    const pathRef = ref(db, `routes/${busId}/path`);

    const unsubBus = onValue(busRef, (snap) => {
      const data = snap.val();
      if (data && data.lat && data.lng) {
        const firebasePos = {
          lat: data.lat,
          lng: data.lng,
          status: data.status || 'standby',
          timestamp: data.lastUpdated || Date.now()
        };
        setPosition(prev => prev ? prev : firebasePos);
        lastKnownPos.current = firebasePos;
        if (data.status === 'running' && !watchId.current) {
          startTracking(metadataRef.current);
        }
      }
    });

    const unsubRoute = onValue(routeRef, (snap) => {
      const data = snap.val();
      if (data) setRouteStops(Object.values(data).sort((a, b) => a.order - b.order));
      else setRouteStops([]);
    });

    const unsubStatus = onValue(statusRef, (snap) => {
      setIsFinalized(snap.val() || false);
    });

    const unsubPath = onValue(pathRef, (snap) => {
      const data = snap.val();
      if (data) {
        const pathArray = Object.values(data);
        setRecordedPath(pathArray);
        recordingPathRef.current = pathArray;
        setPointsCaptured(pathArray.length);
      }
    });

    return () => { unsubBus(); unsubRoute(); unsubStatus(); unsubPath(); };
  }, [busId]);

  const startTracking = async (metadata = metadataRef.current) => {
    console.log("📍 Start Journey initiated. Metadata:", metadata);
    if (watchId.current) return;
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    if (!busId) { setError('No route selected'); return; }

    setIsTracking(true);
    await requestWakeLock();

    const busRef = ref(db, `buses/${busId}`);
    const liveRef = ref(db, `buses/${busId}/live`);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const timestamp = Date.now();
        const liveData = { lat: latitude, lng: longitude, timestamp, status: 'running' };
        
        setPosition(liveData);
        lastKnownPos.current = liveData;

        // If recording mode is ON, capture the path point
        if (recordingPathRef.current.length === 0 || getDistance(latitude, longitude, recordingPathRef.current[recordingPathRef.current.length-1].lat, recordingPathRef.current[recordingPathRef.current.length-1].lng) > 20) {
           const newPoint = { lat: latitude, lng: longitude, timestamp };
           // We ONLY update local state during recording for performance
           // The actually saving happens in stopRecording or periodic sync
           if (isRecording) {
             recordingPathRef.current.push(newPoint);
             setPointsCaptured(recordingPathRef.current.length);
             setRecordedPath([...recordingPathRef.current]);
           }
        }
        
        update(busRef, { 
          lat: latitude, 
          lng: longitude, 
          status: 'running', 
          lastUpdated: timestamp,
          driverName: metadata.name || 'Driver',
          driverPhone: metadata.phone || '--'
        });
        update(liveRef, liveData);
      },
      (err) => {
        let errorMsg = "GPS Error: " + err.message;
        switch(err.code) {
          case 1: errorMsg = "📍 Location access blocked."; break;
          case 2: errorMsg = "🌐 Location information is unavailable."; break;
          case 3: errorMsg = "⏳ GPS request timed out."; break;
        }
        setError(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const startRecording = () => {
    if (!busId) return;
    setIsRecording(true);
    recordingPathRef.current = [];
    setRecordedPath([]);
    setPointsCaptured(0);
    // Clear existing path in Firebase to start fresh
    remove(ref(db, `routes/${busId}/path`));
  };

  const stopRecording = async () => {
    if (!isRecording || !busId) return;
    setIsRecording(false);
    
    // Save the full captured path to Firebase
    const pathRef = ref(db, `routes/${busId}/path`);
    const pathObj = {};
    recordingPathRef.current.forEach((pt, idx) => {
      pathObj[`p_${idx}`] = pt;
    });
    
    await update(ref(db, `routes/${busId}`), { 
      path: pathObj,
      finalized: true,
      lastUpdated: Date.now()
    });
    
    // Also update the finalized status for the bus listing
    await set(ref(db, `buses/${busId}/route_finalized`), true);
    setIsFinalized(true);
  };

  const stopTracking = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    releaseWakeLock();
    setIsTracking(false);
    const timestamp = Date.now();
    const finalUpdate = { status: 'parked', lastUpdated: timestamp };
    if (lastKnownPos.current) {
      finalUpdate.parkingLat = lastKnownPos.current.lat;
      finalUpdate.parkingLng = lastKnownPos.current.lng;
    }
    update(ref(db, `buses/${busId}`), finalUpdate);
    update(ref(db, `buses/${busId}/live`), { status: 'parked', timestamp });
  };

  const markStop = (stopData) => {
    if (isFinalized && !isRecording) return Promise.resolve(null);
    if (lastKnownPos.current) {
        const newStop = {
            name: stopData.name,
            lat: lastKnownPos.current.lat,
            lng: lastKnownPos.current.lng,
            timestamp: Date.now(),
            order: routeStops.length + 1
        };
        const stopRef = ref(db, `buses/${busId}/route/stop_${newStop.order}`);
        const masterStopRef = ref(db, `routes/${busId}/stops/stop_${newStop.order}`);
        return Promise.all([
          set(stopRef, newStop),
          set(masterStopRef, newStop)
        ]).then(() => newStop);
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const newStop = { name: stopData.name, lat: latitude, lng: longitude, timestamp: Date.now(), order: routeStops.length + 1 };
          try {
            const stopRef = ref(db, `buses/${busId}/route/stop_${newStop.order}`);
            const masterStopRef = ref(db, `routes/${busId}/stops/stop_${newStop.order}`);
            await Promise.all([
              set(stopRef, newStop),
              set(masterStopRef, newStop)
            ]);
            resolve(newStop);
          } catch (e) { reject(e); }
        },
        (err) => reject(new Error(err.message)),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
    });
  };

  const finalizeRoute = async () => {
    if (routeStops.length === 0) throw new Error('Add stops first');
    await set(ref(db, `buses/${busId}/route_finalized`), true);
    setIsFinalized(true);
  };

  const deleteStop = async (stopOrder) => {
    if (!busId || (isFinalized && !isRecording)) return;
    try {
      await remove(ref(db, `buses/${busId}/route/stop_${stopOrder}`));
      const remaining = routeStops.filter(s => s.order !== stopOrder).sort((a, b) => a.order - b.order);
      const routeRef = ref(db, `buses/${busId}/route`);
      await remove(routeRef);
      for (let i = 0; i < remaining.length; i++) {
        const reindexed = { ...remaining[i], order: i + 1 };
        await set(ref(db, `buses/${busId}/route/stop_${i + 1}`), reindexed);
      }
    } catch (e) { console.error('Failed to delete stop:', e); }
  };

  useEffect(() => {
    if (!navigator.geolocation || !busId) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const initialPos = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: Date.now(), status: 'standby' };
        setPosition(initialPos);
        lastKnownPos.current = initialPos;
      },
      (err) => console.warn('Initial GPS fix failed:', err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, [busId]);

  return { 
    position, error, isTracking, routeStops, isFinalized, 
    isRecording, recordedPath, pointsCaptured,
    startTracking, stopTracking, markStop, finalizeRoute, deleteStop,
    startRecording, stopRecording 
  };
}
