import { useCallback, useEffect, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import AdminShell from '../../components/admin/AdminShell';
import MapSnippet from '../../components/MapSnippet';
import StatusPill from '../../components/StatusPill';
import {
  fetchAdminReport,
  fetchAssignableUsers,
  toApiError,
  updateAdminReport,
  VOLUME_LABEL,
  type AdminReporter,
  type Assignable,
  type Report,
  type TimelineEntry,
} from '../../lib/api';

const STATUSES = [
  { key: 'pending', label: 'Pending', on: 'bg-flag text-white' },
  { key: 'in_progress', label: 'In progress', on: 'bg-brand text-white' },
  { key: 'resolved', label: 'Resolved', on: 'bg-grass text-white' },
  { key: 'rejected', label: 'Reject', on: 'bg-danger text-white' },
];

const PRIORITIES = ['low', 'normal', 'urgent'];

const Label: React.FC<{ children: React.ReactNode; htmlFor?: string; className?: string }> = ({
  children,
  htmlFor,
  className = '',
}) => (
  <label
    htmlFor={htmlFor}
    className={`block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint ${className}`}
  >
    {children}
  </label>
);

const AdminReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const photoInput = useRef<HTMLInputElement | null>(null);

  const [report, setReport] = useState<Report | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [reporter, setReporter] = useState<AdminReporter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [status, setStatus] = useState('');
  const [team, setTeam] = useState('');
  const [priority, setPriority] = useState('normal');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [assignable, setAssignable] = useState<Assignable[]>([]);
  const [note, setNote] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchAdminReport(Number(id));
      setReport(data.report);
      setTimeline(data.timeline);
      setReporter(data.reporter);
      setStatus(data.report.status);
      setTeam(data.report.assigned_team ?? '');
      setPriority(data.report.priority ?? 'normal');
      setAssignedTo(data.report.assigned_to ?? null);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    // Staff who can take this on. Empty is a real answer — the picker says so
    // rather than silently offering nobody.
    fetchAssignableUsers().then(setAssignable).catch(() => setAssignable([]));
  }, [load]);

  const needsPhoto = status === 'resolved' && !photo && !report?.resolution_photo_url;

  const save = async () => {
    if (!report) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateAdminReport(report.id, {
        status: status !== report.status ? status : undefined,
        assigned_to: assignedTo !== report.assigned_to ? assignedTo : undefined,
        assigned_team: team.trim() && team.trim() !== report.assigned_team ? team.trim() : undefined,
        priority: priority !== report.priority ? priority : undefined,
        note: note.trim() || undefined,
        internal_note: internalNote.trim() || undefined,
        resolution_photo: photo,
      });
      setReport(updated);
      setNote('');
      setPhoto(null);
      setPhotoPreview(null);
      setSaved(true);
      // Refresh the timeline so the new events appear immediately.
      const data = await fetchAdminReport(report.id);
      setTimeline(data.timeline);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        {/* This is a desk screen, so it wears the console's chrome — sidebar,
            scope header and all — rather than the citizen app's phone layout. */}
        <AdminShell
          title={report ? `${report.reference}` : 'Complaint'}
          actions={
            <button
              type="button"
              onClick={() => history.push('/admin/complaints')}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Queue
            </button>
          }
        >
          <div className="px-4 pb-12 pt-4 lg:px-6 lg:pt-6">
            {loading && <p className="py-10 text-center text-[14px] text-ink-soft">Loading…</p>}

            {error && (
              <div role="alert" className="mb-4 rounded-2xl bg-danger-surface px-4 py-3">
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}
            {saved && !error && (
              <div className="mb-4 rounded-2xl bg-grass-surface px-4 py-3">
                <p className="text-[13px] font-semibold text-grass-dark">
                  Updated. The reporter has been notified.
                </p>
              </div>
            )}

            {report && (
              <>
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={report.status} label={report.status_label} />
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                          report.priority === 'urgent'
                            ? 'bg-flag-surface text-flag'
                            : 'bg-surface-container text-ink-soft'
                        }`}
                      >
                        {report.priority ?? 'normal'}
                      </span>
                      {/* Real ward record or nothing — never a guessed label. */}
                      {report.ward && (
                        <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                          {report.ward.label}
                        </span>
                      )}
                      <span className="tnum text-[12px] text-ink-faint">
                        {report.reference} · {report.created_for_humans}
                      </span>
                    </div>
                    <h1 className="mt-2 font-display text-[22px] font-extrabold text-ink lg:text-[26px]">
                      {report.waste_type ?? 'Awaiting analysis'}
                    </h1>
                    <p className="mt-0.5 text-[13.5px] text-ink-soft">{report.address}</p>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[13px] font-bold text-white active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">directions</span>
                    Directions
                  </a>
                </header>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  {/* ------------------------------------------- evidence */}
                  <div className="flex flex-col gap-4 lg:col-span-2">
                    <section className="overflow-hidden rounded-2xl bg-card shadow-card">
                      <div className="grid gap-px bg-line sm:grid-cols-2">
                        <figure className="bg-card">
                          <div className="h-56 bg-surface-container lg:h-64">
                            {report.photo_url && (
                              <img
                                src={report.photo_url}
                                alt="Reported waste"
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <figcaption className="px-3 py-2 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                            Reported
                          </figcaption>
                        </figure>
                        <figure className="bg-card">
                          <div className="flex h-56 items-center justify-center bg-surface-container lg:h-64">
                            {report.resolution_photo_url ? (
                              <img
                                src={report.resolution_photo_url}
                                alt="After clearing"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <p className="px-4 text-center text-[12.5px] text-ink-faint">
                                No after photo yet — one is required to resolve.
                              </p>
                            )}
                          </div>
                          <figcaption className="px-3 py-2 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                            After
                          </figcaption>
                        </figure>
                      </div>
                    </section>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <section className="overflow-hidden rounded-2xl bg-card shadow-card">
                        <MapSnippet
                          markers={[
                            {
                              id: report.id,
                              latitude: report.latitude,
                              longitude: report.longitude,
                              status: report.status,
                            },
                          ]}
                          className="h-40 w-full"
                          compact
                        />
                        <p className="tnum px-3 py-2.5 text-[12px] text-ink-faint">
                          {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                        </p>
                      </section>

                      <section
                        className={`rounded-2xl p-4 ${
                          report.ai_trusted ? 'bg-brand-surface' : 'bg-flag-surface'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-[11px] font-bold uppercase tracking-[0.08em] ${
                              report.ai_trusted ? 'text-brand' : 'text-flag'
                            }`}
                          >
                            {report.ai_trusted ? 'AI classification' : 'Unverified classification'}
                          </p>
                          {report.ai_engine && (
                            <span className="shrink-0 rounded-full bg-card/70 px-2 py-0.5 text-[10px] font-bold uppercase text-ink-soft">
                              {report.ai_engine}
                            </span>
                          )}
                        </div>

                        {/* The numbers below are worthless without this. The
                            stub derives its "confidence" from a hash of the
                            photo's bytes, which looks identical to a real
                            model's output once it's on the screen. */}
                        {!report.ai_trusted && (
                          <p className="mt-1.5 text-[11.5px] leading-snug text-ink">
                            {report.ai_engine === 'stub'
                              ? 'Produced by the offline stand-in, not a vision model. Treat the figures below as placeholders and check the photo yourself.'
                              : report.ai_engine === 'unverified'
                                ? 'No server-side record of this analysis, so its origin cannot be confirmed.'
                                : 'This report has not been analysed.'}
                          </p>
                        )}

                        <dl className="mt-2 grid grid-cols-2 gap-y-1.5 text-[13px]">
                          <dt className="text-ink-soft">Confidence</dt>
                          <dd className="tnum text-right font-bold text-ink">
                            {report.ai_confidence}%
                          </dd>
                          <dt className="text-ink-soft">Severity</dt>
                          <dd className="text-right font-bold capitalize text-ink">
                            {report.severity}
                          </dd>
                          {/* Volume decides the vehicle, so it leads — and an
                              unassessed report says so rather than reading as
                              an empty pile. */}
                          <dt className="text-ink-soft">How much</dt>
                          <dd className="text-right font-bold text-ink">
                            {report.volume_bucket ? (
                              <>
                                {VOLUME_LABEL[report.volume_bucket]}
                                {report.estimated_volume_litres != null && (
                                  <span className="tnum ml-1 font-semibold text-ink-soft">
                                    ≈ {report.estimated_volume_litres} L
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="font-semibold text-ink-soft">Not assessed</span>
                            )}
                          </dd>

                          <dt className="text-ink-soft">Est. weight</dt>
                          <dd className="tnum text-right font-bold text-ink">
                            {report.estimated_weight_kg != null
                              ? `≈ ${report.estimated_weight_kg} kg`
                              : '—'}
                          </dd>

                          <dt className="text-ink-soft">Compostable</dt>
                          <dd className="text-right font-bold text-ink">
                            {report.is_compostable == null ? (
                              <span className="font-semibold text-ink-soft">Not assessed</span>
                            ) : report.is_compostable ? (
                              'Yes'
                            ) : (
                              'No'
                            )}
                          </dd>
                        </dl>
                        {!!report.detected_items?.length && (
                          <p
                            className={`mt-2 text-[12px] ${
                              report.ai_trusted ? 'text-brand' : 'text-ink-soft'
                            }`}
                          >
                            {report.detected_items.join(' · ')}
                          </p>
                        )}
                      </section>
                    </div>

                    {report.note && (
                      <p className="rounded-2xl bg-card p-4 text-[13px] text-ink-soft shadow-card">
                        <span className="font-bold text-ink">Reporter's note: </span>
                        {report.note}
                      </p>
                    )}

                    {reporter && (
                      <section className="rounded-2xl bg-card p-4 shadow-card">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                          Reported by
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-[15px] font-bold text-ink">
                              {reporter.name}
                            </p>
                            <p className="text-[12px] text-ink-soft">
                              {reporter.reports_count} previous report
                              {reporter.reports_count === 1 ? '' : 's'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {reporter.phone && (
                              <a
                                href={`tel:${reporter.phone}`}
                                className="flex items-center gap-1.5 rounded-full bg-grass-surface px-4 py-2 text-[13px] font-semibold text-grass-dark"
                              >
                                <span className="material-symbols-outlined text-[18px]">call</span>
                                {reporter.phone}
                              </a>
                            )}
                            {reporter.email && (
                              <a
                                href={`mailto:${reporter.email}`}
                                className="flex items-center gap-1.5 rounded-full bg-brand-surface px-4 py-2 text-[13px] font-semibold text-brand"
                              >
                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                Email
                              </a>
                            )}
                          </div>
                        </div>
                      </section>
                    )}

                    {!!timeline.length && (
                      <section className="rounded-2xl bg-card p-4 shadow-card">
                        <h2 className="font-display text-[16px] font-bold text-ink">History</h2>
                        <ol className="mt-3 flex flex-col gap-3 border-l border-line pl-4">
                          {timeline.map((e, i) => (
                            <li key={i} className="relative">
                              <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-card" />
                              <p className="text-[13px] font-bold text-ink">{e.title}</p>
                              {e.body && <p className="text-[12px] text-ink-soft">{e.body}</p>}
                              <p className="text-[11px] text-ink-faint">
                                {e.at_human}
                                {e.actor ? ` · ${e.actor}` : ''}
                              </p>
                            </li>
                          ))}
                        </ol>
                      </section>
                    )}
                  </div>

                  {/* --------------------------------------------- actions */}
                  <div className="lg:sticky lg:top-4 lg:self-start">
                    <section className="rounded-2xl bg-card p-4 shadow-card">
                      <h2 className="font-display text-[17px] font-bold text-ink">
                        Assign &amp; update
                      </h2>

                      <Label className="mt-3">Status</Label>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {STATUSES.map((s) => (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => setStatus(s.key)}
                            className={`rounded-full px-3.5 py-2 text-[13px] font-semibold ${
                              status === s.key ? s.on : 'border border-line text-ink-soft'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>

                      {/* Assign to a named person — who is accountable, as
                          distinct from which crew turns up. */}
                      <Label className="mt-4" htmlFor="assignee">
                        Assign to person
                      </Label>
                      <select
                        id="assignee"
                        value={assignedTo ?? ''}
                        onChange={(e) =>
                          setAssignedTo(e.target.value ? Number(e.target.value) : null)
                        }
                        className="mt-1.5 w-full rounded-[14px] border border-line px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none focus:ring-0"
                      >
                        <option value="">Unassigned</option>
                        {assignable.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} — {a.open_assigned} open
                          </option>
                        ))}
                      </select>
                      {!assignable.length && (
                        <p className="mt-1.5 text-[11.5px] text-flag">
                          No staff in this ward yet — add one under Users.
                        </p>
                      )}

                      <Label className="mt-4" htmlFor="team">
                        Assign to team
                      </Label>
                      <input
                        id="team"
                        value={team}
                        onChange={(e) => setTeam(e.target.value)}
                        // Deliberately generic: a sample crew name would read as
                        // a real one this council uses.
                        placeholder="Crew or contractor name"
                        className="mt-1 w-full rounded-[14px] border border-line px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none focus:ring-0"
                      />

                      <Label className="mt-4">Priority</Label>
                      <div className="mt-1.5 flex gap-2">
                        {PRIORITIES.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`flex-1 rounded-full px-3 py-2 text-[13px] font-semibold capitalize ${
                              priority === p
                                ? p === 'urgent'
                                  ? 'bg-flag text-white'
                                  : 'bg-ink text-white'
                                : 'border border-line text-ink-soft'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <Label className="mt-4" htmlFor="note">
                        Message to the reporter
                      </Label>
                      <textarea
                        id="note"
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Shown to the citizen in their notification"
                        className="mt-1 w-full rounded-[14px] border border-line px-3 py-2 text-[13px] text-ink focus:border-brand focus:outline-none focus:ring-0"
                      />

                      <Label className="mt-3" htmlFor="internal">
                        Internal note
                      </Label>
                      <textarea
                        id="internal"
                        rows={2}
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder="Visible to the crew only"
                        className="mt-1 w-full rounded-[14px] border border-line px-3 py-2 text-[13px] text-ink focus:border-brand focus:outline-none focus:ring-0"
                      />

                      <Label className="mt-4">Resolution photo</Label>
                      <input
                        ref={photoInput}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          setPhoto(f);
                          setPhotoPreview(f ? URL.createObjectURL(f) : null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => photoInput.current?.click()}
                        className={`mt-1.5 flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed py-4 text-[13px] font-semibold ${
                          needsPhoto ? 'border-flag text-flag' : 'border-line text-ink-soft'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        {photo ? 'Photo attached — change' : 'Add the after photo'}
                      </button>
                      {photoPreview && (
                        <img
                          src={photoPreview}
                          alt="Resolution preview"
                          className="mt-2 h-32 w-full rounded-xl object-cover"
                        />
                      )}
                      {needsPhoto && (
                        <p className="mt-1.5 text-[12px] text-flag">
                          Required to mark this resolved — it's what the citizen is sent.
                        </p>
                      )}

                      <div className="mt-4 flex items-start gap-2 rounded-[14px] bg-brand-surface px-3 py-2.5">
                        <span className="material-symbols-outlined text-[18px] text-brand">
                          notifications
                        </span>
                        <p className="text-[12px] leading-snug text-ink">
                          {reporter?.name ?? 'The reporter'} will be notified of this change.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={save}
                        disabled={saving || needsPhoto}
                        className="mt-4 w-full rounded-full bg-brand-gradient py-3.5 text-[15px] font-bold text-white shadow-fab active:scale-[0.98] disabled:opacity-50"
                      >
                        {saving ? 'Updating…' : 'Update report'}
                      </button>
                    </section>
                  </div>
                </div>
              </>
            )}
          </div>
        </AdminShell>
      </IonContent>
    </IonPage>
  );
};

export default AdminReportDetail;
