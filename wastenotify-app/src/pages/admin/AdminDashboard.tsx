import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AdminShell from '../../components/admin/AdminShell';
import StatusPill from '../../components/StatusPill';
import {
  fetchAdminDashboard,
  toApiError,
  type AdminDashboard as Payload,
  type DashboardRange,
} from '../../lib/api';

const SEVERITY_TONE: Record<string, string> = {
  high: 'bg-flag',
  medium: 'bg-brand',
  low: 'bg-grass',
};

const RANGES: DashboardRange[] = [7, 14, 30];

/** Timeline event type → the icon and tone the feed shows it with. */
const EVENT_STYLE: Record<string, { icon: string; tone: string }> = {
  submitted: { icon: 'add_a_photo', tone: 'bg-brand-surface text-brand' },
  analysed: { icon: 'auto_awesome', tone: 'bg-iris-surface text-iris' },
  assigned: { icon: 'person_add', tone: 'bg-iris-surface text-iris' },
  in_progress: { icon: 'engineering', tone: 'bg-brand-surface text-brand' },
  resolved: { icon: 'check_circle', tone: 'bg-grass-surface text-grass-dark' },
  rejected: { icon: 'block', tone: 'bg-danger-surface text-danger' },
  note: { icon: 'sticky_note_2', tone: 'bg-surface-container text-ink-soft' },
  escalated: { icon: 'priority_high', tone: 'bg-danger-surface text-danger' },
};

/**
 * Period-on-period change.
 *
 * Direction alone isn't meaning: more reports coming in is not the same kind of
 * "up" as more reports being closed, so the caller says which way is good.
 */
const Delta: React.FC<{ value: number; goodWhen: 'up' | 'down' }> = ({ value, goodWhen }) => {
  if (value === 0) {
    return <span className="text-[11.5px] font-semibold text-ink-faint">no change</span>;
  }

  const up = value > 0;
  const good = up === (goodWhen === 'up');

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11.5px] font-bold ${
        good ? 'text-grass-dark' : 'text-flag'
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">
        {up ? 'trending_up' : 'trending_down'}
      </span>
      <span className="tnum">
        {up ? '+' : ''}
        {value}%
      </span>
    </span>
  );
};

const StatCard: React.FC<{
  value: string | number;
  label: string;
  icon: string;
  tone: string;
  sub?: React.ReactNode;
  onClick?: () => void;
}> = ({ value, label, icon, tone, sub, onClick }) => {
  const body = (
    <>
      <div className="flex items-start justify-between">
        <span className={`material-symbols-outlined text-[20px] ${tone}`}>{icon}</span>
        {onClick && (
          <span className="material-symbols-outlined text-[18px] text-ink-faint">chevron_right</span>
        )}
      </div>
      <p className="tnum mt-1 font-display text-[26px] font-extrabold leading-none text-ink">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
        {label}
      </p>
      {sub && <div className="mt-1 min-h-[17px]">{sub}</div>}
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl bg-card p-4 text-left shadow-card active:scale-[0.99]"
    >
      {body}
    </button>
  ) : (
    <div className="rounded-2xl bg-card p-4 shadow-card">{body}</div>
  );
};

/** Intake vs clearance — the only real "are we keeping up" signal. */
const TrendChart: React.FC<{ points: Payload['trend'] }> = ({ points }) => {
  const peak = Math.max(1, ...points.flatMap((p) => [p.reported, p.resolved]));
  // Only every nth day gets a label, or a 30-day range turns the axis to mush.
  const step = Math.ceil(points.length / 7);

  return (
    <div>
      <div className="relative">
        {/* Gridlines give the bars a scale to be read against. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32">
          {[0, 0.5, 1].map((f) => (
            <div
              key={f}
              className="absolute inset-x-0 border-t border-dashed border-line"
              style={{ top: `${f * 100}%` }}
            />
          ))}
        </div>
        <span className="tnum absolute -top-1 right-0 text-[10px] text-ink-faint">{peak}</span>

        <div className="relative flex h-32 items-end gap-[3px]">
          {points.map((p) => (
            <div key={p.label} className="flex h-full flex-1 items-end justify-center gap-[2px]">
              <span
                className="w-1/2 rounded-t bg-brand"
                style={{ height: `${(p.reported / peak) * 100}%`, minHeight: p.reported ? 2 : 0 }}
                title={`${p.label}: ${p.reported} reported`}
              />
              <span
                className="w-1/2 rounded-t bg-grass"
                style={{ height: `${(p.resolved / peak) * 100}%`, minHeight: p.resolved ? 2 : 0 }}
                title={`${p.label}: ${p.resolved} resolved`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-1.5 flex gap-[3px]">
        {points.map((p, i) => (
          <span key={p.label} className="flex-1 text-center text-[9.5px] text-ink-faint">
            {i % step === 0 ? p.label.split(' ')[0] : ''}
          </span>
        ))}
      </div>

      <div className="mt-2 flex gap-4 text-[11.5px]">
        <span className="flex items-center gap-1.5 text-ink-soft">
          <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Reported
        </span>
        <span className="flex items-center gap-1.5 text-ink-soft">
          <span className="h-2.5 w-2.5 rounded-full bg-grass" /> Resolved
        </span>
      </div>
    </div>
  );
};

/**
 * How long open work has been sitting. An "open" count on its own says nothing
 * about whether it's fresh or rotting; this is the part a ward officer acts on.
 */
const AgingBar: React.FC<{
  aging: Payload['aging'];
  thresholdDays: number;
  onOverdue: () => void;
}> = ({ aging, thresholdDays, onOverdue }) => {
  const total = aging.fresh + aging.watch + aging.overdue;
  const bands = [
    { key: 'fresh', label: 'Under 2 days', n: aging.fresh, bar: 'bg-grass', dot: 'bg-grass' },
    {
      key: 'watch',
      label: `2–${thresholdDays} days`,
      n: aging.watch,
      bar: 'bg-flag',
      dot: 'bg-flag',
    },
    {
      key: 'overdue',
      label: `Over ${thresholdDays} days`,
      n: aging.overdue,
      bar: 'bg-danger',
      dot: 'bg-danger',
    },
  ];

  if (!total) {
    return <p className="py-4 text-[13px] text-ink-soft">Nothing open — nothing aging.</p>;
  }

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-line">
        {bands.map((b) => (
          <span
            key={b.key}
            className={b.bar}
            style={{ width: `${(b.n / total) * 100}%` }}
            title={`${b.n} ${b.label.toLowerCase()}`}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {bands.map((b) => (
          <li key={b.key} className="flex items-center gap-2 text-[13px]">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${b.dot}`} />
            <span className="flex-1 text-ink-soft">{b.label}</span>
            <span className="tnum font-bold text-ink">{b.n}</span>
          </li>
        ))}
      </ul>
      {!!aging.overdue && (
        <button
          type="button"
          onClick={onOverdue}
          className="mt-3 w-full rounded-full bg-danger-surface py-2 text-[12.5px] font-bold text-danger active:scale-[0.99]"
        >
          Open the {aging.overdue} overdue
        </button>
      )}
    </div>
  );
};

/** Share of closed reports that met the configured target. */
const SlaRing: React.FC<{ sla: Payload['sla']; targetDays: number }> = ({ sla, targetDays }) => {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const pct = sla.percent ?? 0;
  const tone = pct >= 80 ? 'text-grass' : pct >= 50 ? 'text-flag' : 'text-danger';

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[86px] w-[86px] shrink-0">
        <svg viewBox="0 0 86 86" className="h-full w-full -rotate-90">
          <circle cx="43" cy="43" r={r} className="stroke-line" strokeWidth="9" fill="none" />
          {sla.percent != null && (
            <circle
              cx="43"
              cy="43"
              r={r}
              className={`${tone} stroke-current`}
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Null is "nothing has closed yet", which is not the same claim as 0%. */}
          <span className="tnum font-display text-[19px] font-extrabold text-ink">
            {sla.percent != null ? `${sla.percent}%` : '—'}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink">Resolved within {targetDays} days</p>
        {sla.percent != null ? (
          <p className="tnum mt-0.5 text-[12.5px] text-ink-soft">
            {sla.within_target} of {sla.resolved_total} closed reports
          </p>
        ) : (
          <p className="mt-0.5 text-[12.5px] text-ink-soft">
            No reports closed yet, so there is nothing to measure.
          </p>
        )}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const history = useHistory();
  const [range, setRange] = useState<DashboardRange>(14);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setError(null);
      setData(await fetchAdminDashboard(range));
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const h = data?.headline;

  /** The counts that mean "someone has to act", each opening its own queue. */
  const alerts = [
    {
      key: 'overdue',
      show: !!h?.overdue,
      tone: 'bg-danger-surface',
      icon: 'warning',
      iconTone: 'text-danger',
      text: `${h?.overdue} overdue — untouched for ${h?.overdue_threshold_days}+ days`,
      to: '/admin/complaints?overdue=1',
    },
    {
      key: 'unassigned',
      show: !!h?.unassigned,
      tone: 'bg-iris-surface',
      icon: 'person_off',
      iconTone: 'text-iris',
      text: `${h?.unassigned} open with nobody assigned`,
      to: '/admin/complaints?unassigned=1',
    },
  ].filter((a) => a.show);

  return (
    <IonPage>
      <IonContent fullscreen>
        <AdminShell
          scope={data?.scope ?? null}
          title="Dashboard"
          actions={
            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-line p-0.5">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    aria-pressed={range === r}
                    className={`tnum rounded-full px-2.5 py-1 text-[12px] font-bold ${
                      range === r ? 'bg-ink text-white' : 'text-ink-soft'
                    }`}
                  >
                    {r}d
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={load}
                disabled={refreshing}
                className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          }
        >
          <div className="px-4 pb-12 pt-4 lg:px-6 lg:pt-6">
            {error && (
              <div role="alert" className="rounded-2xl bg-danger-surface px-4 py-3">
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}
            {loading && <p className="py-10 text-center text-[14px] text-ink-soft">Loading…</p>}

            {data && h && (
              <>
                {!!alerts.length && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {alerts.map((a) => (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() => history.push(a.to)}
                        className={`flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-left active:scale-[0.99] ${a.tone}`}
                      >
                        <span className={`material-symbols-outlined text-[22px] ${a.iconTone}`}>
                          {a.icon}
                        </span>
                        <span className="flex-1 text-[13.5px] font-bold text-ink">{a.text}</span>
                        <span className="material-symbols-outlined text-[20px] text-ink-soft">
                          chevron_right
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Standing position: what is open right now. */}
                <section className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                  <StatCard
                    value={h.open}
                    label="Open now"
                    icon="inbox"
                    tone="text-brand"
                    onClick={() => history.push('/admin/complaints?status=all')}
                    sub={
                      <span className="tnum text-[11.5px] text-ink-faint">
                        {data.aging.fresh} fresh · {data.aging.watch} ageing
                      </span>
                    }
                  />
                  <StatCard
                    value={h.overdue}
                    label="Overdue"
                    icon="schedule"
                    tone="text-danger"
                    onClick={() => history.push('/admin/complaints?overdue=1')}
                    sub={
                      <span className="text-[11.5px] text-ink-faint">
                        over {h.overdue_threshold_days} days
                      </span>
                    }
                  />
                  <StatCard
                    value={h.unassigned}
                    label="Unassigned"
                    icon="person_off"
                    tone="text-iris"
                    onClick={() => history.push('/admin/complaints?unassigned=1')}
                    sub={<span className="text-[11.5px] text-ink-faint">nobody accountable</span>}
                  />
                  <StatCard
                    value={`${h.avg_resolution_days}d`}
                    label="Avg. resolution"
                    icon="timer"
                    tone="text-ink"
                    sub={
                      <span className="text-[11.5px] text-ink-faint">
                        target {h.target_days} days
                      </span>
                    }
                  />
                </section>

                {/* Flow over the selected window, each against the window before it. */}
                <section className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <StatCard
                    value={h.reported_period}
                    label={`Reported · ${range}d`}
                    icon="photo_camera"
                    tone="text-brand"
                    sub={<Delta value={h.reported_delta} goodWhen="down" />}
                  />
                  <StatCard
                    value={h.resolved_period}
                    label={`Resolved · ${range}d`}
                    icon="task_alt"
                    tone="text-grass"
                    sub={<Delta value={h.resolved_delta} goodWhen="up" />}
                  />
                  <StatCard
                    value={`${h.backlog_change > 0 ? '+' : ''}${h.backlog_change}`}
                    label={`Backlog change · ${range}d`}
                    icon={h.backlog_change > 0 ? 'moving' : 'trending_down'}
                    tone={h.backlog_change > 0 ? 'text-flag' : 'text-grass'}
                    sub={
                      <span className="text-[11.5px] text-ink-faint">
                        {h.backlog_change > 0
                          ? 'coming in faster than clearing'
                          : h.backlog_change < 0
                            ? 'clearing faster than coming in'
                            : 'holding level'}
                      </span>
                    }
                  />
                </section>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <section className="rounded-2xl bg-card p-4 shadow-card lg:col-span-2">
                    <h2 className="font-display text-[16px] font-bold text-ink">
                      Intake vs clearance — {range} days
                    </h2>
                    <p className="text-[12px] text-ink-faint">
                      Bars above the other side mean the backlog is moving that way.
                    </p>
                    <div className="mt-3">
                      <TrendChart points={data.trend} />
                    </div>
                  </section>

                  <section className="rounded-2xl bg-card p-4 shadow-card">
                    <h2 className="font-display text-[16px] font-bold text-ink">Open work by age</h2>
                    <div className="mt-3">
                      <AgingBar
                        aging={data.aging}
                        thresholdDays={h.overdue_threshold_days}
                        onOverdue={() => history.push('/admin/complaints?overdue=1')}
                      />
                    </div>

                    <h2 className="mt-5 font-display text-[16px] font-bold text-ink">
                      Service level
                    </h2>
                    <div className="mt-3">
                      <SlaRing sla={data.sla} targetDays={h.target_days} />
                    </div>
                  </section>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <section className="rounded-2xl bg-card p-4 shadow-card">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-[16px] font-bold text-ink">
                        Needs attention
                      </h2>
                      <button
                        type="button"
                        onClick={() => history.push('/admin/complaints')}
                        className="text-[13px] font-semibold text-brand"
                      >
                        All complaints
                      </button>
                    </div>
                    <p className="text-[12px] text-ink-faint">Oldest still open.</p>
                    <div className="mt-3 flex flex-col gap-2">
                      {!data.needs_attention.length && (
                        <p className="py-6 text-center text-[13px] text-ink-soft">
                          Nothing open. Good.
                        </p>
                      )}
                      {data.needs_attention.map((r) => (
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
                            <p className="tnum truncate text-[11.5px] text-ink-faint">
                              {r.reference} · {r.created_for_humans}
                            </p>
                          </div>
                          <StatusPill status={r.status} label={r.status_label} />
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl bg-card p-4 shadow-card">
                    <h2 className="font-display text-[16px] font-bold text-ink">Recent activity</h2>
                    <p className="text-[12px] text-ink-faint">
                      What has actually happened, not just what is standing.
                    </p>
                    <ul className="mt-3 flex flex-col gap-1">
                      {!data.recent_activity.length && (
                        <li className="py-6 text-center text-[13px] text-ink-soft">
                          No activity yet.
                        </li>
                      )}
                      {data.recent_activity.map((e, i) => {
                        const style = EVENT_STYLE[e.type] ?? {
                          icon: 'radio_button_checked',
                          tone: 'bg-surface-container text-ink-soft',
                        };
                        return (
                          <li key={`${e.report_id}-${i}`}>
                            <button
                              type="button"
                              onClick={() => history.push(`/admin/reports/${e.report_id}`)}
                              className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left hover:bg-surface-container"
                            >
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.tone}`}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {style.icon}
                                </span>
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13.5px] font-semibold text-ink">
                                  {e.title}
                                </span>
                                <span className="tnum block truncate text-[11.5px] text-ink-faint">
                                  {e.reference}
                                  {/* Actor is null for citizen-side and automatic
                                      events — left blank rather than attributed
                                      to someone who didn't do it. */}
                                  {e.actor ? ` · ${e.actor}` : ''} · {e.at_human}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <section className="rounded-2xl bg-card p-4 shadow-card">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-[16px] font-bold text-ink">Team workload</h2>
                      <button
                        type="button"
                        onClick={() => history.push('/admin/users')}
                        className="text-[13px] font-semibold text-brand"
                      >
                        Manage
                      </button>
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      {!data.workload.length && (
                        <p className="py-6 text-center text-[13px] text-ink-soft">
                          No staff assigned to this ward yet.
                        </p>
                      )}
                      {data.workload.map((w) => {
                        const peak = Math.max(1, ...data.workload.map((x) => x.open_count));
                        return (
                          <div key={w.id} className="flex items-center gap-3">
                            <span className="w-28 shrink-0 truncate text-[13px] text-ink">
                              {w.name}
                            </span>
                            <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                              <span
                                className="block h-full rounded-full bg-brand"
                                style={{ width: `${(w.open_count / peak) * 100}%` }}
                              />
                            </span>
                            <span className="tnum w-6 text-right text-[13px] font-bold text-ink">
                              {w.open_count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="rounded-2xl bg-card p-4 shadow-card">
                    <h2 className="font-display text-[16px] font-bold text-ink">Open by severity</h2>
                    <ul className="mt-3 flex flex-col gap-2">
                      {(['high', 'medium', 'low'] as const).map((s) => {
                        const n = Number(data.by_severity?.[s] ?? 0);
                        const total = Math.max(
                          1,
                          Object.values(data.by_severity ?? {}).reduce((a, b) => a + Number(b), 0),
                        );
                        return (
                          <li key={s}>
                            <div className="flex items-center justify-between text-[13px]">
                              <span className="capitalize text-ink-soft">{s}</span>
                              <span className="tnum font-bold text-ink">{n}</span>
                            </div>
                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-line">
                              <span
                                className={`block h-full rounded-full ${SEVERITY_TONE[s]}`}
                                style={{ width: `${(n / total) * 100}%` }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    <h2 className="mt-5 font-display text-[16px] font-bold text-ink">
                      Open by waste type
                    </h2>
                    {/* Named before the chart, not after it — someone reading
                        these totals should know what they rest on before they
                        act on them. */}
                    {!!data.classification.unverified && (
                      <p className="mt-1 flex items-start gap-1 text-[11.5px] leading-snug text-flag">
                        <span className="material-symbols-outlined text-[14px]">help</span>
                        <span>
                          {data.classification.unverified} of {data.classification.analysed}{' '}
                          classified by the offline stand-in, not a vision model.
                        </span>
                      </p>
                    )}
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {!data.by_waste_type.length && (
                        <li className="text-[13px] text-ink-soft">Nothing open.</li>
                      )}
                      {data.by_waste_type.map((t) => (
                        <li key={t.label} className="flex justify-between gap-3 text-[13px]">
                          <span className="truncate text-ink-soft">{t.label}</span>
                          <span className="tnum font-bold text-ink">{t.count}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-2xl bg-card p-4 shadow-card">
                    <h2 className="font-display text-[16px] font-bold text-ink">Coverage</h2>
                    <dl className="mt-3 flex flex-col gap-2.5 text-[13px]">
                      <div className="flex justify-between">
                        <dt className="text-ink-soft">Wards with staff</dt>
                        <dd className="tnum font-bold text-ink">
                          {data.coverage.wards_with_staff} / {data.coverage.wards_total}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-soft">Registered citizens</dt>
                        <dd className="tnum font-bold text-ink">{data.coverage.citizens}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-soft">Resolved this month</dt>
                        <dd className="tnum font-bold text-ink">{h.resolved_this_month}</dd>
                      </div>
                    </dl>

                    {data.coverage.wards_with_staff < data.coverage.wards_total && (
                      <button
                        type="button"
                        onClick={() => history.push('/admin/users')}
                        className="mt-3 w-full rounded-full bg-brand-surface py-2 text-[12.5px] font-bold text-brand active:scale-[0.99]"
                      >
                        {data.coverage.wards_total - data.coverage.wards_with_staff} wards have no
                        staff
                      </button>
                    )}

                    <h2 className="mt-5 font-display text-[16px] font-bold text-ink">
                      All-time status
                    </h2>
                    <ul className="mt-2 flex flex-col gap-1.5 text-[13px]">
                      {(
                        [
                          ['pending', 'Pending'],
                          ['in_progress', 'In progress'],
                          ['resolved', 'Resolved'],
                          ['rejected', 'Rejected'],
                        ] as const
                      ).map(([k, label]) => (
                        <li key={k} className="flex justify-between">
                          <span className="text-ink-soft">{label}</span>
                          <span className="tnum font-bold text-ink">{data.by_status[k]}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </>
            )}
          </div>
        </AdminShell>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;
