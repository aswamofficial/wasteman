import { useHistory } from 'react-router-dom';

export type NavKey = 'home' | 'map' | 'report' | 'activity' | 'profile';

interface Item {
  key: NavKey;
  label: string;
  icon: string;
  route: string;
}

const ITEMS: Item[] = [
  { key: 'home', label: 'Home', icon: 'home', route: '/home' },
  { key: 'map', label: 'Map', icon: 'map', route: '/map' },
  { key: 'report', label: 'Report', icon: 'add', route: '/report/capture' },
  { key: 'activity', label: 'Activity', icon: 'bar_chart', route: '/reports' },
  { key: 'profile', label: 'Profile', icon: 'person', route: '/profile' },
];

/*
 * Floating pill nav. Rendered as an absolute sibling of IonContent inside
 * IonPage rather than a position:fixed child — Ionic transforms .ion-page
 * during transitions, which would make a fixed child resolve against the page
 * instead of the viewport and drift mid-animation.
 */
const BottomNav: React.FC<{ active: NavKey }> = ({ active }) => {
  const history = useHistory();

  return (
    /*
     * Pinned to the bottom of IonPage, with the device's safe-area inset added
     * so it clears the iOS home indicator and Android gesture bar instead of
     * sitting under them. Absolute (not fixed) because Ionic transforms
     * .ion-page during transitions, which would make a fixed child drift.
     */
    <div
      className="absolute bottom-0 left-0 z-50 w-full px-3 pt-1 pointer-events-none"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <nav className="pointer-events-auto relative flex items-end justify-between rounded-2xl bg-card px-2 pt-2 pb-1.5 shadow-nav">
        {ITEMS.map((item) => {
          if (item.key === 'report') {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => history.push(item.route)}
                aria-label="Report waste"
                className="flex flex-1 flex-col items-center gap-1 -mt-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-fab ring-4 ring-card active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">{item.icon}</span>
                </span>
                <span className="text-[11px] font-medium text-ink-soft">{item.label}</span>
              </button>
            );
          }

          const on = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => history.push(item.route)}
              aria-current={on ? 'page' : undefined}
              className="flex flex-1 flex-col items-center gap-1 pt-1 active:scale-95 transition-transform"
            >
              <span
                className={`material-symbols-outlined text-[24px] ${
                  on ? 'filled text-brand' : 'text-ink-faint'
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-[11px] ${on ? 'font-semibold text-brand' : 'font-medium text-ink-soft'}`}
              >
                {item.label}
              </span>
              {/* Active marker doubles the signal so it isn't colour-only. */}
              <span
                className={`h-0.5 w-6 rounded-full ${on ? 'bg-brand' : 'bg-transparent'}`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
