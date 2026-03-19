import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGoogleMap } from '@react-google-maps/api';

/**
 * A wrapper for google.maps.marker.AdvancedMarkerElement to work with @react-google-maps/api
 * and support React components as marker content.
 */
const AdvancedMarker = ({ position, children, title, zIndex, onClick }) => {
  const map = useGoogleMap();
  const [marker, setMarker] = useState(null);
  
  // Create a container element for the portal
  const container = useMemo(() => document.createElement('div'), []);

  useEffect(() => {
    if (!map || !position || !window.google?.maps?.marker?.AdvancedMarkerElement) {
      return;
    }

    const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content: container,
      title,
      zIndex,
    });

    let listener = null;
    if (onClick) {
      listener = newMarker.addListener('click', onClick);
    }

    setMarker(newMarker);

    return () => {
      if (listener) listener.remove();
      newMarker.map = null;
      setMarker(null);
    };
  }, [map, position, title, zIndex, onClick, container]);

  // Synch position changes if marker exists
  useEffect(() => {
    if (marker && position) {
      marker.position = position;
    }
  }, [marker, position]);

  // Sync zIndex changes
  useEffect(() => {
    if (marker && zIndex !== undefined) {
      marker.zIndex = zIndex;
    }
  }, [marker, zIndex]);

  return marker ? createPortal(children, container) : null;
};

export default AdvancedMarker;
