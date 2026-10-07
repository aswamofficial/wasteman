// AUTO-GENERATED from the Stitch export `08_confirm_location`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const ConfirmLocation: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-surface text-on-surface h-screen w-full flex flex-col overflow-hidden relative font-body-md">
        {/* Top App Bar */}
        <header className="bg-background dark:bg-inverse-surface rounded-br-3xl w-full top-0 sticky shadow-sm dark:shadow-none flex justify-between items-center px-margin py-md z-40 transition-colors">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95">
              <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
            </button>
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Wasteman</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-caption text-caption text-secondary-text">Step 3 of 4</span>
          </div>
        </header>
        {/* Map Canvas Area */}
        <main className="flex-grow relative w-full h-full bg-surface-container-lowest">
          {/* Map Image Placeholder */}
          <div className="absolute inset-0 w-full h-full bg-cover bg-center" data-alt="A highly detailed top-down street map view showing city blocks, streets, and building outlines. The map style is clean, modern, and minimalist, utilizing a soft light color palette with warm ivory roads, subtle taupe blocks, and sparse teal accents. The aesthetic is professional, clear, and perfectly suited for a high-end civic mobile application interface." data-location="City Map" style={{ backgroundImage: "url('https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg')" }}></div>
          {/* Draggable Marker with Halo */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 cursor-grab active:cursor-grabbing">
            {/* Halo Effect */}
            <div className="absolute w-24 h-24 bg-primary-fixed rounded-full halo-animation mix-blend-multiply z-0"></div>
            {/* Marker */}
            <div className="relative z-10 text-secondary drop-shadow-md">
              <span className="material-symbols-outlined filled" data-icon="location_on" style={{ fontSize: "48px" }}>location_on</span>
            </div>
            {/* Pin Shadow */}
            <div className="w-4 h-2 bg-primary/20 rounded-full mt-1 blur-[2px]"></div>
          </div>
          {/* Map Controls Overlay */}
          <div className="absolute right-margin top-margin flex flex-col gap-2 z-20">
            <button className="w-12 h-12 bg-surface rounded-xl shadow-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95">
              <span className="material-symbols-outlined" data-icon="my_location">my_location</span>
            </button>
            <button className="w-12 h-12 bg-surface rounded-xl shadow-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95">
              <span className="material-symbols-outlined" data-icon="layers">layers</span>
            </button>
          </div>
        </main>
        {/* Bottom Sheet (Fixed to bottom) */}
        <div className="absolute bottom-0 left-0 w-full bg-surface rounded-t-3xl bottom-sheet z-30 pb-safe">
          {/* Drag Handle Indicator */}
          <div className="w-full flex justify-center py-4">
            <div className="w-12 h-1.5 bg-surface-variant rounded-full"></div>
          </div>
          <div className="px-margin pb-margin flex flex-col gap-xl">
            {/* Location Details */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary text-sm" data-icon="push_pin">push_pin</span>
                <span className="font-micro-label text-micro-label text-secondary-text uppercase">Selected Location</span>
              </div>
              <h2 className="font-title-sm text-title-sm text-on-surface pr-8">142, Cross Cut Road</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Gandhipuram, Coimbatore, Tamil Nadu 641012</p>
            </div>
            {/* Fine-tune Hint */}
            <div className="bg-surface-container-low rounded-xl p-3 flex items-start gap-3 border border-surface-variant">
              <span className="material-symbols-outlined text-secondary-text mt-0.5" data-icon="info">info</span>
              <p className="font-caption text-caption text-on-surface-variant">Drag the map to fine-tune the exact location of the issue.</p>
            </div>
            {/* Action Button */}
            <button className="w-full bg-secondary text-on-secondary font-title-sm text-title-sm rounded-full py-4 px-6 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md">
              Confirm Location
              <span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>
            </button>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default ConfirmLocation;
