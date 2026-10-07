// AUTO-GENERATED from the Stitch export `13_report_detail_timeline`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const ReportDetail: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-background font-body-md min-h-screen pb-safe antialiased flex flex-col md:flex-row">
        {/* Mobile Nav Header (Task-focused context, so typical top nav might be suppressed or modified for "Back") */}
        <header className="md:hidden fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex justify-between items-center px-margin py-md shadow-sm">
          <a aria-label="Go back" className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-high text-primary hover:bg-surface-variant transition-colors" href="#">
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </a>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">Report #8492</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </header>
        {/* Desktop Nav Sidebar (If applicable, though instruction says task-focused might hide shell. Kept minimal for context if needed, but per mandate: "Task-Focused: Any sub-page featuring a 'Close' or 'Back' action... hide shell". So hiding global shell.) */}
        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-4xl mx-auto md:py-8 md:px-6 mt-16 md:mt-0 pb-[100px]">
          {/* Desktop Back Button */}
          <div className="hidden md:flex items-center mb-6 gap-3">
            <a className="flex items-center text-on-surface-variant hover:text-primary transition-colors group" href="#">
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" data-icon="arrow_back">arrow_back</span>
              <span className="font-title-sm text-title-sm ml-2">Back to Reports</span>
            </a>
          </div>
          {/* Hero Photo */}
          <div className="relative w-full h-[309px] md:h-[400px] md:rounded-[24px] overflow-hidden shadow-lg mb-6 group">
            <img alt="Reported waste site" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="A high-quality, clear photograph showing a pile of discarded cardboard boxes and household items on a pristine, sunlit city sidewalk. The scene is framed from a slightly elevated angle. The lighting is bright and natural, typical of a mid-morning in a clean urban environment. The color palette emphasizes the warm ivory and concrete tones of the street, contrasting with the textures of the waste, fitting a modern civic reporting app." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYFt3jVjwnhmclC0cNJXYsqrGPW9gU80PB2_MgasJxNgcumyexNeItX46aetBKbR_ycdhnyMcw4QmYgscrCYTTKy_ArqLrxNs2Pk6J76XxJ3LLIKmarNa-2-mryIyg4YBQ21E0Cs4PPI1TxhYJxmYd_qkwaYW6lddGUNv2PpW3wl1Ug0CA75aOgm8cxGaG8LqVWTKLK0xwmsv7q3wFwCG25RG7RhfF2gB-I9O2b5_KAsbGk4wh1Wk6eg" />
            {/* Scrim for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent"></div>
            {/* Hero Overlay Content */}
            <div className="absolute bottom-0 left-0 w-full p-margin md:p-8 flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-secondary/90 text-on-secondary px-3 py-1 rounded-full font-micro-label text-micro-label inline-flex items-center gap-1 backdrop-blur-sm">
                  <span className="material-symbols-outlined filled text-[14px]" data-icon="pending">pending</span>
                  IN PROGRESS
                </span>
                <span className="bg-surface/90 text-on-surface px-3 py-1 rounded-full font-micro-label text-micro-label backdrop-blur-sm">
                  REPORTED 2 HOURS AGO
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-white drop-shadow-md">Illegal Dumping on 5th Ave</h2>
              <div className="flex items-center text-surface-container-highest gap-1 mt-1">
                <span className="material-symbols-outlined text-[18px]" data-icon="location_on">location_on</span>
                <span className="font-caption text-caption">1240 5th Avenue, Seattle, WA</span>
              </div>
            </div>
          </div>
          {/* Content Sheet / Bento Grid Layout */}
          <div className="px-margin md:px-0 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Details & AI Analysis */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Description Card */}
              <section className="bg-surface rounded-xl p-6 shadow-[0_4px_12px_rgba(0,58,62,0.05)] border border-surface-variant">
                <h3 className="font-title-sm text-title-sm text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" data-icon="description">description</span>
                  Description
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Found a large pile of mixed waste, mostly cardboard boxes, some old furniture pieces, and black trash bags left on the sidewalk near the bus stop. It's partially blocking the pedestrian pathway and needs clearing before street sweeping tomorrow.
                </p>
                {/* Reporter Info */}
                <div className="mt-6 pt-4 border-t border-surface-variant flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold overflow-hidden border border-warm-taupe">
                    <img alt="Reporter Avatar" className="w-full h-full object-cover" data-alt="A small profile portrait of a smiling citizen, well-lit, professional yet casual, wearing a bright teal shirt against a soft white background. Modern, clean aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8lSjofjxNtk49x44kt58wrkPey4keIAVZx0b9P9q1NDMt42aANtRO3nfvbebPqSfZJA3v2Up9Vay1Owy9nDBHhPH4zoH0dZArqxng68qxCBQ_MqCZqsAhQNqnKI6-kKxn7zmER0iu2eR9iEpgF86URkfaUY6Z8k-q1Y9Xw01Fnp77OLsGIyWLXZn_x-m2UDZqa04H6Uptu38dLCR-_CyYKgYsYGHHZa2c0Ni_4pr0xeb3IJAy3sh1pA" />
                  </div>
                  <div>
                    <p className="font-caption text-caption text-on-surface-variant">Reported by</p>
                    <p className="font-title-sm text-title-sm text-on-surface text-[15px]">Sarah Jenkins</p>
                  </div>
                </div>
              </section>
              {/* AI Analysis Grid */}
              <section className="bg-surface rounded-xl p-6 shadow-[0_4px_12px_rgba(0,58,62,0.05)] border border-surface-variant">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary" data-icon="smart_toy">smart_toy</span>
                    AI Site Analysis
                  </h3>
                  <span className="text-xs bg-primary-fixed text-on-primary-fixed-variant px-2 py-1 rounded font-medium">Confidence: 94%</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Metric 1 */}
                  <div className="bg-surface-container-low p-4 rounded-lg border border-warm-taupe/50 hover:border-secondary transition-colors">
                    <span className="material-symbols-outlined text-tertiary mb-2" data-icon="category">category</span>
                    <p className="font-caption text-caption text-on-surface-variant mb-1">Primary Type</p>
                    <p className="font-title-sm text-title-sm text-on-surface text-[15px]">Bulk Waste</p>
                  </div>
                  {/* Metric 2 */}
                  <div className="bg-surface-container-low p-4 rounded-lg border border-warm-taupe/50 hover:border-secondary transition-colors">
                    <span className="material-symbols-outlined text-tertiary mb-2" data-icon="weight">weight</span>
                    <p className="font-caption text-caption text-on-surface-variant mb-1">Est. Volume</p>
                    <p className="font-title-sm text-title-sm text-on-surface text-[15px]">Medium (2-3 yds)</p>
                  </div>
                  {/* Metric 3 */}
                  <div className="bg-surface-container-low p-4 rounded-lg border border-warm-taupe/50 hover:border-secondary transition-colors">
                    <span className="material-symbols-outlined text-error mb-2" data-icon="warning">warning</span>
                    <p className="font-caption text-caption text-on-surface-variant mb-1">Hazards</p>
                    <p className="font-title-sm text-title-sm text-on-surface text-[15px]">None Detected</p>
                  </div>
                </div>
              </section>
            </div>
            {/* Right Column: Timeline & Assignment */}
            <div className="flex flex-col gap-6">
              {/* Assigned Team Card */}
              <section className="bg-primary text-on-primary rounded-xl p-6 shadow-lg relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-secondary opacity-20 rounded-full blur-2xl"></div>
                <h3 className="font-title-sm text-title-sm mb-4 relative z-10 flex items-center gap-2 text-primary-fixed">
                  <span className="material-symbols-outlined" data-icon="group">group</span>
                  Assigned Team
                </h3>
                <div className="relative z-10 flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center text-primary shadow-inner">
                    <span className="material-symbols-outlined filled text-[28px]" data-icon="local_shipping">local_shipping</span>
                  </div>
                  <div>
                    <p className="font-title-sm text-title-sm text-white">Rapid Response Unit B</p>
                    <p className="font-caption text-caption text-surface-container-high flex items-center gap-1 mt-1">
                      <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                      En route (15 mins away)
                    </p>
                  </div>
                </div>
                <button className="w-full py-3 px-4 bg-white text-primary font-title-sm text-[14px] rounded-full hover:bg-surface-container transition-colors flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]" data-icon="chat">chat</span>
                  Contact Team
                </button>
              </section>
              {/* Vertical Timeline */}
              <section className="bg-surface rounded-xl p-6 shadow-[0_4px_12px_rgba(0,58,62,0.05)] border border-surface-variant flex-1">
                <h3 className="font-title-sm text-title-sm text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" data-icon="history">history</span>
                  Status Timeline
                </h3>
                <div className="relative pl-6 border-l-2 border-surface-variant ml-3 space-y-8">
                  {/* Step 3: Current */}
                  <div className="relative">
                    <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-surface border-2 border-secondary flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse-ring"></div>
                    </div>
                    <h4 className="font-title-sm text-title-sm text-primary text-[15px] leading-none mb-1">Clean-up in progress</h4>
                    <p className="font-caption text-caption text-on-surface-variant">Team arrived on site and started clearance.</p>
                    <span className="font-micro-label text-micro-label text-secondary mt-2 block">10:15 AM - TODAY</span>
                  </div>
                  {/* Step 2: Completed */}
                  <div className="relative opacity-70">
                    <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center z-10 shadow-sm">
                      <span className="material-symbols-outlined text-white text-[14px] font-bold" data-icon="check">check</span>
                    </div>
                    <h4 className="font-title-sm text-title-sm text-on-surface text-[15px] leading-none mb-1">Team assigned</h4>
                    <p className="font-caption text-caption text-on-surface-variant">Rapid Response Unit B dispatched.</p>
                    <span className="font-micro-label text-micro-label text-outline mt-2 block">09:30 AM - TODAY</span>
                  </div>
                  {/* Step 1: Completed */}
                  <div className="relative opacity-70">
                    <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center z-10 shadow-sm">
                      <span className="material-symbols-outlined text-white text-[14px] font-bold" data-icon="check">check</span>
                    </div>
                    <h4 className="font-title-sm text-title-sm text-on-surface text-[15px] leading-none mb-1">Report submitted</h4>
                    <p className="font-caption text-caption text-on-surface-variant">Received via mobile app.</p>
                    <span className="font-micro-label text-micro-label text-outline mt-2 block">08:12 AM - TODAY</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
        {/* Floating Action / Bottom Bar for Actions */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-background/90 backdrop-blur-lg border-t border-surface-variant shadow-[0_-10px_30px_rgba(0,58,62,0.05)] z-50 md:hidden">
          <button className="w-full bg-secondary text-white py-3.5 rounded-full font-title-sm text-title-sm shadow-md active:scale-[0.98] transition-transform flex justify-center items-center gap-2">
            <span className="material-symbols-outlined" data-icon="add_a_photo">add_a_photo</span>
            Add an update
          </button>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default ReportDetail;
