// AUTO-GENERATED from the Stitch export `12_my_reports`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';
import BottomNav from '../../components/BottomNav';

const MyReports: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-background min-h-screen pb-24 font-body-md">
        {/* TopAppBar */}
        <header className="bg-background dark:bg-inverse-surface rounded-br-3xl w-full top-0 sticky z-40 shadow-sm dark:shadow-none flex justify-between items-center px-margin py-md">
          <div className="flex items-center gap-sm">
            <img className="w-10 h-10 rounded-full object-cover outline outline-1 outline-warm-taupe/30" data-alt="A small, professional circular avatar portrait of a diverse citizen user. Warm ivory lighting, approachable corporate modern aesthetic, soft shadows. High quality." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbvJKUmHb6byJbOQs0p1LBD5cBAubcHEWi5ttVGOQv8CIMC4c5W_FLp8rvyWNblrlD96rr32VMjHdIhUFUJSiHSTbDirzRZ3z8Xe8NpiugNN8S-sqWj4GYSMv8Gseb6dtr7TfQqj3hxYTKSuGmIzH0hY9GM5rCimVtnUb2sThE7nUgE9GCITASHKbojkFuqm6kx7BsGu6kAVjhv4X58NH_GNRFo5TsZbfsrYiP6Ciw82hTLQEiQoK1hw" />
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Wasteman</h1>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors active:scale-95 duration-150">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed" data-icon="location_on">location_on</span>
          </button>
        </header>
        <main className="pt-6">
          {/* Page Title & Segmentation */}
          <div className="px-margin mb-6">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">My Reports</h2>
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
              <button className="whitespace-nowrap px-4 py-2 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold shadow-sm transition-all">All</button>
              <button className="whitespace-nowrap px-4 py-2 rounded-full border border-warm-taupe text-on-surface-variant font-caption text-caption hover:bg-surface-container transition-all">Pending</button>
              <button className="whitespace-nowrap px-4 py-2 rounded-full border border-warm-taupe text-on-surface-variant font-caption text-caption hover:bg-surface-container transition-all">In progress</button>
              <button className="whitespace-nowrap px-4 py-2 rounded-full border border-warm-taupe text-on-surface-variant font-caption text-caption hover:bg-surface-container transition-all">Resolved</button>
            </div>
          </div>
          {/* Reports List */}
          <div className="px-margin flex flex-col gap-3">
            {/* Pending Card */}
            <div className="bg-surface rounded-xl p-4 shadow-[0_4px_12px_rgba(0,58,62,0.05)] border border-warm-taupe/20 flex gap-4 active:scale-[0.98] transition-transform">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img className="w-full h-full object-cover" data-alt="A photograph of an overflowing municipal trash bin on a city sidewalk. Sunny day, urban environment. Photography-forward style, crisp focus, subtle warm tone." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEH5PDiww0UbP5kEcfuxlGTJKH2rW8g5zNUl6zLo2O5n1W9gx4c5s39SXnwGXiTciJyk19QDVXw6CV8slimSaJ9NEuLtjnb3Vj2e2TK3Wk9VGbYKEW_y4TUWWt65MZDKxWuQ3C6FLpy65_5E0W5akElLzKpb_sVMVNBq7h4iiSBPE94ommzTwKhYJVaQS8h-fUB2CYdixmLbMjYzpL1Y6Qw5aevRztIxkp-4w19tgP5D7p8ShozrVA6A" />
              </div>
              <div className="flex flex-col flex-grow justify-between py-1">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-title-sm text-title-sm text-on-surface line-clamp-1">Overflowing Bin</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber/20 text-on-surface font-caption text-caption font-semibold whitespace-nowrap ml-2">Pending</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant line-clamp-1">124 Main St. Plaza</p>
                </div>
                <p className="font-micro-label text-micro-label text-outline uppercase">Reported 2h ago</p>
              </div>
            </div>
            {/* In Progress Card */}
            <div className="bg-surface rounded-xl p-4 shadow-[0_4px_12px_rgba(0,58,62,0.05)] border border-warm-taupe/20 flex gap-4 active:scale-[0.98] transition-transform">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img className="w-full h-full object-cover" data-alt="A photograph of illegal dumping with cardboard boxes and debris next to a park fence. Overcast lighting, civic context. Photography-forward style, crisp focus." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFUz09o3SRBHw73ad9ctLXqY8uRbgma-OCcmWXV3HQcWc_rqqHyXtHvpXxRsZjMZycDqzMC8rdeDC_halaQpkk8428QIBU-fGjn33uXQKuf01P9b1fNYCdhlQ2YdQ_FJayijxOij1plceNNdiGXpV6w2-aGT4BHLobLyNYmCl9IFeTRHYDLSwoGEWMYQjRbH_1Y37mVn9EZDOT6gYuKd9ziKyjq7d-HJEsATMV8fQNS_IeoWVt3-5leg" />
              </div>
              <div className="flex flex-col flex-grow justify-between py-1">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-title-sm text-title-sm text-on-surface line-clamp-1">Illegal Dumping</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-caption text-caption font-semibold whitespace-nowrap ml-2">In progress</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant line-clamp-1">Centennial Park North</p>
                </div>
                <p className="font-micro-label text-micro-label text-outline uppercase">Updated Yesterday</p>
              </div>
            </div>
            {/* Resolved Card */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_2px_8px_rgba(0,58,62,0.03)] border border-warm-taupe/10 flex gap-4 opacity-75 active:scale-[0.98] transition-transform">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative grayscale">
                <img className="w-full h-full object-cover" data-alt="A photograph of a clean, empty sidewalk where graffiti used to be. Bright midday sun, urban wall. Photography-forward style, crisp focus, calm atmosphere." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3y1pcA9b_iqR0rizXJ4RuWvoj9om0zhHL7vyP6hZV3j4z7khyjAn7dY7487qmvTeWi-OOn8hjlo5qXn4qOgtKMKwDwZ7vBZbbXrGaucG8yweY6zUZm91dWwtFbeEyRuj9LaB95_WgrZQadWLXAgllnYpIryK_sty2A8VWciET3JcPYPepxdrJC5Yx0TBNp5fPTD18NXF4UONvYTqC1hAme1TSyV2_cqe6uNz0z3aeqbSPTa_Kw1J7ww" />
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary fill" style={{ fontSize: "28px" }}>check_circle</span>
                </div>
              </div>
              <div className="flex flex-col flex-grow justify-between py-1">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-title-sm text-title-sm text-on-surface line-clamp-1 line-through decoration-outline/50">Graffiti Removal</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant font-caption text-caption font-semibold whitespace-nowrap ml-2">Resolved</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant line-clamp-1">Downtown Underpass</p>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>task_alt</span>
                  <p className="font-micro-label text-micro-label uppercase">Cleared on Oct 12</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* BottomNavBar */}
      </div>
    </IonContent>
      <BottomNav active="activity" />
  </IonPage>
);

export default MyReports;
