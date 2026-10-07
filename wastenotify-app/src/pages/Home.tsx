import { useCallback, useEffect, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  type RefresherEventDetail,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import MapSnippet from '../components/MapSnippet';
import { MenuButton } from '../components/SideMenu';
import StatusPill from '../components/StatusPill';
import { useAuth } from '../context/AuthContext';
import { fetchDashboard, toApiError, type DashboardPayload, type Report } from '../lib/api';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
};

/* ------------------------------------------------------------ section head */

const SectionHead: React.FC<{
  icon: string;
  title: string;
  action?: string;
  onAction?: () => void;
}> = ({ icon, title, action, onAction }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined filled text-[20px] text-brand">{icon}</span>
      <h2 className="font-display text-[17px] font-bold text-ink">{title}</h2>
    </div>
    {action && (
      <button
        type="button"
        onClick={onAction}
        className="flex items-center gap-0.5 text-[14px] font-semibold text-brand active:opacity-70"
      >
        {action}
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    )}
  </div>
);

/* -------------------------------------------------------------- stat cards */

interface StatSpec {
  icon: string;
  value: number;
  unit?: string;
  label: string;
  caption: string;
  /** Tailwind classes for the card tint, icon chip and progress fill. */
  tint: string;
  chip: string;
  bar: string;
  /** Fraction of the bar to fill, 0–1. */
  fill: number;
}

const StatCard: React.FC<{ spec: StatSpec; loading: boolean }> = ({ spec, loading }) => (
  <div className={`flex flex-col gap-2 rounded-2xl border border-line/70 p-3 ${spec.tint}`}>
    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${spec.chip}`}>
      <span className="material-symbols-outlined text-[20px]">{spec.icon}</span>
    </span>

    <div className="flex items-baseline gap-1">
      <span className="tnum font-display text-[24px] font-extrabold leading-none text-ink">
        {loading ? '–' : spec.value}
      </span>
      {spec.unit && <span className="text-[12px] font-semibold text-ink-soft">{spec.unit}</span>}
    </div>

    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink">{spec.label}</p>
      <p className="text-[11px] leading-tight text-ink-faint">{spec.caption}</p>
    </div>

    <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-line">
      <span
        className={`block h-full rounded-full ${spec.bar}`}
        style={{ width: `${Math.round(Math.max(0.12, Math.min(1, spec.fill)) * 100)}%` }}
      />
    </div>
  </div>
);

/* --------------------------------------------------------- recent activity */

const ReportRow: React.FC<{ report: Report; onOpen: () => void }> = ({ report, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 shadow-card active:scale-[0.99] transition-transform"
  >
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-container">
      {report.photo_url ? (
        /*
         * Deliberately not loading="lazy". Native lazy loading resolves
         * intersection against the document viewport, but in Ionic the
         * document never scrolls — scrolling happens inside ion-content's
         * shadow-DOM .inner-scroll — so these images never enter view and are
         * never fetched at all. The list is capped at 5 thumbnails, so eager
         * loading is cheap. A longer list would need an IntersectionObserver
         * rooted on the scroller.
         */
        <img
          src={report.photo_url}
          alt={report.waste_type ?? 'Reported waste'}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-ink-faint">
          <span className="material-symbols-outlined">image</span>
        </span>
      )}
    </div>
    <div className="min-w-0 flex-grow text-left">
      <p className="truncate font-display text-[15px] font-bold text-ink">
        {report.waste_type ?? 'Awaiting analysis'}
      </p>
      <p className="truncate text-[13px] text-ink-soft">{report.address}</p>
      <p className="mt-0.5 text-[11px] text-ink-faint">{report.created_for_humans}</p>
    </div>
    <StatusPill status={report.status} label={report.status_label} />
  </button>
);

/* ----------------------------------------------------------- quick actions */

const QUICK = [
  { icon: 'photo_camera', label: 'Report\nan issue', tint: 'bg-brand-tint', chip: 'bg-brand', route: '/report/capture' },
  { icon: 'description', label: 'My\nreports', tint: 'bg-grass-tint', chip: 'bg-grass', route: '/reports' },
  { icon: 'notifications', label: 'Notifications', tint: 'bg-iris-tint', chip: 'bg-iris', route: '/notifications' },
  { icon: 'headset_mic', label: 'Helpline', tint: 'bg-sea-tint', chip: 'bg-sea', route: '/profile' },
];

/* ------------------------------------------------------------------ screen */

const Home: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();

  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await fetchDashboard());
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async (e: CustomEvent<RefresherEventDetail>) => {
    await load();
    e.detail.complete();
  };

  const name = data?.user.name ?? user?.name ?? '';
  const ward = data?.user.ward ?? user?.ward ?? null;
  const mine = data?.stats;
  const ward_ = data?.community;

  // Personal progress is shown against the ward total, so the bars mean
  // something rather than being decorative.
  const denom = Math.max(1, ward_?.reported ?? 1);

  const stats: StatSpec[] = [
    {
      icon: 'assignment',
      value: mine?.reported ?? 0,
      label: 'Reported',
      caption: 'Issues raised',
      tint: 'bg-brand-tint',
      chip: 'bg-brand-surface text-brand',
      bar: 'bg-brand',
      fill: (mine?.reported ?? 0) / denom,
    },
    {
      icon: 'check_circle',
      value: mine?.resolved ?? 0,
      label: 'Resolved',
      caption: 'Issues solved',
      tint: 'bg-grass-tint',
      chip: 'bg-grass-surface text-grass',
      bar: 'bg-grass',
      fill: (mine?.resolved ?? 0) / Math.max(1, mine?.reported ?? 1),
    },
    {
      icon: 'delete',
      value: mine?.cleared_kg ?? 0,
      unit: 'kg',
      label: 'Cleared',
      caption: 'Waste removed',
      tint: 'bg-sea-tint',
      chip: 'bg-sea-surface text-sea',
      bar: 'bg-sea',
      fill: (mine?.cleared_kg ?? 0) / Math.max(1, ward_?.cleared_kg ?? 1),
    },
  ];

  const live = [
    { icon: 'location_on', value: ward_?.reported ?? 0, label: 'Reported', tone: 'text-brand', bar: 'bg-brand' },
    { icon: 'check_circle', value: ward_?.resolved ?? 0, label: 'Resolved', tone: 'text-grass', bar: 'bg-grass' },
    { icon: 'local_shipping', value: ward_?.cleared_kg ?? 0, unit: 'kg', label: 'Cleared', tone: 'text-brand', bar: 'bg-brand' },
    { icon: 'schedule', value: ward_?.in_progress ?? 0, label: 'In progress', tone: 'text-grass', bar: 'bg-grass' },
  ];

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="min-h-full bg-canvas px-4 pb-32 pt-5">
          {/* ------------------------------------------------------ header */}
          <header className="flex items-start justify-between">
            <div className="flex items-center gap-1 min-w-0">
              <MenuButton />
              {data?.user.avatar_url ? (
                <img
                  src={data.user.avatar_url}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-light font-display text-[22px] font-bold text-white">
                  {name ? name.charAt(0).toUpperCase() : '?'}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[14px] text-ink-soft">{greeting()}</p>
                <h1 className="truncate font-display text-[26px] font-extrabold leading-tight text-ink">
                  {name || '—'}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => history.push('/notifications')}
              aria-label="Notifications"
              className="relative mt-1 flex h-10 w-10 items-center justify-center rounded-full text-ink active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[26px]">notifications</span>
              {!!data?.unread_notifications && (
                <span className="tnum absolute -right-0.5 top-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-flag px-1 text-[11px] font-bold text-white ring-2 ring-canvas">
                  {data.unread_notifications > 9 ? '9+' : data.unread_notifications}
                </span>
              )}
            </button>
          </header>

          {/* A real ward, or an honest prompt to set one — never a placeholder
              ward number. */}
          <p className="mt-3 flex items-center gap-1.5 text-[15px] font-medium text-ink">
            <span className="material-symbols-outlined filled text-[20px] text-grass">
              location_on
            </span>
            {ward ? (
              <>
                {ward.label}
                <span className="text-[13px] font-normal text-ink-faint">· {ward.town}</span>
              </>
            ) : (
              <button
                type="button"
                onClick={() => history.push('/profile')}
                className="text-[14px] font-semibold text-brand"
              >
                Set your ward
              </button>
            )}
          </p>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-2xl bg-danger-surface px-4 py-3"
            >
              <span className="material-symbols-outlined text-[20px] text-danger">cloud_off</span>
              <div>
                <p className="text-[14px] font-bold text-danger">Couldn't load your dashboard</p>
                <p className="text-[13px] text-danger/90">{error}</p>
                <button
                  type="button"
                  onClick={load}
                  className="mt-1 text-[13px] font-bold text-danger underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------- hero banner */}
          <section className="relative mt-5 overflow-hidden rounded-3xl bg-brand-gradient-r px-5 py-6">
            {/* Decorative leaves — purely ornamental, hidden from screen readers */}
            <svg
              aria-hidden="true"
              viewBox="0 0 160 160"
              className="pointer-events-none absolute -right-4 -top-2 h-40 w-40 text-white/25"
            >
              <path
                d="M120 20c-30 4-52 22-58 48-3 13 1 26 10 34 14-6 26-17 33-31 8-16 12-33 15-51z"
                fill="currentColor"
              />
              <path
                d="M150 62c-22 0-40 10-49 27-4 9-4 18 0 25 12-2 23-9 31-19 9-11 15-21 18-33z"
                fill="currentColor"
                opacity=".7"
              />
              <path
                d="M96 96c-18 6-30 18-34 33-2 8 0 15 4 20 10-4 18-12 23-22 5-10 7-21 7-31z"
                fill="currentColor"
                opacity=".5"
              />
            </svg>

            <div className="relative flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-[26px] font-extrabold leading-[1.15] text-white">
                  Let's keep
                  <br />
                  our city clean!
                </h2>
                <p className="mt-2 max-w-[19ch] text-[14px] leading-snug text-white/85">
                  Report issues, track progress and make a difference.
                </p>
              </div>

              <button
                type="button"
                onClick={() => history.push('/report/capture')}
                className="flex shrink-0 items-center gap-2 rounded-2xl bg-card py-3 pl-3 pr-2 shadow-lift active:scale-[0.97] transition-transform"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
                  <span className="material-symbols-outlined text-[22px]">add</span>
                </span>
                <span className="text-left font-display text-[15px] font-bold leading-[1.1] text-ink">
                  Report
                  <br />
                  Now
                </span>
                <span className="material-symbols-outlined text-[20px] text-ink-faint">
                  chevron_right
                </span>
              </button>
            </div>
          </section>

          {/* --------------------------------------------------- your stats */}
          <section className="mt-4 grid grid-cols-3 gap-2.5">
            {stats.map((spec) => (
              <StatCard key={spec.label} spec={spec} loading={loading} />
            ))}
          </section>

          {/* Open work. Reported/Resolved/Cleared above are lifetime totals and
              say nothing about what's still outstanding, which is the thing a
              citizen actually wants to check. Each chip opens that filter. */}
          {!loading && !!mine && mine.reported > 0 && (
            <section className="mt-2.5 flex gap-2.5">
              <button
                type="button"
                onClick={() => history.push('/reports')}
                className="flex flex-1 items-center gap-2 rounded-2xl bg-card px-3 py-2.5 shadow-card active:scale-[0.99] transition-transform"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-flag-surface">
                  <span className="material-symbols-outlined text-[18px] text-flag">
                    pending_actions
                  </span>
                </span>
                <span className="min-w-0 text-left">
                  <span className="tnum block font-display text-[16px] font-extrabold leading-none text-ink">
                    {mine.pending}
                  </span>
                  <span className="text-[11px] text-ink-soft">Pending</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => history.push('/reports')}
                className="flex flex-1 items-center gap-2 rounded-2xl bg-card px-3 py-2.5 shadow-card active:scale-[0.99] transition-transform"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-surface">
                  <span className="material-symbols-outlined text-[18px] text-brand">
                    local_shipping
                  </span>
                </span>
                <span className="min-w-0 text-left">
                  <span className="tnum block font-display text-[16px] font-extrabold leading-none text-ink">
                    {mine.in_progress}
                  </span>
                  <span className="text-[11px] text-ink-soft">In progress</span>
                </span>
              </button>
            </section>
          )}

          {/* Only surfaced when it's true — an always-visible "0 overdue" chip
              would train people to ignore the row. */}
          {!loading && !!mine?.overdue && (
            <button
              type="button"
              onClick={() => history.push('/reports')}
              className="mt-2.5 flex w-full items-center gap-2.5 rounded-2xl bg-flag-surface px-4 py-3 active:scale-[0.99] transition-transform"
            >
              <span className="material-symbols-outlined text-[20px] text-flag">schedule</span>
              <span className="flex-1 text-left text-[13px] font-bold text-ink">
                {mine.overdue} of your reports {mine.overdue === 1 ? 'is' : 'are'} past the 5-day
                target
              </span>
              <span className="material-symbols-outlined text-[18px] text-flag">chevron_right</span>
            </button>
          )}

          {/* ------------------------------------------------- live activity */}
          <section className="mt-6 flex flex-col gap-3">
            <SectionHead
              icon="bar_chart"
              title={data?.community_scope ? `Activity in ${data.community_scope}` : 'Live activity'}
              action="View map"
              onAction={() => history.push('/map')}
            />
            <div className="grid grid-cols-4 rounded-2xl bg-card px-1 py-4 shadow-card">
              {live.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex flex-col items-center gap-1.5 px-1 ${
                    i > 0 ? 'border-l border-line' : ''
                  }`}
                >
                  <span className={`material-symbols-outlined filled text-[22px] ${item.tone}`}>
                    {item.icon}
                  </span>
                  <span className="flex items-baseline gap-0.5">
                    <span className="tnum font-display text-[22px] font-extrabold leading-none text-ink">
                      {loading ? '–' : item.value}
                    </span>
                    {item.unit && (
                      <span className="text-[11px] font-semibold text-ink-soft">{item.unit}</span>
                    )}
                  </span>
                  <span className="text-[12px] text-ink-soft">{item.label}</span>
                  <span className={`h-0.5 w-8 rounded-full ${item.bar}`} />
                </div>
              ))}
            </div>

            {/* Real map, not a decorative stand-in. Inert inside the button so
                the whole card is one tap target through to the full map. */}
            <button
              type="button"
              onClick={() => history.push('/map')}
              aria-label="Open the full map"
              className="relative h-40 w-full overflow-hidden rounded-2xl border border-line shadow-card active:scale-[0.99] transition-transform"
            >
              <MapSnippet markers={data?.pins ?? []} className="h-full w-full" compact />
              <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-ink shadow-card">
                <span className="h-2 w-2 rounded-full bg-flag" />
                Pending
                <span className="ml-1 h-2 w-2 rounded-full bg-grass" />
                Resolved
              </span>
              <span className="absolute bottom-2 right-2 rounded-full bg-card px-3 py-1 text-[12px] font-semibold text-ink shadow-card">
                {data?.pins.length ?? 0} nearby
              </span>
            </button>
          </section>

          {/* ------------------------------------------------ recent reports */}
          <section className="mt-6 flex flex-col gap-3">
            <SectionHead
              icon="eco"
              title="Your recent reports"
              action={data?.recent_reports.length ? 'See all' : undefined}
              onAction={() => history.push('/reports')}
            />

            {loading && (
              <div className="flex flex-col gap-2.5">
                {[0, 1].map((i) => (
                  <div key={i} className="flex animate-pulse items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-surface-container" />
                    <div className="flex-grow space-y-2">
                      <div className="h-3.5 w-2/3 rounded bg-surface-container" />
                      <div className="h-3 w-1/2 rounded bg-surface-container" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !data?.recent_reports.length && !error && (
              <div className="flex items-start gap-4 rounded-2xl border border-dashed border-brand/30 bg-card/60 p-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-surface">
                  <span className="material-symbols-outlined text-[30px] text-brand">
                    assignment
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[17px] font-bold text-ink">No reports yet</p>
                  <p className="mt-1 text-[13px] leading-snug text-ink-soft">
                    Spot dumped waste anywhere in the city? Photograph it and the right municipal
                    team gets notified.
                  </p>
                  <button
                    type="button"
                    onClick={() => history.push('/report/capture')}
                    className="mt-3 rounded-full bg-brand-gradient px-5 py-2.5 text-[14px] font-bold text-white shadow-fab active:scale-[0.98] transition-transform"
                  >
                    Report your first issue
                  </button>
                </div>
              </div>
            )}

            {data?.recent_reports.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onOpen={() => history.push(`/reports/${report.id}`)}
              />
            ))}
          </section>

          {/* -------------------------------------------------- quick actions */}
          <section className="mt-6 flex flex-col gap-3">
            <SectionHead icon="bolt" title="Quick actions" />
            <div className="grid grid-cols-4 gap-2.5">
              {QUICK.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => history.push(q.route)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border border-line/70 px-1 py-4 active:scale-[0.97] transition-transform ${q.tint}`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${q.chip}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{q.icon}</span>
                  </span>
                  <span className="whitespace-pre-line text-center text-[12px] font-semibold leading-tight text-ink">
                    {q.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </IonContent>

      <BottomNav active="home" />
    </IonPage>
  );
};

export default Home;
