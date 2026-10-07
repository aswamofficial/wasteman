import { useCallback, useEffect, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AdminShell from '../../components/admin/AdminShell';
import FieldError from '../../components/FieldError';
import { useAuth } from '../../context/AuthContext';
import {
  changePassword,
  fetchAdminUser,
  toApiError,
  updateProfile,
  uploadAvatar,
  type AdminUserDetail,
} from '../../lib/api';

/**
 * The operator's own account, inside the console.
 *
 * Deliberately not the citizen profile screen: no bottom nav, no reporting
 * stats, no ward picker — an officer's ward is their operational scope and is
 * set under Users, so letting them silently re-scope the whole console from
 * here would be a trap. The citizen page at /profile is untouched.
 */
const AdminProfile: React.FC = () => {
  const history = useHistory();
  const { user, logout, refresh } = useAuth();
  const avatarInput = useRef<HTMLInputElement | null>(null);

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? '');
    try {
      setDetail(await fetchAdminUser(user.id));
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty =
    !!user && (name !== user.name || email !== user.email || phone !== (user.phone ?? ''));

  const saveProfile = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    setFields({});
    try {
      // ward_id is passed through unchanged — this form doesn't own it.
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        ward_id: user?.ward_id ?? null,
      });
      await refresh();
      setNotice('Profile updated.');
    } catch (err) {
      const e = toApiError(err);
      setFields(e.fields);
      if (!Object.keys(e.fields).length) setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    setFields({});
    try {
      const msg = await changePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotice(msg);
    } catch (err) {
      const e = toApiError(err);
      setFields(e.fields);
      if (!Object.keys(e.fields).length) setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onAvatar = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      await uploadAvatar(file);
      await refresh();
      setNotice('Photo updated.');
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const input = (invalid?: string) =>
    `w-full rounded-[14px] border bg-card px-3 py-2.5 text-[14px] text-ink focus:outline-none focus:ring-0 ${
      invalid ? 'border-2 border-danger' : 'border-line focus:border-brand'
    }`;

  const label = 'mb-1 block text-[13px] font-semibold text-ink';

  return (
    <IonPage>
      <IonContent fullscreen>
        <AdminShell
          title="My profile"
          actions={
            <button
              type="button"
              onClick={async () => {
                await logout();
                history.replace('/login');
              }}
              className="flex items-center gap-1.5 rounded-full border border-danger/30 px-3 py-1.5 text-[12.5px] font-semibold text-danger active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign out
            </button>
          }
        >
          <div className="px-4 pb-12 pt-4 lg:px-6 lg:pt-6">
            {notice && (
              <div className="mb-3 flex items-center gap-2 rounded-2xl bg-grass-surface px-4 py-2.5">
                <span className="material-symbols-outlined text-[18px] text-grass">
                  check_circle
                </span>
                <p className="flex-1 text-[13px] font-semibold text-grass-dark">{notice}</p>
                <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
                  <span className="material-symbols-outlined text-[18px] text-grass-dark">
                    close
                  </span>
                </button>
              </div>
            )}
            {error && (
              <div role="alert" className="mb-3 rounded-2xl bg-danger-surface px-4 py-3">
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-3">
              {/* ------------------------------------------------ identity */}
              <div className="flex flex-col gap-4">
                <section className="rounded-2xl bg-card p-5 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt=""
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient font-display text-[28px] font-bold text-white">
                          {user?.name?.charAt(0).toUpperCase() ?? '?'}
                        </span>
                      )}
                      <input
                        ref={avatarInput}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onAvatar(f);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => avatarInput.current?.click()}
                        disabled={busy}
                        aria-label="Change photo"
                        className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-card text-brand shadow-card active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                      </button>
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-[18px] font-extrabold text-ink">
                        {user?.name}
                      </h2>
                      <p className="truncate text-[12.5px] text-ink-soft">{user?.email}</p>
                      <span className="mt-1.5 inline-block rounded-full bg-brand-surface px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-brand">
                        {detail?.user.role ?? (user?.is_admin ? 'admin' : 'staff')}
                      </span>
                    </div>
                  </div>

                  <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-[13px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-soft">Operational scope</dt>
                      {/* A real ward record or the honest city-wide answer. */}
                      <dd className="truncate text-right font-bold text-ink">
                        {user?.ward ? user.ward.label : 'All wards — Coimbatore'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-soft">Phone</dt>
                      <dd className="truncate text-right font-bold text-ink">
                        {user?.phone ?? 'Not set'}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-3 text-[11.5px] leading-snug text-ink-faint">
                    Your ward decides which queue you see. It's changed under Users, not here.
                  </p>
                  <button
                    type="button"
                    onClick={() => history.push('/admin/users')}
                    className="mt-2 w-full rounded-full bg-surface-container py-2 text-[12.5px] font-bold text-ink-soft active:scale-[0.99]"
                  >
                    Open Users
                  </button>
                </section>

                <section className="rounded-2xl bg-card p-4 shadow-card">
                  <h2 className="font-display text-[16px] font-bold text-ink">My workload</h2>
                  {loading ? (
                    <p className="py-4 text-[13px] text-ink-soft">Loading…</p>
                  ) : (
                    <>
                      <div className="mt-3 grid grid-cols-2 gap-2.5">
                        <div className="rounded-xl bg-brand-surface p-3">
                          <p className="tnum font-display text-[22px] font-extrabold text-brand">
                            {detail?.assigned_open ?? 0}
                          </p>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                            Open assigned
                          </p>
                        </div>
                        <div className="rounded-xl bg-surface-container p-3">
                          <p className="tnum font-display text-[22px] font-extrabold text-ink">
                            {detail?.user.reports_count ?? 0}
                          </p>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
                            Filed by me
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => history.push('/admin/complaints')}
                        className="mt-3 w-full rounded-full bg-brand py-2 text-[12.5px] font-bold text-white active:scale-[0.99]"
                      >
                        Go to the queue
                      </button>
                    </>
                  )}
                </section>
              </div>

              {/* -------------------------------------------------- forms */}
              <div className="flex flex-col gap-4 lg:col-span-2">
                <section className="rounded-2xl bg-card p-4 shadow-card">
                  <h2 className="font-display text-[16px] font-bold text-ink">Contact details</h2>
                  <p className="text-[12px] text-ink-faint">
                    Used to sign in, and shown to colleagues on the reports you handle.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="a-name">
                        Full name
                      </label>
                      <input
                        id="a-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={input(fields.name)}
                      />
                      <FieldError message={fields.name} />
                    </div>
                    <div>
                      <label className={label} htmlFor="a-email">
                        Email address
                      </label>
                      <input
                        id="a-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={input(fields.email)}
                      />
                      <FieldError message={fields.email} />
                    </div>
                    <div>
                      <label className={label} htmlFor="a-phone">
                        Phone number
                      </label>
                      <input
                        id="a-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={input(fields.phone)}
                      />
                      <FieldError message={fields.phone} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={saveProfile}
                      disabled={busy || !dirty}
                      className="rounded-full bg-brand px-5 py-2.5 text-[13.5px] font-bold text-white active:scale-[0.98] disabled:opacity-40"
                    >
                      {busy ? 'Saving…' : 'Save changes'}
                    </button>
                    {dirty && (
                      <button
                        type="button"
                        onClick={() => {
                          setName(user?.name ?? '');
                          setEmail(user?.email ?? '');
                          setPhone(user?.phone ?? '');
                          setFields({});
                        }}
                        className="text-[13px] font-semibold text-ink-soft"
                      >
                        Discard
                      </button>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl bg-card p-4 shadow-card">
                  <h2 className="font-display text-[16px] font-bold text-ink">Password</h2>
                  <p className="text-[12px] text-ink-faint">
                    Changing it signs out your other devices.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="a-current">
                        Current password
                      </label>
                      <input
                        id="a-current"
                        type="password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={input(fields.current_password)}
                      />
                      <FieldError message={fields.current_password} />
                    </div>
                    <div>
                      <label className={label} htmlFor="a-new">
                        New password
                      </label>
                      <input
                        id="a-new"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Minimum 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={input(fields.password)}
                      />
                      <FieldError message={fields.password} />
                    </div>
                    <div>
                      <label className={label} htmlFor="a-confirm">
                        Confirm new password
                      </label>
                      <input
                        id="a-confirm"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={input()}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={savePassword}
                    disabled={busy || !currentPassword || !newPassword}
                    className="mt-4 rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-bold text-white active:scale-[0.98] disabled:opacity-40"
                  >
                    {busy ? 'Updating…' : 'Update password'}
                  </button>
                </section>

                <section className="rounded-2xl bg-card p-4 shadow-card">
                  <h2 className="font-display text-[16px] font-bold text-ink">Published policies</h2>
                  <p className="text-[12px] text-ink-faint">
                    What citizens see in the app. Edit them under Policies.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => history.push('/legal/privacy')}
                      className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink-soft"
                    >
                      Privacy Policy
                    </button>
                    <button
                      type="button"
                      onClick={() => history.push('/legal/terms')}
                      className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink-soft"
                    >
                      Terms of Service
                    </button>
                    <button
                      type="button"
                      onClick={() => history.push('/admin/policies')}
                      className="rounded-full bg-brand-surface px-4 py-2 text-[13px] font-semibold text-brand"
                    >
                      Edit policies
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </AdminShell>
      </IonContent>
    </IonPage>
  );
};

export default AdminProfile;
