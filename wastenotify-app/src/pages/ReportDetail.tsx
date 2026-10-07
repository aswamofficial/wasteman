import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import MapSnippet from '../components/MapSnippet';
import TopBar from '../components/TopBar';
import StatusPill from '../components/StatusPill';
import {
  confirmPayment,
  fetchReportDetail,
  rateReport,
  toApiError,
  VOLUME_LABEL,
  type Report,
  type TimelineEntry,
} from '../lib/api';

const STEP_ICON: Record<string, string> = {
  submitted: 'photo_camera',
  analysed: 'auto_awesome',
  assigned: 'groups',
  in_progress: 'local_shipping',
  resolved: 'check_circle',
  rejected: 'block',
  note: 'chat',
};

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const [report, setReport] = useState<Report | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirming, setConfirming] = useState(false);

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [savingRating, setSavingRating] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchReportDetail(Number(id));
      setReport(data.report);
      setTimeline(data.timeline);
      setRating(data.report.rating ?? 0);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const submitRating = async (value: number) => {
    if (!report) return;
    setRating(value);
    setSavingRating(true);
    try {
      const updated = await rateReport(report.id, value, feedback.trim() || undefined);
      setReport(updated);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSavingRating(false);
    }
  };

  const resolved = report?.status === 'resolved';

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-full bg-canvas pb-10">
          {/* Hero photo */}
          <div className="relative h-64 bg-surface-container">
            {report?.photo_url && (
              <img src={report.photo_url} alt="" className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/60 to-transparent" />
            <TopBar title={report?.reference ?? 'Report'} back floating />
          </div>

          <div className="-mt-6 rounded-t-3xl bg-canvas px-4 pt-5">
            {loading && <p className="py-8 text-center text-[14px] text-ink-soft">Loading…</p>}

            {error && (
              <div role="alert" className="rounded-2xl bg-danger-surface px-4 py-3">
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}

            {report && (
              <>
                <div className="flex items-center gap-2">
                  <StatusPill status={report.status} label={report.status_label} />
                  <span className="tnum text-[12px] text-ink-faint">{report.reference}</span>
                </div>

                <h1 className="mt-2 font-display text-[24px] font-extrabold text-ink">
                  {report.waste_type ?? 'Awaiting analysis'}
                </h1>
                <p className="mt-1 flex items-start gap-1.5 text-[14px] text-ink-soft">
                  <span className="material-symbols-outlined filled text-[18px] text-grass">
                    location_on
                  </span>
                  {report.address}
                </p>

                {/* ------------------------------------------- recycling */}
                {report.stream === 'recyclable' && (
                  <section className="mt-5 rounded-2xl bg-grass-surface p-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-grass-dark">
                        recycling
                      </span>
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-grass-dark">
                        Recyclable · {report.material ?? 'mixed'}
                      </p>
                    </div>

                    {report.settled_at ? (
                      <>
                        <p className="tnum mt-2 font-display text-[22px] font-extrabold text-ink">
                          ₹{report.settled_amount} · {report.settled_weight_kg} kg
                        </p>
                        <p className="text-[12.5px] text-ink-soft">
                          Recorded by {report.assignee?.name ?? 'the collector'}.
                        </p>

                        {/* The only check on a figure the collector enters on
                            their own. It records that the person who was
                            actually handed the money agrees with it. */}
                        {report.citizen_confirmed_at ? (
                          <p className="mt-2 flex items-center gap-1 text-[13px] font-semibold text-grass-dark">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            You confirmed this payment
                          </p>
                        ) : (
                          <>
                            <p className="mt-2 text-[12.5px] leading-snug text-ink">
                              Is this what you were paid? Confirming keeps a record both you and
                              the corporation can rely on.
                            </p>
                            <button
                              type="button"
                              disabled={confirming}
                              onClick={async () => {
                                setConfirming(true);
                                try {
                                  setReport(await confirmPayment(report.id));
                                } catch (err) {
                                  setError(toApiError(err).message);
                                } finally {
                                  setConfirming(false);
                                }
                              }}
                              className="mt-2 w-full rounded-full bg-brand-gradient py-2.5 text-[14px] font-bold text-white active:scale-[0.98] disabled:opacity-50"
                            >
                              {confirming ? 'Confirming…' : 'Yes, that’s what I was paid'}
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <p className="mt-1.5 text-[13px] leading-snug text-ink">
                        {report.accepted_at
                          ? `${report.assignee?.name ?? 'A collector'} has accepted this and will pay you on collection.`
                          : 'Offered to local collectors. One of them will come and pay you for the material.'}
                        {report.offer_amount ? (
                          <span className="mt-1 block text-ink-soft">
                            Indicative value ₹{report.offer_amount} at the published rate — the
                            collector weighs it and agrees the final amount with you.
                          </span>
                        ) : (
                          <span className="mt-1 block text-ink-soft">
                            The collector will weigh it and agree a price with you.
                          </span>
                        )}
                      </p>
                    )}
                  </section>
                )}

                {/* Sent to a collector, refused, and handed to the ward. Saying
                    why stops it reading as the report having been ignored. */}
                {report.converted_from === 'recyclable' && (
                  <section className="mt-3 rounded-2xl bg-flag-surface px-4 py-3">
                    <p className="text-[13px] font-bold text-ink">Sent to the corporation instead</p>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-ink-soft">
                      {report.conversion_reason ??
                        'A collector could not take this as recyclable material.'}
                    </p>
                  </section>
                )}

                {/* Before / after once resolved — the payoff of the whole app */}
                {resolved && report.resolution_photo_url && (
                  <section className="mt-5 rounded-2xl bg-card p-4 shadow-card">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined filled text-[22px] text-grass">
                        check_circle
                      </span>
                      <p className="font-display text-[16px] font-bold text-ink">
                        This spot is clean again
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <figure>
                        <img
                          src={report.photo_url ?? ''}
                          alt="Before"
                          className="h-28 w-full rounded-xl object-cover"
                        />
                        <figcaption className="mt-1 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-flag">
                          Before
                        </figcaption>
                      </figure>
                      <figure>
                        <img
                          src={report.resolution_photo_url}
                          alt="After"
                          className="h-28 w-full rounded-xl object-cover"
                        />
                        <figcaption className="mt-1 text-center text-[11px] font-bold uppercase tracking-[0.06em] text-grass">
                          After
                        </figcaption>
                      </figure>
                    </div>
                  </section>
                )}

                {/* Where it is. Opening in Maps is what a citizen actually
                    wants from this card, so the whole snippet is that link. */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="relative mt-4 block h-36 overflow-hidden rounded-2xl border border-line shadow-card"
                >
                  <MapSnippet
                    markers={[
                      {
                        id: report.id,
                        latitude: report.latitude,
                        longitude: report.longitude,
                        status: report.status,
                      },
                    ]}
                    className="h-full w-full"
                    compact
                  />
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-card px-3 py-1 text-[12px] font-semibold text-brand shadow-card">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Open in Maps
                  </span>
                </a>

                {/* AI analysis */}
                <section className="mt-4 rounded-2xl bg-brand-surface p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-brand">
                      auto_awesome
                    </span>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand">
                      AI analysis
                    </p>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-y-2 text-[13px]">
                    <dt className="text-ink-soft">Confidence</dt>
                    <dd className="tnum text-right font-bold text-ink">
                      {report.ai_confidence ?? '—'}%
                    </dd>
                    <dt className="text-ink-soft">Severity</dt>
                    <dd className="text-right font-bold capitalize text-ink">{report.severity}</dd>

                    {/* Reports filed before the analysis asked for volume have
                        no answer — say so rather than printing 0 L. */}
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

                    <dt className="text-ink-soft">Recyclable</dt>
                    <dd className="text-right font-bold text-ink">
                      {report.stream === 'recyclable' ? 'Yes' : 'No'}
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
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {report.detected_items.map((i) => (
                        <span key={i} className="rounded-full bg-card px-2.5 py-1 text-[11px] text-brand">
                          {i}
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                {report.assigned_team && (
                  <section className="mt-3 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-grass-surface">
                      <span className="material-symbols-outlined text-[20px] text-grass">groups</span>
                    </span>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                        Assigned team
                      </p>
                      <p className="text-[14px] font-bold text-ink">{report.assigned_team}</p>
                    </div>
                  </section>
                )}

                {/* Timeline */}
                {!!timeline.length && (
                  <section className="mt-5">
                    <h2 className="font-display text-[16px] font-bold text-ink">Progress</h2>
                    <ol className="mt-3">
                      {timeline.map((e, i) => {
                        const last = i === timeline.length - 1;
                        return (
                          <li key={`${e.type}-${e.at}-${i}`} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                  last ? 'bg-brand text-white' : 'bg-grass text-white'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[17px]">
                                  {STEP_ICON[e.type] ?? 'circle'}
                                </span>
                              </span>
                              {!last && <span className="h-full w-0.5 flex-1 bg-line" />}
                            </div>
                            <div className={last ? 'pb-1' : 'pb-5'}>
                              <p className="text-[14px] font-bold text-ink">{e.title}</p>
                              {e.body && <p className="text-[13px] text-ink-soft">{e.body}</p>}
                              <p className="mt-0.5 text-[11px] text-ink-faint">
                                {e.at_human}
                                {e.actor ? ` · ${e.actor}` : ''}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                )}

                {/* Rating, once resolved */}
                {resolved && (
                  <section className="mt-5 rounded-2xl bg-card p-4 shadow-card">
                    <p className="font-display text-[15px] font-bold text-ink">
                      How was the clean-up?
                    </p>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          disabled={savingRating}
                          onClick={() => submitRating(n)}
                          aria-label={`${n} star${n > 1 ? 's' : ''}`}
                          className="active:scale-90 transition-transform"
                        >
                          <span
                            className={`material-symbols-outlined text-[30px] ${
                              n <= rating ? 'filled text-flag' : 'text-line'
                            }`}
                          >
                            star
                          </span>
                        </button>
                      ))}
                    </div>
                    {!report.rating && (
                      <textarea
                        rows={2}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Leave a comment (optional)"
                        className="mt-3 w-full rounded-[14px] border border-line bg-card px-3 py-2 text-[13px] text-ink focus:border-brand focus:outline-none focus:ring-0"
                      />
                    )}
                    {!!report.rating && (
                      <p className="mt-2 text-[12px] text-grass">Thanks — feedback recorded.</p>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportDetail;
