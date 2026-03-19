import { useState, useEffect, useRef } from 'react';
import { ref, update, onValue, set } from 'firebase/database';
import { db } from '../firebase';

export function useTracking(busId) {
  const [isTracking, setIsTracking] = useState(false);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [isFinalized, setIsFinalized] = useState(false);
  const watchId = useRef(null);
  const lastKnownPos = useRef(null);

  // Sync existing route data from Firebase
  useEffect(() => {
    if (!busId) return;
    const routeRef = ref(db, `buses/${busId}/route`);
    const statusRef = ref(db, `buses/${busId}/route_finalized`);

    const unsubRoute = onValue(routeRef, (snap) => {
      const data = snap.val();
      if (data) {
        setRouteStops(Object.values(data).sort((a, b) => a.order - b.order));
      } else {
        setRouteStops([]);
      }
    });

    const unsubStatus = onValue(statusRef, (snap) => {
      setIsFinalized(snap.val() || false);
    });

    return () => { unsubRoute(); unsubStatus(); };
  }, [busId]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setIsTracking(true);
    const busRef = ref(db, `buses/${busId}`);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = { lat: latitude, lng: longitude };
        setPosition(newPos);
        lastKnownPos.current = newPos; // Update buffer
        update(busRef, { ...newPos, status: 'running', lastUpdated: Date.now() });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const stopTracking = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
    update(ref(db, `buses/${busId}`), { status: 'parked', lastUpdated: Date.now() });
  };

  /**
   * FIX: markStop now prioritized buffered 'lastKnownPos' 
   * to avoid timeout errors when GPS is already tracking.
   */
  const markStop = (stopData) => {
    if (isFinalized) return Promise.resolve(null);

    // If we ALREADY have a GPS fix from the background watch, use it instantly!
    if (lastKnownPos.current) {
        const newStop = {
            name: stopData.name,
            lat: lastKnownPos.current.lat,
            lng: lastKnownPos.current.lng,
            timestamp: Date.now(),
            order: routeStops.length + 1
        };
        const stopRef = ref(db, `buses/${busId}/route/stop_${newStop.order}`);
        return set(stopRef, newStop).then(() => newStop);
    }

    // Fallback: Fresh attempt if watchPosition hasn't fired yet
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const newStop = {
            name: stopData.name,
            lat: latitude,
            lng: longitude,
            timestamp: Date.now(),
            order: routeStops.length + 1
          };
          try {
            const stopRef = ref(db, `buses/${busId}/route/stop_${newStop.order}`);
            await set(stopRef, newStop);
            resolve(newStop);
          } catch (e) {
            reject(e);
          }
        },
        (err) => {
            const msg = err.code === 3 ? "GPS Signal Timeout. Try outdoor location." : err.message;
            reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
    });
  };

  const finalizeRoute = async () => {
    if (routeStops.length === 0) throw new Error('Add stops first');
    await set(ref(db, `buses/${busId}/route_finalized`), true);
    setIsFinalized(true);
  };

  useEffect(() => {
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  return { position, error, isTracking, routeStops, isFinalized, startTracking, stopTracking, markStop, finalizeRoute };
}
