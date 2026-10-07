// AUTO-GENERATED from the Stitch export `06_capture_photo`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const CapturePhoto: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-background h-screen w-full overflow-hidden relative font-body-md">
        {/* Live Viewfinder Background (Full Bleed) */}
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-cover bg-center opacity-90" data-alt="A first-person perspective, full-screen live camera view of a disorganized pile of discarded cardboard boxes and household waste sitting on a city sidewalk. The lighting is overcast daylight, providing clear visibility of the waste without harsh shadows. The image aims for a realistic, documentary style typical of municipal reporting apps, maintaining a neutral, objective mood. The color palette focuses on muted urban grays and browns, slightly desaturated to match a utility application context." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAV2s1zc107IVoOBDXgYm6cdjxE3Die1a8dgT8qgeIwhc-3HfN3MrfFkEY8ozTfPfV1e-1gXAFTYDkhFwa0ViNek1YBaYQo_yPjZ47C85pYutctl2JRRGX9Rx03_PZPbjMCRXc8l-KWbSJwh30FpKPmr0fHua9xyhh9LRfJgJB1aMOqgpdMkPewUnwOspufe-VUfJFqeFKWPw1J-9UB-U79P6p3s0xgZ7FxJho_d1KESZEyVOS_q6uECw')" }}></div>
          {/* Subtle scrim for UI legibility at top and bottom */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>
        {/* UI Overlay (Transactional Screen - No Global Navs) */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between">
          {/* Top Section: Header & Progress */}
          <div className="pt-12 px-margin w-full flex flex-col gap-md">
            {/* Header Row */}
            <div className="flex justify-between items-center">
              <button className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors active:scale-95 flex items-center justify-center">
                <span className="material-symbols-outlined text-white" data-icon="close">close</span>
              </button>
              <div className="flex items-center gap-xs bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <span className="material-symbols-outlined text-[16px] text-secondary-fixed" data-icon="location_on" data-weight="fill">location_on</span>
                <span className="font-micro-label text-micro-label text-white tracking-wider">GPS locked · ±4 m</span>
              </div>
              <button className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors active:scale-95 flex items-center justify-center">
                <span className="material-symbols-outlined text-white" data-icon="flash_auto">flash_auto</span>
              </button>
            </div>
            {/* Progress Indicator */}
            <div className="flex items-center gap-xs mt-sm w-full max-w-[200px] mx-auto">
              <div className="h-1.5 flex-1 rounded-full bg-secondary"></div>
              <div className="h-1.5 flex-1 rounded-full bg-white/30 backdrop-blur-sm"></div>
              <div className="h-1.5 flex-1 rounded-full bg-white/30 backdrop-blur-sm"></div>
              <div className="h-1.5 flex-1 rounded-full bg-white/30 backdrop-blur-sm"></div>
            </div>
            <div className="text-center w-full mt-1">
              <span className="font-caption text-caption text-white/90 drop-shadow-md">Step 1: Photo Evidence</span>
            </div>
          </div>
          {/* Middle Section: Framing Guidelines (Optional contextual element) */}
          <div className="flex-1 flex items-center justify-center pointer-events-none p-margin">
            {/* Framing brackets */}
            <div className="w-full max-w-[280px] h-[280px] border-2 border-white/30 rounded-xl relative">
              {/* Corner accents */}
              <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-4 border-l-4 border-secondary-fixed rounded-tl-xl"></div>
              <div className="absolute top-[-2px] right-[-2px] w-6 h-6 border-t-4 border-r-4 border-secondary-fixed rounded-tr-xl"></div>
              <div className="absolute bottom-[-2px] left-[-2px] w-6 h-6 border-b-4 border-l-4 border-secondary-fixed rounded-bl-xl"></div>
              <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-4 border-r-4 border-secondary-fixed rounded-br-xl"></div>
              {/* Center reticle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-50">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          {/* Bottom Section: Controls */}
          <div className="pb-safe pt-md pb-xl px-margin flex flex-col items-center gap-md">
            <div className="text-center mb-sm">
              <p className="font-body-md text-body-md text-white drop-shadow-md">Center the waste in the frame</p>
            </div>
            {/* Shutter Button Area */}
            <div className="flex justify-between items-center w-full max-w-sm mx-auto px-4">
              {/* Gallery Thumbnail (Left) */}
              <button className="w-12 h-12 rounded-lg overflow-hidden border border-white/40 active:scale-95 transition-transform bg-surface-container">
                <div className="w-full h-full bg-cover bg-center" data-alt="A small square thumbnail image showing a previously captured photo of an overflowing green municipal trash bin on a residential street. The lighting is bright daylight. The style is utilitarian and functional, acting as a recent photo preview icon. The colors highlight the green bin against a concrete background." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnNLVGxBcTcpzB8QZT-keWiorTbIHiYyZMMS4DPTbxKuX7437L_kbQbxveGpvRNt9Oqbum5l3a87v3XPkXXewSaUlADrjTevrTlyKLgHk3XgycZ9fIiYpSKlVUzvgA84J9shvXRoMFHzVZXmbFBVBDvYXzIFScrk0c4q9FZPMJXGXCXSqysWutYbrP6Y1pS0LBHEQGSvHBtR3l5GZbIOCKQDeZxjfTlS0Zg71xA7QMx6zI6rOjkO7Bkg')" }}></div>
              </button>
              {/* Main Shutter Button (Center) */}
              <button className="relative w-20 h-20 rounded-full flex items-center justify-center active:scale-90 transition-transform duration-200 group">
                {/* Outer Ring (Turquoise/Secondary) */}
                <div className="absolute inset-0 rounded-full border-[3px] border-secondary opacity-80 group-hover:opacity-100 transition-opacity"></div>
                {/* Inner White Button */}
                <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-95">
                  <span className="material-symbols-outlined text-secondary text-[32px]" data-icon="camera">camera</span>
                </div>
              </button>
              {/* Mode Switch / Secondary Action (Right) */}
              <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:scale-95 transition-transform">
                <span className="material-symbols-outlined" data-icon="flip_camera_ios">flip_camera_ios</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default CapturePhoto;
