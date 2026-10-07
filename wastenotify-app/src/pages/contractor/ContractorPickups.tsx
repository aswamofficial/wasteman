import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import {
  acceptPickup,
  fetchPickups,
  rejectPickup,
  releasePickup,
  settlePickup,
  toApiError,
  type PickupsPayload,
  type Report,
} from '../../lib/api';

type Tab = 'available' | 'mine' | 'history';

const TABS: { key: Tab; label: string }[] = [
  { key: 'available', label: 'Available' },
  { key: 'mine', label: 'Accepted' },
  { key: 'history', label: 'Collected' },
];

const MATERIAL_ICON: Record<string, string> = {
  paper: 'newspaper',
  plastic: 'water_bottle',
  metal: 'hardware',
  glass: 'wine_bar',
  electronics: 'cable',
  textile: 'checkroom',
  mixed: 'inventory_2',
};

const rupees = (n: number | null | undefined) =>
  n == null ? null : `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

/**
 * The collector's whole app: what's on offer, what they've taken, what they've
 * paid out.
 *
 * Deliberately not built on AdminShell. A collector is not a municipal officer
 * — they have no ward queue, no complaints, no policies — and reusing that
 * chrome would put a corporation sidebar around a private business's screen.
 */
const ContractorPickups: React.FC = () => {
  const history = useHistory();
  const { user, logout } = useAuth();

  const [tab, setTab] = useState<Tab>('available');
  const [data, setData] = useState<PickupsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Settlement sheet
  const [settling, setSettling] = useState<Report | null>(null);
  const [amount, setAmount] = useState('');
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');

  // Rejection sheet
  const [rejecting, setRejecting] = useState<Report | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await fetchPickups(tab));
    } catch (err) {
      const e = toApiError(err);
      // A pending or suspended collector is bounced to their registration
      // screen, which explains the status, rather than left on an empty list.
      if (e.status === 403) history.replace('/collector/register');
      else setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab, history]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: number, fn: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await load();
      return true;
    } catch (err) {
      setError(toApiError(err).message);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const submitSettle = async () => {
    if (!settling) return;
    const ok = await act(settling.id, () =>
      settlePickup(settling.id, Number(amount), Number(weight), note.trim() || undefined),
    );
    if (ok) {
      setSettling(null);
      setAmount('');
      setWeight('');
      setNote('');
    }
  };

  const submitReject = async () => {
    if (!rejecting) return;
    const ok = await act(rejecting.id, () => rejectPickup(rejecting.id, reason.trim()));
    if (ok) {
      setRejecting(null);
      setReason('');
    }
  };

  const rows = data?.reports ?? [];

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-full bg-canvas pb-16">
          {/* Collectors work off a phone in the street and a laptop in the
              yard, so the layout is constrained rather than left to stretch
              across a desktop width. */}
          <header className="bg-brand-gradient px-4 pb-6 pt-5 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1100px] items-start justify-between gap-3">
              <div className="min-w-0">
                <Logo size={26} variant="mono" withWordmark />
                <p className="mt-2 font-display text-[20px] font-extrabold text-white">
                  Collector
                </p>
                <p className="truncate text-[13px] text-white/75">{user?.name}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  history.replace('/login');
                }}
                className="shrink-0 rounded-full border border-white/30 px-3 py-1.5 text-[12px] font-semibold text-white active:scale-95"
              >
                Sign out
              </button>
            </div>

            {/* Paid out, not earned — the money moves from the collector to
                residents, and calling it earnings would invert that. */}
            <div className="mx-auto mt-4 flex w-full max-w-[1100px] divide-x divide-white/25 rounded-2xl bg-white/15 py-3">
              <div className="flex-1 text-center">
                <p className="tnum font-display text-[18px] font-extrabold text-white">
                  {rupees(data?.earnings.paid_total ?? 0)}
                </p>
                <p className="text-[11px] text-white/75">Paid to residents</p>
              </div>
              <div className="flex-1 text-center">
                <p className="tnum font-display text-[18px] font-extrabold text-white">
                  {(data?.earnings.collected_kg ?? 0).toFixed(1)} kg
                </p>
                <p className="text-[11px] text-white/75">Collected</p>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1100px] px-4 lg:px-8">
            <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setTab(t.key);
                    setLoading(true);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
                    tab === t.key ? 'bg-ink text-white' : 'border border-line bg-card text-ink-soft'
                  }`}
                >
                  {t.label}
                  {data && (
                    <span className={tab === t.key ? 'ml-1.5 text-white/70' : 'ml-1.5 text-ink-faint'}>
                      {data.counts[t.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div role="alert" className="mt-3 rounded-2xl bg-danger-surface px-4 py-3">
                <p className="text-[13px] text-danger">{error}</p>
              </div>
            )}

            {/* An unset service area is not a claim to work everywhere — say so
                rather than showing an empty list that looks like no demand. */}
            {data && !data.service_wards.length && (
              <div className="mt-3 rounded-2xl bg-flag-surface px-4 py-3">
                <p className="text-[13px] text-ink">
                  No service wards set, so nothing will ever appear here.{' '}
                  <button
                    type="button"
                    onClick={() => history.push('/collector/register')}
                    className="font-bold underline"
                  >
                    Choose your wards
                  </button>
                </p>
              </div>
            )}

            {loading && <p className="mt-8 text-center text-[14px] text-ink-soft">Loading…</p>}

            {!loading && !rows.length && !error && (
              <p className="mt-10 text-center text-[14px] text-ink-soft">
                {tab === 'available'
                  ? 'Nothing on offer in your wards right now.'
                  : tab === 'mine'
                    ? "You haven't accepted anything yet."
                    : 'Nothing collected yet.'}
              </p>
            )}

            {/* Two across on a laptop: a job is a compact card, and one per
                row across 1100px would be mostly empty space. */}
            <div className="mt-3 grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              {rows.map((r) => (
                <article key={r.id} className="flex flex-col rounded-2xl bg-card p-3 shadow-card">
                  <div className="flex gap-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                      {r.photo_url && (
                        <img src={r.photo_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1 rounded-full bg-grass-surface px-2 py-0.5 text-[10.5px] font-bold uppercase text-grass-dark">
                          <span className="material-symbols-outlined text-[13px]">
                            {MATERIAL_ICON[r.material ?? 'mixed'] ?? 'inventory_2'}
                          </span>
                          {r.material ?? 'mixed'}
                        </span>
                        {!r.ai_trusted && (
                          <span className="rounded-full bg-flag-surface px-1.5 py-0.5 text-[10px] font-bold uppercase text-flag">
                            unverified
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate font-display text-[15px] font-bold text-ink">
                        {r.waste_type ?? 'Recyclable material'}
                      </p>
                      <p className="truncate text-[12px] text-ink-soft">{r.address}</p>
                      <p className="tnum mt-0.5 text-[11.5px] text-ink-faint">
                        {r.reference} · ~{r.estimated_weight_kg ?? '?'} kg · {r.created_for_humans}
                      </p>
                    </div>
                  </div>

                  {/* Estimate, stated as one. The final figure is agreed at the
                      door, so promising a price here would commit the collector
                      to a number the app can't hold them to. */}
                  <div className="mt-2.5 flex items-center justify-between rounded-xl bg-surface-container px-3 py-2">
                    <span className="text-[12px] text-ink-soft">
                      {tab === 'history' ? 'You paid' : 'Indicative at published rate'}
                    </span>
                    <span className="tnum text-[14px] font-bold text-ink">
                      {tab === 'history'
                        ? `${rupees(r.settled_amount)} · ${r.settled_weight_kg} kg`
                        : (rupees(r.offer_amount) ?? 'Price on collection')}
                    </span>
                  </div>

                  {tab === 'available' && (
                    <div className="mt-2.5 flex gap-2">
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => act(r.id, () => acceptPickup(r.id))}
                        className="flex-1 rounded-full bg-brand-gradient py-2.5 text-[13.5px] font-bold text-white active:scale-[0.98] disabled:opacity-50"
                      >
                        {busyId === r.id ? 'Accepting…' : 'Accept pickup'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejecting(r)}
                        className="rounded-full border border-line px-4 py-2.5 text-[13px] font-semibold text-ink-soft"
                      >
                        Not recyclable
                      </button>
                    </div>
                  )}

                  {tab === 'mine' && (
                    <>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[12px] text-ink-soft">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-full bg-brand-surface px-3 py-1.5 font-semibold text-brand"
                        >
                          <span className="material-symbols-outlined text-[16px]">directions</span>
                          Directions
                        </a>
                        {/* Contact details arrive only once the job is
                            accepted — see PickupController. */}
                        {r.reporter?.phone && (
                          <a
                            href={`tel:${r.reporter.phone}`}
                            className="flex items-center gap-1 rounded-full bg-grass-surface px-3 py-1.5 font-semibold text-grass-dark"
                          >
                            <span className="material-symbols-outlined text-[16px]">call</span>
                            {r.reporter.name}
                          </a>
                        )}
                      </div>
                      <div className="mt-2.5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSettling(r);
                            setWeight(String(r.estimated_weight_kg ?? ''));
                            setAmount(r.offer_amount ? String(r.offer_amount) : '');
                          }}
                          className="flex-1 rounded-full bg-brand-gradient py-2.5 text-[13.5px] font-bold text-white active:scale-[0.98]"
                        >
                          Collected — record payment
                        </button>
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => act(r.id, () => releasePickup(r.id))}
                          className="rounded-full border border-line px-4 py-2.5 text-[13px] font-semibold text-ink-soft disabled:opacity-50"
                        >
                          Release
                        </button>
                      </div>
                    </>
                  )}

                  {tab === 'history' && (
                    <p className="mt-2 text-[11.5px] text-ink-faint">
                      {r.citizen_confirmed_at
                        ? '✓ Resident confirmed this payment'
                        : 'Awaiting the resident’s confirmation'}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------ settle sheet */}
        {settling && (
          <div className="fixed inset-0 z-50 flex items-end bg-ink/50" role="dialog">
            <div className="max-h-[88%] w-full overflow-y-auto rounded-t-3xl bg-card p-5">
              <h2 className="font-display text-[18px] font-bold text-ink">Record the collection</h2>
              <p className="mt-1 text-[12.5px] text-ink-soft">
                {settling.reference} · {settling.address}
              </p>

              <label className="mt-4 block text-[13px] font-semibold text-ink" htmlFor="s-weight">
                Weight collected (kg)
              </label>
              <input
                id="s-weight"
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1 w-full rounded-[14px] border border-line px-3 py-2.5 text-[15px] text-ink focus:border-brand focus:outline-none"
              />

              <label className="mt-3 block text-[13px] font-semibold text-ink" htmlFor="s-amount">
                Amount paid to the resident (₹)
              </label>
              <input
                id="s-amount"
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-[14px] border border-line px-3 py-2.5 text-[15px] text-ink focus:border-brand focus:outline-none"
              />

              <label className="mt-3 block text-[13px] font-semibold text-ink" htmlFor="s-note">
                Note (optional)
              </label>
              <input
                id="s-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. paid by UPI"
                className="mt-1 w-full rounded-[14px] border border-line px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none"
              />

              <p className="mt-3 rounded-xl bg-brand-surface px-3 py-2 text-[12px] leading-snug text-ink">
                The resident is asked to confirm this amount. Record what you actually handed
                over — this is the only record either of you will have.
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSettling(null)}
                  className="flex-1 rounded-full border border-line py-3 text-[14px] font-semibold text-ink-soft"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitSettle}
                  disabled={!weight || !amount || busyId === settling.id}
                  className="flex-1 rounded-full bg-brand-gradient py-3 text-[14px] font-bold text-white disabled:opacity-50"
                >
                  {busyId === settling.id ? 'Saving…' : 'Confirm collection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------ reject sheet */}
        {rejecting && (
          <div className="fixed inset-0 z-50 flex items-end bg-ink/50" role="dialog">
            <div className="w-full rounded-t-3xl bg-card p-5">
              <h2 className="font-display text-[18px] font-bold text-ink">Not recyclable</h2>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">
                This sends {rejecting.reference} to the corporation for removal instead. The
                resident is told why, so the waste doesn’t just sit there.
              </p>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. soaked and mixed with food waste — no scrap value"
                className="mt-3 w-full rounded-[14px] border border-line px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none"
              />
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejecting(null)}
                  className="flex-1 rounded-full border border-line py-3 text-[14px] font-semibold text-ink-soft"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReject}
                  disabled={reason.trim().length < 4}
                  className="flex-1 rounded-full bg-flag py-3 text-[14px] font-bold text-white disabled:opacity-50"
                >
                  Send to corporation
                </button>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ContractorPickups;
