import { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { fetchLegal, type LegalOperator, type PublishedLegal } from '../../lib/api';
import { LEGAL_UPDATED, PRIVACY, TERMS, type Section } from './legalContent';

/** What the operator must supply before the policy can be published. */
const REQUIRED_LABELS: Record<string, string> = {
  name: 'operating body',
  email: 'privacy contact email',
  address: 'registered address',
  grievance_officer: 'grievance officer',
};

/**
 * Renders the privacy policy or the terms. Both are also reachable without
 * signing in — Google Play requires the privacy policy to be accessible to
 * anyone, not just to users who already have an account.
 *
 * The published version wins over the bundled copy. Previously this screen only
 * ever rendered the bundled constants, so everything an admin edited under
 * Policies was saved, versioned — and never shown to a single citizen.
 */
const LegalPage: React.FC<{ kind: 'privacy' | 'terms' }> = ({ kind }) => {
  const history = useHistory();
  const [live, setLive] = useState<PublishedLegal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchLegal(kind)
      .then((d) => {
        if (!cancelled) setLive(d);
      })
      // Offline, or the API is down. The bundled copy is a worse answer than
      // the published one but a much better answer than a blank policy.
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const bundled: Section[] = kind === 'privacy' ? PRIVACY : TERMS;
  const sections: Section[] = live?.sections?.length ? live.sections : bundled;
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  const operator: LegalOperator | null = live?.operator ?? null;
  const missing = live?.missing ?? [];
  const updated = live?.effective_at ?? live?.updated_at?.slice(0, 10) ?? LEGAL_UPDATED;

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-full bg-canvas pb-16">
          <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-canvas px-4 py-3">
            <button
              type="button"
              onClick={() => history.goBack()}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink active:scale-95"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-display text-[18px] font-bold text-ink">{title}</h1>
          </header>

          <div className="mx-auto max-w-2xl px-4 pt-5">
            <p className="text-[12px] text-ink-faint">
              {loading ? 'Loading the current version…' : `Last updated ${updated}`}
              {live && !live.published && ' · bundled copy, nothing published yet'}
            </p>

            {!!missing.length && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-flag-surface px-4 py-3">
                <span className="material-symbols-outlined text-[20px] text-flag">warning</span>
                <p className="text-[12.5px] leading-snug text-ink">
                  <strong>Not ready to publish.</strong> Still unset:{' '}
                  {missing.map((m) => REQUIRED_LABELS[m] ?? m).join(', ')}. Google Play will reject
                  a policy that doesn't name a real controller and a working contact. An
                  administrator sets these under Configuration → Contact details.
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-6">
              {sections.map((s) => (
                <section key={s.heading}>
                  <h2 className="font-display text-[16px] font-bold text-ink">{s.heading}</h2>
                  {s.body.map((p) => (
                    <p key={p} className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                      {p}
                    </p>
                  ))}
                  {s.bullets && (
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex gap-2 text-[14px] leading-relaxed text-ink-soft">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <section className="rounded-2xl bg-card p-4 shadow-card">
                <h2 className="font-display text-[16px] font-bold text-ink">Contact</h2>
                {/* Straight from the operator's own configuration. An unset
                    field reads as "Not set" — a plausible-looking placeholder
                    here would be a false statement about who holds the data. */}
                <dl className="mt-2 flex flex-col gap-1 text-[13.5px]">
                  {(
                    [
                      ['Operator', operator?.name],
                      ['Email', operator?.email],
                      ['Address', operator?.address],
                      ['Grievances', operator?.grievance_officer],
                      ['Helpline', operator?.helpline],
                    ] as const
                  ).map(([label, value]) =>
                    // The helpline is optional, so it's simply omitted when
                    // blank rather than advertised as missing.
                    label === 'Helpline' && !value ? null : (
                      <div key={label} className="flex gap-2">
                        <dt className="w-28 shrink-0 text-ink-faint">{label}</dt>
                        <dd className={value ? 'text-ink-soft' : 'text-flag'}>
                          {value ?? 'Not set'}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
              </section>

              <div className="flex gap-3">
                {kind === 'privacy' ? (
                  <button
                    type="button"
                    onClick={() => history.push('/legal/terms')}
                    className="text-[14px] font-semibold text-brand"
                  >
                    Read the Terms of Service
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => history.push('/legal/privacy')}
                    className="text-[14px] font-semibold text-brand"
                  >
                    Read the Privacy Policy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LegalPage;
