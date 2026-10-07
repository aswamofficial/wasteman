import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import {
  fetchContractorProfile,
  saveContractorProfile,
  toApiError,
  type ContractorProfile,
} from '../../lib/api';

/**
 * Register as a collector, and — just as importantly — see where that
 * application has got to.
 *
 * This screen sits outside the verified-collector gate on purpose. Someone
 * waiting for approval has to be able to read that they're waiting; putting it
 * behind the gate would leave them with a 403 and no explanation.
 */
const ContractorRegister: React.FC = () => {
  const history = useHistory();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [wards, setWards] = useState<{ id: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [licence, setLicence] = useState('');
  const [phone, setPhone] = useState('');
  const [wardIds, setWardIds] = useState<number[]>([]);
  const [wardQuery, setWardQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchContractorProfile();
      setWards(data.wards);
      setProfile(data.profile);
      if (data.profile) {
        setBusinessName(data.profile.business_name);
        setLicence(data.profile.licence_no ?? '');
        setPhone(data.profile.contact_phone ?? user?.phone ?? '');
        setWardIds(data.profile.wards.map((w) => w.id));
      } else {
        setPhone(user?.phone ?? '');
      }
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await saveContractorProfile({
        business_name: businessName.trim(),
        licence_no: licence.trim() || undefined,
        contact_phone: phone.trim() || undefined,
        ward_ids: wardIds,
      });
      setProfile(res.profile);
      setNotice(res.message);
      if (res.profile.status === 'verified') history.replace('/collector');
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleWard = (id: number) =>
    setWardIds((cur) => (cur.includes(id) ? cur.filter((w) => w !== id) : [...cur, id]));

  const visibleWards = wardQuery
    ? wards.filter((w) => w.label.toLowerCase().includes(wardQuery.toLowerCase()))
    : wards.slice(0, 40);

  const status = profile?.status;

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-full bg-canvas pb-16">
          <header className="bg-brand-gradient px-4 pb-6 pt-6 lg:px-8">
            <div className="mx-auto w-full max-w-[820px]">
            <Logo size={28} variant="mono" withWordmark />
            <h1 className="mt-3 font-display text-[22px] font-extrabold text-white">
              Collect recyclables
            </h1>
            <p className="mt-1 max-w-md text-[13.5px] leading-snug text-white/85">
              Buy paper, plastic, metal, glass and e-waste directly from residents in the wards you
              cover. You pay them at the door; the app records what was collected.
            </p>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[820px] px-4 lg:px-8">
            {/* Status is the first thing on the page, because for anyone who
                has already applied it's the only thing they came to read. */}
            {status && (
              <div
                className={`mt-4 flex items-start gap-2 rounded-2xl px-4 py-3 ${
                  status === 'verified'
                    ? 'bg-grass-surface'
                    : status === 'suspended'
                      ? 'bg-danger-surface'
                      : 'bg-flag-surface'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    status === 'verified'
                      ? 'text-grass-dark'
                      : status === 'suspended'
                        ? 'text-danger'
                        : 'text-flag'
                  }`}
                >
                  {status === 'verified' ? 'verified' : status === 'suspended' ? 'block' : 'schedule'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold text-ink">
                    {status === 'verified'
                      ? 'Approved — you can accept pickups'
                      : status === 'suspended'
                        ? 'Account suspended'
                        : 'Waiting for the corporation to approve you'}
                  </p>
                  {profile?.status_reason && (
                    <p className="mt-0.5 text-[12.5px] leading-snug text-ink-soft">
                      {profile.status_reason}
                    </p>
                  )}
                  {status === 'pending' && !profile?.status_reason && (
                    <p className="mt-0.5 text-[12.5px] leading-snug text-ink-soft">
                      Residents’ home addresses are only shared with approved collectors, so an
                      officer checks every registration.
                    </p>
                  )}
                  {status === 'verified' && (
                    <button
                      type="button"
                      onClick={() => history.push('/collector')}
                      className="mt-1.5 text-[13px] font-bold text-grass-dark underline"
                    >
                      Go to pickups
                    </button>
                  )}
                </div>
              </div>
            )}

            {notice && (
              <div className="mt-3 rounded-2xl bg-brand-surface px-4 py-3">
                <p className="text-[13px] text-brand">{notice}</p>
              </div>
            )}
            {error && (
              <div role="alert" className="mt-3 rounded-2xl bg-danger-surface px-4 py-3">
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}
            {loading && <p className="mt-8 text-center text-[14px] text-ink-soft">Loading…</p>}

            {!loading && (
              <section className="mt-4 rounded-2xl bg-card p-4 shadow-card">
                <h2 className="font-display text-[16px] font-bold text-ink">Your business</h2>

                <label className="mt-3 block text-[13px] font-semibold text-ink" htmlFor="c-name">
                  Business name
                </label>
                <input
                  id="c-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="As registered"
                  className="mt-1 w-full rounded-[14px] border border-line px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none"
                />

                <label className="mt-3 block text-[13px] font-semibold text-ink" htmlFor="c-lic">
                  Licence or GST number
                </label>
                <input
                  id="c-lic"
                  value={licence}
                  onChange={(e) => setLicence(e.target.value)}
                  className="mt-1 w-full rounded-[14px] border border-line px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none"
                />
                {/* The required document differs by corporation, so the field
                    doesn't pretend to know which one is wanted. */}
                <p className="mt-1 text-[11.5px] text-ink-faint">
                  Whatever your corporation asks collectors to register with.
                </p>

                <label className="mt-3 block text-[13px] font-semibold text-ink" htmlFor="c-phone">
                  Contact number
                </label>
                <input
                  id="c-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-[14px] border border-line px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none"
                />

                <h2 className="mt-5 font-display text-[16px] font-bold text-ink">
                  Wards you cover
                </h2>
                <p className="text-[12px] text-ink-faint">
                  You’ll only be offered pickups in these wards. {wardIds.length} selected.
                </p>
                <input
                  value={wardQuery}
                  onChange={(e) => setWardQuery(e.target.value)}
                  placeholder="Search wards"
                  aria-label="Search wards"
                  className="mt-2 w-full rounded-full border border-line px-4 py-2 text-[13px] text-ink focus:border-brand focus:outline-none"
                />
                <div className="mt-2 flex max-h-56 flex-wrap gap-1.5 overflow-y-auto">
                  {visibleWards.map((w) => {
                    const on = wardIds.includes(w.id);
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => toggleWard(w.id)}
                        aria-pressed={on}
                        className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                          on ? 'bg-brand text-white' : 'border border-line bg-card text-ink-soft'
                        }`}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                  {!visibleWards.length && (
                    <p className="py-3 text-[13px] text-ink-soft">No wards match “{wardQuery}”.</p>
                  )}
                </div>

                {status === 'verified' && (
                  <p className="mt-3 rounded-xl bg-flag-surface px-3 py-2 text-[12px] leading-snug text-ink">
                    Changing your business name or licence sends the registration back for
                    re-approval — the point of the check is that a named business was verified.
                  </p>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={saving || !businessName.trim() || !wardIds.length}
                  className="mt-4 w-full rounded-full bg-brand-gradient py-3 text-[15px] font-bold text-white shadow-fab active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? 'Submitting…' : profile ? 'Save changes' : 'Submit registration'}
                </button>
              </section>
            )}

            <button
              type="button"
              onClick={async () => {
                await logout();
                history.replace('/login');
              }}
              className="mx-auto mt-5 block text-[13px] font-semibold text-ink-soft"
            >
              Sign out
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ContractorRegister;
