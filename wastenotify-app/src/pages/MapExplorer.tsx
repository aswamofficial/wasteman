import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import BottomNav from '../components/BottomNav';
import StatusPill from '../components/StatusPill';
import TopBar from '../components/TopBar';
import {
  DEFAULT_CENTER,
  MAPS_API_KEY,
  MAP_STYLES,
  loadGoogleMaps,
  meIcon,
  pinIcon,
} from '../lib/googleMaps';
import {
  fetchMapReports,
  fetchWardBoundaries,
  toApiError,
  type MapPayload,
  type Report,
  type WardFeatureProperties,
} from '../lib/api';
import { wardFill, wardStroke, zoneFill, type WardColorMode } from '../lib/wardColors';
import { useAuth } from '../context/AuthContext';

/** Stored map layer choices, so they survive leaving and returning. */
const MAP_LAYER_PREFS = 'wasteman_map_layers';

/**
 * The corporation this app actually accepts reports for. Used only when the
 * signed-in citizen has no home ward yet — it is the service area, not a guess
 * about where they are.
 */
const SERVICE_TOWN = 'Coimbatore';

type StatusKey = 'all' | 'pending' | 'in_progress' | 'resolved';

const STATUS_CHIPS: { key: StatusKey; label: string; dot: string }[] = [
  { key: 'all', label: 'All', dot: 'bg-ink' },
  { key: 'pending', label: 'Pending', dot: 'bg-flag' },
  { key: 'in_progress', label: 'In progress', dot: 'bg-brand' },
  { key: 'resolved', label: 'Resolved', dot: 'bg-grass' },
];

const MapExplorer: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const homeWardNo = user?.ward?.ward_no ?? null;

  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.Marker>>(new Map());
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const meMarkerRef = useRef<google.maps.Marker | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const [data, setData] = useState<MapPayload | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<StatusKey>('all');
  const [type, setType] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);

  const [layersOpen, setLayersOpen] = useState(false);
  const [showWards, setShowWards] = useState(true);
  const [showWardLabels, setShowWardLabels] = useState(true);
  const [colorMode, setColorMode] = useState<WardColorMode>('ward');
  const prefsLoaded = useRef(false);
  const [activeWard, setActiveWard] = useState<WardFeatureProperties | null>(null);
  const wardsLoaded = useRef(false);
  const wardLabels = useRef<google.maps.Marker[]>([]);

  /**
   * Move the camera to a report.
   *
   * panTo animates, and animation frames are suspended while the document is
   * hidden (background tab, or a headless/preview host), which silently drops
   * the move. setCenter is instant and always applies, so fall back to it
   * rather than leaving the map pointing somewhere else.
   */
  const focusOn = useCallback((lat: number, lng: number, zoom?: number) => {
    const map = mapRef.current;
    if (!map) return;
    if (document.hidden) map.setCenter({ lat, lng });
    else map.panTo({ lat, lng });
    if (zoom != null) map.setZoom(zoom);
  }, []);

  /* ------------------------------------------------------------ load data */

  const load = useCallback(async () => {
    try {
      setDataError(null);
      setData(await fetchMapReports({ status, type: type ?? undefined }));
    } catch (err) {
      setDataError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [status, type]);

  useEffect(() => {
    load();
  }, [load]);

  /* ------------------------------------------------------------- init map */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const maps = await loadGoogleMaps();
        if (cancelled || !mapNode.current) return;

        mapRef.current = new maps.Map(mapNode.current, {
          center: DEFAULT_CENTER,
          zoom: 13,
          styles: MAP_STYLES,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          clickableIcons: false,
        });

        // Tapping empty map space clears the selection.
        mapRef.current.addListener('click', () => setSelectedId(null));

        setMapReady(true);
      } catch (err) {
        if (cancelled) return;
        setMapError(
          (err as Error)?.message === 'MISSING_MAPS_KEY'
            ? 'MISSING_MAPS_KEY'
            : 'Google Maps failed to load. Check the API key and that the Maps JavaScript API is enabled.',
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------- layer settings */

  // Someone who turns the wards off doesn't want them back on the next visit,
  // so the choice is stored rather than reset with the component.
  useEffect(() => {
    (async () => {
      const { value } = await Preferences.get({ key: MAP_LAYER_PREFS });
      if (value) {
        try {
          const saved = JSON.parse(value) as {
            showWards?: boolean;
            showWardLabels?: boolean;
            colorMode?: WardColorMode;
          };
          if (typeof saved.showWards === 'boolean') setShowWards(saved.showWards);
          if (typeof saved.showWardLabels === 'boolean') setShowWardLabels(saved.showWardLabels);
          if (saved.colorMode === 'ward' || saved.colorMode === 'zone') setColorMode(saved.colorMode);
        } catch {
          // Corrupt value — fall back to defaults rather than crashing the map.
        }
      }
      prefsLoaded.current = true;
    })();
  }, []);

  useEffect(() => {
    // Don't write on first render, or we'd overwrite stored prefs with the
    // component defaults before the read above has landed.
    if (!prefsLoaded.current) return;
    Preferences.set({
      key: MAP_LAYER_PREFS,
      value: JSON.stringify({ showWards, showWardLabels, colorMode }),
    });
  }, [showWards, showWardLabels, colorMode]);

  /* ------------------------------------------------------ ward boundaries */

  // Load the outlines once and hand them to the Data layer. Google keeps the
  // geometry; we only ever restyle it, which is far cheaper than rebuilding
  // 100 Polygon objects whenever the colour mode changes.
  useEffect(() => {
    if (!mapReady || wardsLoaded.current) return;
    const map = mapRef.current;
    if (!map) return;

    wardsLoaded.current = true;

    (async () => {
      try {
        /*
         * One city's wards, not every mapped ward in the state.
         *
         * The citizen map is where someone reports what's in front of them, so
         * a second corporation 350 km away is 150 KB of payload and 200 ward
         * markers they can never act on. The admin console is where the
         * state-wide view lives.
         */
        const fc = await fetchWardBoundaries(user?.ward?.town ?? SERVICE_TOWN);
        map.data.addGeoJson(fc as unknown as GeoJSON.FeatureCollection);

        map.data.addListener('click', (e: google.maps.Data.MouseEvent) => {
          const props = {
            id: e.feature.getProperty('id'),
            ward_no: e.feature.getProperty('ward_no'),
            zone: e.feature.getProperty('zone'),
            town: e.feature.getProperty('town'),
            lgd_code: e.feature.getProperty('lgd_code'),
            label: e.feature.getProperty('label'),
            centroid: e.feature.getProperty('centroid'),
          } as WardFeatureProperties;

          // Tapping the same ward again clears it, so there's always a way out
          // without hunting for a close button.
          setActiveWard((cur) => (cur?.id === props.id ? null : props));
        });

        // Ward numbers at each centroid — a colour alone doesn't tell anyone
        // which ward they're looking at.
        wardLabels.current = fc.features.map((f) => {
          const c = f.properties.centroid;
          return new google.maps.Marker({
            position: { lat: Number(c.lat), lng: Number(c.lng) },
            clickable: false,
            zIndex: 2,
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0, fillOpacity: 0, strokeOpacity: 0 },
            label: {
              text: String(f.properties.ward_no),
              fontSize: '11px',
              fontWeight: '700',
              color: '#0D1B2A',
            },
          });
        });
      } catch {
        // Boundaries are an overlay, not the map itself — a failure here must
        // not take out the reports view.
        setActiveWard(null);
      }
    })();
  }, [mapReady]);

  // Style + visibility. Runs on every relevant change, including the first
  // paint after the GeoJSON lands.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    map.data.setStyle((feature) => {
      if (!showWards) return { visible: false };

      const wardNo = Number(feature.getProperty('ward_no'));
      const zone = feature.getProperty('zone') as string | null;
      // Town is passed through so a ward keeps the same colour here as it has
      // on the admin map, where both corporations are drawn at once.
      const featureTown = feature.getProperty('town') as string | undefined;
      const isActive = activeWard?.ward_no === wardNo;
      const isHome = homeWardNo != null && wardNo === homeWardNo;

      const fill = colorMode === 'ward' ? wardFill(wardNo, featureTown) : zoneFill(zone);
      const stroke = colorMode === 'ward' ? wardStroke(wardNo, featureTown) : zoneFill(zone);

      return {
        fillColor: fill,
        fillOpacity: isActive ? 0.62 : 0.3,
        strokeColor: isActive ? '#0D1B2A' : stroke,
        strokeWeight: isActive ? 3 : isHome ? 2.5 : 1,
        strokeOpacity: isActive ? 1 : 0.85,
        // Selected ward sits above its neighbours so its outline isn't clipped.
        zIndex: isActive ? 3 : 1,
        clickable: true,
      };
    });

    // Numbers are their own switch — useful to hide when the pins get dense.
    wardLabels.current.forEach((m) => m.setMap(showWards && showWardLabels ? map : null));
  }, [showWards, showWardLabels, colorMode, activeWard, mapReady, homeWardNo]);

  /* ------------------------------------------------------- visible reports */

  const visible = useMemo(() => {
    const list = data?.reports ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.address.toLowerCase().includes(q) ||
        (r.waste_type ?? '').toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q),
    );
  }, [data, search]);

  /* --------------------------------------------------------- sync markers */

  useEffect(() => {
    const maps = mapRef.current;
    // Wait for whichever of "map ready" / "data arrived" happens last —
    // syncing on data alone silently drops pins when the map is still booting.
    if (!maps || !mapReady) return;

    const wanted = new Set(visible.map((r) => r.id));

    // Drop markers that are no longer in the filtered set.
    for (const [id, marker] of markersRef.current) {
      if (!wanted.has(id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    }

    for (const report of visible) {
      const existing = markersRef.current.get(report.id);
      const icon = pinIcon(report.status, report.id === selectedId);

      if (existing) {
        existing.setIcon(icon);
        existing.setZIndex(report.id === selectedId ? 999 : 1);
        continue;
      }

      const marker = new google.maps.Marker({
        position: { lat: report.latitude, lng: report.longitude },
        icon,
        title: report.waste_type ?? report.reference,
        zIndex: report.id === selectedId ? 999 : 1,
      });

      marker.addListener('click', () => {
        setSelectedId(report.id);
        setSheetOpen(true);
        focusOn(report.latitude, report.longitude);
      });

      markersRef.current.set(report.id, marker);
    }

    const all = [...markersRef.current.values()];

    clustererRef.current?.clearMarkers();
    clustererRef.current ??= new MarkerClusterer({ map: maps });
    clustererRef.current.addMarkers(all);

    // Dev-only handle. Google Maps refuses to paint while document.hidden is
    // true (headless/background tabs), so this is the only way to assert the
    // camera and pins are actually correct in an automated check.
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__wnMap = {
        map: maps,
        markers: markersRef.current,
      };
    }

    // Frame the results once per filter change, but never yank the camera
    // away from a pin the user just tapped.
    if (all.length && selectedId == null) {
      const bounds = new google.maps.LatLngBounds();
      visible.forEach((r) => bounds.extend({ lat: r.latitude, lng: r.longitude }));
      if (me) bounds.extend(me);
      maps.fitBounds(bounds, { top: 150, bottom: 260, left: 40, right: 40 });
    }
  }, [visible, mapReady, selectedId, me, focusOn]);

  /* ------------------------------------------------------------- locate me */

  const locate = async () => {
    setLocating(true);
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setMe(here);

      if (mapRef.current) {
        meMarkerRef.current?.setMap(null);
        meMarkerRef.current = new google.maps.Marker({
          position: here,
          map: mapRef.current,
          icon: meIcon(),
          zIndex: 1000,
          title: 'You are here',
        });
        focusOn(here.lat, here.lng, 15);
      }
    } catch {
      setDataError('Location permission denied or unavailable.');
    } finally {
      setLocating(false);
    }
  };

  const selected = visible.find((r) => r.id === selectedId) ?? null;

  const chipCount = (key: StatusKey) => data?.counts[key] ?? 0;

  /* ----------------------------------------------------------------- views */

  const MissingKey = (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-surface">
        <span className="material-symbols-outlined text-[30px] text-brand">key</span>
      </span>
      <p className="font-display text-[18px] font-bold text-ink">Google Maps key needed</p>
      <p className="text-[14px] leading-snug text-ink-soft">
        Add <code className="rounded bg-surface-container px-1">VITE_GOOGLE_MAPS_API_KEY</code> to{' '}
        <code className="rounded bg-surface-container px-1">wastenotify-app/.env</code> and restart
        the dev server. The Maps JavaScript API must be enabled on that key.
      </p>
    </div>
  );

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div className="relative h-full w-full overflow-hidden bg-canvas">
          {/* ------------------------------------------------------- map */}
          <div ref={mapNode} className="absolute inset-0 h-full w-full" />

          {mapError === 'MISSING_MAPS_KEY' && (
            <div className="absolute inset-0 bg-canvas">{MissingKey}</div>
          )}
          {mapError && mapError !== 'MISSING_MAPS_KEY' && (
            <div className="absolute inset-0 flex items-center justify-center bg-canvas px-8 text-center">
              <p className="text-[14px] text-ink-soft">{mapError}</p>
            </div>
          )}

          {/* Menu stays reachable even though the map is full-bleed. */}
          <TopBar title="Map" floating />

          {/* ------------------------------------------------ top controls */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2.5 p-4 pt-14">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-card px-4 py-3 shadow-lift">
              <span className="material-symbols-outlined text-[22px] text-ink-faint">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search an area, type or ID"
                aria-label="Search reports"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-0"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                  <span className="material-symbols-outlined text-[20px] text-ink-faint">close</span>
                </button>
              )}
            </div>

            {/* status chips */}
            <div className="pointer-events-auto -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar">
              {STATUS_CHIPS.map((chip) => {
                const on = status === chip.key;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => {
                      setStatus(chip.key);
                      setSelectedId(null);
                    }}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold shadow-card transition-colors ${
                      on ? 'bg-ink text-white' : 'bg-card text-ink-soft'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${chip.dot}`} />
                    {chip.label}
                    <span className={on ? 'text-white/70' : 'text-ink-faint'}>
                      {chipCount(chip.key)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* waste type chips */}
            {!!data?.waste_types.length && (
              <div className="pointer-events-auto -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar">
                <button
                  type="button"
                  onClick={() => setType(null)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold shadow-card ${
                    type === null ? 'bg-brand text-white' : 'bg-card text-ink-soft'
                  }`}
                >
                  All types
                </button>
                {data.waste_types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(type === t ? null : t);
                      setSelectedId(null);
                    }}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold shadow-card ${
                      type === t ? 'bg-brand text-white' : 'bg-card text-ink-soft'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ------------------------------------------------- layers panel */}
          {layersOpen && (
            <>
              {/* Tap-away closer. Transparent, but it must sit above the map so
                  the click doesn't fall through and drop the ward selection. */}
              <button
                type="button"
                aria-label="Close layers"
                onClick={() => setLayersOpen(false)}
                className="absolute inset-0 z-30 cursor-default"
              />
              <div className="absolute right-4 top-1/2 z-40 w-60 -translate-y-1/2 rounded-2xl bg-card p-4 shadow-lift">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                  Map layers
                </p>

                {/* Explicit labelled switch — the icon-only version wasn't
                    discoverable and didn't say what it toggled. */}
                <label className="mt-3 flex cursor-pointer items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-ink">
                      Ward boundaries
                    </span>
                    <span className="block text-[11.5px] text-ink-faint">
                      {showWards ? 'Showing all 100 wards' : 'Hidden'}
                    </span>
                  </span>
                  <span className="relative shrink-0">
                    <input
                      type="checkbox"
                      checked={showWards}
                      onChange={(e) => setShowWards(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="block h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-brand" />
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                  </span>
                </label>

                {showWards && (
                  <>
                    <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold text-ink">
                          Ward numbers
                        </span>
                        <span className="block text-[11.5px] text-ink-faint">
                          Labels at ward centres
                        </span>
                      </span>
                      <span className="relative shrink-0">
                        <input
                          type="checkbox"
                          checked={showWardLabels}
                          onChange={(e) => setShowWardLabels(e.target.checked)}
                          className="peer sr-only"
                        />
                        <span className="block h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-brand" />
                        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                      </span>
                    </label>

                    <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                      Colour by
                    </p>
                    <div className="mt-1.5 flex rounded-full bg-surface-container p-1">
                      {(['ward', 'zone'] as WardColorMode[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setColorMode(m)}
                          className={`flex-1 rounded-full py-1.5 text-[12.5px] font-semibold capitalize transition-colors ${
                            colorMode === m ? 'bg-brand text-white' : 'text-ink-soft'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setLayersOpen(false)}
                  className="mt-4 w-full rounded-full bg-surface-container py-2 text-[13px] font-semibold text-ink-soft"
                >
                  Done
                </button>
              </div>
            </>
          )}

          {/* ------------------------------------------------ side controls */}
          <div className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">
            <button
              type="button"
              onClick={() => setLayersOpen((v) => !v)}
              aria-expanded={layersOpen}
              aria-label="Map layers"
              className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lift active:scale-95 ${
                layersOpen ? 'bg-ink text-white' : showWards ? 'bg-brand text-white' : 'bg-card text-ink-soft'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">layers</span>
            </button>
            <button
              type="button"
              onClick={locate}
              disabled={locating || !mapReady}
              aria-label="Show my location"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-brand shadow-lift active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[22px]">
                {locating ? 'progress_activity' : 'my_location'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                load();
              }}
              aria-label="Refresh reports"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-ink-soft shadow-lift active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">refresh</span>
            </button>
          </div>

          {/* Selected ward — sits above the legend so it never covers the pins */}
          {activeWard && showWards && (
            <div
              className="absolute left-4 right-4 z-30 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-lift"
              style={{ bottom: sheetOpen ? 300 : 132 }}
            >
              <span
                className="h-9 w-9 shrink-0 rounded-lg"
                style={{
                  background:
                    colorMode === 'ward'
                      ? wardFill(activeWard.ward_no, activeWard.town)
                      : zoneFill(activeWard.zone),
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-bold text-ink">{activeWard.label}</p>
                <p className="tnum text-[11.5px] text-ink-faint">
                  {/* Not every corporation publishes LGD codes; showing an
                      empty "LGD" would read as a missing value rather than a
                      code that was never released. */}
                  {activeWard.lgd_code ? `LGD ${activeWard.lgd_code}` : 'No LGD code published'}
                  {homeWardNo === activeWard.ward_no ? ' · your ward' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  focusOn(Number(activeWard.centroid.lat), Number(activeWard.centroid.lng), 14);
                }}
                className="rounded-full bg-brand-surface px-3 py-1.5 text-[12px] font-bold text-brand"
              >
                Zoom to
              </button>
              <button type="button" onClick={() => setActiveWard(null)} aria-label="Clear ward">
                <span className="material-symbols-outlined text-[20px] text-ink-faint">close</span>
              </button>
            </div>
          )}

          {/* ------------------------------------------------------ legend */}
          <div
            className="absolute left-4 z-20 rounded-xl bg-card/95 px-3 py-2 shadow-card"
            style={{ bottom: (sheetOpen ? 300 : 132) + (activeWard && showWards ? 68 : 0) }}
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint">
              Legend
            </p>
            <div className="flex flex-col gap-1">
              {[
                { c: 'bg-flag', l: 'Pending' },
                { c: 'bg-brand', l: 'In progress' },
                { c: 'bg-grass', l: 'Resolved' },
              ].map((x) => (
                <span key={x.l} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                  <span className={`h-2.5 w-2.5 rounded-full ${x.c}`} />
                  {x.l}
                </span>
              ))}
            </div>
          </div>

          {/* ------------------------------------------------- bottom sheet */}
          <div
            className="absolute inset-x-0 z-30 rounded-t-3xl bg-card shadow-nav transition-[height] duration-300"
            style={{ bottom: 76, height: sheetOpen ? 236 : 68 }}
          >
            <button
              type="button"
              onClick={() => setSheetOpen((v) => !v)}
              aria-expanded={sheetOpen}
              className="flex w-full flex-col items-center gap-1.5 px-4 pt-2.5"
            >
              <span className="h-1 w-10 rounded-full bg-line" />
              <span className="flex w-full items-center justify-between">
                <span className="font-display text-[15px] font-bold text-ink">
                  {loading
                    ? 'Loading reports…'
                    : `${visible.length} report${visible.length === 1 ? '' : 's'}${
                        search ? ' matching' : ' nearby'
                      }`}
                </span>
                <span className="material-symbols-outlined text-[22px] text-ink-faint">
                  {sheetOpen ? 'expand_more' : 'expand_less'}
                </span>
              </span>
            </button>

            {sheetOpen && (
              <div className="mt-2 h-[172px] overflow-y-auto px-4 pb-3">
                {dataError && <p className="py-6 text-center text-[13px] text-danger">{dataError}</p>}

                {!loading && !dataError && !visible.length && (
                  <p className="py-8 text-center text-[13px] text-ink-soft">
                    No reports match these filters.
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  {visible.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      selected={report.id === selectedId}
                      onSelect={() => {
                        setSelectedId(report.id);
                        focusOn(report.latitude, report.longitude, 16);
                      }}
                      onOpen={() => history.push(`/reports/${report.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected pin callout, above the sheet */}
          {selected && !sheetOpen && (
            <div className="absolute inset-x-4 z-30" style={{ bottom: 156 }}>
              <ReportCard
                report={selected}
                selected
                onSelect={() => setSheetOpen(true)}
                onOpen={() => history.push(`/reports/${selected.id}`)}
              />
            </div>
          )}
        </div>
      </IonContent>

      <BottomNav active="map" />
    </IonPage>
  );
};

/* ---------------------------------------------------------------- helpers */

const ReportCard: React.FC<{
  report: Report;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}> = ({ report, selected, onSelect, onOpen }) => (
  <div
    className={`flex items-center gap-3 rounded-2xl border p-2.5 transition-colors ${
      selected ? 'border-brand bg-brand-tint' : 'border-line bg-card'
    }`}
  >
    <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 text-left">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container">
        {report.photo_url ? (
          <img src={report.photo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-ink-faint">
            <span className="material-symbols-outlined text-[20px]">image</span>
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-ink">
          {report.waste_type ?? 'Awaiting analysis'}
        </p>
        <p className="truncate text-[12px] text-ink-soft">{report.address}</p>
        <p className="text-[11px] text-ink-faint">
          {report.distance_km != null ? `${report.distance_km} km away · ` : ''}
          {report.created_for_humans}
        </p>
      </div>
    </button>
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <StatusPill status={report.status} label={report.status_label} />
      <button
        type="button"
        onClick={onOpen}
        className="text-[12px] font-semibold text-brand active:opacity-70"
      >
        Open
      </button>
    </div>
  </div>
);

export default MapExplorer;
