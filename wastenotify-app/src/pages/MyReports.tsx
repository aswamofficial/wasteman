import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage, IonRefresher, IonRefresherContent, type RefresherEventDetail } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ActivityTabs from '../components/ActivityTabs';
import TopBar from '../components/TopBar';
import StatusPill from '../components/StatusPill';
import { fetchMyReports, toApiError, type Report, type StatusCounts } from '../lib/api';

const TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'resolved', label: 'Resolved' },
];

const MyReports: React.FC = () => {
  const history = useHistory();
  const [tab, setTab] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [counts, setCounts] = useState<StatusCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchMyReports(tab);
      setReports(data.reports);
      setCounts(data.counts);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async (e: CustomEvent<RefresherEventDetail>) => {
    await load();
    e.detail.complete();
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent />
        </IonRefresher>

        <TopBar title="Activity" />

        <div className="min-h-full bg-canvas px-4 pb-32 pt-3">
          <ActivityTabs active="reports" onNavigate={(to) => history.push(to)} />

          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar">
            {TABS.map((t) => {
              const on = tab === t.key;
              const n = counts ? (counts as unknown as Record<string, number>)[t.key] : undefined;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setTab(t.key);
                    setLoading(true);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
                    on ? 'bg-ink text-white' : 'border border-line bg-card text-ink-soft'
                  }`}
                >
                  {t.label}
                  {n != null && (
                    <span className={on ? 'ml-1.5 text-white/70' : 'ml-1.5 text-ink-faint'}>{n}</span>
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <div role="alert" className="mt-4 rounded-2xl bg-danger-surface px-4 py-3">
              <p className="text-[13px] text-danger">{error}</p>
              <button type="button" onClick={load} className="mt-1 text-[13px] font-bold text-danger underline">
                Try again
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {loading &&
              [0, 1, 2].map((i) => (
                <div key={i} className="flex animate-pulse gap-3 rounded-2xl bg-card p-3 shadow-card">
                  <div className="h-20 w-20 rounded-xl bg-surface-container" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3.5 w-1/2 rounded bg-surface-container" />
                    <div className="h-3 w-3/4 rounded bg-surface-container" />
                  </div>
                </div>
              ))}

            {!loading && !reports.length && !error && (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-card px-6 py-12 text-center">
                <span className="material-symbols-outlined text-[36px] text-ink-faint">inbox</span>
                <p className="font-display text-[17px] font-bold text-ink">Nothing here yet</p>
                <p className="text-[13px] text-ink-soft">
                  {tab === 'all'
                    ? "You haven't filed any reports."
                    : `No ${TABS.find((t) => t.key === tab)?.label.toLowerCase()} reports.`}
                </p>
                <button
                  type="button"
                  onClick={() => history.push('/report/capture')}
                  className="mt-1 rounded-full bg-brand px-5 py-2.5 text-[14px] font-bold text-white"
                >
                  Report waste
                </button>
              </div>
            )}

            {reports.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => history.push(`/reports/${r.id}`)}
                className="flex w-full gap-3 rounded-2xl bg-card p-3 text-left shadow-card active:scale-[0.99] transition-transform"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                  {r.photo_url ? (
                    <img src={r.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-ink-faint">
                      <span className="material-symbols-outlined">image</span>
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <StatusPill status={r.status} label={r.status_label} />
                  <p className="mt-1.5 truncate font-display text-[15px] font-bold text-ink">
                    {r.waste_type ?? 'Awaiting analysis'}
                  </p>
                  <p className="truncate text-[12.5px] text-ink-soft">{r.address}</p>
                  <p className="tnum mt-1 text-[11px] text-ink-faint">
                    {r.reference} · {r.created_for_humans}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </IonContent>
      <BottomNav active="activity" />
    </IonPage>
  );
};

export default MyReports;
