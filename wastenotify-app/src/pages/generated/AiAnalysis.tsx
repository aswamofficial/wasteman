// AUTO-GENERATED from the Stitch export `07_ai_analysis_result`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const AiAnalysis: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="antialiased text-on-surface flex flex-col min-h-screen relative pb-[80px] md:pb-0">
        {/* Top App Bar (Hidden Nav logic - this is a transactional/flow screen, so TopAppBar acts as a back/header only) */}
        <header className="bg-transparent absolute top-0 left-0 w-full z-20">
          <div className="flex justify-between items-center px-margin py-md w-full">
            <button className="w-10 h-10 rounded-full bg-surface-container-lowest/80 backdrop-blur flex items-center justify-center text-primary shadow-sm hover:bg-surface-container transition-colors active:scale-95 duration-150">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="font-headline-md text-headline-md font-bold text-surface-container-lowest drop-shadow-md">
              Analysis
            </div>
            <div className="w-10 h-10"></div> {/* Spacer */}
          </div>
        </header>
        {/* Main Content Canvas */}
        <main className="flex-grow flex flex-col w-full max-w-2xl mx-auto">
          {/* Hero Image Section (Photography-Forward) */}
          <section className="relative w-full h-[45vh] min-h-[350px] bg-surface-dim overflow-hidden rounded-b-3xl shadow-sm z-10">
            <div className="absolute inset-0 bg-cover bg-center" data-alt="A high-quality smartphone photo taken in bright daylight showing a pile of mixed household waste on a city sidewalk. The pile includes plastic bags, cardboard boxes, and organic food scraps. The lighting is natural and clear, emphasizing the textures of the waste materials against the concrete pavement. The aesthetic is documentary and civic-focused, maintaining a realistic yet clean visual style appropriate for a municipal app in a Warm Ivory and Deep Teal color palette environment." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCdO85y6XWoaugT6vE3L646fCvcpsu_TCDA9aKYJlewW_QMdhhu8pcLkMIje6fKkaPLBJnjH_fNggYc-G6aKIPCb8S1cnK3Aq0iJRhYKZTLo8Ec-j-jzGC2jiHepxJEbxpKBBK-7kn3NBv8MkpHyULp5B3ESwUZxp0WFA5tWrLvcXO3vBfsrcfnxi4OpnVJmDkZfvubH23UGpU0pbs95AdNTehg5VElM4Uo2nyTxp4DBhRjcyrCQT8ipQ')" }}></div>
            {/* Dark Scrim Overlay */}
            <div className="absolute inset-0 hero-gradient"></div>
            {/* Scanning Overlay Effect */}
            <div className="absolute inset-0 border-4 border-secondary/30 rounded-b-3xl pointer-events-none"></div>
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-secondary shadow-[0_0_10px_2px_rgba(0,106,104,0.5)] opacity-50 animate-[scan_3s_ease-in-out_infinite_alternate]"></div>
            <style>
              @keyframes scan &#123;
              0% &#123; top: 20%; opacity: 0; &#125;
              10% &#123; opacity: 0.8; &#125;
              90% &#123; opacity: 0.8; &#125;
              100% &#123; top: 80%; opacity: 0; &#125;
              &#125;
            </style>
            {/* Image Actions */}
            <div className="absolute bottom-margin right-margin flex gap-sm">
              <button className="w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur flex items-center justify-center text-on-surface-variant shadow-sm hover:bg-surface-container transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[20px]">crop</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur flex items-center justify-center text-on-surface-variant shadow-sm hover:bg-surface-container transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[20px]">drive_file_rename_outline</span>
              </button>
            </div>
          </section>
          {/* Analysis Results Container */}
          <section className="px-margin -mt-8 relative z-20 flex-grow flex flex-col gap-gutter pb-xl">
            {/* Primary Result Card (Glassmorphism) */}
            <div className="glass-card rounded-[20px] p-margin shadow-[0_4px_20px_rgba(0,58,62,0.08)] flex flex-col gap-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-micro-label text-micro-label text-secondary uppercase mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    AI Classification Complete
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Mixed household waste</h1>
                </div>
                <div className="flex flex-col items-end">
                  <div className="w-12 h-12 rounded-full border-4 border-secondary flex items-center justify-center text-secondary font-title-sm text-title-sm bg-surface-container-lowest shadow-sm">
                    94<span className="text-[10px]">%</span>
                  </div>
                  <span className="font-caption text-caption text-secondary-text mt-1">Confidence</span>
                </div>
              </div>
              <div className="h-[1px] w-full bg-warm-taupe/30 my-2"></div>
              {/* Detected Categories */}
              <div>
                <h3 className="font-caption text-caption text-on-surface-variant mb-2">Detected Materials</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-highest border border-warm-taupe/50 font-body-md text-body-md text-on-surface font-semibold">
                    <span className="material-symbols-outlined text-[16px] mr-1 text-on-surface-variant">recycling</span> Plastic
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-highest border border-warm-taupe/50 font-body-md text-body-md text-on-surface font-semibold">
                    <span className="material-symbols-outlined text-[16px] mr-1 text-on-surface-variant">eco</span> Organic
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-highest border border-warm-taupe/50 font-body-md text-body-md text-on-surface font-semibold">
                    <span className="material-symbols-outlined text-[16px] mr-1 text-on-surface-variant">description</span> Paper
                  </span>
                </div>
              </div>
            </div>
            {/* Contextual Info Cards (Bento Grid Style) */}
            <div className="grid grid-cols-2 gap-gutter">
              {/* Severity Card */}
              <div className="bg-surface-container-lowest rounded-[20px] p-md border border-warm-taupe/40 shadow-[0_2px_8px_rgba(0,58,62,0.04)] flex flex-col justify-between h-[100px]">
                <span className="font-caption text-caption text-on-surface-variant">Assessed Severity</span>
                <div className="inline-flex items-center self-start px-3 py-1.5 rounded-full bg-amber/10 border border-amber/20">
                  <span className="w-2 h-2 rounded-full bg-amber mr-2"></span>
                  <span className="font-body-md text-body-md text-amber font-semibold">HIGH</span>
                </div>
              </div>
              {/* Routing Card */}
              <div className="bg-surface-container-lowest rounded-[20px] p-md border border-warm-taupe/40 shadow-[0_2px_8px_rgba(0,58,62,0.04)] flex flex-col justify-between h-[100px]">
                <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">route</span> Routing to
                </span>
                <div className="font-body-md text-body-md text-primary font-semibold leading-tight">
                  Ward 12<br />Sanitation Team
                </div>
              </div>
            </div>
            {/* Location Context (Optional visual filler to show data-rich environment) */}
            <div className="bg-surface-container-lowest rounded-[20px] p-md border border-warm-taupe/40 shadow-[0_2px_8px_rgba(0,58,62,0.04)] flex items-center gap-md">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div className="flex-grow">
                <div className="font-caption text-caption text-on-surface-variant">Location Tagged</div>
                <div className="font-body-md text-body-md text-on-surface font-semibold">142 Oak Street, Ward 12</div>
              </div>
            </div>
            {/* Action Area (Sticky Bottom Sheet on Mobile, normal flow on Desktop) */}
            <div className="mt-auto pt-xl">
              <button className="w-full bg-secondary text-on-secondary rounded-full py-4 px-6 font-title-sm text-title-sm shadow-md hover:bg-secondary/90 transition-colors active:scale-[0.98] duration-150 flex items-center justify-center gap-2 pulse-ring">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Looks correct
              </button>
              <button className="w-full mt-3 bg-transparent border-2 border-warm-taupe text-on-surface rounded-full py-3 px-6 font-body-md text-body-md hover:bg-surface-variant/50 transition-colors active:scale-[0.98] duration-150">
                Edit details manually
              </button>
            </div>
          </section>
        </main>
        {/* Navigation Shell suppressed because this is a Transactional/Linear flow screen (Analysis Result -> Confirmation) */}
      </div>
    </IonContent>
  </IonPage>
);

export default AiAnalysis;
