import { useHistory } from 'react-router-dom';
import { MenuButton } from './SideMenu';

interface Props {
  title: string;
  /** Show a back arrow instead of the hamburger (detail screens). */
  back?: boolean;
  /** Where back goes. Defaults to browser history. */
  backTo?: string;
  /** Right-hand controls. */
  actions?: React.ReactNode;
  /** Sits over a coloured header rather than the canvas. */
  tone?: 'light' | 'dark';
  /** Float over content (map/photo heroes) instead of taking layout space. */
  floating?: boolean;
}

/**
 * Consistent top bar for the citizen section.
 *
 * Every screen gets the same reach: the drawer is always one tap away from the
 * top-left, and detail screens swap it for a back arrow so the gesture is never
 * ambiguous. Sticky rather than fixed — inside IonContent a fixed element
 * resolves against the transformed .ion-page during transitions and drifts.
 */
const TopBar: React.FC<Props> = ({
  title,
  back = false,
  backTo,
  actions,
  tone = 'dark',
  floating = false,
}) => {
  const history = useHistory();
  const light = tone === 'light';

  return (
    <header
      className={
        floating
          ? 'pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center gap-1 px-2 py-2'
          : `sticky top-0 z-30 flex items-center gap-1 px-2 py-2 ${
              light ? '' : 'border-b border-line bg-canvas/95 backdrop-blur'
            }`
      }
    >
      <div className={floating ? 'pointer-events-auto' : ''}>
        {back ? (
          <button
            type="button"
            onClick={() => (backTo ? history.push(backTo) : history.goBack())}
            aria-label="Back"
            className={`flex h-10 w-10 items-center justify-center rounded-full active:scale-95 ${
              floating ? 'bg-card/90 shadow-card text-ink' : light ? 'text-white' : 'text-ink'
            }`}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        ) : (
          <MenuButton tone={light ? 'light' : 'dark'} />
        )}
      </div>

      <h1
        className={`min-w-0 flex-1 truncate font-display text-[18px] font-bold ${
          floating ? 'sr-only' : light ? 'text-white' : 'text-ink'
        }`}
      >
        {title}
      </h1>

      {actions && (
        <div className={`flex shrink-0 items-center gap-1 ${floating ? 'pointer-events-auto' : ''}`}>
          {actions}
        </div>
      )}
    </header>
  );
};

/** Bell with unread badge, for the top bar's actions slot. */
export const NotificationBell: React.FC<{ count?: number; tone?: 'light' | 'dark' }> = ({
  count = 0,
  tone = 'dark',
}) => {
  const history = useHistory();

  return (
    <button
      type="button"
      onClick={() => history.push('/notifications')}
      aria-label={count ? `Notifications, ${count} unread` : 'Notifications'}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full active:scale-95 ${
        tone === 'light' ? 'text-white' : 'text-ink'
      }`}
    >
      <span className="material-symbols-outlined text-[24px]">notifications</span>
      {count > 0 && (
        <span className="tnum absolute -right-0.5 top-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-flag px-1 text-[11px] font-bold text-white ring-2 ring-canvas">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

export default TopBar;
