import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

// Listen to ALL buses in Firebase — no dummy fallback
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
            number: val.number || `Bus ${id.split('_')[1]}`,
            route: val.route || {},
            route_finalized: val.route_finalized || false,
            lat: val.lat || 0,
            lng: val.lng || 0,
            status: val.status || 'offline',
            lastUpdated: val.lastUpdated || Date.now(),
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
