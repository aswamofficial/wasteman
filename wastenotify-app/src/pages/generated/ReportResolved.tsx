// AUTO-GENERATED from the Stitch export `14_resolved_before_after`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';
import BottomNav from '../../components/BottomNav';

const ReportResolved: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col pb-[80px] md:pb-0">
        {/* Top App Bar (Web & Mobile) */}
        <header className="bg-background dark:bg-inverse-surface rounded-br-3xl w-full top-0 sticky shadow-sm dark:shadow-none flex justify-between items-center px-margin py-md w-full z-40">
          <div className="flex items-center gap-3">
            <img className="w-10 h-10 rounded-full object-cover" data-alt="A small circular profile picture of an individual, well-lit with a warm smile, against a neutral background. The lighting is soft and natural, fitting a modern professional municipal app aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiKXNmEXUrExUCOCXZvxPkXtFYEc_6F_XiiAcVjZqjagmZP2mgB8cQaeG8BiJdtaG-rLlD8pobVWvxI9uBECVRnv05-Vipr64BK3IL3nrrTD0SE4ZGjl-1HxPt3lbgqV41hkUt92B1_bwEfg3UvpYn9JUFLgdQtJvckH9net_bxcseZgCE-Qm2YG7tR8g01BAvuFrDfxa3oORp8ZTzj-HhuAUJO_NbHH14c4Y56AyV7OJEaPbA9Ey7Hg" />
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Wasteman</h1>
          </div>
          <button className="active:scale-95 duration-150 p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed" data-icon="location_on">location_on</span>
          </button>
        </header>
        <main className="flex-1 max-w-3xl mx-auto w-full px-margin py-xl space-y-6">
          {/* Celebration Banner */}
          <section className="bg-primary text-on-primary rounded-[20px] p-6 shadow-elevated flex items-center gap-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-fixed opacity-20 rounded-full blur-xl"></div>
            <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-secondary opacity-30 rounded-full blur-2xl"></div>
            <span className="material-symbols-outlined text-4xl relative z-10" data-icon="check_circle">check_circle</span>
            <div className="relative z-10">
              <h2 className="font-title-sm text-title-sm mb-1">This spot is clean again</h2>
              <p className="font-caption text-caption opacity-90">Report #WN-4892 resolved by City Services.</p>
            </div>
          </section>
          {/* Before / After Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before Card */}
            <div className="relative rounded-[20px] overflow-hidden shadow-soft aspect-[4/3] group border border-warm-taupe/30">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="A photograph showing a pile of discarded cardboard boxes and general household waste dumped illegally on a sidewalk corner. The lighting is overcast daytime, capturing the gritty reality of urban litter in a clear, factual documentary style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIPq7zLCHD7ZWRvETHTksP3xUqNq2JvADYBtj6oOeYvBOJVnRjRvKbr4YfciaTrw4iA-u3gPMCfIMMBbFuoxeO_H-yKetv7Rl2-VhI9hlTW9AhOGep5K818tr4DJdwrI8rRofaLL4LXfgWOeO1NQFs4aakNPHAle_9JKLIzRhy6K1ch1uv4BchO8foqXb6-wVQuaO2BRJyRuQCHF6oWK4i41RHZBGqXye9UJAUBooRzcsE5dLdfUSUug" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute top-4 left-4 bg-amber text-on-background font-micro-label text-micro-label px-3 py-1 rounded-full uppercase shadow-md backdrop-blur-sm bg-opacity-90 border border-amber/50">
                BEFORE
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-caption text-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]" data-icon="calendar_today">calendar_today</span> Oct 12, 09:30 AM
                </p>
              </div>
            </div>
            {/* After Card */}
            <div className="relative rounded-[20px] overflow-hidden shadow-soft aspect-[4/3] group border border-primary/20">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="A photograph of the exact same sidewalk corner, now completely clean and free of any trash or debris. The lighting is bright and sunny daytime, emphasizing the positive resolution and clean urban environment in a crisp, modern aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdxznNq9eVwx5ccDgINgAXIWCR4_f23tOtvIPnMFx4cd0H_VuYnGUY8Q3v9eV8zgT_Yb7I72aWoH1_yedrBbUbPHs8WPeyxMIAxqstylyFrcCIVyz4fimqIpD5BpWqav_xbnxsT9OAc_X3jEp5Q1L-zcvABcrb44hOaJDzpDgYJlk72rIdjdCYnKoGHZ6CWVbr_er-Ik7yC9zlGyeYezLBsQLFNGlKS6SaemN4W6VCg_z-zGPAKwatxg" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute top-4 left-4 bg-primary text-on-primary font-micro-label text-micro-label px-3 py-1 rounded-full uppercase shadow-md backdrop-blur-sm bg-opacity-90 border border-primary-fixed/30">
                AFTER
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-caption text-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]" data-icon="task_alt">task_alt</span> Oct 14, 14:15 PM
                </p>
              </div>
            </div>
          </section>
          {/* Impact Stats */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container rounded-[20px] p-5 border border-warm-taupe/40 shadow-soft flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-primary mb-2 text-3xl" data-icon="weight">weight</span>
              <span className="font-headline-lg text-headline-lg text-primary block">40kg</span>
              <span className="font-caption text-caption text-on-surface-variant mt-1">Waste Removed</span>
            </div>
            <div className="bg-surface-container rounded-[20px] p-5 border border-warm-taupe/40 shadow-soft flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-primary mb-2 text-3xl" data-icon="timer">timer</span>
              <span className="font-headline-lg text-headline-lg text-primary block">2 Days</span>
              <span className="font-caption text-caption text-on-surface-variant mt-1">Resolution Time</span>
            </div>
          </section>
          {/* Feedback Section */}
          <section className="bg-surface rounded-[20px] p-6 border border-warm-taupe shadow-soft mt-8 relative">
            <div className="text-center mb-6">
              <h3 className="font-title-sm text-title-sm text-on-surface mb-2">How did we do?</h3>
              <p className="font-caption text-caption text-on-surface-variant">Rate the cleanup quality to help us improve city services.</p>
            </div>
            <div className="flex justify-center gap-2 mb-8">
              <button className="text-warm-taupe hover:text-amber transition-colors"><span className="material-symbols-outlined text-4xl" data-icon="star" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span></button>
              <button className="text-warm-taupe hover:text-amber transition-colors"><span className="material-symbols-outlined text-4xl" data-icon="star" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span></button>
              <button className="text-warm-taupe hover:text-amber transition-colors"><span className="material-symbols-outlined text-4xl" data-icon="star" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span></button>
              <button className="text-warm-taupe hover:text-amber transition-colors"><span className="material-symbols-outlined text-4xl" data-icon="star" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span></button>
              <button className="text-warm-taupe hover:text-amber transition-colors"><span className="material-symbols-outlined text-4xl" data-icon="star_outline">star</span></button>
            </div>
            <button className="w-full bg-secondary hover:bg-tertiary-container text-on-secondary font-title-sm text-title-sm py-3 px-6 rounded-full transition-all shadow-elevated active:scale-95 flex items-center justify-center gap-2">
              <span>Submit Feedback</span>
              <span className="material-symbols-outlined text-[20px]" data-icon="send">send</span>
            </button>
          </section>
        </main>
        {/* Bottom Navigation Bar (Mobile Only) */}
        {/* Side Navigation (Web Only - Hidden on Mobile) */}
        <aside className="hidden md:flex flex-col fixed left-0 top-[72px] h-[calc(100vh-72px)] w-20 lg:w-64 bg-background dark:bg-inverse-surface border-r border-warm-taupe/30 py-6 px-3 shadow-soft z-30">
          <nav className="flex flex-col gap-2 w-full">
            <button className="flex items-center lg:justify-start justify-center gap-4 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors w-full">
              <span className="material-symbols-outlined" data-icon="home">home</span>
              <span className="hidden lg:block font-body-md text-body-md">Home</span>
            </button>
            <button className="flex items-center lg:justify-start justify-center gap-4 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors w-full">
              <span className="material-symbols-outlined" data-icon="map">map</span>
              <span className="hidden lg:block font-body-md text-body-md">Map</span>
            </button>
            <button className="flex items-center lg:justify-start justify-center gap-4 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors w-full">
              <span className="material-symbols-outlined" data-icon="add_circle">add_circle</span>
              <span className="hidden lg:block font-body-md text-body-md">Report</span>
            </button>
            <button className="flex items-center lg:justify-start justify-center gap-4 px-4 py-3 rounded-full bg-secondary-container text-on-secondary-container font-bold hover:opacity-80 transition-colors w-full">
              <span className="material-symbols-outlined" data-icon="history" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
              <span className="hidden lg:block font-body-md text-body-md">Activity</span>
            </button>
            <button className="flex items-center lg:justify-start justify-center gap-4 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors w-full">
              <span className="material-symbols-outlined" data-icon="person">person</span>
              <span className="hidden lg:block font-body-md text-body-md">Profile</span>
            </button>
          </nav>
        </aside>
        {/* Adjust main content margin for web sidebar */}
        <style>
          @media (min-width: 768px) &#123;
          main &#123;
          margin-left: 5rem;
          &#125;
          &#125;
          @media (min-width: 1024px) &#123;
          main &#123;
          margin-left: 16rem;
          &#125;
          &#125;
        </style>
      </div>
    </IonContent>
      <BottomNav active="activity" />
  </IonPage>
);

export default ReportResolved;
