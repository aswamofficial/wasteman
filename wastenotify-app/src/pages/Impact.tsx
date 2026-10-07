import { useCallback, useEffect, useMemo, useState } from 'react';
import { IonContent, IonPage, IonRefresher, IonRefresherContent, type RefresherEventDetail } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ActivityTabs from '../components/ActivityTabs';
import TopBar from '../components/TopBar';
import { fetchStats, toApiError, type StatsPayload } from '../lib/api';

type Scope = 'me' | 'ward' | 'city';

const SCOPES: { key: Scope; label: string }[] = [
  { key: 'me', label: 'Me' },
  { key: 'ward', label: 'My ward' },
  { key: 'city', label: 'City' },
];

/** Series colours, in the order slices are drawn. */
const SERIES = ['bg-brand', 'bg-grass', 'bg-sea', 'bg-iris', 'bg-flag', 'bg-ink-faint'];
const SERIES_HEX = ['#1A73E8', '#34A853', '#00897B', '#5B6ADA', '#F59E0B', '#8A99AE'];

/* --------------------------------------------------------------- trend line */

const TrendChart: React.FC<{ points: { label: string; count: number }[] }> = ({ points }) => {
  const { path, area, max, coords } = useMemo(() => {
    const w = 300;
    const h = 90;
    const peak = Math.max(1, ...points.map((p) => p.count));
    const step = points.length > 1 ? w / (points.length - 1) : w;

    const pts = points.map((p, i) => ({
      x: i * step,
      y: h - (p.count / peak) * (h - 12) - 6,
      ...p,
    }));

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    return {
      path: line,
      area: `${line} L${w},${h} L0,${h} Z`,
      max: peak,
      coords: pts,
    };
  }, [points]);

  return (
    <div>
      <svg viewBox="0 0 300 90" className="h-24 w-full overflow-visible" role="img" aria-label="Reports over time">
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1="0" x2="300" y1={6 + f * 78} y2={6 + f * 78} stroke="#E6EBF2" strokeWidth="1" />
        ))}
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A73E8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1A73E8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trendFill)" />
        <path d={path} fill="none" stroke="#1A73E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((p, i) => (
          <circle
            key={p.label}
            cx={p.x}
            cy={p.y}
            r={i === coords.length - 1 ? 4.5 : 3}
            fill={i === coords.length - 1 ? '#1A73E8' : '#ffffff'}
            stroke="#1A73E8"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between">
        {points.map((p) => (
          <span key={p.label} className="text-[11px] text-ink-faint">
            {p.label}
          </span>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-ink-faint">Peak {max} in a month</p>
    </div>
  );
};

/* ------------------------------------------------------------------ screen */

const Impact: React.FC = () => {
  const history = useHistory();
  const [scope, setScope] = useState<Scope>('me');
  const [data, setData] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await fetchStats(scope));
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async (e: CustomEvent<RefresherEventDetail>) => {
    await load();
    e.detail.complete();
  };

  const s = data?.stats;
  const empty = !loading && !error && s?.reported === 0;

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent />
        </IonRefresher>

        <TopBar title="Activity" />

        <div className="min-h-full bg-canvas px-4 pb-32 pt-3">
          <ActivityTabs active="impact" onNavigate={(to) => history.push(to)} />

          {/* Scope */}
          <div className="mt-4 flex rounded-full bg-brand-surface p-1">
            {SCOPES.map((sc) => (
              <button
                key={sc.key}
                type="button"
                onClick={() => {
                  setScope(sc.key);
                  setLoading(true);
                }}
                className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
                  scope === sc.key ? 'bg-brand text-white' : 'text-brand'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          {error && (
            <div role="alert" className="mt-4 rounded-2xl bg-danger-surface px-4 py-3">
              <p className="text-[13px] text-danger">{error}</p>
              <button type="button" onClick={load} className="mt-1 text-[13px] font-bold text-danger underline">
                Try again
              </button>
            </div>
          )}

          {empty && (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-card px-6 py-12 text-center">
              <span className="material-symbols-outlined text-[36px] text-ink-faint">bar_chart</span>
              <p className="font-display text-[16px] font-bold text-ink">No data yet</p>
              <p className="text-[13px] text-ink-soft">
                File a report and your impact starts showing up here.
              </p>
            </div>
          )}

          {!empty && (
            <>
              {/* Headline */}
              <section className="mt-4 rounded-3xl bg-ink px-5 py-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/60">
                  Total waste cleared
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="tnum font-display text-[40px] font-extrabold leading-none text-white">
                    {loading ? '–' : (data?.headline.cleared_kg ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[16px] font-semibold text-white/70">kg</span>
                </div>
                {!!data && (
                  <span
                    className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold ${
                      data.headline.trend_percent >= 0
                        ? 'bg-grass/25 text-grass'
                        : 'bg-flag/25 text-flag'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {data.headline.trend_percent >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    {data.headline.trend_percent >= 0 ? '+' : ''}
                    {data.headline.trend_percent}% vs last month
                  </span>
                )}
              </section>

              {/* Stat grid */}
              <section className="mt-3 grid grid-cols-2 gap-2.5">
                {[
                  { v: s?.reported ?? 0, l: 'Reports filed', i: 'assignment', t: 'text-brand' },
                  { v: s?.resolved ?? 0, l: 'Resolved', i: 'check_circle', t: 'text-grass' },
                  { v: `${s?.resolution_rate ?? 0}%`, l: 'Resolution rate', i: 'percent', t: 'text-sea' },
                  { v: `${s?.avg_days ?? 0}d`, l: 'Avg. fix time', i: 'schedule', t: 'text-iris' },
                ].map((c) => (
                  <div key={c.l} className="rounded-2xl bg-card p-4 shadow-card">
                    <span className={`material-symbols-outlined text-[20px] ${c.t}`}>{c.i}</span>
                    <p className="tnum mt-1 font-display text-[22px] font-extrabold text-ink">
                      {loading ? '–' : c.v}
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                      {c.l}
                    </p>
                  </div>
                ))}
              </section>

              {/* Waste type breakdown */}
              {!!data?.breakdown.length && (
                <section className="mt-5 rounded-2xl bg-card p-4 shadow-card">
                  <h2 className="font-display text-[16px] font-bold text-ink">Waste types</h2>
                  <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-line">
                    {data.breakdown.map((b, i) => (
                      <span
                        key={b.label}
                        className={SERIES[i % SERIES.length]}
                        style={{ width: `${b.percent}%` }}
                        title={`${b.label} ${b.percent}%`}
                      />
                    ))}
                  </div>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {data.breakdown.map((b, i) => (
                      <li key={b.label} className="flex items-center gap-2 text-[13px]">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: SERIES_HEX[i % SERIES_HEX.length] }}
                        />
                        <span className="flex-1 truncate text-ink-soft">{b.label}</span>
                        <span className="tnum font-bold text-ink">{b.percent}%</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Trend */}
              {!!data?.trend.length && (
                <section className="mt-3 rounded-2xl bg-card p-4 shadow-card">
                  <h2 className="font-display text-[16px] font-bold text-ink">Reports over time</h2>
                  <div className="mt-3">
                    <TrendChart points={data.trend} />
                  </div>
                </section>
              )}

              {/* Badges */}
              {!!data?.badges.length && (
                <section className="mt-3 rounded-2xl bg-card p-4 shadow-card">
                  <h2 className="font-display text-[16px] font-bold text-ink">Achievements</h2>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {data.badges.map((b) => (
                      <div key={b.key} className="flex flex-col items-center gap-1.5 text-center">
                        <span
                          className={`flex h-14 w-14 items-center justify-center rounded-full ${
                            b.earned ? 'bg-brand-surface text-brand' : 'bg-surface-container text-ink-faint'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[26px]">{b.icon}</span>
                        </span>
                        <span
                          className={`text-[11px] font-semibold leading-tight ${
                            b.earned ? 'text-ink' : 'text-ink-faint'
                          }`}
                        >
                          {b.label}
                        </span>
                        {!b.earned && (
                          <span className="tnum text-[10px] text-ink-faint">{b.progress}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </IonContent>
      <BottomNav active="activity" />
    </IonPage>
  );
};

export default Impact;
