import { IonContent, IonMenu, IonMenuToggle } from '@ionic/react';
// menuController is a core controller, not a React export.
import { menuController } from '@ionic/core/components';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

interface Item {
  icon: string;
  label: string;
  route: string;
  adminOnly?: boolean;
}

const MAIN: Item[] = [
  { icon: 'home', label: 'Home', route: '/home' },
  { icon: 'add_circle', label: 'Report waste', route: '/report/capture' },
  { icon: 'map', label: 'Map', route: '/map' },
  { icon: 'description', label: 'My reports', route: '/reports' },
  { icon: 'bar_chart', label: 'Impact', route: '/statistics' },
  { icon: 'notifications', label: 'Notifications', route: '/notifications' },
];

const ACCOUNT: Item[] = [
  { icon: 'person', label: 'Profile', route: '/profile' },
  { icon: 'admin_panel_settings', label: 'Ward operations', route: '/admin', adminOnly: true },
];

const LEGAL: Item[] = [
  { icon: 'policy', label: 'Privacy Policy', route: '/legal/privacy' },
  { icon: 'gavel', label: 'Terms of Service', route: '/legal/terms' },
];

/**
 * App-wide drawer. Registered once in App.tsx against the router outlet, so
 * every page can open it with `menuController.open()` without each screen
 * owning its own copy.
 */
const SideMenu: React.FC = () => {
  const history = useHistory();
  const { user, isAdmin, logout } = useAuth();

  const go = async (route: string) => {
    await menuController.close();
    history.push(route);
  };

  const signOut = async () => {
    await menuController.close();
    await logout();
    history.replace('/login');
  };

  const Section: React.FC<{ title?: string; items: Item[] }> = ({ title, items }) => (
    <div className="px-2 py-2">
      {title && (
        <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
          {title}
        </p>
      )}
      {items
        .filter((i) => !i.adminOnly || isAdmin)
        .map((i) => (
          <button
            key={i.route}
            type="button"
            onClick={() => go(i.route)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left active:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[22px] text-ink-soft">{i.icon}</span>
            <span className="text-[14.5px] font-medium text-ink">{i.label}</span>
          </button>
        ))}
    </div>
  );

  return (
    <IonMenu contentId="main" menuId="app-menu" type="overlay">
      <IonContent>
        <div className="flex min-h-full flex-col bg-canvas">
          {/* Identity */}
          <div className="bg-brand-gradient-r px-5 pb-6 pt-8">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                className="h-14 w-14 rounded-full border-2 border-white/70 object-cover"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 font-display text-[22px] font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </span>
            )}
            <p className="mt-3 font-display text-[18px] font-extrabold text-white">
              {user?.name ?? 'Not signed in'}
            </p>
            <p className="truncate text-[12.5px] text-white/80">{user?.email}</p>
            {user?.ward && (
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
                <span className="material-symbols-outlined filled text-[14px]">location_on</span>
                {user.ward.label}
              </p>
            )}
          </div>

          <Section items={MAIN} />
          <div className="mx-4 border-t border-line" />
          <Section title="Account" items={ACCOUNT} />
          <div className="mx-4 border-t border-line" />
          <Section title="Legal" items={LEGAL} />

          {/* Sign out sits at the bottom, always visible, never hidden behind
              a submenu — Play reviewers look for an obvious way out. */}
          <div className="mt-auto p-4">
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-danger/30 bg-danger-surface py-3 text-[14.5px] font-bold text-danger active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign out
            </button>
            <div className="mt-3 flex justify-center">
              <Logo size={22} withWordmark />
            </div>
          </div>
        </div>
      </IonContent>
    </IonMenu>
  );
};

/** Hamburger that opens the drawer. Place in any page header. */
export const MenuButton: React.FC<{ tone?: 'light' | 'dark' }> = ({ tone = 'dark' }) => (
  <IonMenuToggle menu="app-menu" autoHide={false}>
    <button
      type="button"
      aria-label="Open menu"
      className={`flex h-10 w-10 items-center justify-center rounded-full active:scale-95 ${
        tone === 'light' ? 'text-white' : 'text-ink'
      }`}
    >
      <span className="material-symbols-outlined text-[26px]">menu</span>
    </button>
  </IonMenuToggle>
);

export default SideMenu;
