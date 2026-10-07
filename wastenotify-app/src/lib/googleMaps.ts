import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

export const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';

/** Coimbatore city centre — the fallback view before we know where the user is. */
export const DEFAULT_CENTER = { lat: 11.0168, lng: 76.9558 };

let pending: Promise<typeof google.maps> | null = null;

/**
 * Loads the Maps JS API once per session.
 *
 * Deliberately a raster map: vector/WebGL rendering needs a `mapId`, and a
 * `mapId` also disables the inline `styles` below (styling then has to be done
 * in the Cloud console). Raster keeps the palette in code and renders in more
 * environments.
 */
export async function loadGoogleMaps(): Promise<typeof google.maps> {
  if (!MAPS_API_KEY) {
    throw new Error('MISSING_MAPS_KEY');
  }

  // js-api-loader v2 replaced the Loader class with this functional API.
  // Both libraries are pulled up front so google.maps.Marker and the geometry
  // helpers exist by the time the map screen starts placing pins.
  pending ??= (async () => {
    setOptions({ key: MAPS_API_KEY, v: 'weekly' });
    await Promise.all([importLibrary('maps'), importLibrary('marker')]);
    return google.maps;
  })();

  return pending;
}

/**
 * Light basemap tuned to the app palette: cool near-white land, muted roads,
 * no POI clutter competing with the report pins.
 */
export const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f7f9fc' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a6b84' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#e6ebf2' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#f1f4f9' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e8f0fe' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a99ae' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#d8e6f8' }] },
];

const PIN_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  in_progress: '#1A73E8',
  resolved: '#34A853',
  rejected: '#8A99AE',
};

/**
 * Teardrop pin as an inline SVG data URI. Selected pins render larger with a
 * halo so the active report is obvious without relying on colour alone.
 */
export function pinIcon(status: string, selected = false): google.maps.Icon {
  const color = PIN_COLORS[status] ?? PIN_COLORS.pending;
  const size = selected ? 52 : 38;
  const halo = selected
    ? `<circle cx="24" cy="22" r="21" fill="${color}" opacity="0.22"/>`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 60" width="${size}" height="${size * 1.25}">
    ${halo}
    <path d="M24 4c-8.8 0-16 7.2-16 16 0 11.4 14.2 33.4 14.8 34.3a1.4 1.4 0 0 0 2.4 0C25.8 53.4 40 31.4 40 20c0-8.8-7.2-16-16-16z"
      fill="${color}" stroke="#ffffff" stroke-width="3"/>
    <circle cx="24" cy="20" r="6.5" fill="#ffffff"/>
  </svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size * 1.25),
    anchor: new google.maps.Point(size / 2, size * 1.25),
  };
}

/** Blue dot marking the user's own position. */
export function meIcon(): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: '#1A73E8',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 3,
  };
}
