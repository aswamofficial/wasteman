// AUTO-GENERATED from the Stitch export `a2_admin_incoming_report_detail`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const AdminReportDetail: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-background min-h-screen pb-24 font-body-md antialiased">
        {/* TopAppBar */}
        <header className="bg-background dark:bg-inverse-surface rounded-br-3xl w-full top-0 sticky shadow-sm dark:shadow-none z-40">
          <div className="flex justify-between items-center px-margin py-md w-full">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-surface-container transition-colors rounded-full active:scale-95 duration-150">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container">
                <img alt="User Profile" className="w-full h-full object-cover" data-alt="Close up professional portrait of a municipal administrator in soft office lighting, wearing business casual attire, warm and approachable expression, high resolution, corporate modern aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU8Tmo2aS0YWdoCPn-9UU-3s-U0gXLUmULXrnViOx4zKT5iOm6GaRqx7AHz1vmqgjxmgu_3_C52cjaPhNfEGa2BLTSB7ooOul8RgN6B5K1fcUiTBnXiYvP7dGMNmntn1G2xXcwbt2Q99Sa_DoM9mvqbrrkg8hdFdqNHb_1DGieN_Tk0GtvV4b9G6Bi2UM7788RxKXQdDlN50SoO2wuSGlzy5kKW6xoIU9Fr0ZhRrMQaAd8sfqQMOBBqA" />
              </div>
              <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Wasteman</h1>
            </div>
            <button className="p-2 hover:bg-surface-container transition-colors rounded-full active:scale-95 duration-150">
              <span className="material-symbols-outlined text-primary dark:text-primary-fixed">more_vert</span>
            </button>
          </div>
        </header>
        <main className="px-margin py-lg space-y-gutter max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,106,104,0.08)]">
            <img alt="Reported waste" className="w-full h-full object-cover" data-alt="A photo taken from a smartphone showing a pile of discarded cardboard boxes and household furniture left on a suburban sidewalk next to a street sign. The lighting is overcast daylight. The photo is framed as evidence for a municipal report." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiYSRg_G6lc3yitQIPH6GZTrqX_UqN4U5q-2kURdEapXsmpG6vGuu6_ubsZEPwt-kfgHfiaDcJ0HmJbSCI-nRtEm_1x3sjstqNwgeeA8YjhpY9pf5nwWjpBu5m91tKxeb_WtnQY9bBE5hzEZ4PXIsZeU4ceBU4XYxC8DvCqfIf0w2T1N0eQsdcYJE0s4Aq6mkfcp7-tv97KlR8LI8BvwA8FhcOOoWL-3PSqBMc8gaH3t5B4epCGi7tmQ" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <h2 className="font-title-sm text-title-sm text-white mb-1">Illegal Dumping - Furniture</h2>
                <p className="font-caption text-caption text-white/80">Reported 2 hours ago</p>
              </div>
              <div className="bg-amber px-3 py-1.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                <span className="font-caption text-caption font-semibold text-white">PENDING</span>
              </div>
            </div>
          </div>
          {/* AI Classification Card */}
          <div className="bg-surface-container-low rounded-xl p-5 border border-warm-taupe/30 shadow-[0_4px_12px_rgba(0,106,104,0.05)]">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary">memory</span>
              <h3 className="font-title-sm text-title-sm text-primary">AI Classification</h3>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="font-caption text-caption text-secondary-text mb-1">Primary Type</p>
                <p className="font-body-md text-body-md font-semibold text-on-surface">Bulky Waste</p>
              </div>
              <div>
                <p className="font-caption text-caption text-secondary-text mb-1">Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[92%] rounded-full"></div>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-secondary">92%</span>
                </div>
              </div>
              <div>
                <p className="font-caption text-caption text-secondary-text mb-1">Severity</p>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-amber"></span>
                  <p className="font-body-md text-body-md font-semibold text-on-surface">Medium</p>
                </div>
              </div>
              <div>
                <p className="font-caption text-caption text-secondary-text mb-1">Est. Volume</p>
                <p className="font-body-md text-body-md font-semibold text-on-surface">3-4 Cubic Yds</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-warm-taupe/30">
                <p className="font-caption text-caption text-secondary-text mb-1">Recommended Action</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
                  <p className="font-body-md text-body-md font-semibold text-primary">Dispatch Flatbed Crew (Team B)</p>
                </div>
              </div>
            </div>
          </div>
          {/* Location & Map */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden border border-warm-taupe/30 shadow-[0_4px_12px_rgba(0,106,104,0.05)]">
            <div className="p-4 border-b border-warm-taupe/30 flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary mt-0.5">location_on</span>
              <div>
                <p className="font-body-md text-body-md font-semibold text-on-surface">142 Maplewood Avenue</p>
                <p className="font-caption text-caption text-secondary-text">District 4, Sector 7</p>
              </div>
            </div>
            <div className="h-32 w-full bg-surface-container-high relative">
              <img alt="Map Location" className="w-full h-full object-cover" data-location="Portland, Oregon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0Xb-LXVXwARV41vE3y3WXWyKHSCCUKBn4WKlQGS90mlUL2yOoEkWT5HiPgs0z8e9XQFh8sgEpAy2wzZxbQ-Q-ZIxiO5KSjDt09-QtvliAiMxZX9wjDpDIXOcGqHxY_7F7mWxC-k5nAyO8XOwwbovR7U6HY38ezh845kJnHetLhaIjiL40yVfj-hOrGwTKn-a3j1AWbZukhjRKhA5dOrL8k7jFaQcZstBljEb_75oPjCpM9Sp-lYtBAg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-error rounded-full border-2 border-white shadow-md animate-pulse"></div>
              </div>
            </div>
          </div>
          {/* Reporter Info */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-warm-taupe/30 shadow-[0_4px_12px_rgba(0,106,104,0.05)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container">
                <img alt="Reporter" className="w-full h-full object-cover" data-alt="Portrait of an everyday citizen, male, casual clothing, taken outdoors in natural light. Warm and friendly appearance, reliable community member." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhSgprD9LIWAtJBKMX_RCVxqU4mP4kRDUPuGtlwHfTHhA6CiyxMMJ9UpO4MX5fiqB_gIFrmwrHMJxjfMl-DtGofTdNBlRTt0tu24DA9qg1plS3KO2_34EVVzWCu2CLWZwql3QsmIIMPQWvxx3yr3d-NTVsn5nYM0IPFQH34DgoHbh5m-3KEA12BcsGwHYwbOY3SEOJmKdvpYo_5w_rkc-nmvIJU8KLyfRfOytPjf4HFTrGahL-xz--jA" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-body-md text-body-md font-semibold text-on-surface">Ravi Kumar</p>
                  <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <p className="font-caption text-caption text-secondary-text">Citizen Reporter • 12 Reports</p>
              </div>
            </div>
            <button className="p-2 text-primary hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </main>
        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-surface border-t border-warm-taupe/20 p-4 pb-safe flex gap-4 shadow-[0_-4px_20px_rgba(0,32,33,0.08)] z-50">
          <button className="flex-1 py-3 px-4 rounded-full border border-warm-taupe text-on-surface-variant font-title-sm text-title-sm font-semibold text-center hover:bg-surface-container transition-colors active:scale-95">
            Reject
          </button>
          <button className="flex-[2] py-3 px-4 rounded-full bg-secondary text-white font-title-sm text-title-sm font-semibold text-center flex items-center justify-center gap-2 hover:bg-tertiary transition-colors active:scale-95 shadow-md">
            <span>Assign Team</span>
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default AdminReportDetail;
