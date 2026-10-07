// AUTO-GENERATED from the Stitch export `a4_admin_ward_map_heatmap`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const AdminWardMap: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-background font-body-md h-screen flex flex-col overflow-hidden">
        {/* TopAppBar from JSON */}
        <header className="bg-background dark:bg-inverse-surface rounded-br-3xl w-full top-0 sticky shadow-sm dark:shadow-none flex justify-between items-center px-margin py-md w-full z-40">
          <div className="flex items-center gap-sm">
            <img alt="User profile photo" className="w-8 h-8 rounded-full object-cover" data-alt="A high-quality, professional headshot of a municipal administrator in an office setting. Warm ivory and teal lighting. Crisp focus, modern corporate style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdijo3g_4mHoO_D69-OC2Q1UCK5JM3wyWmGwo1o1vC-znLceBA1euv5-AvhFsTp513PZ5GxflZRxacTTZvl8jj3kWFRZH0eXD-5dMhci6-BylN14c18rAhlaFMVjalYBv9KLeM0aPiBcnBw_9Ns0uvnY5_-inObEkoO5V_g7WtcZqS1bbzuorkZalA8ct7D3I9ihnpwMb-0l-ULUo9cHxVAkqmZD0IhABjl-xdn926atUpQTjLbUDmXw" />
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Wasteman</h1>
          </div>
          <button className="text-primary dark:text-primary-fixed hover:bg-surface-container transition-colors p-2 rounded-full active:scale-95 duration-150">
            <span className="material-symbols-outlined" data-icon="location_on">location_on</span>
          </button>
        </header>
        {/* Map Canvas (Main Content) */}
        <main className="flex-grow relative z-0">
          {/* Map Background Image */}
          <div className="absolute inset-0 bg-surface-container-high" data-alt="A highly detailed, top-down map view of a modern city center. The map style is light and clean, emphasizing soft ivory and warm taupe tones for streets and buildings, with vivid teal accents for parks and water bodies. Bright, clear, overhead lighting creates a professional, civic-tech aesthetic." data-location="City Center" style={{ backgroundImage: "url('https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg')" }}></div>
          {/* Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Heatmap / Shading Simulation */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_40%,_rgba(232,163,61,0.5)_0%,_transparent_40%),_radial-gradient(circle_at_70%_60%,_rgba(0,106,104,0.4)_0%,_transparent_50%)]"></div>
            {/* Cluster Bubbles */}
            <div className="absolute top-[35%] left-[25%] pointer-events-auto">
              <button className="bg-amber text-on-primary font-title-sm w-12 h-12 rounded-full flex items-center justify-center shadow-md transform hover:scale-105 transition-transform">12</button>
            </div>
            <div className="absolute top-[55%] left-[65%] pointer-events-auto">
              <button className="bg-secondary text-on-secondary font-title-sm w-14 h-14 rounded-full flex items-center justify-center shadow-md transform hover:scale-105 transition-transform">24</button>
            </div>
            <div className="absolute top-[20%] left-[80%] pointer-events-auto">
              <button className="bg-primary text-on-primary font-title-sm w-10 h-10 rounded-full flex items-center justify-center shadow-md transform hover:scale-105 transition-transform">5</button>
            </div>
          </div>
          {/* Top Controls (Search & View Toggle) */}
          <div className="absolute top-0 left-0 w-full p-margin flex flex-col gap-sm pointer-events-auto z-10">
            {/* Search Pill */}
            <div className="bg-surface flex items-center px-4 py-3 rounded-full shadow-[0_2px_8px_rgba(0,58,62,0.1)] border border-warm-taupe/30">
              <span className="material-symbols-outlined text-outline mr-sm">search</span>
              <input className="bg-transparent border-none outline-none focus:ring-0 flex-grow font-body-md text-on-surface placeholder-outline" placeholder="Search wards or addresses" type="text" />
              <button className="text-secondary"><span className="material-symbols-outlined">mic</span></button>
            </div>
            {/* Chips Container */}
            <div className="flex gap-sm overflow-x-auto pb-2 scrollbar-hide">
              <button className="bg-secondary-container text-on-secondary-container border-2 border-transparent px-4 py-1.5 rounded-full font-body-md font-semibold whitespace-nowrap flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">blur_on</span> Heatmap
              </button>
              <button className="bg-surface text-on-surface-variant border border-warm-taupe px-4 py-1.5 rounded-full font-body-md whitespace-nowrap hover:bg-surface-variant transition-colors flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">location_on</span> Pins
              </button>
              <button className="bg-surface text-on-surface-variant border border-warm-taupe px-4 py-1.5 rounded-full font-body-md whitespace-nowrap hover:bg-surface-variant transition-colors flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">route</span> Routes
              </button>
              <div className="w-[1px] bg-warm-taupe my-1 mx-xs"></div>
              <button className="bg-surface text-on-surface-variant border border-warm-taupe px-3 py-1.5 rounded-full font-body-md whitespace-nowrap hover:bg-surface-variant transition-colors flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">filter_list</span> Filters
              </button>
            </div>
          </div>
          {/* FAB */}
          <button className="absolute bottom-[200px] right-margin bg-secondary text-on-secondary w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,106,104,0.3)] z-20 hover:scale-105 transition-transform active:scale-95">
            <span className="material-symbols-outlined filled text-[24px]">my_location</span>
          </button>
          {/* Bottom Sheet (Peeking) */}
          <div className="absolute bottom-16 left-0 w-full bg-surface rounded-t-[24px] shadow-[0_-8px_20px_rgba(0,32,33,0.1)] z-30 flex flex-col pt-3 pb-[80px] px-margin transition-transform duration-300">
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-warm-taupe rounded-full mx-auto mb-4"></div>
            <div className="flex justify-between items-start mb-md">
              <div>
                <h2 className="font-title-sm text-on-surface">Hotspot — Cross Cut Road</h2>
                <p className="font-caption text-secondary-text mt-xs flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">warning</span> High density reported
                </p>
              </div>
              <button className="bg-error-container text-on-error-container px-3 py-1 rounded-full font-micro-label uppercase">Critical</button>
            </div>
            {/* Thumbnails List */}
            <div className="flex gap-md overflow-x-auto pb-sm scrollbar-hide">
              <div className="min-w-[120px] h-[80px] rounded-lg overflow-hidden relative shadow-sm border border-warm-taupe/20">
                <img className="w-full h-full object-cover" data-alt="A close-up, clear photo of overflowing municipal waste bins on a city sidewalk. The lighting is bright daylight, showing realistic urban textures. Modern, clean aesthetic despite the subject matter, focusing on data collection for civic improvement." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwApSyfj41kHiiowKqGBqxy_4b_GABLzPuUfmb56kV2-cIYzS_LP1c3FvATLYrC45KTwlq_5wz8ZiNmyJXofQh_GXrRcswefodWgVHJGEHindUa3VzjUxIoAacOCQyLZNB9LXgqMwGVT_BKH3znng_I_g5DHFeuTSXC9-IWvrHaeimP-6MIzbPt14lO_o74_F_BUdA0Ns13u_lac2Y_EhevpTZma73sW1qQ40sG2nadqQ2dwikw0bstQ" />
                <div className="absolute bottom-1 left-1 bg-surface/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-semibold text-on-surface">10m ago</div>
              </div>
              <div className="min-w-[120px] h-[80px] rounded-lg overflow-hidden relative shadow-sm border border-warm-taupe/20">
                <img className="w-full h-full object-cover" data-alt="A daytime photo of a pile of discarded cardboard boxes and bags next to a streetlamp on a paved pedestrian path. Bright, flat lighting suitable for documentation. Clean and professional composition." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr5BaR8pNKgJ2TjLXHFlBM5zksbUYHZZ3gAd0Nu_uv-Q2FfauMK5V5NRBl7QQT912DW5Ql3TWPIfzp7nuf_qGlLllf982CArpph8IlF81KZhD37kzusQ6TX2M6U4_oLjwqOwCpgVHTYoaBwAV8LbMO9hYUsMtnfNgfTmoX-sQ6T93V8dMzE_m51Xh8IP_AfdxvUVRn2z0g5uhOTFcFgvU6JIULOLiyreXYj-09KICe5Ol3xUm4YagPdQ" />
                <div className="absolute bottom-1 left-1 bg-surface/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-semibold text-on-surface">1h ago</div>
              </div>
              <div className="min-w-[120px] h-[80px] rounded-lg flex items-center justify-center bg-surface-container border border-warm-taupe/50 text-secondary-text cursor-pointer hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined">add_photo_alternate</span>
              </div>
            </div>
          </div>
        </main>
        {/* BottomNavBar from JSON */}
        <style>
          /* Utility to hide scrollbar for horizontal scrolling containers */
          .scrollbar-hide::-webkit-scrollbar &#123;
          display: none;
          &#125;
          .scrollbar-hide &#123;
          -ms-overflow-style: none;
          scrollbar-width: none;
          &#125;
        </style>
      </div>
    </IonContent>
  </IonPage>
);

export default AdminWardMap;
