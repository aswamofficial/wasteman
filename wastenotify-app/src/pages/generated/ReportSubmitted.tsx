// AUTO-GENERATED from the Stitch export `10_report_submitted`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const ReportSubmitted: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
        {/* Top Navigation (Suppressed for transactional screen) */}
        {/* Bottom Navigation (Suppressed for transactional screen) */}
        <main className="w-full max-w-[390px] mx-auto px-margin py-xl flex flex-col items-center flex-grow justify-center relative">
          {/* Animated Success Graphic */}
          <div className="relative w-32 h-32 flex items-center justify-center mb-10">
            {/* Ripple Rings */}
            <div className="absolute inset-0 bg-primary-fixed rounded-full opacity-50 ripple-1 pointer-events-none"></div>
            <div className="absolute inset-0 bg-primary-fixed rounded-full opacity-50 ripple-2 pointer-events-none"></div>
            <div className="absolute inset-0 bg-primary-fixed rounded-full opacity-50 ripple-3 pointer-events-none"></div>
            {/* Central Circle */}
            <div className="relative z-10 w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-primary text-[48px]" data-icon="check" data-weight="fill">check</span>
            </div>
          </div>
          {/* Headline & Subtext */}
          <div className="text-center mb-8 flex flex-col items-center">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Report Submitted</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs text-center">Typically resolved in <span className="font-bold text-on-surface">2–4 days</span>. You will receive updates via push notification.</p>
          </div>
          {/* Reference Card */}
          <div className="w-full bg-surface-container rounded-[20px] p-margin mb-10 shadow-sm border border-warm-taupe/30 flex items-center justify-between">
            <div>
              <p className="font-micro-label text-micro-label text-on-surface-variant uppercase mb-1">Reference Number</p>
              <p className="font-title-sm text-title-sm text-primary tracking-tight">#WN-24817</p>
            </div>
            <button className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-surface-variant transition-colors active:scale-95 group relative">
              <span className="material-symbols-outlined transition-transform group-hover:scale-110" data-icon="content_copy">content_copy</span>
              {/* Tooltip */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-caption text-caption px-2 py-1 rounded opacity-0 transition-opacity pointer-events-none whitespace-nowrap">Copied!</span>
            </button>
          </div>
          {/* Actions */}
          <div className="w-full space-y-md mt-auto mb-xl">
            <button className="w-full py-4 px-margin bg-secondary text-on-secondary rounded-full font-title-sm text-title-sm shadow-md hover:bg-tertiary transition-colors active:scale-95 flex items-center justify-center gap-2">
              Track Report
              <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">arrow_forward</span>
            </button>
            <button className="w-full py-4 px-margin bg-transparent text-secondary border border-warm-taupe rounded-full font-title-sm text-title-sm hover:bg-surface-container transition-colors active:scale-95 flex items-center justify-center gap-2">
              Back to Home
              <span className="material-symbols-outlined text-[20px]" data-icon="home">home</span>
            </button>
          </div>
        </main>
      </div>
    </IonContent>
  </IonPage>
);

export default ReportSubmitted;
