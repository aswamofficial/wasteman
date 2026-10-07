// AUTO-GENERATED from the Stitch export `05_home_dashboard`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';
import BottomNav from '../../components/BottomNav';

const Home: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="antialiased pb-24">
        {/* TopAppBar */}
        <header className="bg-background dark:bg-inverse-surface rounded-br-3xl w-full top-0 sticky shadow-sm dark:shadow-none z-40 flex justify-between items-center px-margin py-md w-full">
          <div className="flex items-center gap-3">
            <img alt="User profile photo" className="w-10 h-10 rounded-full object-cover border border-warm-taupe" data-alt="A professional headshot of a diverse individual, warmly lit, wearing modern casual attire, representing a community-minded citizen. The lighting is soft and natural, emphasizing approachability and civic engagement in a clean, modern style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLCisKPWI9whcMOw51nrqpJcUBGep99Aws7lE0Smv4znQkEFKKdep3aaTlnOznPRL0FKxt5qHXgFrzLM_YdJtVIlktdUI5mPVnI0Ym-cPFgodDbYOywm-FSCnqw8WMtvmTyUAPd3SU5PJhl5aI8YPqUBLTsq7Zm94YLtRaIMhFYdfj-KVcA-XlFom3-An0PwKKSjFY9PeZglZhYDKy02OfQuEVHivuxy8AtoRwUHOmBv7hKFGDm8NhCg" />
            <div>
              <p className="font-caption text-caption text-on-surface-variant">Good morning,</p>
              <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Ravi Kumar</h1>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95 duration-150 text-primary dark:text-primary-fixed">
            <span className="material-symbols-outlined" data-icon="location_on">location_on</span>
          </button>
        </header>
        <main className="px-margin py-xl flex flex-col gap-xl">
          {/* Hero Action Card */}
          <section className="relative bg-surface-container rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,106,104,0.08)]">
            <div className="bg-cover bg-center w-full h-48 relative" data-alt="A clean, modern street corner showing a neatly managed waste collection area. The scene is brightly lit with morning sunlight, emphasizing a clean and well-maintained urban environment. The color palette features warm sunlight tones against cool urban grays and greens, conveying a sense of order and civic responsibility." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCnVIClvs_0lbQuDkZNCCIKwNPNnOWUwr1D_Rej43YLrU8UZcPP92Wk1d1y7SJQg-WTkHfX-wtV6-9paxyy_lZYvuzQSICJ9sWAT1BV0gL9V0gCjZ8IPS08MWIYc0NnPa6nRgkybn1oFNrMJ3II5NerSQQFudpD20ITpOL2Ef6b-EBWXau4Jq24MAlcxX1MffYZ3gglfeH_U5A8hY6LBB1xYKkDRA4pnB9e1HK4X4nQRLlNZz10Bz7BbA')" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-lg w-full flex justify-between items-end">
                <div>
                  <h2 className="font-title-sm text-title-sm text-on-primary mb-1">See something?</h2>
                  <p className="font-body-md text-body-md text-on-primary/80">Help keep our city clean.</p>
                </div>
                <button className="bg-secondary text-on-secondary rounded-full w-14 h-14 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                  <span className="material-symbols-outlined filled text-2xl" data-icon="photo_camera">photo_camera</span>
                </button>
              </div>
            </div>
          </section>
          {/* Stats Grid (Bento style) */}
          <section className="grid grid-cols-3 gap-md">
            <div className="bg-surface-container-low rounded-xl p-md border border-warm-taupe/50 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-amber mb-1" data-icon="pending_actions">pending_actions</span>
              <span className="font-headline-md text-headline-md text-primary">12</span>
              <span className="font-micro-label text-micro-label text-on-surface-variant uppercase mt-1">Reported</span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-md border border-warm-taupe/50 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-secondary mb-1" data-icon="check_circle">check_circle</span>
              <span className="font-headline-md text-headline-md text-primary">8</span>
              <span className="font-micro-label text-micro-label text-on-surface-variant uppercase mt-1">Resolved</span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-md border border-warm-taupe/50 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-tertiary mb-1" data-icon="delete_sweep">delete_sweep</span>
              <span className="font-headline-md text-headline-md text-primary">45</span>
              <span className="font-micro-label text-micro-label text-on-surface-variant uppercase mt-1">Cleared</span>
            </div>
          </section>
          {/* Map Preview */}
          <section className="flex flex-col gap-md">
            <div className="flex justify-between items-center">
              <h3 className="font-title-sm text-title-sm text-primary">Live Activity</h3>
              <a className="font-body-md text-body-md text-secondary hover:underline" href="#">View Map</a>
            </div>
            <div className="bg-surface-container rounded-2xl h-40 overflow-hidden relative shadow-sm border border-warm-taupe/30">
              <img alt="Map Preview" className="w-full h-full object-cover opacity-80" data-location="Toronto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxhcEgW7jNkV2UtSdSptywc61efiNaz13frpi85ICXpwxG84NDEVgLN9lb8N9L2N3f3o2yVXMnKVwAJ9yuhOc2mSdAHOa3iboQuvO2HB19xbWTOvtKKWwRFq46GpyzETAoZ4nFFdA1pWnS9dFxb7vrwM4ZvSiO0t-CoB3WK3yvvtGyAj0-NsT8iuAORg7MA_0WnbnYpUSL9ROOoYo8m8blTMsCgmUWHyHf1tW3Qd7waUdjXlW8gHhiyA" />
              {/* Pins */}
              <div className="absolute top-1/4 left-1/3 text-amber animate-pulse">
                <span className="material-symbols-outlined filled drop-shadow-md" data-icon="location_on">location_on</span>
              </div>
              <div className="absolute top-1/2 left-2/3 text-secondary">
                <span className="material-symbols-outlined filled drop-shadow-md" data-icon="location_on">location_on</span>
              </div>
            </div>
          </section>
          {/* Recent Reports List */}
          <section className="flex flex-col gap-gutter">
            <h3 className="font-title-sm text-title-sm text-primary mb-xs">Your recent reports</h3>
            <div className="bg-surface-container-low rounded-xl p-md border border-warm-taupe/50 flex gap-md items-center">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <img alt="Report image" className="w-full h-full object-cover" data-alt="A close-up shot of an overflowing public trash bin in a park setting. The image highlights the need for municipal attention. The lighting is daytime, natural, and clear, focusing on the specific issue while maintaining the modern, structured aesthetic of the app." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKSyD0z1IyiqSjq_DT0I6htch53ucZhOK_1wIMDRjHQ3atvGj-ZcL6Fvir-2SHrG7Wd8tm4Bk17pe7-wRIYGiLJAVMYP-OySxm0z2nS0JWysFvN0m1JrHtWmmUcHjn0eOR7tLAE8wagRml1BVuzCmaCFd6RyPnYZpvAITzojmnDI1KenLqtpN_yER6buTumj7TI5-nEafEZemIv8ruCxAqGs7GsVJKgu8kt4Khlv3XkASvmryZYh-rnQ" />
              </div>
              <div className="flex-grow">
                <h4 className="font-body-md text-body-md font-semibold text-primary">Overflowing Bin</h4>
                <p className="font-caption text-caption text-on-surface-variant line-clamp-1">Corner of Main St and Elm</p>
                <p className="font-micro-label text-micro-label text-secondary-text mt-1">Today, 9:42 AM</p>
              </div>
              <div className="shrink-0">
                <span className="bg-amber/20 text-amber font-caption text-caption px-3 py-1 rounded-full border border-amber/30">Pending</span>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-md border border-warm-taupe/50 flex gap-md items-center">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <img alt="Report image" className="w-full h-full object-cover" data-alt="A photograph of scattered debris on a sidewalk near a construction site. The image serves as documentary evidence for a civic report. It is well-lit, sharp, and focused on the street-level issue, aligning with the app's clean and objective visual style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBdM3aUlDLqyQSOj5jiWXz95JWfqFT9eEYhCGygB4VY1aigL4mzSPmxUhsU_bxTWTr9gV71isRdtSGloliOk6Q4imPAq6p2ihp--eS9qXJiBIJwKDU8KqPzHyuHqGGtx0kYeF2zbiY1vnQxrP09HTdHbuz0ywhAglDnt-Q95BcHsRX3YsJd7ODhZXbPlm30cxDzPhrgqPfIEoxG8OukBYYfD6gwHZOtQ5jndx4zV8zJ0d_wBV6gZlUQw" />
              </div>
              <div className="flex-grow">
                <h4 className="font-body-md text-body-md font-semibold text-primary">Street Debris</h4>
                <p className="font-caption text-caption text-on-surface-variant line-clamp-1">742 Evergreen Terrace</p>
                <p className="font-micro-label text-micro-label text-secondary-text mt-1">Yesterday</p>
              </div>
              <div className="shrink-0">
                <span className="bg-secondary/10 text-secondary font-caption text-caption px-3 py-1 rounded-full border border-secondary/30">Resolved</span>
              </div>
            </div>
          </section>
        </main>
        {/* BottomNavBar */}
      </div>
    </IonContent>
      <BottomNav active="home" />
  </IonPage>
);

export default Home;
