import { useCallback, useEffect, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import {
  analysePhoto,
  submitReport,
  toApiError,
  VOLUME_LABEL,
  type Analysis,
  type Report,
} from '../lib/api';
import { DEFAULT_CENTER, MAP_STYLES, loadGoogleMaps, pinIcon } from '../lib/googleMaps';
import { MenuButton } from '../components/SideMenu';

type Step = 'capture' | 'analysis' | 'location' | 'details' | 'done';

const STEP_INDEX: Record<Step, number> = {
  capture: 0,
  analysis: 1,
  location: 2,
  details: 3,
  done: 4,
};

const PRESENT_SINCE = [
  { value: 'today', label: 'Today' },
  { value: 'few_days', label: 'A few days' },
  { value: 'over_a_week', label: 'Over a week' },
  { value: 'unknown', label: "Don't know" },
];

const BLOCKING = [
  { value: 'road', label: 'Road' },
  { value: 'footpath', label: 'Footpath' },
  { value: 'drain', label: 'Drain' },
  { value: 'nothing', label: 'Nothing' },
];

const SEVERITY_STYLE: Record<string, string> = {
  low: 'bg-grass-surface text-grass-dark',
  medium: 'bg-brand-surface text-brand',
  high: 'bg-flag-surface text-flag',
};

/* ------------------------------------------------------------------ chrome */

const Header: React.FC<{ step: Step; title: string; onBack?: () => void }> = ({
  step,
  title,
  onBack,
}) => (
  <div className="sticky top-0 z-30 bg-canvas px-4 pb-3 pt-4">
    <div className="flex items-center gap-2">
      {!onBack && <MenuButton />}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      )}
      <h1 className="font-display text-[18px] font-bold text-ink">{title}</h1>
    </div>
    <div className="mt-3 flex gap-1.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full ${
            i <= STEP_INDEX[step] ? 'bg-brand' : 'bg-line'
          }`}
        />
      ))}
    </div>
    <p className="mt-1.5 text-[12px] text-ink-faint">
      Step {Math.min(STEP_INDEX[step] + 1, 4)} of 4
    </p>
  </div>
);

const Chip: React.FC<{ on: boolean; onClick: () => void; children: React.ReactNode }> = ({
  on,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
      on ? 'bg-brand text-white' : 'border border-line bg-card text-ink-soft'
    }`}
  >
    {children}
  </button>
);

/* ------------------------------------------------------------------ screen */

const ReportFlow: React.FC = () => {
  const history = useHistory();

  const [step, setStep] = useState<Step>('capture');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const [coords, setCoords] = useState({ lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng });
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [presentSince, setPresentSince] = useState('few_days');
  const [blocking, setBlocking] = useState('nothing');
  const [note, setNote] = useState('');

  const [created, setCreated] = useState<Report | null>(null);

  const fileInput = useRef<HTMLInputElement | null>(null);
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  /* ------------------------------------------------------- step 1: capture */

  const handleFile = useCallback(async (file: Blob, name: string) => {
    setBusy(true);
    setError(null);
    try {
      const local = URL.createObjectURL(file);
      setPhotoUrl(local);

      const result = await analysePhoto(file, name);
      setPhotoPath(result.photo_path);
      setAnalysis(result.analysis);
      setStep('analysis');
    } catch (err) {
      setError(toApiError(err).message);
      setPhotoUrl(null);
    } finally {
      setBusy(false);
    }
  }, []);

  const takePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        width: 1600,
      });
      if (!photo.webPath) return;
      const blob = await (await fetch(photo.webPath)).blob();
      await handleFile(blob, `report.${photo.format ?? 'jpg'}`);
    } catch {
      // Capacitor throws when the picker is cancelled, and on the web it may
      // not be available at all — fall back to a plain file input rather than
      // showing an error for what is usually just "user changed their mind".
      fileInput.current?.click();
    }
  };

  /* ------------------------------------------------- step 3: location + map */

  const captureLocation = useCallback(async () => {
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      // Keep the default centre; the citizen can drag the pin instead.
    }
  }, []);

  // Reverse geocode for a human address, degrading to coordinates. Geocoding
  // is a separately-billable API that may not be enabled on the key, so a
  // failure here must never block the report.
  const describe = useCallback(async (lat: number, lng: number) => {
    try {
      const maps = await loadGoogleMaps();
      const geocoder = new maps.Geocoder();
      const { results } = await geocoder.geocode({ location: { lat, lng } });
      if (results?.[0]) {
        setAddress(results[0].formatted_address);
        return;
      }
    } catch {
      /* fall through */
    }
    setAddress((prev) => prev || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  }, []);

  useEffect(() => {
    if (step !== 'location') return;
    let cancelled = false;

    (async () => {
      try {
        const maps = await loadGoogleMaps();
        if (cancelled || !mapNode.current) return;

        const map = new maps.Map(mapNode.current, {
          center: coords,
          zoom: 17,
          styles: MAP_STYLES,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          clickableIcons: false,
        });
        mapRef.current = map;

        const marker = new google.maps.Marker({
          position: coords,
          map,
          draggable: true,
          icon: pinIcon('in_progress', true),
        });
        markerRef.current = marker;

        marker.addListener('dragend', () => {
          const p = marker.getPosition();
          if (!p) return;
          const next = { lat: p.lat(), lng: p.lng() };
          setCoords(next);
          describe(next.lat, next.lng);
        });

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          const next = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          marker.setPosition(next);
          setCoords(next);
          describe(next.lat, next.lng);
        });
      } catch {
        // No maps key — the address field alone still lets them file a report.
      }
    })();

    return () => {
      cancelled = true;
    };
    // Only re-init when entering the step; coords updates move the marker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const goToLocation = async () => {
    setStep('location');
    await captureLocation();
  };

  useEffect(() => {
    if (step === 'location' && !address) {
      describe(coords.lat, coords.lng);
    }
    if (step === 'location' && mapRef.current && markerRef.current) {
      markerRef.current.setPosition(coords);
      if (document.hidden) mapRef.current.setCenter(coords);
      else mapRef.current.panTo(coords);
    }
  }, [step, coords, address, describe]);

  /* --------------------------------------------------------- step 4: submit */

  const submit = async () => {
    if (!photoPath) return;
    setBusy(true);
    setError(null);
    try {
      const report = await submitReport({
        photo_path: photoPath,
        latitude: coords.lat,
        longitude: coords.lng,
        address: address.trim() || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
        landmark: landmark.trim() || undefined,
        present_since: presentSince,
        blocking,
        note: note.trim() || undefined,
        waste_type: analysis?.waste_type,
        ai_confidence: analysis?.confidence,
        severity: analysis?.severity,
        estimated_weight_kg: analysis?.estimated_weight_kg,
        detected_items: analysis?.detected_items,
      });
      setCreated(report);
      setStep('done');
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const ErrorBar = error ? (
    <div role="alert" className="mx-4 mb-3 flex items-start gap-2 rounded-2xl bg-danger-surface px-4 py-3">
      <span className="material-symbols-outlined text-[20px] text-danger">error</span>
      <p className="text-[13px] text-danger">{error}</p>
    </div>
  ) : null;

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-full bg-canvas pb-10">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f, f.name);
            }}
          />

          {/* ------------------------------------------------ step 1 capture */}
          {step === 'capture' && (
            <>
              <Header step="capture" title="Report waste" onBack={() => history.push('/home')} />
              {ErrorBar}
              <div className="px-4">
                <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-brand/40 bg-card px-6 py-12 text-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-surface">
                    <span className="material-symbols-outlined text-[36px] text-brand">
                      photo_camera
                    </span>
                  </span>
                  <div>
                    <p className="font-display text-[19px] font-bold text-ink">
                      Photograph the waste
                    </p>
                    <p className="mt-1 text-[14px] leading-snug text-ink-soft">
                      Get the whole pile in frame. Our AI reads the photo to identify the waste type
                      and route it to the right team.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={takePhoto}
                    disabled={busy}
                    className="mt-1 rounded-full bg-brand-gradient px-7 py-3 text-[15px] font-bold text-white shadow-fab active:scale-[0.98] disabled:opacity-60"
                  >
                    {busy ? 'Analysing…' : 'Take a photo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={busy}
                    className="text-[13px] font-semibold text-brand"
                  >
                    Choose from gallery
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ----------------------------------------------- step 2 analysis */}
          {step === 'analysis' && analysis && (
            <>
              <Header step="analysis" title="AI analysis" onBack={() => setStep('capture')} />
              {ErrorBar}
              <div className="flex flex-col gap-4 px-4">
                {photoUrl && (
                  <div className="relative overflow-hidden rounded-3xl">
                    <img src={photoUrl} alt="" className="h-56 w-full object-cover" />
                    <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-[12px] font-semibold text-white">
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      {analysis.engine === 'claude' ? 'Analysed by Claude' : 'Sample analysis'}
                    </span>
                  </div>
                )}

                {!analysis.is_waste && (
                  <div className="flex items-start gap-2 rounded-2xl bg-flag-surface px-4 py-3">
                    <span className="material-symbols-outlined text-[20px] text-flag">warning</span>
                    <p className="text-[13px] text-ink">
                      This doesn't look like dumped waste. You can still submit it, but a crew may
                      close it without action.
                    </p>
                  </div>
                )}

                <div className="rounded-2xl bg-card p-5 shadow-card">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand">
                    Detected waste type
                  </p>
                  <h2 className="mt-1 font-display text-[22px] font-extrabold text-ink">
                    {analysis.waste_type}
                  </h2>
                  <p className="mt-1 text-[14px] text-ink-soft">{analysis.summary}</p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{ width: `${analysis.confidence}%` }}
                      />
                    </div>
                    <span className="tnum text-[13px] font-bold text-ink">
                      {analysis.confidence}%
                    </span>
                  </div>

                  {!!analysis.detected_items.length && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {analysis.detected_items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-brand-surface px-3 py-1 text-[12px] font-medium text-brand"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  <dl className="mt-4 space-y-2 border-t border-line pt-4">
                    <div className="flex items-center justify-between">
                      <dt className="text-[13px] text-ink-soft">Severity</dt>
                      <dd
                        className={`rounded-full px-3 py-1 text-[12px] font-bold uppercase ${
                          SEVERITY_STYLE[analysis.severity]
                        }`}
                      >
                        {analysis.severity}
                      </dd>
                    </div>

                    {/* Scale first, then weight: the volume is what the photo
                        actually shows, and the weight is derived from it. */}
                    <div className="flex items-center justify-between">
                      <dt className="text-[13px] text-ink-soft">How much</dt>
                      <dd className="text-[14px] font-bold text-ink">
                        {VOLUME_LABEL[analysis.volume_bucket]}
                        <span className="tnum ml-1.5 font-semibold text-ink-soft">
                          ≈ {analysis.estimated_volume_litres} L
                        </span>
                      </dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-[13px] text-ink-soft">Estimated weight</dt>
                      <dd className="tnum text-[14px] font-bold text-ink">
                        ≈ {analysis.estimated_weight_kg} kg
                      </dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-[13px] text-ink-soft">Recyclable</dt>
                      <dd
                        className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                          analysis.stream === 'recyclable'
                            ? 'bg-grass-surface text-grass-dark'
                            : 'bg-line text-ink-soft'
                        }`}
                      >
                        {analysis.stream === 'recyclable' ? 'Yes — a collector buys this' : 'No'}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-[13px] text-ink-soft">Compostable</dt>
                      <dd
                        className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                          analysis.is_compostable
                            ? 'bg-grass-surface text-grass-dark'
                            : 'bg-line text-ink-soft'
                        }`}
                      >
                        {analysis.is_compostable ? 'Yes' : 'No'}
                      </dd>
                    </div>
                  </dl>

                  {/* The weight drives the indicative payout on the recyclable
                      side, so say plainly that it is an estimate off a photo
                      before anyone treats it as what they will be paid. */}
                  <p className="mt-3 text-[11.5px] leading-snug text-ink-faint">
                    Weight and volume are estimated from the photo. The collector weighs the
                    material at your door and the actual figure is what gets recorded.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goToLocation}
                  className="rounded-full bg-brand-gradient py-3.5 text-[15px] font-bold text-white shadow-fab active:scale-[0.98]"
                >
                  Looks correct — continue
                </button>
                <button
                  type="button"
                  onClick={() => setStep('capture')}
                  className="pb-2 text-[14px] font-semibold text-ink-soft"
                >
                  Retake photo
                </button>
              </div>
            </>
          )}

          {/* ----------------------------------------------- step 3 location */}
          {step === 'location' && (
            <>
              <Header step="location" title="Confirm location" onBack={() => setStep('analysis')} />
              {ErrorBar}
              <div className="flex flex-col gap-4 px-4">
                <div className="relative h-64 overflow-hidden rounded-3xl bg-surface-container">
                  <div ref={mapNode} className="h-full w-full" />
                  <span className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-card px-3 py-1.5 text-[12px] font-semibold text-ink shadow-card">
                    Drag the pin to adjust
                  </span>
                  <button
                    type="button"
                    onClick={captureLocation}
                    aria-label="Use my current location"
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-card text-brand shadow-lift active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">my_location</span>
                  </button>
                </div>

                <div className="rounded-2xl bg-card p-4 shadow-card">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                    Pin location
                  </p>
                  <label className="mt-2 block text-[13px] font-semibold text-ink" htmlFor="address">
                    Address
                  </label>
                  <input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, area, city"
                    className="mt-1 w-full rounded-[14px] border border-line bg-card px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none focus:ring-0"
                  />
                  <p className="tnum mt-2 text-[12px] text-ink-faint">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>

                  <label className="mt-3 block text-[13px] font-semibold text-ink" htmlFor="landmark">
                    Landmark <span className="font-normal text-ink-faint">(optional)</span>
                  </label>
                  <input
                    id="landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Next to the school gate"
                    className="mt-1 w-full rounded-[14px] border border-line bg-card px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none focus:ring-0"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="rounded-full bg-brand-gradient py-3.5 text-[15px] font-bold text-white shadow-fab active:scale-[0.98]"
                >
                  Confirm location
                </button>
              </div>
            </>
          )}

          {/* ------------------------------------------------ step 4 details */}
          {step === 'details' && (
            <>
              <Header step="details" title="Add details" onBack={() => setStep('location')} />
              {ErrorBar}
              <div className="flex flex-col gap-4 px-4">
                <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
                  {photoUrl && (
                    <img src={photoUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-display text-[15px] font-bold text-ink">
                      {analysis?.waste_type}
                    </p>
                    <p className="truncate text-[12px] text-ink-soft">{address}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[14px] font-semibold text-ink">
                    How long has it been here?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRESENT_SINCE.map((o) => (
                      <Chip
                        key={o.value}
                        on={presentSince === o.value}
                        onClick={() => setPresentSince(o.value)}
                      >
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[14px] font-semibold text-ink">Is it blocking anything?</p>
                  <div className="flex flex-wrap gap-2">
                    {BLOCKING.map((o) => (
                      <Chip key={o.value} on={blocking === o.value} onClick={() => setBlocking(o.value)}>
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-ink" htmlFor="note">
                    Add a note <span className="font-normal text-ink-faint">(optional)</span>
                  </label>
                  <textarea
                    id="note"
                    rows={4}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Anything the clean-up team should know?"
                    className="w-full rounded-[14px] border border-line bg-card px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none focus:ring-0"
                  />
                </div>

                <div className="flex items-start gap-2 rounded-2xl bg-brand-surface px-4 py-3">
                  <span className="material-symbols-outlined text-[20px] text-brand">shield</span>
                  <p className="text-[12px] leading-snug text-ink">
                    Your name and contact are shared only with the municipal team assigned to this
                    report.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={submit}
                  disabled={busy}
                  className="rounded-full bg-brand-gradient py-3.5 text-[15px] font-bold text-white shadow-fab active:scale-[0.98] disabled:opacity-60"
                >
                  {busy ? 'Submitting…' : 'Submit report'}
                </button>
              </div>
            </>
          )}

          {/* --------------------------------------------------- step 5 done */}
          {step === 'done' && created && (
            <div className="flex min-h-[85vh] flex-col items-center justify-center px-8 text-center">
              <span className="flex h-28 w-28 items-center justify-center rounded-full bg-grass-surface">
                <span className="material-symbols-outlined text-[52px] text-grass">check_circle</span>
              </span>
              <h2 className="mt-5 font-display text-[26px] font-extrabold text-ink">
                Report submitted
              </h2>
              <p className="mt-2 text-[14px] leading-snug text-ink-soft">
                The ward sanitation team has been notified with your photo and location.
              </p>

              <div className="mt-6 w-full rounded-2xl bg-card p-5 shadow-card">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                  Report ID
                </p>
                <p className="tnum mt-1 font-display text-[22px] font-extrabold text-ink">
                  {created.reference}
                </p>
                <p className="mt-3 border-t border-line pt-3 text-[13px] text-ink-soft">
                  We'll send you a photo the moment it's cleared.
                </p>
              </div>

              <button
                type="button"
                onClick={() => history.push(`/reports/${created.id}`)}
                className="mt-6 w-full rounded-full bg-brand-gradient py-3.5 text-[15px] font-bold text-white shadow-fab active:scale-[0.98]"
              >
                Track this report
              </button>
              <button
                type="button"
                onClick={() => history.push('/home')}
                className="mt-3 text-[14px] font-semibold text-ink-soft"
              >
                Back to home
              </button>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportFlow;
