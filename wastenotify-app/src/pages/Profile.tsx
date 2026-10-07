import { useCallback, useEffect, useRef, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import FieldError from '../components/FieldError';
import { useAuth } from '../context/AuthContext';
import {
  changePassword,
  deleteAccount,
  fetchProfile,
  fetchWards,
  locateWard,
  toApiError,
  updateProfile,
  uploadAvatar,
  type ProfilePayload,
  type Ward,
} from '../lib/api';
import { Geolocation } from '@capacitor/geolocation';

type Panel = 'none' | 'edit' | 'password' | 'delete';

const Row: React.FC<{
  icon: string;
  label: string;
  value?: string;
  onClick?: () => void;
  tone?: string;
}> = ({ icon, label, value, onClick, tone }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-surface-container disabled:active:bg-transparent"
  >
    <span className={`material-symbols-outlined text-[22px] ${tone ?? 'text-ink-soft'}`}>{icon}</span>
    <span className={`flex-1 text-[14.5px] font-medium ${tone ?? 'text-ink'}`}>{label}</span>
    {value && <span className="max-w-[45%] truncate text-[13px] text-ink-faint">{value}</span>}
    {onClick && <span className="material-symbols-outlined text-[20px] text-ink-faint">chevron_right</span>}
  </button>
);

const Profile: React.FC = () => {
  const history = useHistory();
  const { user, logout, refresh } = useAuth();
  const avatarInput = useRef<HTMLInputElement | null>(null);

  const [data, setData] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>('none');
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wardId, setWardId] = useState<number | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [locating, setLocating] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const load = useCallback(async () => {
    try {
      setError(null);
      const p = await fetchProfile();
      setData(p);
      setName(p.user.name);
      setEmail(p.user.email);
      setPhone(p.user.phone ?? '');
      setWardId(p.user.ward_id);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // The real ward list, imported from official boundary data. Failing to
    // load it leaves the picker empty and the UI says why, rather than
    // offering made-up options.
    fetchWards()
      .then((w) => setWards(w.wards))
      .catch(() => setWards([]));
  }, [load]);

  /** Set the home ward from the device's actual position. */
  const detectWard = async () => {
    setLocating(true);
    setError(null);
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const found = await locateWard(pos.coords.latitude, pos.coords.longitude);
      if (found) {
        setWardId(found.id);
        setNotice(`Detected ${found.label}. Save to keep it.`);
      } else {
        setError('That location is outside the mapped municipal wards.');
      }
    } catch {
      setError('Could not read your location.');
    } finally {
      setLocating(false);
    }
  };

  /** Play-required account deletion. Signs out locally whatever the outcome. */
  const removeAccount = async () => {
    setBusy(true);
    setError(null);
    setFields({});
    try {
      await deleteAccount(deletePassword, deleteConfirmed);
      await logout();
      history.replace('/login');
    } catch (err) {
      const e = toApiError(err);
      setFields(e.fields);
      if (!Object.keys(e.fields).length) setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    setBusy(true);
    setError(null);
    setFields({});
    try {
      await updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim(), ward_id: wardId });
      await load();
      await refresh();
      setPanel('none');
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
    setFields({});
    try {
      const msg = await changePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPanel('none');
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
      await load();
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

  const u = data?.user ?? user;

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-full bg-canvas pb-32">
          {/* Header */}
          <div className="bg-brand-gradient-r">
            <TopBar title="Profile" tone="light" />
          </div>
          <header className="-mt-1 rounded-b-3xl bg-brand-gradient-r px-4 pb-8 pt-2 text-center">
            <div className="relative inline-block">
              {u?.avatar_url ? (
                <img
                  src={u.avatar_url}
                  alt=""
                  className="h-24 w-24 rounded-full border-4 border-white/70 object-cover"
                />
              ) : (
                <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/70 bg-white/20 font-display text-[34px] font-bold text-white">
                  {u?.name?.charAt(0).toUpperCase() ?? '?'}
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
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-card text-brand shadow-lift active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </button>
            </div>

            <h1 className="mt-3 font-display text-[22px] font-extrabold text-white">{u?.name}</h1>
            {u?.email_verified && u?.phone_verified && (
              <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-white/85">
                <span className="material-symbols-outlined filled text-[16px]">verified</span>
                Verified citizen
              </p>
            )}

            <div className="mt-5 flex divide-x divide-white/25 rounded-2xl bg-white/15 py-3">
              {[
                { v: data?.stats.reported ?? 0, l: 'Reports' },
                { v: data?.stats.resolved ?? 0, l: 'Resolved' },
                { v: `${data?.stats.cleared_kg ?? 0}kg`, l: 'Cleared' },
              ].map((x) => (
                <div key={x.l} className="flex-1">
                  <p className="tnum font-display text-[18px] font-extrabold text-white">{x.v}</p>
                  <p className="text-[11px] text-white/75">{x.l}</p>
                </div>
              ))}
            </div>
          </header>

          <div className="px-4">
            {notice && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-grass-surface px-4 py-3">
                <span className="material-symbols-outlined text-[20px] text-grass">check_circle</span>
                <p className="flex-1 text-[13px] font-semibold text-grass-dark">{notice}</p>
                <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
                  <span className="material-symbols-outlined text-[18px] text-grass-dark">close</span>
                </button>
              </div>
            )}
            {error && (
              <div role="alert" className="mt-4 rounded-2xl bg-danger-surface px-4 py-3">
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}
            {loading && <p className="mt-6 text-center text-[14px] text-ink-soft">Loading…</p>}

            {/* Contact */}
            <section className="mt-4 overflow-hidden rounded-2xl bg-card shadow-card">
              <div className="flex items-center justify-between px-4 pt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                  Contact
                </p>
                <button
                  type="button"
                  onClick={() => setPanel(panel === 'edit' ? 'none' : 'edit')}
                  className="text-[13px] font-semibold text-brand"
                >
                  {panel === 'edit' ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {panel !== 'edit' ? (
                <div className="mt-1 divide-y divide-line">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="material-symbols-outlined text-[22px] text-ink-soft">mail</span>
                    <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{u?.email}</span>
                    {u?.email_verified && (
                      <span className="shrink-0 rounded-full bg-grass-surface px-2 py-0.5 text-[10px] font-bold uppercase text-grass-dark">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="material-symbols-outlined text-[22px] text-ink-soft">call</span>
                    <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{u?.phone}</span>
                    {u?.phone_verified && (
                      <span className="shrink-0 rounded-full bg-grass-surface px-2 py-0.5 text-[10px] font-bold uppercase text-grass-dark">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="material-symbols-outlined text-[22px] text-ink-soft">
                      location_on
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] text-ink">
                      {u?.ward ? u.ward.label + ' · ' + u.ward.town : 'No ward set'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-4">
                  <div>
                    <label className="mb-1 block text-[13px] font-semibold text-ink" htmlFor="p-name">
                      Full name
                    </label>
                    <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className={input(fields.name)} />
                    <FieldError message={fields.name} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-semibold text-ink" htmlFor="p-email">
                      Email address
                    </label>
                    <input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input(fields.email)} />
                    <FieldError message={fields.email} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-semibold text-ink" htmlFor="p-phone">
                      Phone number
                    </label>
                    <input id="p-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={input(fields.phone)} />
                    <FieldError message={fields.phone} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-semibold text-ink" htmlFor="p-ward">
                      Ward
                    </label>
                    <select
                      id="p-ward"
                      value={wardId ?? ''}
                      onChange={(e) => setWardId(e.target.value ? Number(e.target.value) : null)}
                      className={input(fields.ward_id)}
                    >
                      <option value="">Not set</option>
                      {wards.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                    <FieldError message={fields.ward_id} />
                    <button
                      type="button"
                      onClick={detectWard}
                      disabled={locating}
                      className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-brand disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[18px]">my_location</span>
                      {locating ? 'Locating…' : 'Detect from my location'}
                    </button>
                    {!wards.length && (
                      <p className="mt-1.5 text-[12px] text-flag">
                        No wards imported yet — run <code>php artisan wards:import</code> on the API.
                      </p>
                    )}
                  </div>

                  <p className="text-[12px] leading-snug text-ink-faint">
                    Changing your email or phone clears its verified badge until it's confirmed again.
                  </p>

                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={busy}
                    className="mt-1 rounded-full bg-brand-gradient py-3 text-[14.5px] font-bold text-white shadow-fab active:scale-[0.98] disabled:opacity-60"
                  >
                    {busy ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              )}
            </section>

            {/* Security */}
            <section className="mt-3 overflow-hidden rounded-2xl bg-card shadow-card">
              {panel !== 'password' ? (
                <div className="divide-y divide-line">
                  <Row icon="lock" label="Change password" onClick={() => setPanel('password')} />
                  <Row icon="notifications" label="Notifications" value="In-app" onClick={() => history.push('/notifications')} />
                  <Row icon="map" label="Explore the map" onClick={() => history.push('/map')} />
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                      Change password
                    </p>
                    <button type="button" onClick={() => setPanel('none')} className="text-[13px] font-semibold text-brand">
                      Cancel
                    </button>
                  </div>
                  <div>
                    <input
                      type="password"
                      autoComplete="current-password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={input(fields.current_password)}
                    />
                    <FieldError message={fields.current_password} />
                  </div>
                  <div>
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="New password (min 8 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={input(fields.password)}
                    />
                    <FieldError message={fields.password} />
                  </div>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={input()}
                  />
                  <p className="text-[12px] text-ink-faint">
                    Your other devices will be signed out.
                  </p>
                  <button
                    type="button"
                    onClick={savePassword}
                    disabled={busy}
                    className="rounded-full bg-brand-gradient py-3 text-[14.5px] font-bold text-white shadow-fab active:scale-[0.98] disabled:opacity-60"
                  >
                    {busy ? 'Updating…' : 'Update password'}
                  </button>
                </div>
              )}
            </section>

            {/* Admin shortcut, only where it applies */}
            {u?.is_admin && (
              <section className="mt-3 overflow-hidden rounded-2xl bg-card shadow-card">
                <Row
                  icon="admin_panel_settings"
                  label="Ward operations"
                  tone="text-brand"
                  onClick={() => history.push('/admin')}
                />
              </section>
            )}

            {/* Legal — Play requires the privacy policy to be reachable in-app */}
            <section className="mt-3 overflow-hidden rounded-2xl bg-card shadow-card">
              <div className="divide-y divide-line">
                <Row icon="policy" label="Privacy Policy" onClick={() => history.push('/legal/privacy')} />
                <Row icon="gavel" label="Terms of Service" onClick={() => history.push('/legal/terms')} />
              </div>
            </section>

            <section className="mt-3 overflow-hidden rounded-2xl bg-card shadow-card">
              <Row
                icon="logout"
                label="Sign out"
                tone="text-danger"
                onClick={async () => {
                  await logout();
                  history.replace('/login');
                }}
              />
            </section>

            {/* Account deletion. Google Play requires apps that let users create
                an account to offer deletion inside the app. */}
            <section className="mt-3 overflow-hidden rounded-2xl border border-danger/25 bg-card">
              {panel !== 'delete' ? (
                <Row
                  icon="delete_forever"
                  label="Delete account"
                  tone="text-danger"
                  onClick={() => setPanel('delete')}
                />
              ) : (
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-[15px] font-bold text-danger">Delete account</p>
                    <button
                      type="button"
                      onClick={() => setPanel('none')}
                      className="text-[13px] font-semibold text-brand"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-[13px] leading-snug text-ink-soft">
                    This removes your name, email, phone, photo and notifications, and signs out
                    every device. It cannot be undone.
                  </p>
                  <p className="text-[13px] leading-snug text-ink-soft">
                    Reports you filed are kept as civic records but are permanently anonymised —
                    they can no longer be traced back to you.
                  </p>
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Confirm your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className={input(fields.password)}
                  />
                  <FieldError message={fields.password} />
                  <label className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={deleteConfirmed}
                      onChange={(e) => setDeleteConfirmed(e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-line text-danger focus:ring-danger"
                    />
                    <span className="text-[13px] text-ink-soft">
                      I understand this permanently deletes my account.
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={removeAccount}
                    disabled={busy || !deleteConfirmed || !deletePassword}
                    className="rounded-full bg-danger py-3 text-[14.5px] font-bold text-white active:scale-[0.98] disabled:opacity-50"
                  >
                    {busy ? 'Deleting…' : 'Permanently delete my account'}
                  </button>
                </div>
              )}
            </section>

            <p className="mt-5 text-center text-[11px] text-ink-faint">
              Wasteman · signed in as {u?.email}
            </p>
          </div>
        </div>
      </IonContent>
      <BottomNav active="profile" />
    </IonPage>
  );
};

export default Profile;
