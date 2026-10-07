import { useMemo, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Link, Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toApiError } from '../lib/api';
import FieldError from '../components/FieldError';

/*
 * Screen 03 wasn't in the Stitch export, so this is hand-built to match the
 * login screen's structure and the design system tokens: teal hero panel with
 * the asymmetric bottom-left radius, one elevated card, 14px inputs with a
 * leading icon, full-pill primary action.
 */

/** Cheap client-side strength hint. The server is the real authority (min 8). */
function strengthOf(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] };
}

const Signup: React.FC = () => {
  const { register, isAuthenticated, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const strength = useMemo(() => strengthOf(password), [password]);

  if (!loading && isAuthenticated) {
    return <Redirect to="/home" />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Catch the two things the server can't phrase as nicely in context.
    if (!agreed) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }
    if (password !== confirm) {
      setError(null);
      setFields({ password_confirmation: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);
    setError(null);
    setFields({});

    try {
      // No imperative navigation here — register() populates the auth context
      // and the isAuthenticated redirect above handles the move to /home.
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: confirm,
      });
    } catch (err) {
      const apiError = toApiError(err);
      setError(Object.keys(apiError.fields).length ? null : apiError.message);
      setFields(apiError.fields);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (invalid?: string, extra = '') =>
    `block w-full pl-10 py-3 bg-surface-container-lowest rounded-[14px] font-body-md text-body-md text-on-surface focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50 ${extra} ${
      invalid ? 'border-2 border-error' : 'border border-warm-taupe focus:border-turquoise'
    }`;

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="bg-surface min-h-screen flex flex-col font-body-md text-on-surface antialiased overflow-x-hidden">
          <header className="bg-deep-teal rounded-br-[40px] pt-10 pb-14 px-margin relative overflow-hidden shadow-sm">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10">
              <Link
                to="/login"
                aria-label="Back to sign in"
                className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-white/90 hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <h1 className="mt-3 font-headline-lg text-headline-lg text-white">
                Create your account
              </h1>
              <p className="mt-2 font-body-md text-body-md text-white/80 max-w-sm">
                Phone and email are both required so we can reach you about your reports and send
                the photo when they're resolved.
              </p>
            </div>
          </header>

          <main className="flex-grow px-margin -mt-6 pb-xl relative z-20 flex flex-col items-center">
            <div className="w-full max-w-md bg-surface-container-lowest rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,58,62,0.08)] border border-warm-taupe/20">
              {error && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2 rounded-[14px] bg-error-container px-4 py-3"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-error-container">
                    error
                  </span>
                  <p className="font-caption text-caption text-on-error-container">{error}</p>
                </div>
              )}

              <form className="space-y-5" onSubmit={submit} noValidate>
                <div>
                  <label className="block font-body-md text-body-md mb-1.5" htmlFor="name">
                    Full name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        person
                      </span>
                    </div>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass(fields.name, 'pr-3')}
                    />
                  </div>
                  <FieldError message={fields.name} />
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <label className="block font-body-md text-body-md" htmlFor="signup-email">
                      Email address
                    </label>
                    <span className="font-micro-label text-micro-label uppercase text-turquoise">
                      Required
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        mail
                      </span>
                    </div>
                    <input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass(fields.email, 'pr-3')}
                    />
                  </div>
                  <FieldError message={fields.email} />
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <label className="block font-body-md text-body-md" htmlFor="phone">
                      Phone number
                    </label>
                    <span className="font-micro-label text-micro-label uppercase text-turquoise">
                      Required
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        call
                      </span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass(fields.phone, 'pr-3')}
                    />
                  </div>
                  <FieldError message={fields.phone} />
                  {!fields.phone && (
                    <p className="mt-1.5 font-caption text-caption text-on-surface-variant">
                      Clean-up crews use this to reach you on site.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-body-md text-body-md mb-1.5" htmlFor="signup-password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        lock
                      </span>
                    </div>
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass(fields.password, 'pr-10')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>

                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex flex-grow gap-1" aria-hidden="true">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              i < strength.score ? 'bg-turquoise' : 'bg-warm-taupe'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-caption text-caption text-on-surface-variant">
                        {strength.label}
                      </span>
                    </div>
                  )}
                  <FieldError message={fields.password} />
                </div>

                <div>
                  <label className="block font-body-md text-body-md mb-1.5" htmlFor="confirm">
                    Confirm password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        lock_reset
                      </span>
                    </div>
                    <input
                      id="confirm"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={inputClass(fields.password_confirmation, 'pr-3')}
                    />
                  </div>
                  <FieldError message={fields.password_confirmation} />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-warm-taupe text-turquoise focus:ring-turquoise"
                  />
                  <span className="font-caption text-caption text-on-surface-variant">
                    I agree to the{' '}
                    <span className="text-turquoise font-semibold">Terms of Service</span> and{' '}
                    <span className="text-turquoise font-semibold">Privacy Policy</span>.
                  </span>
                </label>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center items-center gap-2 py-3.5 px-6 bg-turquoise hover:bg-secondary text-white rounded-full font-title-sm text-title-sm transition-colors shadow-[0_4px_14px_rgba(0,106,104,0.2)] active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
                  >
                    {submitting ? 'Creating account…' : 'Create account'}
                    <span className="material-symbols-outlined text-[20px]">
                      {submitting ? 'progress_activity' : 'arrow_forward'}
                    </span>
                  </button>
                </div>
              </form>

              <p className="mt-6 text-center font-caption text-caption text-on-surface-variant">
                Already have an account?{' '}
                <Link className="text-turquoise font-semibold hover:underline" to="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
