// AUTO-GENERATED from the Stitch export `a3_admin_assign_update_status`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const AdminAssignUpdate: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-surface antialiased h-screen overflow-hidden flex flex-col relative">
        {/* Background Content (Dimmed Detail View) */}
        <div className="flex-1 w-full h-full absolute inset-0 z-0 overflow-y-auto pb-32 pointer-events-none">
          {/* Header Image Placeholder */}
          <div className="w-full h-64 bg-cover bg-center relative" data-alt="A photograph of a street corner in a modern city during daytime, highlighting a reported municipal issue like an overflowing public waste bin. The scene is brightly lit with natural sunlight, capturing a realistic civic environment. The image uses a clean, slightly muted color palette that aligns with a warm, professional government interface aesthetic, emphasizing clarity and reality." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCYAcKTVlQ6xmU8j0aSIOlIVY-ReNgLTepGTitYrwWFW85fIAhdrD0JEypZJ_owKZ4ctM9BYcsz1MmGALY1BkV1bcnvSsfb-F-Z3idtDCz8aWf_rKRBNuZMEGizPm_m84WmS_1BnzJR1G8SLqoXbeh-_4xQo_mGESIHAhHemPsF_OCIZ1k_VuLaau6sJdd5aT456ygnxkHooVEoXLymcHHB6Q3QcAeefmW-baQdo_Qp1CzH1zgUNJKCog')" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
          {/* Detail Content Mockup */}
          <div className="px-margin py-xl relative z-10 -mt-10 bg-background rounded-t-card flex flex-col gap-md">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary">Report #8492</h1>
              <p className="font-body-md text-body-md text-secondary-text">Overflowing waste bin near central park entrance.</p>
            </div>
            <div className="flex gap-sm">
              <span className="inline-flex items-center px-[12px] py-1 rounded-full bg-amber/20 text-amber font-body-md text-body-md font-semibold text-[13px]">
                Pending
              </span>
              <span className="inline-flex items-center px-[12px] py-1 rounded-full bg-surface-container-high text-on-surface-variant font-body-md text-body-md text-[13px]">
                <span className="material-symbols-outlined text-[16px] mr-1">location_on</span> Main St.
              </span>
            </div>
          </div>
        </div>
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity duration-300"></div>
        {/* Bottom Sheet */}
        <div className="bottom-sheet absolute bottom-0 left-0 w-full bg-background rounded-t-[28px] shadow-[0_-8px_24px_rgba(0,58,62,0.1)] z-50 flex flex-col max-h-[795px]">
          {/* Drag Handle */}
          <div className="w-full flex justify-center pt-4 pb-2">
            <div className="w-12 h-1.5 bg-warm-taupe/50 rounded-full"></div>
          </div>
          <div className="px-margin pb-xl overflow-y-auto">
            <div className="flex justify-between items-center mb-lg">
              <h2 className="font-title-sm text-title-sm text-primary">Update Report</h2>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="flex flex-col gap-xl">
              {/* Status Segmented Control */}
              <div className="flex flex-col gap-sm">
                <label className="font-micro-label text-micro-label text-secondary-text uppercase">Status</label>
                <div className="flex p-1 bg-surface-container-high rounded-input relative w-full">
                  <button className="flex-1 py-2 font-body-md text-body-md rounded-input text-on-surface-variant hover:text-primary transition-colors" type="button">Pending</button>
                  <button className="flex-1 py-2 font-body-md text-body-md rounded-input bg-background shadow-sm text-primary font-semibold relative z-10 transition-colors" type="button">In Progress</button>
                  <button className="flex-1 py-2 font-body-md text-body-md rounded-input text-on-surface-variant hover:text-primary transition-colors" type="button">Resolved</button>
                </div>
              </div>
              {/* Priority Chips */}
              <div className="flex flex-col gap-sm">
                <label className="font-micro-label text-micro-label text-secondary-text uppercase">Priority</label>
                <div className="flex gap-sm flex-wrap">
                  <button className="px-4 py-2 rounded-full border border-warm-taupe text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors" type="button">Low</button>
                  <button className="px-4 py-2 rounded-full border border-warm-taupe text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors" type="button">Normal</button>
                  <button className="px-4 py-2 rounded-full border-2 border-error bg-error-container text-on-error-container font-body-md text-body-md font-semibold flex items-center gap-1 transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    Urgent
                  </button>
                </div>
              </div>
              {/* Assign to Team (Avatar Chips) */}
              <div className="flex flex-col gap-sm">
                <label className="font-micro-label text-micro-label text-secondary-text uppercase">Assign to Team</label>
                <div className="flex gap-md overflow-x-auto pb-2 -mx-margin px-margin hide-scrollbar">
                  {/* Add Button */}
                  <button className="flex-shrink-0 flex flex-col items-center gap-xs group" type="button">
                    <div className="w-12 h-12 rounded-full border border-dashed border-primary text-primary flex items-center justify-center bg-surface-container group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                      <span className="material-symbols-outlined">add</span>
                    </div>
                    <span className="font-caption text-caption text-secondary-text group-hover:text-primary">Assign</span>
                  </button>
                  {/* Selected Avatar */}
                  <button className="flex-shrink-0 flex flex-col items-center gap-xs relative" type="button">
                    <div className="absolute -top-1 -right-1 bg-secondary text-on-secondary rounded-full w-4 h-4 flex items-center justify-center z-10 border border-background">
                      <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                    </div>
                    <img className="w-12 h-12 rounded-full border-2 border-secondary object-cover bg-surface-variant" data-alt="A small, circular avatar portrait of a municipal worker wearing a high-visibility vest. The portrait is brightly lit, professional, and friendly, set against a solid warm ivory background, fitting a modern government application interface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAehR0_UUY4i2qNm32gAHa_IkrDTKqzLi28l4ckVFEV3xh2JwzOgQjDH8u2rq3DJKJoEgLJqtbOwh2FMyVjAKHVeTzL80OxpJIp01bWGJjTbXu2L-9CLeuLOR5UbwXPJG_Z-U1zl7RmYkou9v6bTRVuFDASKXOLabbDgloAQGoeLMLoXXuACgbJnKMG8iPHY1jmBBdTTyqIVr2IWIItJL0Utt6TUpnd9KAHLTiOUjL6WkH_pwHxHYBcTQ" />
                    <span className="font-caption text-caption text-primary font-semibold">Team Alpha</span>
                  </button>
                  {/* Unselected Avatar */}
                  <button className="flex-shrink-0 flex flex-col items-center gap-xs opacity-70 hover:opacity-100 transition-opacity" type="button">
                    <img className="w-12 h-12 rounded-full border border-warm-taupe object-cover bg-surface-variant" data-alt="A small, circular avatar portrait of a sanitation crew member. The portrait is brightly lit, professional, set against a solid warm ivory background, fitting a modern government application interface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcBtLBE0ULHBHikFAmnRtcOdXhtNGqN8AObZtYX_g-wBObdKDgvAUKH2l3-hGyx8-JP7mEc7Gxud9Esp3a6iwdOk9JVjSsuBgmlrGicoxlhnhk60czpapgzlopT7_9zBxAscwzpeTd2CmR3KYh5-FV5IoBRH1HecOC_kb8Sfo3E_CR-Sfg0kDrKqTPWQZE43v6cv4jP_Xv4-aTGEkYg0kVNJAluHxRga3osOV51mLiXcCcpEaafmLh2w" />
                    <span className="font-caption text-caption text-secondary-text">Team Bravo</span>
                  </button>
                </div>
                <style>
                  .hide-scrollbar::-webkit-scrollbar &#123; display: none; &#125;
                  .hide-scrollbar &#123; -ms-overflow-style: none; scrollbar-width: none; &#125;
                </style>
              </div>
              {/* Scheduled Pickup Field */}
              <div className="flex flex-col gap-sm">
                <label className="font-micro-label text-micro-label text-secondary-text uppercase">Scheduled Time</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">schedule</span>
                  <input className="w-full bg-background border border-warm-taupe text-on-surface font-body-md text-body-md rounded-input py-3 pl-10 pr-3 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors" type="datetime-local" defaultValue="2024-05-20T14:30" />
                </div>
              </div>
              {/* Upload Tile */}
              <div className="flex flex-col gap-sm">
                <label className="font-micro-label text-micro-label text-secondary-text uppercase">Resolution Evidence</label>
                <button className="w-full h-24 border border-dashed border-warm-taupe rounded-card bg-surface-container flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:border-primary transition-colors hover:text-primary" type="button">
                  <span className="material-symbols-outlined mb-1">add_a_photo</span>
                  <span className="font-body-md text-body-md">Add photo</span>
                </button>
              </div>
              {/* Action Button */}
              <div className="pt-sm">
                <button className="w-full bg-secondary hover:bg-primary text-on-secondary font-title-sm text-title-sm rounded-full py-4 shadow-sm transition-colors active:scale-[0.98]" type="button">
                  Update report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default AdminAssignUpdate;
