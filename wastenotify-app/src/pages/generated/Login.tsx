// AUTO-GENERATED from the Stitch export `02_login`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const Login: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-surface min-h-screen flex flex-col font-body-md text-on-surface antialiased overflow-x-hidden selection:bg-turquoise selection:text-white">
        {/* Hero / Header Panel */}
        <header className="bg-deep-teal rounded-br-[40px] pt-12 pb-16 px-margin flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="material-symbols-outlined text-white text-[32px]" data-icon="delete" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-white">Wasteman</h1>
            <p className="font-body-md text-body-md text-white/80 text-center max-w-xs">Secure access to municipal waste management services.</p>
          </div>
        </header>
        {/* Main Content Canvas */}
        <main className="flex-grow px-margin -mt-6 pb-xl relative z-20 flex flex-col items-center">
          {/* Login Card */}
          <div className="w-full max-w-md bg-surface-container-lowest rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,58,62,0.08)] border border-warm-taupe/20">
            <h2 className="font-title-sm text-title-sm text-on-surface mb-6">Sign In</h2>
            <form action="#" className="space-y-5" method="POST">
              {/* Email Input (Focused State) */}
              <div>
                <label className="block font-body-md text-body-md text-on-surface mb-1.5" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-turquoise text-[20px]" data-icon="mail">mail</span>
                  </div>
                  <input className="block w-full pl-10 pr-3 py-3 bg-surface-container-lowest border-2 border-turquoise rounded-[14px] font-body-md text-body-md text-on-surface focus:outline-none focus:ring-0 focus:border-turquoise shadow-[0_0_0_4px_rgba(0,106,104,0.1)] transition-all" id="email" name="email" placeholder="Enter your email" type="email" defaultValue="alex.citizen@example.com" />
                </div>
              </div>
              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-body-md text-body-md text-on-surface" htmlFor="password">Password</label>
                  <a className="font-caption text-caption text-turquoise hover:underline" href="#">Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]" data-icon="lock">lock</span>
                  </div>
                  <input className="block w-full pl-10 pr-10 py-3 bg-surface-container-lowest border border-warm-taupe rounded-[14px] font-body-md text-body-md text-on-surface focus:outline-none focus:border-turquoise focus:ring-0 transition-colors placeholder:text-on-surface-variant/50" id="password" name="password" placeholder="Enter your password" type="password" />
                  <button className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface transition-colors" type="button">
                    <span className="material-symbols-outlined text-[20px]" data-icon="visibility_off">visibility_off</span>
                  </button>
                </div>
              </div>
              {/* Sign In Button */}
              <div className="pt-2">
                <button className="w-full flex justify-center items-center gap-2 py-3.5 px-6 bg-turquoise hover:bg-secondary text-white rounded-full font-title-sm text-title-sm transition-colors shadow-[0_4px_14px_rgba(0,106,104,0.2)] active:scale-[0.98]" type="submit">
                  Sign in
                  <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">arrow_forward</span>
                </button>
              </div>
            </form>
            <div className="mt-6 flex items-center justify-center">
              <div className="flex-grow border-t border-warm-taupe/50"></div>
              <span className="px-3 bg-surface-container-lowest font-caption text-caption text-on-surface-variant">or</span>
              <div className="flex-grow border-t border-warm-taupe/50"></div>
            </div>
            {/* Google SSO Button */}
            <div className="mt-6">
              <button className="w-full flex justify-center items-center gap-3 py-3 px-6 bg-surface-container-lowest border border-warm-taupe hover:bg-surface-container-low text-on-surface rounded-full font-body-md text-body-md transition-colors active:scale-[0.98]" type="button">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Continue with Google
              </button>
            </div>
            <p className="mt-6 text-center font-caption text-caption text-on-surface-variant">
              Don't have an account? <a className="text-turquoise font-semibold hover:underline" href="#">Sign up</a>
            </p>
          </div>
        </main>
        {/* Support Link Floating Bottom */}
        <div className="pb-safe mt-auto py-6 flex justify-center">
          <a className="flex items-center gap-1.5 font-caption text-caption text-on-surface-variant hover:text-on-surface transition-colors" href="#">
            <span className="material-symbols-outlined text-[16px]" data-icon="help">help</span>
            Need Help? Contact Support
          </a>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default Login;
