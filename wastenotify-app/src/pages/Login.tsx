import { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Link, Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toApiError } from '../lib/api';
import FieldError from '../components/FieldError';
import Logo from '../components/Logo';

/*
 * Live version of the Stitch screen `02_login`. The generated file stays in
 * pages/generated as the untouched design import; this is the one that's
 * routed and wired.
 */
const Login: React.FC = () => {
  const { login, isAuthenticated, isAdmin, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  /*
   * Navigation after a successful sign-in is declarative, not a history.push
   * in the submit handler. login() populates the auth context, which re-renders
   * this component — an imperative push would race that re-render and lose,
   * which is exactly how admins ended up on /home instead of /admin.
   */
  if (!loading && isAuthenticated) {
    return <Redirect to={isAdmin ? '/admin' : '/home'} />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    setFields({});

    try {
      await login(email.trim(), password);
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError.message);
      setFields(apiError.fields);
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'block w-full pl-10 pr-3 py-3 bg-surface-container-lowest rounded-[14px] font-body-md text-body-md text-on-surface focus:outline-none focus:ring-0 transition-colors placeholder:text-on-surface-variant/50';

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="bg-surface min-h-screen flex flex-col font-body-md text-on-surface antialiased overflow-x-hidden">
          {/* Hero / Header Panel */}
          <header className="bg-brand-gradient rounded-br-[40px] pt-12 pb-16 px-margin flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-4">
              {/* The mark itself, not a generic bin glyph — this is the first
                  screen anyone sees, so it's where the identity has to land. */}
              <Logo size={72} variant="mono" />
              <h1 className="font-headline-lg text-headline-lg text-white">Wasteman</h1>
              <p className="font-body-md text-body-md text-white/80 text-center max-w-xs">
                Secure access to municipal waste management services.
              </p>
            </div>
          </header>

          <main className="flex-grow px-margin -mt-6 pb-xl relative z-20 flex flex-col items-center">
            <div className="w-full max-w-md bg-surface-container-lowest rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,58,62,0.08)] border border-warm-taupe/20">
              <h2 className="font-title-sm text-title-sm text-on-surface mb-6">Sign In</h2>

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
                  <label
                    className="block font-body-md text-body-md text-on-surface mb-1.5"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-turquoise text-[20px]">
                        mail
                      </span>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${inputBase} ${
                        fields.email
                          ? 'border-2 border-error'
                          : 'border border-warm-taupe focus:border-turquoise'
                      }`}
                    />
                  </div>
                  <FieldError message={fields.email} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      className="block font-body-md text-body-md text-on-surface"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <Link
                      className="font-caption text-caption text-turquoise hover:underline"
                      to="/login"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                        lock
                      </span>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputBase} pr-10 ${
                        fields.password
                          ? 'border-2 border-error'
                          : 'border border-warm-taupe focus:border-turquoise'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                  <FieldError message={fields.password} />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center items-center gap-2 py-3.5 px-6 bg-brand-gradient text-white rounded-full font-title-sm text-title-sm shadow-[0_4px_14px_rgba(11,87,208,0.25)] active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
                  >
                    {submitting ? 'Signing in…' : 'Sign in'}
                    <span className="material-symbols-outlined text-[20px]">
                      {submitting ? 'progress_activity' : 'arrow_forward'}
                    </span>
                  </button>
                </div>
              </form>

              <div className="mt-6 flex items-center justify-center">
                <div className="flex-grow border-t border-warm-taupe/50" />
                <span className="px-3 font-caption text-caption text-on-surface-variant">or</span>
                <div className="flex-grow border-t border-warm-taupe/50" />
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  disabled
                  title="Google sign-in is not wired up yet"
                  className="w-full flex justify-center items-center gap-3 py-3 px-6 bg-surface-container-lowest border border-warm-taupe text-on-surface rounded-full font-body-md text-body-md transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </div>

              <p className="mt-6 text-center font-caption text-caption text-on-surface-variant">
                Don't have an account?{' '}
                <Link className="text-turquoise font-semibold hover:underline" to="/signup">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-6 w-full max-w-md rounded-[14px] border border-warm-taupe/40 bg-surface-container-low px-4 py-3">
              <p className="font-micro-label text-micro-label uppercase text-secondary">
                Demo accounts
              </p>
              <p className="mt-1 font-caption text-caption text-on-surface-variant">
                demo@wastenotify.com · admin@wastenotify.com — password{' '}
                <span className="font-semibold text-on-surface">password</span>
              </p>
            </div>
          </main>

          <div className="mt-auto py-6 flex justify-center">
            <span className="flex items-center gap-1.5 font-caption text-caption text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">help</span>
              Need Help? Contact Support
            </span>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
