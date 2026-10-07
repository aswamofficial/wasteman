import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import AdminShell from '../../components/admin/AdminShell';
import { fetchSettings, saveSettings, toApiError, type AppSetting } from '../../lib/api';

const GROUP_META: Record<string, { title: string; help: string; icon: string }> = {
  service: {
    title: 'Service targets',
    help: 'What counts as late, and what citizens are promised.',
    icon: 'schedule',
  },
  ai: {
    title: 'AI classification',
    help: 'How report photos are analysed and when a human should check.',
    icon: 'auto_awesome',
  },
  contact: {
    title: 'Contact details',
    help: 'Shown to citizens in the app and in the policies.',
    icon: 'call',
  },
  privacy: {
    title: 'Privacy & visibility',
    help: 'What citizens and crews can see about each other.',
    icon: 'shield',
  },
};

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchSettings();
      setSettings(data.settings);
      setGroups(data.groups);
      setValues(Object.fromEntries(data.settings.map((s) => [s.key, s.value])));
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = settings.some((s) => String(values[s.key] ?? '') !== String(s.value ?? ''));

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const msg = await saveSettings(values);
      setNotice(msg);
      await load();
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, v: unknown) => setValues((prev) => ({ ...prev, [key]: v }));

  return (
    <IonPage>
      <IonContent fullscreen>
        <AdminShell
          scope={null}
          title="Configuration"
          actions={
            <button
              type="button"
              onClick={submit}
              disabled={!dirty || saving}
              className="rounded-full bg-brand px-4 py-1.5 text-[12.5px] font-bold text-white disabled:opacity-40"
            >
              {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
            </button>
          }
        >
          <div className="px-4 pb-24 pt-4 lg:px-6 lg:pt-6">
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
            {loading && <p className="py-10 text-center text-[14px] text-ink-soft">Loading…</p>}

            <div className="grid gap-4 lg:grid-cols-2">
              {groups.map((g) => {
                const meta = GROUP_META[g] ?? { title: g, help: '', icon: 'tune' };
                return (
                  <section key={g} className="rounded-2xl bg-card p-4 shadow-card">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-brand">
                        {meta.icon}
                      </span>
                      <h2 className="font-display text-[16px] font-bold text-ink">{meta.title}</h2>
                    </div>
                    {meta.help && <p className="mt-1 text-[12.5px] text-ink-faint">{meta.help}</p>}

                    <div className="mt-4 flex flex-col gap-4">
                      {settings
                        .filter((s) => s.group === g)
                        .map((s) => (
                          <div key={s.key}>
                            {s.type === 'bool' ? (
                              <label className="flex cursor-pointer items-start justify-between gap-3">
                                <span className="min-w-0">
                                  <span className="block text-[14px] font-semibold text-ink">
                                    {s.label}
                                  </span>
                                  {s.help && (
                                    <span className="block text-[12px] leading-snug text-ink-faint">
                                      {s.help}
                                    </span>
                                  )}
                                </span>
                                <span className="relative mt-0.5 shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={!!values[s.key]}
                                    onChange={(e) => set(s.key, e.target.checked)}
                                    className="peer sr-only"
                                  />
                                  <span className="block h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-brand" />
                                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                                </span>
                              </label>
                            ) : (
                              <>
                                <label
                                  className="block text-[14px] font-semibold text-ink"
                                  htmlFor={`s-${s.key}`}
                                >
                                  {s.label}
                                </label>
                                {s.help && (
                                  <p className="text-[12px] leading-snug text-ink-faint">{s.help}</p>
                                )}
                                <input
                                  id={`s-${s.key}`}
                                  type={
                                    s.type === 'int'
                                      ? 'number'
                                      : s.type === 'email'
                                        ? 'email'
                                        : s.type === 'tel'
                                          ? 'tel'
                                          : 'text'
                                  }
                                  value={String(values[s.key] ?? '')}
                                  onChange={(e) => set(s.key, e.target.value)}
                                  placeholder="Not set"
                                  className="mt-1.5 w-full rounded-[14px] border border-line bg-card px-3 py-2.5 text-[14px] text-ink focus:border-brand focus:outline-none focus:ring-0"
                                />
                                {/* Contact details start blank rather than
                                    carrying a plausible-looking placeholder. */}
                                {!String(values[s.key] ?? '') && s.group === 'contact' && (
                                  <p className="mt-1 text-[11.5px] text-flag">
                                    Not set — citizens will see nothing here.
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Sticky within the content column, not fixed to the viewport with
                a hard-coded sidebar offset — the sidebar can collapse, and a
                fixed offset would leave a gap when it does. */}
            {dirty && (
              <div className="sticky bottom-0 z-30 -mx-4 mt-4 border-t border-line bg-card px-4 py-3 lg:-mx-6 lg:px-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] text-ink-soft">You have unsaved changes.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={load}
                      className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink-soft"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={saving}
                      className="rounded-full bg-brand px-5 py-2 text-[13px] font-bold text-white disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AdminShell>
      </IonContent>
    </IonPage>
  );
};

export default AdminSettings;
