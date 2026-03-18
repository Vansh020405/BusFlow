import { useEffect, useRef, useState, useCallback } from 'react';
import { ref, onValue, set, serverTimestamp } from 'firebase/database';
import { db } from '../firebase';
import { DUMMY_BUSES } from '../data';

// ─── Use Firebase Bus Data (with dummy fallback) ───
export function useBusData() {
  const [buses, setBuses] = useState(DUMMY_BUSES);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    try {
      const busesRef = ref(db, 'buses');
      const unsubscribe = onValue(busesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const liveBuses = Object.entries(data).map(([id, val]) => ({
            id,
            number: val.number || id.replace('_', ' ').toUpperCase(),
            route: val.route || '',
            lat: val.lat || 0,
            lng: val.lng || 0,
            status: val.status || 'offline',
            lastUpdated: val.timestamp || Date.now(),
          }));
          setBuses(liveBuses);
          setIsLive(true);
        }
      }, (error) => {
        console.warn('Firebase not configured, using dummy data:', error.message);
        setIsLive(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase init error, using dummy data');
      setIsLive(false);
    }
  }, []);

  return { buses, isLive };
}

// ─── Geolocation tracker for driver ───
export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef(null);
  const lastPushRef = useRef(0);

  const startTracking = useCallback((busId) => {
    if (!navigator.geolocation) {
      setError('GPS not supported');
      return;
    }

    setError(null);
    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const now = Date.now();
        setPosition({ lat: latitude, lng: longitude, timestamp: now });

        // Throttle Firebase pushes to every 5 seconds
        if (now - lastPushRef.current > 5000) {
          lastPushRef.current = now;
          try {
            set(ref(db, `buses/${busId}`), {
              lat: latitude,
              lng: longitude,
              timestamp: now,
              status: 'running',
            });
          } catch (e) {
            console.warn('Firebase push failed:', e.message);
          }
        }
      },
      (err) => {
        switch (err.code) {
          case 1:
            setError('Location permission denied. Please allow GPS access.');
            break;
          case 2:
            setError('Location unavailable. Check your GPS settings.');
            break;
          case 3:
            setError('Location request timed out. Retrying...');
            break;
          default:
            setError('Unable to get location.');
        }
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );
  }, []);

  const stopTracking = useCallback((busId) => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);

    try {
      set(ref(db, `buses/${busId}/status`), 'parked');
    } catch (e) {
      console.warn('Firebase update failed:', e.message);
    }
  }, []);

  return { position, error, isTracking, startTracking, stopTracking };
}

// ─── Online/Offline detection ───
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
