import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import AdminShell from '../../components/admin/AdminShell';
import { fetchAdminLegal, saveLegal, toApiError, type LegalDoc, type LegalSection } from '../../lib/api';
import { PRIVACY, TERMS } from '../legal/legalContent';

const SLUGS = [
  { slug: 'privacy', title: 'Privacy Policy', seed: PRIVACY },
  { slug: 'terms', title: 'Terms of Service', seed: TERMS },
] as const;

const AdminPolicies: React.FC = () => {
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [slug, setSlug] = useState<'privacy' | 'terms'>('privacy');
  const [draft, setDraft] = useState<LegalDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setDocs(await fetchAdminLegal());
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Pick up the stored version, or seed the editor from the bundled copy so an
  // operator starts from real text instead of a blank page.
  useEffect(() => {
    const meta = SLUGS.find((s) => s.slug === slug)!;
    const stored = docs.find((d) => d.slug === slug);
    setDraft(
      stored ?? {
        slug,
        title: meta.title,
        sections: meta.seed.map((s) => ({ heading: s.heading, body: s.body, bullets: s.bullets ?? [] })),
        published: false,
        effective_at: null,
      },
    );
  }, [slug, docs]);

  const patchSection = (i: number, patch: Partial<LegalSection>) => {
    setDraft((d) =>
      d ? { ...d, sections: d.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) } : d,
    );
  };

  const submit = async (publish: boolean) => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const msg = await saveLegal(slug, {
        title: draft.title,
        sections: draft.sections,
        published: publish,
        effective_at: draft.effective_at,
      });
      setNotice(msg);
      await load();
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const stored = docs.find((d) => d.slug === slug);

  return (
    <IonPage>
      <IonContent fullscreen>
        <AdminShell
          scope={null}
          title="Policies"
          actions={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => submit(false)}
                disabled={saving}
                className="rounded-full border border-line px-4 py-1.5 text-[12.5px] font-semibold text-ink-soft disabled:opacity-40"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={() => submit(true)}
                disabled={saving}
                className="rounded-full bg-brand px-4 py-1.5 text-[12.5px] font-bold text-white disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Publish'}
              </button>
            </div>
          }
        >
          <div className="px-4 pb-16 pt-4 lg:px-6 lg:pt-6">
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

            <div className="flex gap-2">
              {SLUGS.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => setSlug(s.slug)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
                    slug === s.slug ? 'bg-ink text-white' : 'border border-line bg-card text-ink-soft'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px]">
              {stored ? (
                <>
                  <span
                    className={`rounded-full px-2.5 py-1 font-bold ${
                      stored.published
                        ? 'bg-grass-surface text-grass-dark'
                        : 'bg-flag-surface text-flag'
                    }`}
                  >
                    {stored.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-ink-faint">
                    Last edited by {stored.updated_by ?? 'unknown'}
                    {stored.effective_at ? ` · effective ${stored.effective_at}` : ''}
                  </span>
                </>
              ) : (
                <span className="rounded-full bg-flag-surface px-2.5 py-1 font-bold text-flag">
                  Not saved yet — showing the version bundled with the app
                </span>
              )}
            </div>

            <p className="mt-3 rounded-2xl bg-brand-surface px-4 py-3 text-[12.5px] leading-snug text-ink">
              <strong>Publishing makes this live for every user immediately.</strong> Google Play
              holds the operator responsible for the policy being accurate about what the app
              collects — keep it in step with the Data safety form. Saving as a draft changes
              nothing for users.
            </p>

            {draft && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-2xl bg-card p-4 shadow-card">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint" htmlFor="doc-title">
                    Document title
                  </label>
                  <input
                    id="doc-title"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="mt-1.5 w-full rounded-[14px] border border-line px-3 py-2.5 text-[15px] font-semibold text-ink focus:border-brand focus:outline-none focus:ring-0"
                  />
                </div>

                {draft.sections.map((s, i) => (
                  <div key={i} className="rounded-2xl bg-card p-4 shadow-card">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                        Section {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            sections: draft.sections.filter((_, idx) => idx !== i),
                          })
                        }
                        className="text-[12.5px] font-semibold text-danger"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      value={s.heading}
                      onChange={(e) => patchSection(i, { heading: e.target.value })}
                      placeholder="Heading"
                      className="mt-2 w-full rounded-[14px] border border-line px-3 py-2 text-[14px] font-semibold text-ink focus:border-brand focus:outline-none focus:ring-0"
                    />

                    <label className="mt-3 block text-[11.5px] font-semibold text-ink-soft">
                      Paragraphs — one per line
                    </label>
                    <textarea
                      rows={4}
                      value={s.body.join('\n')}
                      onChange={(e) =>
                        patchSection(i, { body: e.target.value.split('\n').filter(Boolean) })
                      }
                      className="mt-1 w-full rounded-[14px] border border-line px-3 py-2 text-[13.5px] leading-relaxed text-ink focus:border-brand focus:outline-none focus:ring-0"
                    />

                    <label className="mt-3 block text-[11.5px] font-semibold text-ink-soft">
                      Bullet points — one per line (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={(s.bullets ?? []).join('\n')}
                      onChange={(e) =>
                        patchSection(i, { bullets: e.target.value.split('\n').filter(Boolean) })
                      }
                      className="mt-1 w-full rounded-[14px] border border-line px-3 py-2 text-[13.5px] leading-relaxed text-ink focus:border-brand focus:outline-none focus:ring-0"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      sections: [...draft.sections, { heading: '', body: [], bullets: [] }],
                    })
                  }
                  className="rounded-2xl border border-dashed border-line py-3 text-[13.5px] font-semibold text-ink-soft"
                >
                  + Add section
                </button>
              </div>
            )}
          </div>
        </AdminShell>
      </IonContent>
    </IonPage>
  );
};

export default AdminPolicies;
