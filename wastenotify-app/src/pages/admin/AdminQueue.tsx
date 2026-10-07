import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IonContent, IonPage, IonRefresher, IonRefresherContent, type RefresherEventDetail } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import AdminShell from '../../components/admin/AdminShell';
import StatusPill from '../../components/StatusPill';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAdminQueue,
  toApiError,
  type AdminScope,
  type AdminStats,
  type Report,
  type StatusCounts,
} from '../../lib/api';

const FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'all', label: 'All' },
];

const SEVERITY: Record<string, string> = {
  high: 'bg-flag-surface text-flag',
  medium: 'bg-brand-surface text-brand',
  low: 'bg-grass-surface text-grass-dark',
};

const Kpi: React.FC<{ value: string; label: string; tone: string }> = ({ value, label, tone }) => (
  <div className="rounded-2xl bg-card p-3 shadow-card">
    <p className={`tnum font-display text-[22px] font-extrabold ${tone}`}>{value}</p>
    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
      {label}
    </p>
  </div>
);

const AdminQueue: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [term, setTerm] = useState('');
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [counts, setCounts] = useState<StatusCounts | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [scope, setScope] = useState<AdminScope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * The URL is the single source of truth for the filters. The dashboard's
   * alert tiles link here as `?overdue=1` / `?unassigned=1`; without reading
   * the query they landed on an unfiltered list that silently contradicted the
   * count they were clicked from. Chips write the same query, so a filtered
   * view is shareable and survives a reload.
   *
   * Derived during render rather than mirrored into state: copying it in an
   * effect meant the first render fetched the *default* filter and the
   * corrected fetch raced it — the deep link showed its chip active while the
   * list underneath was whatever resolved last.
   */
  const { status, overdueOnly, unassignedOnly, mineOnly } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const overdue = params.get('overdue') === '1';
    const unassigned = params.get('unassigned') === '1';
    const mine = params.get('mine') === '1';

    return {
      overdueOnly: overdue,
      unassignedOnly: unassigned,
      mineOnly: mine,
      // These flags all mean "open work", so a status chip would fight them.
      status: params.get('status') ?? (overdue || unassigned || mine ? 'all' : 'pending'),
    };
  }, [location.search]);

  // Typing shouldn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setQuery(term.trim()), 350);
    return () => clearTimeout(t);
  }, [term]);

  // Guards against a slow earlier response overwriting a newer one.
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const mine = ++requestId.current;
    try {
      setError(null);
      const data = await fetchAdminQueue({
        // A search runs across every status. Scoping it to the active chip
        // means typing a reference that is sitting in another tab returns
        // "nothing matches", which reads as "no such report".
        status: query ? 'all' : status,
        overdue: overdueOnly,
        unassigned: unassignedOnly,
        mine: mineOnly,
        q: query,
        sort: 'oldest',
      });
      if (mine !== requestId.current) return;
      setReports(data.reports);
      setCounts(data.counts);
      setStats(data.stats);
      setScope(data.scope);
    } catch (err) {
      if (mine !== requestId.current) return;
      setError(toApiError(err).message);
    } finally {
      if (mine === requestId.current) setLoading(false);
    }
  }, [status, overdueOnly, unassignedOnly, mineOnly, query]);

  useEffect(() => {
    load();
  }, [load]);

  const applyFilter = (next: {
    status?: string;
    overdue?: boolean;
    unassigned?: boolean;
    mine?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (next.overdue) params.set('overdue', '1');
    if (next.unassigned) params.set('unassigned', '1');
    if (next.mine) params.set('mine', '1');
    if (next.status) params.set('status', next.status);

    setLoading(true);
    // `replace`, not `push` — filtering isn't a place you want Back to unwind
    // one chip at a time.
    history.replace(`/admin/complaints${params.toString() ? `?${params}` : ''}`);
  };

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

        <AdminShell scope={scope}>
          {/* Mobile header. Hidden on desktop, where AdminShell's sidebar and
              top bar carry the same information. */}
          <header className="rounded-b-3xl bg-ink px-4 pb-6 pt-5 lg:hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/60">
                  Operational view
                </p>
                {/* Comes from the API's `scope`, which reflects the filter the
                    query actually applied. Previously this rendered the admin's
                    own ward while the query returned the whole city. */}
                <h1 className="mt-1 font-display text-[22px] font-extrabold text-white">
                  {scope?.type === 'ward' && scope.ward
                    ? scope.ward.label
                    : 'All wards — Coimbatore'}
                </h1>
                <p className="text-[13px] text-white/70">{user?.name}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  history.replace('/login');
                }}
                className="rounded-full border border-white/25 px-3 py-1.5 text-[12px] font-semibold text-white active:scale-95"
              >
                Sign out
              </button>
            </div>
          </header>

          <div className="px-4 lg:px-6 lg:pt-6">
            {!!stats?.overdue && !overdueOnly && (
              <button
                type="button"
                onClick={() => applyFilter({ overdue: true })}
                className="-mt-4 flex w-full items-center gap-3 rounded-2xl bg-flag-surface px-4 py-3 shadow-card active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[22px] text-flag">warning</span>
                <span className="flex-1 text-left text-[13.5px] font-bold text-ink">
                  {stats.overdue} report{stats.overdue === 1 ? '' : 's'} overdue (
                  {stats.overdue_threshold_days}+ days)
                </span>
                <span className="material-symbols-outlined text-[20px] text-flag">chevron_right</span>
              </button>
            )}

            <section className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-5">
              <Kpi value={String(stats?.new_today ?? 0)} label="New today" tone="text-flag" />
              <Kpi value={String(stats?.in_progress ?? 0)} label="In progress" tone="text-brand" />
              <Kpi value={String(stats?.unassigned ?? 0)} label="Unassigned" tone="text-iris" />
              <Kpi
                value={String(stats?.resolved_this_month ?? 0)}
                label="Resolved this month"
                tone="text-grass"
              />
              <Kpi
                value={`${stats?.avg_resolution_days ?? 0}d`}
                label="Avg. resolution"
                tone="text-ink"
              />
            </section>

            <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-center">
              {/* Dimmed while searching, because the search deliberately
                  ignores them rather than silently narrowing the results. */}
              <div
                className={`-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar ${
                  query ? 'opacity-40' : ''
                }`}
              >
                {FILTERS.map((f) => {
                  const on =
                    !query && status === f.key && !overdueOnly && !unassignedOnly && !mineOnly;
                  const n = counts ? (counts as unknown as Record<string, number>)[f.key] : undefined;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => applyFilter({ status: f.key })}
                      className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
                        on ? 'bg-ink text-white' : 'border border-line bg-card text-ink-soft'
                      }`}
                    >
                      {f.label}
                      {n != null && (
                        <span className={on ? 'ml-1.5 text-white/70' : 'ml-1.5 text-ink-faint'}>
                          {n}
                        </span>
                      )}
                    </button>
                  );
                })}

                <span className="shrink-0 self-center px-1 text-line">|</span>

                {/* An officer's own work. Previously they got the whole ward
                    and had to scan every row for their own name. */}
                <button
                  type="button"
                  onClick={() => applyFilter({ mine: !mineOnly })}
                  aria-pressed={mineOnly}
                  className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
                    mineOnly ? 'bg-brand text-white' : 'border border-line bg-card text-ink-soft'
                  }`}
                >
                  Mine
                  {stats != null && (
                    <span className={mineOnly ? 'ml-1.5 text-white/70' : 'ml-1.5 text-ink-faint'}>
                      {stats.mine}
                    </span>
                  )}
                  {mineOnly && ' ✕'}
                </button>

                {/* Both of these mean "open work needing a decision", so they
                    sit apart from the status chips rather than among them. */}
                <button
                  type="button"
                  onClick={() => applyFilter({ overdue: !overdueOnly })}
                  aria-pressed={overdueOnly}
                  className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
                    overdueOnly ? 'bg-flag text-white' : 'border border-line bg-card text-ink-soft'
                  }`}
                >
                  Overdue
                  {stats != null && (
                    <span className={overdueOnly ? 'ml-1.5 text-white/70' : 'ml-1.5 text-ink-faint'}>
                      {stats.overdue}
                    </span>
                  )}
                  {overdueOnly && ' ✕'}
                </button>
                <button
                  type="button"
                  onClick={() => applyFilter({ unassigned: !unassignedOnly })}
                  aria-pressed={unassignedOnly}
                  className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
                    unassignedOnly ? 'bg-iris text-white' : 'border border-line bg-card text-ink-soft'
                  }`}
                >
                  Unassigned
                  {stats != null && (
                    <span
                      className={unassignedOnly ? 'ml-1.5 text-white/70' : 'ml-1.5 text-ink-faint'}
                    >
                      {stats.unassigned}
                    </span>
                  )}
                  {unassignedOnly && ' ✕'}
                </button>
              </div>

              <div className="relative shrink-0 lg:w-72">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-ink-faint">
                  search
                </span>
                <input
                  type="search"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Reference, address or waste type"
                  aria-label="Search complaints"
                  className="w-full rounded-full border border-line bg-card py-2 pl-10 pr-3 text-[13px] text-ink focus:border-brand focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-4 rounded-2xl bg-danger-surface px-4 py-3">
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}

            {loading && <p className="mt-8 text-center text-[14px] text-ink-soft">Loading queue…</p>}

            {!loading && !reports.length && !error && (
              <p className="mt-10 text-center text-[14px] text-ink-soft">
                {query
                  ? `Nothing matches “${query}” in any status.`
                  : overdueOnly
                    ? 'Nothing is overdue. Good.'
                    : unassignedOnly
                      ? 'Everything open has an owner.'
                      : mineOnly
                        ? 'Nothing is assigned to you.'
                        : 'Nothing in this queue. Good.'}
              </p>
            )}

            <div className="mt-3 grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              {reports.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => history.push(`/admin/reports/${r.id}`)}
                  className="flex w-full gap-3 rounded-2xl bg-card p-3 text-left shadow-card active:scale-[0.99] transition-transform"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                    {r.photo_url && (
                      <img src={r.photo_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          SEVERITY[r.severity] ?? SEVERITY.medium
                        }`}
                      >
                        {r.severity}
                      </span>
                      <StatusPill status={r.status} label={r.status_label} />
                      {/* Severity and waste type on this row come from the
                          classifier. If that wasn't a real model, say so here
                          rather than only on the detail screen — the triage
                          decision is often made from the list. */}
                      {!r.ai_trusted && r.waste_type && (
                        <span
                          title="Classification not produced by a vision model"
                          className="flex items-center gap-0.5 rounded-full bg-flag-surface px-1.5 py-0.5 text-[10px] font-bold uppercase text-flag"
                        >
                          <span className="material-symbols-outlined text-[12px]">help</span>
                          unverified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate font-display text-[14.5px] font-bold text-ink">
                      {r.waste_type ?? 'Awaiting analysis'}
                    </p>
                    <p className="truncate text-[12px] text-ink-soft">{r.address}</p>
                    <p className="tnum mt-0.5 text-[11px] text-ink-faint">
                      {r.reference} · {r.created_for_humans}
                    </p>
                  </div>
                  <span className="material-symbols-outlined self-center text-ink-faint">
                    chevron_right
                  </span>
                  {/* Ward is only shown for a city-wide admin — for a
                      ward-scoped one it would repeat on every row. */}
                  {scope?.type === 'city' && r.ward && (
                    <span className="hidden shrink-0 self-center rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-ink-soft lg:inline">
                      W{r.ward.ward_no}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="h-8" />
          </div>
        </AdminShell>
      </IonContent>
    </IonPage>
  );
};

export default AdminQueue;
