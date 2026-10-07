import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import AdminShell from '../../components/admin/AdminShell';
import {
  fetchAdminContractors,
  fetchRates,
  saveRates,
  toApiError,
  updateAdminContractor,
  type AdminContractorRow,
  type ContractorStatus,
  type MaterialRateRow,
} from '../../lib/api';

const FILTERS: { key: string; label: string }[] = [
  { key: 'pending', label: 'Awaiting approval' },
  { key: 'verified', label: 'Approved' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'all', label: 'All' },
];

const STATUS_TONE: Record<ContractorStatus, string> = {
  pending: 'bg-flag-surface text-flag',
  verified: 'bg-grass-surface text-grass-dark',
  suspended: 'bg-danger-surface text-danger',
};

/**
 * Approving collectors, and publishing the rate card they quote against.
 *
 * These sit on one screen because they're the same job: deciding who may reach
 * residents, and on what terms.
 */
const AdminContractors: React.FC = () => {
  const [status, setStatus] = useState('pending');
  const [rows, setRows] = useState<AdminContractorRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const [suspending, setSuspending] = useState<AdminContractorRow | null>(null);
  const [reason, setReason] = useState('');

  const [rates, setRates] = useState<MaterialRateRow[]>([]);
  const [ratesDirty, setRatesDirty] = useState(false);
  const [savingRates, setSavingRates] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchAdminContractors(status, q);
      setRows(data.contractors);
      setCounts(data.counts);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [status, q]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchRates().then(setRates).catch(() => setRates([]));
  }, []);

  const setStatusFor = async (row: AdminContractorRow, next: ContractorStatus, why?: string) => {
    setBusy(row.id);
    setError(null);
    try {
      await updateAdminContractor(row.id, next, why);
      setNotice(
        next === 'verified'
          ? `${row.business_name} approved — they can accept pickups now.`
          : `${row.business_name} set to ${next}.`,
      );
      await load();
      return true;
    } catch (err) {
      setError(toApiError(err).message);
      return false;
    } finally {
      setBusy(null);
    }
  };

  const submitRates = async () => {
    setSavingRates(true);
    try {
      setNotice(await saveRates(rates));
      setRatesDirty(false);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSavingRates(false);
    }
  };

  const editRate = (material: string, patch: Partial<MaterialRateRow>) => {
    setRates((cur) => cur.map((r) => (r.material === material ? { ...r, ...patch } : r)));
    setRatesDirty(true);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <AdminShell title="Collectors">
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

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar">
                    {FILTERS.map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => {
                          setStatus(f.key);
                          setLoading(true);
                        }}
                        className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
                          status === f.key
                            ? 'bg-ink text-white'
                            : 'border border-line bg-card text-ink-soft'
                        }`}
                      >
                        {f.label}
                        <span
                          className={status === f.key ? 'ml-1.5 text-white/70' : 'ml-1.5 text-ink-faint'}
                        >
                          {counts[f.key] ?? 0}
                        </span>
                      </button>
                    ))}
                  </div>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search business or person"
                    aria-label="Search collectors"
                    className="shrink-0 rounded-full border border-line bg-card px-4 py-2 text-[13px] text-ink focus:border-brand focus:outline-none sm:w-64"
                  />
                </div>

                {loading && <p className="py-10 text-center text-[14px] text-ink-soft">Loading…</p>}
                {!loading && !rows.length && (
                  <p className="py-10 text-center text-[14px] text-ink-soft">
                    {status === 'pending' ? 'No registrations waiting.' : 'Nobody here.'}
                  </p>
                )}

                <div className="mt-3 flex flex-col gap-2.5">
                  {rows.map((c) => (
                    <article key={c.id} className="rounded-2xl bg-card p-4 shadow-card">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-[15.5px] font-bold text-ink">
                              {c.business_name}
                            </h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase ${STATUS_TONE[c.status]}`}
                            >
                              {c.status}
                            </span>
                          </div>
                          <p className="text-[12.5px] text-ink-soft">
                            {c.name} · {c.email}
                            {c.phone ? ` · ${c.phone}` : ''}
                          </p>
                          {/* Left blank rather than filled with a placeholder —
                              "no licence given" is a fact an approver needs. */}
                          <p className="tnum text-[11.5px] text-ink-faint">
                            {c.licence_no ? `Licence ${c.licence_no}` : 'No licence number given'}
                            {' · '}
                            {c.completed_pickups} collected · {c.open_pickups} open
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.wards.map((w) => (
                          <span
                            key={w.id}
                            className="rounded-full bg-surface-container px-2.5 py-0.5 text-[11px] text-ink-soft"
                          >
                            {w.label}
                          </span>
                        ))}
                        {!c.wards.length && (
                          <span className="text-[11.5px] text-flag">No wards selected</span>
                        )}
                      </div>

                      {c.status_reason && (
                        <p className="mt-2 rounded-xl bg-surface-container px-3 py-2 text-[12px] text-ink-soft">
                          {c.status_reason}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {c.status !== 'verified' && (
                          <button
                            type="button"
                            disabled={busy === c.id}
                            onClick={() => setStatusFor(c, 'verified')}
                            className="rounded-full bg-brand-gradient px-4 py-2 text-[13px] font-bold text-white active:scale-95 disabled:opacity-50"
                          >
                            {busy === c.id ? 'Working…' : 'Approve'}
                          </button>
                        )}
                        {c.status !== 'suspended' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSuspending(c);
                              setReason('');
                            }}
                            className="rounded-full border border-danger/30 px-4 py-2 text-[13px] font-semibold text-danger"
                          >
                            Suspend
                          </button>
                        )}
                        {c.status === 'suspended' && (
                          <button
                            type="button"
                            disabled={busy === c.id}
                            onClick={() => setStatusFor(c, 'pending', 'Returned for review.')}
                            className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink-soft"
                          >
                            Return to pending
                          </button>
                        )}
                      </div>

                      {/* Suspension doesn't cancel work already accepted — the
                          resident is expecting that collector. */}
                      {c.status === 'verified' && c.open_pickups > 0 && (
                        <p className="mt-2 text-[11.5px] text-ink-faint">
                          {c.open_pickups} pickup{c.open_pickups === 1 ? '' : 's'} in progress.
                          Suspending stops new ones; these still stand.
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </div>

              {/* ------------------------------------------------ rate card */}
              <section className="rounded-2xl bg-card p-4 shadow-card lg:self-start">
                <h2 className="font-display text-[16px] font-bold text-ink">Rate card</h2>
                <p className="text-[12px] leading-snug text-ink-faint">
                  Published ₹/kg, used to show residents an indicative value. The amount actually
                  paid is agreed at the door and recorded separately.
                </p>

                <div className="mt-3 flex flex-col gap-2">
                  {rates.map((r) => (
                    <div key={r.material} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 text-[13px] capitalize text-ink">
                        {r.material}
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={r.rate_per_kg ?? ''}
                        onChange={(e) =>
                          editRate(r.material, {
                            rate_per_kg: e.target.value === '' ? null : Number(e.target.value),
                            active: e.target.value !== '',
                          })
                        }
                        placeholder="—"
                        aria-label={`Rate per kg for ${r.material}`}
                        className="w-24 rounded-[12px] border border-line px-2.5 py-1.5 text-right text-[13px] text-ink focus:border-brand focus:outline-none"
                      />
                      <span className="text-[12px] text-ink-faint">/kg</span>
                    </div>
                  ))}
                </div>

                {/* An empty rate is not zero. Say which it is. */}
                <p className="mt-3 text-[11.5px] leading-snug text-ink-faint">
                  Leave blank for no published rate — residents are then told the collector will
                  agree a price on collection, rather than being shown ₹0.
                </p>

                <button
                  type="button"
                  onClick={submitRates}
                  disabled={!ratesDirty || savingRates}
                  className="mt-3 w-full rounded-full bg-brand px-4 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-40"
                >
                  {savingRates ? 'Saving…' : ratesDirty ? 'Publish rates' : 'Saved'}
                </button>
              </section>
            </div>
          </div>
        </AdminShell>

        {suspending && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog">
            <div className="w-full max-w-md rounded-2xl bg-card p-5">
              <h2 className="font-display text-[17px] font-bold text-ink">
                Suspend {suspending.business_name}
              </h2>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">
                They stop being offered new pickups immediately. The reason is shown to them, and
                is the record of why access was removed.
              </p>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this account being suspended?"
                className="mt-3 w-full rounded-[14px] border border-line px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none"
              />
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSuspending(null)}
                  className="flex-1 rounded-full border border-line py-2.5 text-[13.5px] font-semibold text-ink-soft"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!reason.trim()}
                  onClick={async () => {
                    if (await setStatusFor(suspending, 'suspended', reason.trim())) {
                      setSuspending(null);
                    }
                  }}
                  className="flex-1 rounded-full bg-danger py-2.5 text-[13.5px] font-bold text-white disabled:opacity-50"
                >
                  Suspend
                </button>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminContractors;
