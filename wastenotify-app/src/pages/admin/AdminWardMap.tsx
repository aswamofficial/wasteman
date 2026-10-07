import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AdminShell from '../../components/admin/AdminShell';
import StatusPill from '../../components/StatusPill';
import { DEFAULT_CENTER, MAP_STYLES, loadGoogleMaps, pinIcon } from '../../lib/googleMaps';
import {
  districtFill,
  districtStroke,
  wardFill,
  wardStroke,
  zoneFill,
  ZONE_LEGEND,
  type WardColorMode,
} from '../../lib/wardColors';
import {
  fetchAdminQueue,
  fetchDistrictBoundaries,
  fetchWardBoundaries,
  toApiError,
  type AdminScope,
  type DistrictBoundaries,
  type DistrictFeatureProperties,
  type Report,
  type WardBoundaries,
  type WardFeatureProperties,
} from '../../lib/api';

const ALL_TOWNS = 'all';

/**
 * Operational map: every open complaint in scope, over the real boundaries.
 *
 * Two layers, and the difference between them matters. Wards are the unit the
 * service actually runs on — only the two Tamil Nadu corporations that publish
 * ward geometry have them. Districts are context: they cover the state, but
 * nothing routes on a district, so they are drawn under the wards and are not
 * clickable. The legend says which is which rather than letting the colours
 * imply the whole state is served.
 */
const AdminWardMap: React.FC = () => {
  const history = useHistory();

  const node = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const districtLayer = useRef<google.maps.Data | null>(null);
  const districtLabels = useRef<google.maps.Marker[]>([]);
  const markers = useRef<Map<number, google.maps.Marker>>(new Map());
  const loaded = useRef(false);

  const [reports, setReports] = useState<Report[]>([]);
  const [scope, setScope] = useState<AdminScope | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wardData, setWardData] = useState<WardBoundaries | null>(null);
  const [districtData, setDistrictData] = useState<DistrictBoundaries | null>(null);

  const [showWards, setShowWards] = useState(true);
  const [showDistricts, setShowDistricts] = useState(true);
  const [town, setTown] = useState<string>(ALL_TOWNS);
  const [colorMode, setColorMode] = useState<WardColorMode>('zone');
  const [activeWard, setActiveWard] = useState<WardFeatureProperties | null>(null);
  const [activeDistrict, setActiveDistrict] = useState<DistrictFeatureProperties | null>(null);
  const [statusFilter, setStatusFilter] = useState('open');
  const [legendOpen, setLegendOpen] = useState(false);
  const [districtError, setDistrictError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchAdminQueue({
        status: statusFilter === 'open' ? 'all' : statusFilter,
        sort: 'oldest',
      });
      const rows =
        statusFilter === 'open'
          ? data.reports.filter((r) => r.status === 'pending' || r.status === 'in_progress')
          : data.reports;
      setReports(rows);
      setScope(data.scope);
    } catch (err) {
      setError(toApiError(err).message);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const maps = await loadGoogleMaps();
        if (cancelled || !node.current) return;
        mapRef.current = new maps.Map(node.current, {
          center: DEFAULT_CENTER,
          zoom: 12,
          styles: MAP_STYLES,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          clickableIcons: false,
        });
        mapRef.current.addListener('click', () => {
          setActiveWard(null);
          setActiveDistrict(null);
        });
        setReady(true);
      } catch {
        setError('Google Maps failed to load. Check the API key.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Both layers load once, in full, and are shown or hidden by style. The whole
   * payload is ~300 KB and server-cached, so re-fetching on every toggle would
   * cost more than holding it.
   */
  useEffect(() => {
    if (!ready || loaded.current) return;
    const map = mapRef.current;
    if (!map) return;
    loaded.current = true;

    (async () => {
      // Districts go on their own Data layer so ward styling can't reach them
      // and a ward always wins a click over the district beneath it.
      try {
        const districts = await fetchDistrictBoundaries();
        const layer = new google.maps.Data({ map });
        layer.addGeoJson(districts as unknown as GeoJSON.FeatureCollection);

        layer.addListener('click', (e: google.maps.Data.MouseEvent) => {
          const props = {
            id: e.feature.getProperty('id'),
            name: e.feature.getProperty('name'),
            state: e.feature.getProperty('state'),
            dt_code: e.feature.getProperty('dt_code'),
            centroid: e.feature.getProperty('centroid'),
          } as DistrictFeatureProperties;
          setActiveWard(null);
          setActiveDistrict((cur) => (cur?.id === props.id ? null : props));
        });

        districtLayer.current = layer;
        setDistrictData(districts);
      } catch (err) {
        // Previously swallowed. A silently missing layer is indistinguishable
        // from "there is no data for the rest of the state", which is exactly
        // the wrong conclusion to let someone draw.
        setDistrictError(toApiError(err).message);
      }

      try {
        const wards = await fetchWardBoundaries();
        map.data.addGeoJson(wards as unknown as GeoJSON.FeatureCollection);
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
          setActiveDistrict(null);
          setActiveWard((cur) => (cur?.id === props.id ? null : props));
        });
        setWardData(wards);
      } catch {
        /* outlines are an overlay; the pins still work without them */
      }
    })();
  }, [ready]);

  // Ward styling
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    map.data.setStyle((feature) => {
      const featureTown = feature.getProperty('town') as string;
      if (!showWards || (town !== ALL_TOWNS && featureTown !== town)) {
        return { visible: false };
      }

      const wardNo = Number(feature.getProperty('ward_no'));
      const zone = feature.getProperty('zone') as string | null;
      const active = activeWard?.id === feature.getProperty('id');

      return {
        fillColor: colorMode === 'ward' ? wardFill(wardNo, featureTown) : zoneFill(zone),
        fillOpacity: active ? 0.55 : 0.22,
        strokeColor: active
          ? '#0D1B2A'
          : colorMode === 'ward'
            ? wardStroke(wardNo, featureTown)
            : zoneFill(zone),
        strokeWeight: active ? 3 : 1,
        zIndex: active ? 4 : 2,
        clickable: true,
      };
    });
  }, [showWards, colorMode, activeWard, town, ready]);

  // District styling — always beneath the wards
  useEffect(() => {
    const layer = districtLayer.current;
    if (!layer) return;

    /*
     * How prominent a district is depends on what the view is *about*.
     *
     * Zoomed into a city, districts are backdrop and should stay out of the
     * way of the wards. At the state view they are the only thing on screen
     * across 36 of 38 districts — drawn as faint backdrop there, the map looked
     * like it had no data outside Chennai and Coimbatore.
     */
    const stateView = town === ALL_TOWNS;

    layer.setStyle((feature) => {
      if (!showDistricts) return { visible: false };
      const name = feature.getProperty('name') as string;
      const active = activeDistrict?.id === feature.getProperty('id');

      return {
        fillColor: districtFill(name),
        fillOpacity: active ? 0.55 : stateView ? 0.34 : 0.08,
        strokeColor: active ? '#0D1B2A' : districtStroke(name),
        strokeWeight: active ? 2.5 : stateView ? 1.4 : 0.8,
        strokeOpacity: stateView ? 0.9 : 0.5,
        zIndex: active ? 3 : 1,
        // Only where they're the subject; in a city view a stray district
        // click would fight the ward the user is aiming at.
        clickable: stateView,
      };
    });
  }, [showDistricts, town, activeDistrict, districtData]);

  /**
   * District name labels, so the state view reads as 37 named districts rather
   * than an anonymous patchwork.
   */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !districtData) return;

    const wanted = showDistricts && town === ALL_TOWNS;

    if (!wanted) {
      districtLabels.current.forEach((m) => m.setMap(null));
      districtLabels.current = [];
      return;
    }

    if (districtLabels.current.length) return;

    districtLabels.current = districtData.features.map((f) =>
      new google.maps.Marker({
        position: { lat: Number(f.properties.centroid.lat), lng: Number(f.properties.centroid.lng) },
        map,
        clickable: false,
        zIndex: 2,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0, fillOpacity: 0, strokeOpacity: 0 },
        label: {
          text: f.properties.name,
          fontSize: '10px',
          fontWeight: '700',
          color: '#0D1B2A',
        },
      }),
    );
  }, [districtData, showDistricts, town]);

  /** Frame whatever the town selector is pointing at, from the real centroids. */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const points =
      town === ALL_TOWNS
        ? districtData?.features.map((f) => f.properties.centroid)
        : wardData?.features
            .filter((f) => f.properties.town === town)
            .map((f) => f.properties.centroid);

    if (!points?.length) return;

    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    map.fitBounds(bounds, 24);
  }, [town, ready, wardData, districtData]);

  // Complaint pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const wanted = new Set(reports.map((r) => r.id));
    for (const [id, m] of markers.current) {
      if (!wanted.has(id)) {
        m.setMap(null);
        markers.current.delete(id);
      }
    }

    reports.forEach((r) => {
      if (markers.current.has(r.id)) return;
      const marker = new google.maps.Marker({
        position: { lat: r.latitude, lng: r.longitude },
        map,
        icon: pinIcon(r.status),
        title: `${r.reference} — ${r.waste_type ?? ''}`,
        zIndex: 6,
      });
      marker.addListener('click', () => history.push(`/admin/reports/${r.id}`));
      markers.current.set(r.id, marker);
    });
  }, [reports, ready, history]);

  // Ward id, not ward number: numbers repeat across corporations.
  const visible = activeWard ? reports.filter((r) => r.ward?.id === activeWard.id) : reports;

  const towns = useMemo(() => wardData?.towns ?? [], [wardData]);

  const wardCount = useMemo(
    () =>
      town === ALL_TOWNS
        ? (wardData?.features.length ?? 0)
        : (wardData?.features.filter((f) => f.properties.town === town).length ?? 0),
    [wardData, town],
  );

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <AdminShell scope={scope} title="Ward map">
          <div className="flex h-[calc(100vh-56px)] flex-col lg:h-[calc(100vh-57px)] lg:flex-row">
            {/* Map */}
            <div className="relative min-h-0 flex-1">
              <div ref={node} className="h-full w-full" />

              <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap gap-2 p-3">
                <div className="pointer-events-auto flex gap-2 rounded-full bg-card p-1 shadow-lift">
                  {[
                    { k: 'open', l: 'Open' },
                    { k: 'pending', l: 'Pending' },
                    { k: 'in_progress', l: 'In progress' },
                    { k: 'all', l: 'All' },
                  ].map((f) => (
                    <button
                      key={f.k}
                      type="button"
                      onClick={() => setStatusFilter(f.k)}
                      className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${
                        statusFilter === f.k ? 'bg-ink text-white' : 'text-ink-soft'
                      }`}
                    >
                      {f.l}
                    </button>
                  ))}
                </div>

                {/* Area selector — "Tamil Nadu" zooms out to the district layer */}
                <div className="pointer-events-auto flex gap-1 rounded-full bg-card p-1 shadow-lift">
                  <button
                    type="button"
                    onClick={() => setTown(ALL_TOWNS)}
                    className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${
                      town === ALL_TOWNS ? 'bg-ink text-white' : 'text-ink-soft'
                    }`}
                  >
                    Tamil Nadu
                  </button>
                  {towns.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTown(t)}
                      className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${
                        town === t ? 'bg-ink text-white' : 'text-ink-soft'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-lift">
                  <label className="flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold text-ink">
                    <input
                      type="checkbox"
                      checked={showDistricts}
                      onChange={(e) => setShowDistricts(e.target.checked)}
                      className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                    />
                    Districts
                    {/* The count is on the control, so "are the districts
                        loaded?" is answerable without zooming around. */}
                    <span className="tnum text-ink-faint">{districtData?.count ?? 0}</span>
                  </label>
                  <span className="text-line">|</span>
                  <label className="flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold text-ink">
                    <input
                      type="checkbox"
                      checked={showWards}
                      onChange={(e) => setShowWards(e.target.checked)}
                      className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                    />
                    Wards
                    <span className="tnum text-ink-faint">{wardCount}</span>
                  </label>
                  {showWards && (
                    <button
                      type="button"
                      onClick={() => setColorMode((m) => (m === 'ward' ? 'zone' : 'ward'))}
                      className="rounded-full bg-surface-container px-2.5 py-1 text-[11.5px] font-semibold capitalize text-ink-soft"
                    >
                      by {colorMode}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setLegendOpen((v) => !v)}
                  aria-expanded={legendOpen}
                  className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft shadow-lift"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {legendOpen ? 'close' : 'info'}
                  </span>
                  Legend
                </button>
              </div>

              {/* What's drawn, where it came from, and what it doesn't cover. */}
              {legendOpen && (
                <div className="absolute bottom-3 left-3 max-h-[60%] w-[300px] overflow-y-auto rounded-2xl bg-card p-4 shadow-lift">
                  <h3 className="font-display text-[14px] font-bold text-ink">What's on this map</h3>

                  <p className="mt-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-ink-faint">
                    Wards — {wardCount} mapped
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-1.5">
                    {ZONE_LEGEND.filter((g) => town === ALL_TOWNS || g.town === town).map((g) => (
                      <li key={g.town}>
                        <p className="text-[12px] font-semibold text-ink">{g.town}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {g.zones.map((z) => (
                            <span
                              key={z}
                              className="flex items-center gap-1 rounded-full bg-surface-container px-1.5 py-0.5 text-[10.5px] text-ink-soft"
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: zoneFill(z) }}
                              />
                              {z}
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {wardData?.sources && (
                    <ul className="mt-2 flex flex-col gap-0.5">
                      {Object.entries(wardData.sources).map(([t, s]) => (
                        <li key={t} className="text-[10.5px] leading-snug text-ink-faint">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="mt-3 text-[11.5px] font-bold uppercase tracking-[0.06em] text-ink-faint">
                    Districts — {districtData?.count ?? 0} mapped
                  </p>
                  {/* Straight from the API so the caveat can't drift out of
                      sync with the data actually being drawn. */}
                  {districtData?.coverage && (
                    <p className="mt-1 text-[11px] leading-snug text-flag">
                      {districtData.coverage}
                    </p>
                  )}
                  {districtData?.source && (
                    <p className="mt-1 text-[10.5px] leading-snug text-ink-faint">
                      {districtData.source}
                      {districtData.source_year ? ` · ${districtData.source_year}` : ''}
                    </p>
                  )}

                  <p className="mt-3 border-t border-line pt-2 text-[11px] leading-snug text-ink-soft">
                    Only Chennai and Coimbatore publish ward geometry. Districts are context —
                    reports are matched to wards, so nothing is routed on them.
                  </p>
                </div>
              )}

              {(error || districtError) && (
                <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-danger-surface px-4 py-3">
                  {error && <p className="text-[13px] text-danger">{error}</p>}
                  {districtError && (
                    <p className="text-[13px] text-danger">
                      District outlines failed to load ({districtError}) — the rest of the state is
                      blank because of this, not because there's no data.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Side list */}
            <aside className="flex min-h-0 flex-col border-t border-line bg-card lg:w-96 lg:border-l lg:border-t-0">
              <div className="border-b border-line px-4 py-3">
                {activeDistrict ? (
                  /*
                   * Clicking a district has to answer the obvious question —
                   * "why is there nothing here?" — rather than leaving the
                   * absence to be read as a broken map.
                   */
                  <>
                    <p className="font-display text-[15px] font-bold text-ink">
                      {activeDistrict.name} district
                    </p>
                    <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">
                      No ward boundaries are published for this district, and it isn't in the
                      service area — reports here aren't routed to anyone.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveDistrict(null)}
                      className="mt-2 text-[12.5px] font-semibold text-brand"
                    >
                      Clear selection
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-display text-[15px] font-bold text-ink">
                      {activeWard
                        ? activeWard.label
                        : town === ALL_TOWNS
                          ? 'Tamil Nadu'
                          : `${town} — all wards`}
                    </p>
                    <p className="text-[12px] text-ink-faint">
                      {town === ALL_TOWNS && !activeWard
                        ? `${districtData?.count ?? 0} districts · ${wardCount} wards mapped in ${
                            wardData?.towns.length ?? 0
                          } cities`
                        : `${visible.length} complaint${visible.length === 1 ? '' : 's'}${
                            activeWard ? ' in this ward' : ''
                          }`}
                    </p>
                    {activeWard && (
                      <button
                        type="button"
                        onClick={() => setActiveWard(null)}
                        className="mt-1 text-[12.5px] font-semibold text-brand"
                      >
                        Clear ward filter
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {!visible.length && (
                  <p className="py-8 text-center text-[13px] text-ink-soft">
                    Nothing outstanding here.
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  {visible.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => history.push(`/admin/reports/${r.id}`)}
                      className="flex items-center gap-3 rounded-xl border border-line p-2.5 text-left active:scale-[0.99]"
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-container">
                        {r.photo_url && (
                          <img src={r.photo_url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-bold text-ink">
                          {r.waste_type ?? 'Awaiting analysis'}
                        </p>
                        <p className="truncate text-[11.5px] text-ink-soft">{r.address}</p>
                        <p className="tnum text-[11px] text-ink-faint">
                          {r.reference}
                          {r.ward ? ` · W${r.ward.ward_no}` : ''}
                          {r.assignee?.name ? ` · ${r.assignee.name}` : ' · unassigned'}
                        </p>
                      </div>
                      <StatusPill status={r.status} label={r.status_label} />
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </AdminShell>
      </IonContent>
    </IonPage>
  );
};

export default AdminWardMap;
