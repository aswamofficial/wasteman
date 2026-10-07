import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import AdminShell from '../../components/admin/AdminShell';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAdminUsers,
  fetchWards,
  suspendAdminUser,
  toApiError,
  updateAdminUser,
  type AdminUserRow,
  type Ward,
} from '../../lib/api';

const ROLE_TONE: Record<string, string> = {
  admin: 'bg-brand-surface text-brand',
  staff: 'bg-iris-surface text-iris',
  citizen: 'bg-surface-container text-ink-soft',
};

const AdminUsers: React.FC = () => {
  const { user: me } = useAuth();

  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchAdminUsers({ role, status, q });
      setRows(data.users);
      setCounts(data.counts);
      setRoles(data.roles);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [role, status, q]);

  useEffect(() => {
    // Debounced so typing in the search box doesn't fire a request per keystroke.
    const t = setTimeout(load, q ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  useEffect(() => {
    fetchWards().then((w) => setWards(w.wards)).catch(() => setWards([]));
  }, []);

  const save = async (patch: Parameters<typeof updateAdminUser>[1]) => {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      await updateAdminUser(editing.id, patch);
      setNotice('User updated.');
      setEditing(null);
      await load();
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const toggleSuspend = async (u: AdminUserRow) => {
    setBusy(true);
    setError(null);
    try {
      const reason = u.suspended
        ? undefined
        : window.prompt('Reason for suspension (shown to the user at sign-in):') || undefined;
      await suspendAdminUser(u.id, !u.suspended, reason);
      setNotice(u.suspended ? 'Account restored.' : 'Account suspended.');
      setEditing(null);
      await load();
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const chip = (on: boolean) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${
      on ? 'bg-ink text-white' : 'border border-line bg-card text-ink-soft'
    }`;

  return (
    <IonPage>
      <IonContent fullscreen>
        <AdminShell scope={null} title="Users">
          <div className="px-4 pb-12 pt-4 lg:px-6 lg:pt-6">
            {notice && (
              <div className="mb-3 flex items-center gap-2 rounded-2xl bg-grass-surface px-4 py-2.5">
                <span className="material-symbols-outlined text-[18px] text-grass">check_circle</span>
                <p className="flex-1 text-[13px] font-semibold text-grass-dark">{notice}</p>
                <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
                  <span className="material-symbols-outlined text-[18px] text-grass-dark">close</span>
                </button>
              </div>
            )}
            {error && (
              <div role="alert" className="mb-3 rounded-2xl bg-danger-surface px-4 py-3">
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-2 lg:w-72">
                <span className="material-symbols-outlined text-[20px] text-ink-faint">search</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Name, email or phone"
                  aria-label="Search users"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-0"
                />
              </div>

              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar">
                {['all', ...roles].map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)} className={chip(role === r)}>
                    <span className="capitalize">{r}</span>
                    <span className={role === r ? 'ml-1.5 text-white/70' : 'ml-1.5 text-ink-faint'}>
                      {counts[r] ?? counts.all ?? 0}
                    </span>
                  </button>
                ))}
                <span className="w-px shrink-0 bg-line" />
                {['all', 'active', 'suspended'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={chip(status === s)}
                  >
                    <span className="capitalize">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {loading && <p className="py-10 text-center text-[14px] text-ink-soft">Loading users…</p>}
            {!loading && !rows.length && (
              <p className="py-10 text-center text-[14px] text-ink-soft">No users match.</p>
            )}

            {/* Desktop table / mobile cards from one source */}
            <div className="mt-4 overflow-hidden rounded-2xl bg-card shadow-card">
              <table className="hidden w-full text-left lg:table">
                <thead>
                  <tr className="border-b border-line text-[11px] font-bold uppercase tracking-[0.06em] text-ink-faint">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Ward</th>
                    <th className="px-4 py-3 text-right">Reports</th>
                    <th className="px-4 py-3 text-right">Open assigned</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <tr key={u.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <p className="text-[14px] font-semibold text-ink">{u.name}</p>
                        <p className="text-[12px] text-ink-faint">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                            ROLE_TONE[u.role ?? 'citizen']
                          }`}
                        >
                          {u.role ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-ink-soft">
                        {u.ward?.label ?? '—'}
                      </td>
                      <td className="tnum px-4 py-3 text-right text-[13px] text-ink">
                        {u.reports_count ?? 0}
                      </td>
                      <td className="tnum px-4 py-3 text-right text-[13px] text-ink">
                        {u.open_assigned ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        {u.suspended ? (
                          <span className="rounded-full bg-danger-surface px-2.5 py-1 text-[11px] font-bold text-danger">
                            Suspended
                          </span>
                        ) : (
                          <span className="rounded-full bg-grass-surface px-2.5 py-1 text-[11px] font-bold text-grass-dark">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setEditing(u)}
                          className="rounded-full border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-col divide-y divide-line lg:hidden">
                {rows.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setEditing(u)}
                    className="flex items-center gap-3 p-3 text-left active:bg-surface-container"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-surface font-display text-[15px] font-bold text-brand">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-ink">
                        {u.name}
                      </span>
                      <span className="block truncate text-[12px] text-ink-faint">
                        {u.ward?.label ?? 'No ward'} · {u.reports_count ?? 0} reports
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                        u.suspended ? 'bg-danger-surface text-danger' : ROLE_TONE[u.role ?? 'citizen']
                      }`}
                    >
                      {u.suspended ? 'Suspended' : u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Manage panel */}
          {editing && (
            <>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setEditing(null)}
                className="fixed inset-0 z-40 bg-ink/40"
              />
              <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-card p-5 shadow-lift lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[420px] lg:rounded-none lg:rounded-l-3xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-[19px] font-extrabold text-ink">
                      {editing.name}
                    </h2>
                    <p className="text-[13px] text-ink-soft">{editing.email}</p>
                    <p className="text-[12px] text-ink-faint">{editing.phone ?? 'No phone'}</p>
                  </div>
                  <button type="button" onClick={() => setEditing(null)} aria-label="Close">
                    <span className="material-symbols-outlined text-ink-faint">close</span>
                  </button>
                </div>

                {editing.id === me?.id && (
                  <p className="mt-3 rounded-xl bg-brand-surface px-3 py-2 text-[12px] text-brand">
                    This is your own account — role and suspension are locked to stop you locking
                    yourself out.
                  </p>
                )}

                <label className="mt-4 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                  Role
                </label>
                <div className="mt-1.5 flex gap-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      disabled={busy || editing.id === me?.id}
                      onClick={() => save({ role: r })}
                      className={`flex-1 rounded-full py-2 text-[13px] font-semibold capitalize disabled:opacity-40 ${
                        editing.role === r ? 'bg-brand text-white' : 'border border-line text-ink-soft'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <label
                  className="mt-4 block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint"
                  htmlFor="u-ward"
                >
                  Assigned ward
                </label>
                <select
                  id="u-ward"
                  defaultValue={editing.ward_id ?? ''}
                  disabled={busy}
                  onChange={(e) => save({ ward_id: e.target.value ? Number(e.target.value) : null })}
                  className="mt-1.5 w-full rounded-[14px] border border-line bg-card px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none focus:ring-0"
                >
                  <option value="">No ward</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11.5px] text-ink-faint">
                  Staff and admins only see complaints from their assigned ward. Leave blank for
                  city-wide access.
                </p>

                <div className="mt-5 rounded-2xl bg-surface-container p-3">
                  <p className="text-[12px] text-ink-soft">
                    {editing.reports_count ?? 0} reports filed · {editing.open_assigned ?? 0} open
                    assigned
                  </p>
                  {editing.suspended && editing.suspended_reason && (
                    <p className="mt-1 text-[12px] text-danger">
                      Suspended: {editing.suspended_reason}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={busy || editing.id === me?.id}
                  onClick={() => toggleSuspend(editing)}
                  className={`mt-4 w-full rounded-full py-3 text-[14px] font-bold disabled:opacity-40 ${
                    editing.suspended
                      ? 'bg-grass text-white'
                      : 'border border-danger/30 bg-danger-surface text-danger'
                  }`}
                >
                  {editing.suspended ? 'Restore account' : 'Suspend account'}
                </button>
                <p className="mt-2 text-center text-[11.5px] text-ink-faint">
                  Suspending signs the user out everywhere and blocks sign-in. Their reports stay.
                </p>
              </div>
            </>
          )}
        </AdminShell>
      </IonContent>
    </IonPage>
  );
};

export default AdminUsers;
