import { useEffect, useRef, useState } from 'react';
import { DEFAULT_CENTER, MAP_STYLES, loadGoogleMaps, pinIcon } from '../lib/googleMaps';

export interface SnippetMarker {
  id: number | string;
  latitude: number;
  longitude: number;
  status: string;
}

interface Props {
  markers?: SnippetMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  /** Renders a small pin scale — used when the snippet is short. */
  compact?: boolean;
}

/**
 * A small, non-interactive Google map.
 *
 * Deliberately inert: gestures are off and the canvas has pointer-events
 * disabled, so the snippet never steals a tap from the card it sits inside —
 * the parent decides where tapping goes. Falls back to a labelled placeholder
 * rather than an empty grey box when there's no key or the API fails, since a
 * blank rectangle reads as a broken component.
 */
const MapSnippet: React.FC<Props> = ({ markers = [], center, zoom = 13, className = '', compact }) => {
  const node = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const drawn = useRef<google.maps.Marker[]>([]);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const maps = await loadGoogleMaps();
        if (cancelled || !node.current) return;

        mapRef.current = new maps.Map(node.current, {
          center: center ?? DEFAULT_CENTER,
          zoom,
          styles: MAP_STYLES,
          disableDefaultUI: true,
          gestureHandling: 'none',
          keyboardShortcuts: false,
          clickableIcons: false,
        });
        setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Built once; the marker effect below handles updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    // Same "whichever finishes last" guard the full map needs — syncing on
    // markers alone drops pins when the map is still booting.
    if (!map || !ready) return;

    drawn.current.forEach((m) => m.setMap(null));
    drawn.current = [];

    markers.forEach((m) => {
      const marker = new google.maps.Marker({
        position: { lat: m.latitude, lng: m.longitude },
        map,
        icon: { ...pinIcon(m.status), scaledSize: new google.maps.Size(compact ? 22 : 28, (compact ? 22 : 28) * 1.25) },
        clickable: false,
      });
      drawn.current.push(marker);
    });

    if (center) {
      map.setCenter(center);
      map.setZoom(zoom);
      return;
    }

    if (markers.length === 1) {
      map.setCenter({ lat: markers[0].latitude, lng: markers[0].longitude });
      map.setZoom(16);
    } else if (markers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend({ lat: m.latitude, lng: m.longitude }));
      map.fitBounds(bounds, 28);
    }
  }, [markers, ready, center, zoom, compact]);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-surface-container text-ink-faint ${className}`}
      >
        <span className="material-symbols-outlined text-[24px]">map</span>
        <span className="text-[11px]">Map unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-surface-container ${className}`}>
      <div ref={node} className="pointer-events-none h-full w-full" />
    </div>
  );
};

export default MapSnippet;
