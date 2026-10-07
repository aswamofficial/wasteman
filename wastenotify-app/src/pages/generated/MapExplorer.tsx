// AUTO-GENERATED from the Stitch export `11_map_explorer`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';
import BottomNav from '../../components/BottomNav';

const MapExplorer: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="h-screen w-full overflow-hidden flex flex-col relative text-on-surface pb-24">
        {/* Top Navigation Container (Hidden on mobile map view to maximize space, keeping search floating) */}
        <div className="hidden md:flex bg-background shadow-sm rounded-br-3xl w-full top-0 sticky justify-between items-center px-margin py-md z-40">
          <div className="flex items-center gap-sm">
            <span className="font-headline-md text-headline-md font-bold text-primary">Wasteman</span>
          </div>
          <div className="flex items-center gap-lg">
            <nav className="flex gap-lg">
              <a className="text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors px-3 py-1 rounded-full" href="#">Home</a>
              <a className="text-primary font-bold font-body-md text-body-md bg-surface-container-high px-3 py-1 rounded-full" href="#">Map</a>
              <a className="text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors px-3 py-1 rounded-full" href="#">Report</a>
              <a className="text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors px-3 py-1 rounded-full" href="#">Activity</a>
            </nav>
            <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
            </div>
          </div>
        </div>
        {/* Main Content Area: The Map */}
        <main className="flex-grow relative w-full h-full">
          {/* Map Background */}
          <div className="absolute inset-0 w-full h-full map-bg" data-alt="A light, clean vector street map of a typical urban city center. The map is designed in a minimalist, modern style using very soft beige and ivory tones for land, and slightly darker taupe lines for streets. There are no labels or clutter. The aesthetic is high-tech municipal service, clean and highly functional, prioritizing legibility for data overlays." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGsW8HinrHTU42-k15uzessQ1-MsvECtO2kzmU505SE1wBRmWhb5F3HQ7Z5j-Sh1J1k1LBNAWJu_3prONqBKN6bjcfrSP8QFjy1DJtiAOBaKksD-cZByNhF1NIcim4QcNeK0s7OITQCuva_EOOdPTT-LrpUDqdLmKPZVxlMpmePqLTGy4chpyv-8bgi3nHlVtrj4UDnYboCO47924oT9n7yRlTlEufo7uOn_YZJFVDbcHZTOII6hynAw')" }}>
          </div>
          {/* Map Pins (Simulated positions) */}
          {/* Resolved Pin (Deep Teal) */}
          <div className="absolute top-[30%] left-[20%] flex flex-col items-center map-pin cursor-pointer group z-10">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-md border-2 border-surface border-opacity-50 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined filled text-on-secondary text-[18px]">check_circle</span>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-secondary -mt-1 drop-shadow-sm"></div>
          </div>
          {/* Pending Pin (Amber) */}
          <div className="absolute top-[45%] left-[55%] flex flex-col items-center map-pin cursor-pointer group z-20">
            <div className="w-10 h-10 bg-amber rounded-full flex items-center justify-center shadow-lg border-2 border-surface group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined filled text-on-primary text-[22px]">warning</span>
            </div>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber -mt-1 drop-shadow-md"></div>
          </div>
          {/* Pending Pin (Amber) */}
          <div className="absolute top-[20%] left-[75%] flex flex-col items-center map-pin cursor-pointer group z-10">
            <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center shadow-md border-2 border-surface border-opacity-50 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined filled text-on-primary text-[18px]">warning</span>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber -mt-1 drop-shadow-sm"></div>
          </div>
          {/* Resolved Pin (Deep Teal) */}
          <div className="absolute top-[60%] left-[35%] flex flex-col items-center map-pin cursor-pointer group z-10">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-md border-2 border-surface border-opacity-50 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined filled text-on-secondary text-[18px]">check_circle</span>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-secondary -mt-1 drop-shadow-sm"></div>
          </div>
          {/* Floating UI Overlays */}
          <div className="absolute inset-0 pointer-events-none p-margin flex flex-col justify-between pt-safe">
            {/* Top Controls: Search and Filters */}
            <div className="pointer-events-auto flex flex-col gap-md z-30 pt-4 md:pt-0">
              {/* Search Bar */}
              <div className="bg-surface shadow-[0_4px_12px_rgba(0,58,62,0.08)] rounded-full h-14 flex items-center px-4 border border-surface-variant w-full max-w-md mx-auto md:mx-0">
                <span className="material-symbols-outlined text-secondary-text mr-3">search</span>
                <input className="flex-grow bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface placeholder:text-outline p-0" placeholder="Search address or issue type..." type="text" />
                <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors ml-2">
                  <span className="material-symbols-outlined text-secondary-text text-[20px]">mic</span>
                </button>
              </div>
              {/* Filter Chips (Horizontally Scrollable) */}
              <div className="flex gap-sm overflow-x-auto hide-scrollbar pb-2 w-full max-w-md mx-auto md:mx-0">
                <button className="shrink-0 h-8 px-4 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold flex items-center shadow-sm">
                  All Issues
                </button>
                <button className="shrink-0 h-8 px-3 rounded-full bg-surface border border-warm-taupe text-on-surface-variant font-caption text-caption flex items-center gap-1 hover:bg-surface-container transition-colors shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber inline-block"></span>
                  Pending
                </button>
                <button className="shrink-0 h-8 px-3 rounded-full bg-surface border border-warm-taupe text-on-surface-variant font-caption text-caption flex items-center gap-1 hover:bg-surface-container transition-colors shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
                  Resolved
                </button>
                <button className="shrink-0 h-8 px-3 rounded-full bg-surface border border-warm-taupe text-on-surface-variant font-caption text-caption flex items-center gap-1 hover:bg-surface-container transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">map</span>
                  My Zone
                </button>
              </div>
            </div>
            {/* Bottom Sheet / Floating Cards */}
            <div className="pointer-events-auto pb-[80px] md:pb-0 z-30 bottom-sheet transform translate-y-0" id="reportsSheet">
              <div className="w-full max-w-2xl mx-auto md:ml-0 md:mb-6">
                {/* Handle for dragging (mobile only) */}
                <div className="w-12 h-1 bg-warm-taupe rounded-full mx-auto mb-3 md:hidden"></div>
                <div className="flex items-center justify-between mb-3 px-2">
                  <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">near_me</span>
                    3 reports nearby
                  </h2>
                  <button className="text-secondary font-caption text-caption font-semibold flex items-center hover:opacity-80">
                    List View <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
                {/* Horizontal Swipeable Cards */}
                <div className="flex gap-md overflow-x-auto hide-scrollbar pb-4 px-2 -mx-2 snap-x snap-mandatory">
                  {/* Card 1: Pending (Active/Highlighted) */}
                  <div className="snap-center shrink-0 w-72 bg-surface rounded-[20px] shadow-[0_8px_16px_rgba(0,32,33,0.06)] border border-surface-variant overflow-hidden flex flex-col active:scale-[0.98] transition-transform cursor-pointer">
                    <div className="h-28 relative">
                      <div className="absolute inset-0 bg-black/20 z-10"></div>
                      <img className="w-full h-full object-cover" data-alt="A clear, eye-level photograph of a municipal sidewalk where an overflowing trash can is spilling refuse onto the pavement. The scene is shot in daylight, highlighting the urban infrastructure. The overall color grading is neutral and objective, typical of a civic reporting application photo, meant to clearly show the issue without dramatic filters." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3o01aZ4Bgg7mq-VuSwwm-V5EAiTea-2HJQ6HQvWsuvLFbNB2Y_yAjB3NeupgbDUTz7oyjY6BBkYo8Ei_4zKUB2udY7OghEa-Cw03L9La7fokjkOaA75K9vaKR_A-ovwTxg-zbDcN48Qy5X1mTDmRKSFYwQ7IFdBiqKYmrtb9ZrhB9Dx2YtGrDRLODqTfbCJ1sivYCR15KzW0qmrljr3tQoQRFJ5ACmIVvCrNg7dFFDfz2sqgEPxX77w" />
                      <div className="absolute top-3 right-3 z-20">
                        <span className="bg-surface/90 backdrop-blur-sm text-amber font-micro-label text-micro-label px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-amber/20">
                          <span className="material-symbols-outlined filled text-[12px]">warning</span> Pending
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <h3 className="font-body-md text-body-md font-bold text-on-surface truncate">Overflowing Public Bin</h3>
                      <p className="font-caption text-caption text-secondary-text truncate">124 Maple Street, Downtown</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-variant">
                        <span className="font-caption text-caption text-on-surface-variant text-[11px]">Reported 2h ago</span>
                        <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-secondary-container transition-colors">
                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Card 2: Resolved */}
                  <div className="snap-center shrink-0 w-72 bg-surface rounded-[20px] shadow-sm border border-warm-taupe/50 overflow-hidden flex flex-col active:scale-[0.98] transition-transform cursor-pointer opacity-90">
                    <div className="h-28 relative">
                      <div className="absolute inset-0 bg-black/10 z-10"></div>
                      <img className="w-full h-full object-cover" data-alt="A clean photograph of a freshly cleared alleyway in a city. The pavement is mostly clean, showing recent municipal work. Bright daylight illuminates the scene. The image serves as 'after' proof of municipal resolution, maintaining a clinical, documentary style typical of civic apps." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhWS0ygiH5kak6BaChvQxUeNUUIGiYZkZPexBLy1iAPNRvehynqFO2dxKrzjqmwltgtuN2ipdNXL-PITOs-_ZNkpN6l8THf_wzT1CxnDXHKT-RkQBIY13RBR346Lam5TOr5MhKJR8HfeIsbwvK5Fg_qGxNnJBGCkdmFhDK_0549t1M12ZoIzj3kQUxMspHtzVgkQjk_bVwCOBrtBG3UJDpsTZ55uZEDhGuFn9yG8qAHrN4PPRF0cKqBA" />
                      <div className="absolute top-3 right-3 z-20">
                        <span className="bg-surface/90 backdrop-blur-sm text-secondary font-micro-label text-micro-label px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-secondary/20">
                          <span className="material-symbols-outlined filled text-[12px]">check_circle</span> Resolved
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <h3 className="font-body-md text-body-md font-bold text-on-surface truncate">Illegal Dumping Cleared</h3>
                      <p className="font-caption text-caption text-secondary-text truncate">Alley behind 500 Oak Ave</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-variant">
                        <span className="font-caption text-caption text-on-surface-variant text-[11px]">Resolved yesterday</span>
                        <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-secondary-container transition-colors">
                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Card 3: Pending */}
                  <div className="snap-center shrink-0 w-72 bg-surface rounded-[20px] shadow-sm border border-warm-taupe/50 overflow-hidden flex flex-col active:scale-[0.98] transition-transform cursor-pointer opacity-90">
                    <div className="h-28 relative bg-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline text-4xl">broken_image</span>
                      <div className="absolute top-3 right-3 z-20">
                        <span className="bg-surface text-amber font-micro-label text-micro-label px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-amber/20">
                          <span className="material-symbols-outlined filled text-[12px]">warning</span> Pending
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <h3 className="font-body-md text-body-md font-bold text-on-surface truncate">Damaged Signage</h3>
                      <p className="font-caption text-caption text-secondary-text truncate">Corner of Elm &amp; 5th</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-variant">
                        <span className="font-caption text-caption text-on-surface-variant text-[11px]">Reported 5h ago</span>
                        <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-secondary-container transition-colors">
                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Map Locating FAB (Absolute positioned above bottom sheet) */}
            <button className="pointer-events-auto absolute right-margin bottom-[320px] md:bottom-24 w-12 h-12 bg-surface rounded-full shadow-[0_4px_10px_rgba(0,32,33,0.15)] flex items-center justify-center text-primary hover:bg-surface-container active:scale-95 transition-all z-20 border border-surface-variant">
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>
        </main>
        {/* Bottom Navigation Bar (Mobile Only) */}
      </div>
    </IonContent>
      <BottomNav active="map" />
  </IonPage>
);

export default MapExplorer;
