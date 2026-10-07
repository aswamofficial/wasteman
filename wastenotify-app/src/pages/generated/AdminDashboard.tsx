// AUTO-GENERATED from the Stitch export `a1_admin_dashboard`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const AdminDashboard: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-surface-container-high text-on-surface min-h-screen font-body-md flex flex-col md:flex-row">
        {/* Mobile Top App Bar (Only visible on small screens) */}
        <header className="md:hidden flex justify-between items-center px-margin py-md w-full bg-background dark:bg-inverse-surface rounded-br-3xl top-0 sticky z-40 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden">
              <img className="w-full h-full object-cover" data-alt="A small, professional avatar photo of a municipal worker in a bright, modern office setting. The style is clean and corporate, reflecting a safe, civic-minded identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpMEG5t8hNYTKv7E-DC8zM0TMXGYX9VHy_-L77hYujlpUbtNCdwS-htX-4qH0jvn83wzDhPxksPAHADete99AcnqxAAlLxfHAAWJ24pz8uFmZ-1-aJq3ylSVULrMQG-rshVfjlDJVR2FKYDBfwaniuGYTsYLMsuByNNWGLICLvOnJ_BBCqvpvk8Fqr4Aqd4_8O713G2YCiO9cqY1L8uPzAhqRKbvMzATLJ5fhWPPnJPwxteS7GdCL17Q" />
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Wasteman</h1>
          </div>
          <button className="text-primary dark:text-primary-fixed active:scale-95 duration-150 hover:bg-surface-container transition-colors p-2 rounded-full">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>location_on</span>
          </button>
        </header>
        {/* Desktop Side Nav (Hidden on mobile) */}
        <aside className="hidden md:flex flex-col w-64 bg-surface dark:bg-surface-container-low h-screen sticky top-0 border-r border-surface-variant shadow-[4px_0_10px_rgba(0,32,33,0.05)] z-40">
          <div className="p-xl flex items-center gap-3 border-b border-surface-variant">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">delete_outline</span>
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">Wasteman</h1>
          </div>
          <nav className="flex-1 py-xl px-md space-y-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary-container text-on-secondary-container font-bold transition-colors" href="#">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              Dashboard
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors" href="#">
              <span className="material-symbols-outlined">map</span>
              Map View
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors" href="#">
              <span className="material-symbols-outlined">report</span>
              Reports
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors" href="#">
              <span className="material-symbols-outlined">history</span>
              Activity Log
            </a>
          </nav>
          <div className="p-margin border-t border-surface-variant">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden">
                <img className="w-full h-full object-cover" data-alt="A small, professional avatar photo of a municipal administrative worker in a bright, modern office setting. The style is clean and corporate." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM9QRWG1oOVygkYD697NDVubigfxLcl7fvuAc72VC1YAk5EajLHpS1MBXyeW01dvKdQGHOWxo3RLLrvny9jGBs6WZcrSS-gK4SLrqVsCDmTIbHY6v2MnrW6V6Lqety6i8QDX7X5-I5GxVrb0X195jf8d--9pxDuDCShtH37Pe4v_2mDyams-aMLMy4Pkzwhv4e1XZ4cxFPAdmGs0Jp_RnTzjGUQfHiJxAl6ZksJrb-w2gw4Mj9cFD-LA" />
              </div>
              <div>
                <p className="font-body-md text-on-surface font-bold">Admin User</p>
                <p className="font-caption text-caption text-on-surface-variant">Ward 12 Supervisor</p>
              </div>
            </div>
          </div>
        </aside>
        {/* Main Content Canvas */}
        <main className="flex-1 flex flex-col pb-20 md:pb-0 h-screen overflow-y-auto">
          {/* Page Header */}
          <div className="px-margin py-xl bg-surface">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 max-w-7xl mx-auto">
              <div>
                <p className="font-micro-label text-micro-label text-secondary uppercase mb-1">Operational View</p>
                <h2 className="font-headline-lg text-headline-lg text-primary">Ward 12 Sanitation</h2>
              </div>
              <div className="flex gap-2">
                <button className="bg-surface text-primary border border-warm-taupe px-4 py-2 rounded-full font-body-md font-bold flex items-center gap-2 hover:bg-surface-container-high transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  Filter
                </button>
                <button className="bg-secondary text-on-secondary px-6 py-2 rounded-full font-body-md font-bold hover:opacity-90 transition-opacity shadow-sm">
                  Export Data
                </button>
              </div>
            </div>
          </div>
          {/* Alert Strip */}
          <div className="bg-amber/10 border-l-4 border-amber p-4 mx-margin md:mx-auto max-w-7xl w-full mt-gutter rounded-r-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-amber mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div>
              <p className="font-body-md font-bold text-on-surface">3 Overdue Reports Detected</p>
              <p className="font-caption text-caption text-on-surface-variant mt-1">Hazardous waste collection in Sector B is 4 hours past SLA. Dispatch immediate response.</p>
            </div>
            <button className="ml-auto text-amber hover:bg-amber/20 p-1 rounded-full transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <div className="flex-1 p-margin md:p-xl max-w-7xl mx-auto w-full">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter md:gap-xl mb-xl">
              {/* KPI Card 1 */}
              <div className="bg-surface rounded-[20px] p-5 shadow-sm border border-warm-taupe/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-4xl text-primary">fiber_new</span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant mb-2">New Reports (24h)</p>
                <div className="flex items-end gap-2">
                  <p className="font-headline-lg text-headline-lg text-primary">42</p>
                  <span className="font-caption text-caption text-secondary bg-secondary/10 px-2 py-0.5 rounded-full mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">trending_up</span> 12%
                  </span>
                </div>
              </div>
              {/* KPI Card 2 */}
              <div className="bg-surface rounded-[20px] p-5 shadow-sm border border-warm-taupe/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-4xl text-amber">pending_actions</span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant mb-2">In Progress</p>
                <div className="flex items-end gap-2">
                  <p className="font-headline-lg text-headline-lg text-on-surface">18</p>
                </div>
              </div>
              {/* KPI Card 3 */}
              <div className="bg-surface rounded-[20px] p-5 shadow-sm border border-warm-taupe/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-4xl text-secondary">check_circle</span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant mb-2">Resolved Today</p>
                <div className="flex items-end gap-2">
                  <p className="font-headline-lg text-headline-lg text-on-surface">27</p>
                </div>
              </div>
              {/* KPI Card 4 */}
              <div className="bg-surface rounded-[20px] p-5 shadow-sm border border-warm-taupe/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-4xl text-error">timer</span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant mb-2">Avg. Resolution Time</p>
                <div className="flex items-end gap-2">
                  <p className="font-headline-lg text-headline-lg text-on-surface">4.2<span className="text-title-sm text-on-surface-variant">h</span></p>
                </div>
              </div>
            </div>
            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
              {/* Left Column: Reports Queue (Takes up 2 columns on large screens) */}
              <div className="lg:col-span-2 flex flex-col gap-gutter">
                <div className="bg-surface rounded-[20px] shadow-sm border border-warm-taupe/30 overflow-hidden flex flex-col h-[500px]">
                  <div className="p-5 border-b border-warm-taupe/30 flex justify-between items-center bg-surface-container-lowest">
                    <h3 className="font-title-sm text-title-sm text-primary">Active Reports Queue</h3>
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                  {/* Dense Table View */}
                  <div className="overflow-x-auto flex-1 bg-surface">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container-lowest border-b border-warm-taupe/30 font-micro-label text-micro-label text-on-surface-variant uppercase sticky top-0 z-10">
                        <tr>
                          <th className="p-3 pl-5 font-normal">ID</th>
                          <th className="p-3 font-normal">Type</th>
                          <th className="p-3 font-normal">Location</th>
                          <th className="p-3 font-normal">Severity</th>
                          <th className="p-3 font-normal">Status</th>
                          <th className="p-3 font-normal">Time</th>
                          <th className="p-3 pr-5 font-normal text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="font-caption text-caption text-on-surface divide-y divide-warm-taupe/20">
                        {/* Row 1: High Severity / Overdue */}
                        <tr className="hover:bg-surface-container-low transition-colors bg-amber/5">
                          <td className="p-3 pl-5 font-bold text-primary">#WN-8821</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-amber">delete</span>
                              Illegal Dumping
                            </div>
                          </td>
                          <td className="p-3">Sector B, Alley 4</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-micro-label text-[10px]">
                              High
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 bg-amber/20 text-amber px-2 py-0.5 rounded-full font-micro-label text-[10px]">
                              Overdue
                            </span>
                          </td>
                          <td className="p-3 text-on-surface-variant">4h ago</td>
                          <td className="p-3 pr-5 text-right">
                            <button className="text-secondary hover:text-primary transition-colors font-bold">Review</button>
                          </td>
                        </tr>
                        {/* Row 2: In Progress */}
                        <tr className="hover:bg-surface-container-low transition-colors">
                          <td className="p-3 pl-5 font-bold text-primary">#WN-8822</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-primary">recycling</span>
                              Missed Collection
                            </div>
                          </td>
                          <td className="p-3">124 Maple St.</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full font-micro-label text-[10px]">
                              Low
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-micro-label text-[10px]">
                              In Progress
                            </span>
                          </td>
                          <td className="p-3 text-on-surface-variant">1h ago</td>
                          <td className="p-3 pr-5 text-right">
                            <button className="text-secondary hover:text-primary transition-colors font-bold">Review</button>
                          </td>
                        </tr>
                        {/* Row 3: New */}
                        <tr className="hover:bg-surface-container-low transition-colors">
                          <td className="p-3 pl-5 font-bold text-primary">#WN-8823</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-primary">broken_image</span>
                              Damaged Bin
                            </div>
                          </td>
                          <td className="p-3">Park Ave. &amp; 5th</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full font-micro-label text-[10px]">
                              Med
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full font-micro-label text-[10px]">
                              New
                            </span>
                          </td>
                          <td className="p-3 text-on-surface-variant">15m ago</td>
                          <td className="p-3 pr-5 text-right">
                            <button className="text-secondary hover:text-primary transition-colors font-bold">Assign</button>
                          </td>
                        </tr>
                        {/* Row 4: New */}
                        <tr className="hover:bg-surface-container-low transition-colors">
                          <td className="p-3 pl-5 font-bold text-primary">#WN-8824</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-primary">delete</span>
                              Overflowing Bin
                            </div>
                          </td>
                          <td className="p-3">Central Plaza</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full font-micro-label text-[10px]">
                              Med
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full font-micro-label text-[10px]">
                              New
                            </span>
                          </td>
                          <td className="p-3 text-on-surface-variant">5m ago</td>
                          <td className="p-3 pr-5 text-right">
                            <button className="text-secondary hover:text-primary transition-colors font-bold">Assign</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* Right Column: Map & Tools */}
              <div className="flex flex-col gap-gutter h-full">
                {/* Mini Map Heatmap */}
                <div className="bg-surface rounded-[20px] shadow-sm border border-warm-taupe/30 overflow-hidden flex-1 min-h-[300px] relative">
                  <div className="absolute top-0 left-0 w-full p-4 z-10 bg-gradient-to-b from-surface/80 to-transparent pointer-events-none">
                    <h3 className="font-title-sm text-title-sm text-primary">Incident Heatmap</h3>
                    <p className="font-caption text-caption text-on-surface-variant">Live view of Ward 12</p>
                  </div>
                  {/* Map Placeholder */}
                  <div className="w-full h-full relative bg-surface-variant">
                    {/* Using a stylized image as a map placeholder */}
                    <img className="w-full h-full object-cover" data-alt="A stylized, modern, flat vector map of a city district (Ward 12). The map is designed with clean, geometric lines in a light mode palette, utilizing soft warm ivory tones for landmasses and subtle taupe outlines for streets. The aesthetic is professional, technical, and safe, typical of a high-end municipal dashboard. There are subtle, abstract colored dots (amber, teal, primary green) scattered across the map indicating data points or heat spots, but no complex 3D rendering or text labels." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD54MryCKFGt3fgnJxdUoaTxVaRDOzNwE83eFG6I2EgkKwLK05Nq945adQ-ZLwoxm9_kSIXRkTOwUj2b_oqH9aqCB7kvJ8xx4bHNGxgmKU4EhTqEGktbzCvLgxgQ7IOYnvVSjuZ9jxOZRwbgVPgQYh2OqGVcnteQbVspIApR783y_DAQ7qxuo5vr_EjRGpxkk_DHUV7KN79iuItEBYOVNLS89a4XLmtGW6NalyP9b6-KxygLR_IgD1yVg" />
                    {/* Simulated Map Pins Overlay */}
                    <div className="absolute inset-0">
                      <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-amber rounded-full shadow-[0_0_15px_rgba(232,163,61,0.6)] animate-pulse border-2 border-surface"></div>
                      <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-secondary rounded-full shadow-sm border-2 border-surface"></div>
                      <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-error rounded-full shadow-[0_0_10px_rgba(168,86,76,0.4)] border-2 border-surface"></div>
                    </div>
                  </div>
                </div>
                {/* Quick Actions / Status Summary */}
                <div className="bg-surface rounded-[20px] shadow-sm border border-warm-taupe/30 p-5">
                  <h3 className="font-title-sm text-title-sm text-primary mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-3 rounded-[14px] border border-warm-taupe/50 hover:border-secondary hover:bg-surface-container transition-all text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px] text-on-secondary-container">local_shipping</span>
                        </div>
                        <span className="font-body-md text-on-surface font-bold">Dispatch Extra Unit</span>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-[14px] border border-warm-taupe/50 hover:border-secondary hover:bg-surface-container transition-all text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px] text-primary">campaign</span>
                        </div>
                        <span className="font-body-md text-on-surface font-bold">Broadcast Alert</span>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* Mobile Bottom Navigation (Hidden on desktop) */}
      </div>
    </IonContent>
  </IonPage>
);

export default AdminDashboard;
