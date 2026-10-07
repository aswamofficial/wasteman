import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';
import type { AdminScope } from '../../lib/api';

const NAV = [
  { icon: 'dashboard', label: 'Dashboard', route: '/admin' },
  { icon: 'inbox', label: 'Complaints', route: '/admin/complaints' },
  { icon: 'group', label: 'Users', route: '/admin/users' },
  { icon: 'local_shipping', label: 'Collectors', route: '/admin/contractors' },
  { icon: 'map', label: 'Ward map', route: '/admin/map' },
  { icon: 'policy', label: 'Policies', route: '/admin/policies' },
  { icon: 'settings', label: 'Configuration', route: '/admin/settings' },
  { icon: 'person', label: 'My profile', route: '/admin/profile' },
];

/** Collapsed/expanded is a workspace preference, so it survives navigation. */
const SIDEBAR_PREF = 'wasteman_admin_sidebar';

/**
 * Chrome for the admin console.
 *
 * The sidebar carries the app's blue→green brand gradient rather than a neutral
 * dark panel, so the console reads as the same product as the citizen app.
 * Above `lg` it's persistent and collapsible to an icon rail; below that the
 * same nav slides in from the hamburger.
 */
const AdminShell: React.FC<{
  /** The scope the screen's own query applied. Omit when it doesn't have one. */
  scope?: AdminScope | null;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ scope, title, children, actions }) => {
  const history = useHistory();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [prefLoaded, setPrefLoaded] = useState(false);

  useEffect(() => {
    Preferences.get({ key: SIDEBAR_PREF })
      .then(({ value }) => {
        if (value === 'collapsed') setCollapsed(true);
      })
      .finally(() => setPrefLoaded(true));
  }, []);

  useEffect(() => {
    // Don't write before the read lands, or the default would overwrite it.
    if (!prefLoaded) return;
    Preferences.set({ key: SIDEBAR_PREF, value: collapsed ? 'collapsed' : 'expanded' });
  }, [collapsed, prefLoaded]);

  /*
   * Screens that run a scoped query pass their own scope. The rest fall back to
   * the signed-in admin's ward — their real assignment, not an assumption that
   * everyone is city-wide.
   */
  const effective: AdminScope =
    scope ?? (user?.ward ? { type: 'ward', ward: user.ward } : { type: 'city', ward: null });

  const scopeLabel =
    effective.type === 'ward' && effective.ward ? effective.ward.label : 'All wards — Coimbatore';

  const signOut = async () => {
    await logout();
    history.replace('/login');
  };

  const go = (route: string) => {
    setDrawerOpen(false);
    history.push(route);
  };

  const isOn = (route: string) =>
    route === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(route);

  /* ------------------------------------------------------------- fragments */

  const NavList = ({ tone, rail = false }: { tone: 'brand' | 'plain'; rail?: boolean }) => (
    <nav className={`flex flex-col gap-1 ${rail ? 'px-2' : 'px-3'}`}>
      {NAV.map((n) => {
        const on = isOn(n.route);
        return (
          <button
            key={n.route}
            type="button"
            onClick={() => go(n.route)}
            aria-current={on ? 'page' : undefined}
            // Native tooltip is the label's only home when collapsed.
            title={rail ? n.label : undefined}
            className={`flex items-center rounded-xl text-left text-[14px] font-medium transition-colors ${
              rail ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
            } ${
              tone === 'brand'
                ? on
                  ? 'bg-white/20 text-white'
                  : 'text-white/75 hover:bg-white/10'
                : on
                  ? 'bg-brand-surface text-brand'
                  : 'text-ink-soft hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[21px]">{n.icon}</span>
            {!rail && n.label}
          </button>
        );
      })}
    </nav>
  );

  const Identity = ({ tone, rail = false }: { tone: 'brand' | 'plain'; rail?: boolean }) => (
    <div
      className={`mt-auto border-t ${tone === 'brand' ? 'border-white/15' : 'border-line'} ${
        rail ? 'p-2' : 'p-4'
      }`}
    >
      {rail ? (
        <button
          type="button"
          onClick={signOut}
          title={`Sign out — ${user?.name ?? ''}`}
          aria-label="Sign out"
          className="flex w-full items-center justify-center rounded-xl py-3 text-white/80 hover:bg-white/10 active:scale-95"
        >
          <span className="material-symbols-outlined text-[21px]">logout</span>
        </button>
      ) : (
        <>
          <p
            className={`truncate text-[13px] font-semibold ${
              tone === 'brand' ? 'text-white' : 'text-ink'
            }`}
          >
            {user?.name}
          </p>
          <p
            className={`truncate text-[11.5px] ${
              tone === 'brand' ? 'text-white/65' : 'text-ink-faint'
            }`}
          >
            {user?.email}
          </p>
          <button
            type="button"
            onClick={signOut}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2 text-[12.5px] font-semibold active:scale-95 ${
              tone === 'brand'
                ? 'border border-white/30 text-white hover:bg-white/10'
                : 'border border-danger/30 text-danger'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="flex min-h-full bg-canvas">
      {/* Desktop sidebar — brand gradient, collapsible to an icon rail */}
      <aside
        // `relative` so the collapse handle anchors to the sidebar's own edge
        // rather than escaping to the initial containing block.
        // Width and flex-basis are both pinned: the sidebar is a flex item, so
        // its used size is resolved from the basis, and stating it explicitly
        // keeps the two in step instead of relying on `basis: auto` deferring
        // to `width`.
        className={`relative hidden shrink-0 flex-col bg-brand-gradient-b transition-all duration-200 lg:flex ${
          collapsed ? 'w-[68px] basis-[68px]' : 'w-[256px] basis-[256px]'
        }`}
      >
        <div className={`relative ${collapsed ? 'px-2 pb-4 pt-5' : 'px-5 pb-5 pt-6'}`}>
          {collapsed ? (
            <div className="flex justify-center">
              {/* The rail is the one place a bare letter was standing in for
                  the brand; the mark reads at 36px, so use it. */}
              <Logo size={36} variant="mono" />
            </div>
          ) : (
            <>
              <Logo size={30} variant="mono" withWordmark />
              <p className="mt-2 font-display text-[17px] font-extrabold text-white">
                Ward operations
              </p>
              <p className="mt-2 rounded-full bg-white/15 px-2.5 py-1 text-center text-[11px] font-semibold text-white/90">
                {scopeLabel}
              </p>
            </>
          )}
        </div>

        <NavList tone="brand" rail={collapsed} />
        <Identity tone="brand" rail={collapsed} />

        {/* Collapse handle sits on the sidebar's edge so it reads as belonging
            to the sidebar, not to the content column. */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute bottom-20 z-20 hidden h-7 w-7 items-center justify-center rounded-full border border-line bg-card text-ink-soft shadow-card hover:text-ink lg:flex"
          style={{ left: collapsed ? 52 : 240 }}
        >
          <span className="material-symbols-outlined text-[18px]">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card shadow-lift lg:hidden">
            <div className="bg-brand-gradient-r px-5 py-5">
              <Logo size={30} variant="mono" withWordmark />
              <p className="mt-2 font-display text-[17px] font-extrabold text-white">
                Ward operations
              </p>
              <p className="mt-2 inline-block rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
                {scopeLabel}
              </p>
            </div>
            <div className="pt-3">
              <NavList tone="plain" />
            </div>
            <Identity tone="plain" />
          </aside>
        </>
      )}

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-canvas/95 px-2 py-2 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open admin menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink active:scale-95"
          >
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>
          <h1 className="min-w-0 flex-1 truncate font-display text-[17px] font-bold text-ink">
            {title ?? scopeLabel}
          </h1>
          {actions}
        </div>

        {/* Desktop top bar */}
        <div className="hidden items-center justify-between border-b border-line bg-card px-6 py-3 lg:flex">
          <div>
            <h1 className="font-display text-[18px] font-bold text-ink">{title ?? scopeLabel}</h1>
            {title && <p className="text-[12px] text-ink-faint">{scopeLabel}</p>}
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>

        <div className="mx-auto w-full max-w-[1400px]">{children}</div>
      </div>
    </div>
  );
};

export default AdminShell;
