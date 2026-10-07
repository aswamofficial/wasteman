import { IonContent, IonPage } from '@ionic/react';
import { Link } from 'react-router-dom';

/*
 * Development-only index of every ported Stitch screen. Not part of the
 * product — it exists so the whole design can be walked through in one place
 * before the screens are wired to real data.
 */
interface Entry {
  code: string;
  name: string;
  route: string;
  /** Wired to the API, or still the static design import. */
  live?: boolean;
}

const CITIZEN: Entry[] = [
  { code: '01', name: 'Splash & onboarding', route: '/onboarding' },
  { code: '02', name: 'Login', route: '/login', live: true },
  { code: '03', name: 'Sign up', route: '/signup', live: true },
  { code: '05', name: 'Home dashboard', route: '/home', live: true },
  // Stitch screens 06–10 are one wizard now; 13/14 are one detail screen that
  // switches to before/after once resolved. Listing the old routes separately
  // would just link to pages that no longer exist.
  { code: '06–10', name: 'Report waste — capture → AI → location → submit', route: '/report/capture', live: true },
  { code: '11', name: 'Map explorer', route: '/map', live: true },
  { code: '12', name: 'My reports', route: '/reports', live: true },
  { code: '13–14', name: 'Report detail, timeline & before/after', route: '/reports/1', live: true },
  { code: '15', name: 'Notifications', route: '/notifications', live: true },
  { code: '16', name: 'Impact & statistics', route: '/statistics', live: true },
  { code: '17–18', name: 'Profile, edit & password', route: '/profile', live: true },
];

const ADMIN: Entry[] = [
  { code: 'A1', name: 'Admin queue & KPIs', route: '/admin', live: true },
  { code: 'A2–A3', name: 'Report detail, assign & resolve', route: '/admin/reports/1', live: true },
  { code: 'A4', name: 'Ward map & heatmap', route: '/admin/map' },
];

const MISSING = ['04 Phone verification (OTP)'];

const Row: React.FC<{ entry: Entry }> = ({ entry }) => (
  <Link
    to={entry.route}
    className="flex items-center gap-md px-lg py-md bg-surface-container-lowest border border-warm-taupe/50 rounded-xl active:scale-[0.99] transition-transform"
  >
    <span className="font-micro-label text-micro-label text-secondary w-7 shrink-0">
      {entry.code}
    </span>
    <span className="font-body-md text-body-md text-primary flex-grow">{entry.name}</span>
    {entry.live && (
      <span className="font-micro-label text-micro-label uppercase text-secondary bg-secondary-container px-2 py-0.5 rounded-full shrink-0">
        Live
      </span>
    )}
    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
  </Link>
);

const Screens: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="px-margin py-xl flex flex-col gap-xl">
        <header className="flex flex-col gap-sm">
          <p className="font-micro-label text-micro-label text-secondary uppercase">
            Design preview
          </p>
          <h1 className="font-headline-lg text-headline-lg text-primary">Wasteman screens</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Screens ported from the Stitch export into Ionic React. Those marked{' '}
            <span className="font-semibold text-secondary">Live</span> talk to the API; the rest are
            still static design imports. Signed-in screens redirect to login.
          </p>
        </header>

        <section className="flex flex-col gap-gutter">
          <h2 className="font-title-sm text-title-sm text-primary">Citizen app</h2>
          {CITIZEN.map((e) => (
            <Row key={e.route} entry={e} />
          ))}
        </section>

        <section className="flex flex-col gap-gutter">
          <h2 className="font-title-sm text-title-sm text-primary">Admin</h2>
          {ADMIN.map((e) => (
            <Row key={e.route} entry={e} />
          ))}
        </section>

        <section className="flex flex-col gap-sm bg-amber/10 border border-amber/30 rounded-xl p-lg">
          <h2 className="font-title-sm text-title-sm text-primary">Not in the export</h2>
          <p className="font-caption text-caption text-on-surface-variant">
            Still missing from the Stitch export. Sign up and edit-profile were hand-built to
            match; generate this one in Stitch and drop the folder in, then re-run the converter.
          </p>
          <ul className="flex flex-col gap-xs mt-sm">
            {MISSING.map((m) => (
              <li key={m} className="font-body-md text-body-md text-primary">
                {m}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </IonContent>
  </IonPage>
);

export default Screens;
