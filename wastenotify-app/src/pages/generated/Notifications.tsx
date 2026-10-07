// AUTO-GENERATED from the Stitch export `15_notifications`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';
import BottomNav from '../../components/BottomNav';

const Notifications: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="antialiased min-h-screen flex flex-col hide-scroll pb-24">
        {/* TopAppBar */}
        <header className="bg-background dark:bg-inverse-surface rounded-br-3xl w-full top-0 sticky z-40 shadow-sm dark:shadow-none flex justify-between items-center px-margin py-md">
          <div className="flex items-center gap-sm cursor-pointer hover:bg-surface-container transition-colors p-2 rounded-full active:scale-95 duration-150">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container-highest">
              <img alt="User Profile" className="w-full h-full object-cover" data-alt="A portrait of a smiling community member in a sunny outdoor setting. Warm natural lighting, professional civic photography style, light modern aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDffCduQACgQLPyjGgKPusqw9r-uOaFR4QAp2Ume7N5_-lww2rQYRmpm4GstBHA8JusLvAneHNHTBt7l1JWg78te-zVjuq3mr0HlTQ5LOjiM_yx6t5iokGJcFwikHBwLgLMIL4hDPIPuNEkjhYFuYdLDBDGjuTXI2ZvijIqOjY69-Xq6WwwwB7dkSExbAnLw2nesVYsTpUeOQTbBQM2JN7oKtiHXB-he8q7YmX0siKuqh4eHbbOxM_uGw" />
            </div>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Wasteman</h1>
          <div className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-surface-container transition-colors active:scale-95 duration-150">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed" data-icon="location_on">location_on</span>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 px-margin pt-lg pb-xl max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="mb-xl flex items-center justify-between">
            <h2 className="font-headline-lg text-headline-lg text-on-background">Notifications</h2>
            <button className="font-micro-label text-micro-label text-secondary px-4 py-2 rounded-full hover:bg-surface-container transition-colors">MARK ALL READ</button>
          </div>
          {/* Today Section */}
          <section className="mb-xl">
            <h3 className="font-title-sm text-title-sm text-secondary-text mb-md px-2">Today</h3>
            <div className="flex flex-col gap-sm">
              {/* Resolved (Unread, Pale Aqua tint) */}
              <article className="notification-row relative bg-secondary-fixed/20 rounded-xl p-md flex items-start gap-md cursor-pointer border border-transparent hover:border-secondary-fixed/50">
                <div className="unread-indicator"></div>
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-secondary" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background overflow-hidden">
                    <img alt="Resolved photo" className="w-full h-full object-cover" data-alt="A small thumbnail showing a clean street corner where illegal dumping was recently cleared. Bright daylight, civic improvement, crisp photography." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfSoUlCGZ5LetEW6XM_JmFvoyRSJjTXvV_1zpBZWii21GEOrtoMBW8VejzJ32VROtwDgaKFZBLl4nPu16CO4N0ElCjwI5p5bqFhY5q3OX56FtdbEud_jjuNcgHtX03smz76lzfsZn6nKrLOXf2yv_mvQBqe1pOpSoxGYq1WmjuhaW7X6Mtr3EdlNkNpXCgljgd_JGmuiyMWrWiZ_UGRdTTVozJeJRAXmZth6g5xLGcr16MSi9BihpB6A" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-body-md text-body-md font-bold text-on-surface truncate">Issue Resolved</h4>
                    <span className="font-caption text-caption text-secondary-text shrink-0 ml-2">10m ago</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant line-clamp-2">Your report for "Mattress dumping" on 4th St has been successfully resolved by city crews. Thank you!</p>
                </div>
              </article>
              {/* In Progress (Unread, Pale Aqua tint) */}
              <article className="notification-row relative bg-secondary-fixed/20 rounded-xl p-md flex items-start gap-md cursor-pointer border border-transparent hover:border-secondary-fixed/50">
                <div className="unread-indicator"></div>
                <div className="shrink-0 w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-on-primary-container" data-icon="sync">sync</span>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-body-md text-body-md font-bold text-on-surface truncate">Crew Dispatched</h4>
                    <span className="font-caption text-caption text-secondary-text shrink-0 ml-2">2h ago</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant line-clamp-2">A cleanup crew is currently en route to handle "Graffiti" at Pioneer Park.</p>
                </div>
              </article>
              {/* AI Verified (Read) */}
              <article className="notification-row relative bg-surface-container rounded-xl p-md flex items-start gap-md cursor-pointer hover:bg-surface-container-high border border-surface-variant">
                <div className="shrink-0 w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center shadow-sm border border-outline-variant">
                  <span className="material-symbols-outlined text-tertiary" data-icon="auto_awesome">auto_awesome</span>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-body-md text-body-md text-on-surface truncate">AI Verification Complete</h4>
                    <span className="font-caption text-caption text-secondary-text shrink-0 ml-2">4h ago</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant line-clamp-2">Your photo of "Overflowing bin" has been verified and prioritized by our automated system.</p>
                </div>
              </article>
            </div>
          </section>
          {/* This Week Section */}
          <section>
            <h3 className="font-title-sm text-title-sm text-secondary-text mb-md px-2 mt-lg">This Week</h3>
            <div className="flex flex-col gap-sm">
              {/* Pending Reminder (Read, Amber badge) */}
              <article className="notification-row relative bg-surface-container rounded-xl p-md flex items-start gap-md cursor-pointer hover:bg-surface-container-high border border-surface-variant">
                <div className="shrink-0 w-12 h-12 rounded-full bg-amber/20 flex items-center justify-center shadow-sm border border-amber/30">
                  <span className="material-symbols-outlined text-amber" data-icon="schedule">schedule</span>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-body-md text-body-md text-on-surface truncate">Awaiting Assessment</h4>
                    <span className="font-caption text-caption text-secondary-text shrink-0 ml-2">Mon</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant line-clamp-2">Your report for "Pothole" is still pending initial assessment. We expect an update within 48 hours.</p>
                </div>
              </article>
              {/* Community (Read) */}
              <article className="notification-row relative bg-surface-container rounded-xl p-md flex items-start gap-md cursor-pointer hover:bg-surface-container-high border border-surface-variant">
                <div className="shrink-0 w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center shadow-sm border border-outline-variant">
                  <span className="material-symbols-outlined text-on-surface" data-icon="group">group</span>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-body-md text-body-md text-on-surface truncate">Community Impact</h4>
                    <span className="font-caption text-caption text-secondary-text shrink-0 ml-2">Sun</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant line-clamp-2">3 neighbors also reported issues near Elm St. A coordinated cleanup is being scheduled.</p>
                </div>
              </article>
            </div>
          </section>
        </main>
        {/* BottomNavBar */}
      </div>
    </IonContent>
      <BottomNav active="home" />
  </IonPage>
);

export default Notifications;
