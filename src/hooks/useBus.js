import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

// Listen to ALL buses in Firebase
export function useBusData() {
  const [buses, setBuses] = useState([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    try {
      const busesRef = ref(db, 'buses');
      const unsubscribe = onValue(busesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const liveBuses = Object.entries(data).map(([id, val]) => ({
            id,
            number: val.number || val.busNumber || `Bus ${id.split('_')[1]}`,
            route: val.route || {},
            tripMode: val.tripMode || 'arrival',
            route_finalized_arrival: val.route_finalized_arrival || false,
            route_finalized_return: val.route_finalized_return || false,
            lat: val.lat || 0,
            lng: val.lng || 0,
            status: val.status || 'offline',
            lastUpdated: val.lastUpdated || Date.now(),
            driverName: val.driverName,
            driverPhone: val.driverPhone
          }));
          setBuses(liveBuses);
          setIsLive(true);
        }
      }, (error) => {
        console.warn('Firebase sync error:', error.message);
        setIsLive(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase init error');
      setIsLive(false);
    }
  }, []);

  return { buses, isLive };
}

// Hook for real-time tracking of a specific bus
export function useBusLive(busId) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!busId) return;
    const liveRef = ref(db, `buses/${busId}/live`);
    const unsubscribe = onValue(liveRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setData({
           lat: Number(val.lat),
           lng: Number(val.lng),
           timestamp: val.timestamp,
           status: val.status
        });
      }
    });

    return () => unsubscribe();
  }, [busId]);

  return data;
}

export function useBusRoutePath(busId, tripMode = 'arrival') {
  const [path, setPath] = useState([]);

  useEffect(() => {
    if (!busId) return;
    // Try specifically for the trip mode
    const pathRef = ref(db, `routes/${busId}/${tripMode}/path`);
    const legacyRef = ref(db, `routes/${busId}/path`);
    
    // First try mode-specific path
    const unsubscribe = onValue(pathRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setPath(Object.values(val));
      } else {
          // Fallback to legacy path if mode-specific is missing
          onValue(legacyRef, (legacySnap) => {
            const legVal = legacySnap.val();
            if (legVal) setPath(Object.values(legVal));
            else setPath([]);
          }, { onlyOnce: true });
      }
    });

    return () => unsubscribe();
  }, [busId, tripMode]);

  return path;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return isOnline;
}
