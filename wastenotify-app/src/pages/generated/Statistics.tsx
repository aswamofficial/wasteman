// AUTO-GENERATED from the Stitch export `16_statistics_impact`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';
import BottomNav from '../../components/BottomNav';

const Statistics: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-background antialiased min-h-screen flex flex-col pt-safe pb-24">
        {/* TopAppBar */}
        <header className="bg-background dark:bg-inverse-surface rounded-br-3xl w-full top-0 sticky shadow-sm dark:shadow-none flex justify-between items-center px-margin py-md z-40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container bg-surface-variant flex-shrink-0">
              <img alt="User profile photo" className="w-full h-full object-cover" data-alt="A professional headshot of a community member, bright lighting, soft Warm Ivory background, subtle smile, corporate modern style, clean and approachable." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8RMakZ2gd2XLmXMUlonLnwu3V1NmA4bhVqb-V1JTzWuDwNurNAImHrKkbjub_K6OFuUJvdTEDcX_AfdTni3V9oC15A31GJ4np4Mkd8kzRLS3e_DfTF0meOMD5uYWosR0piqbmSi2KM1xTZ7b-fq_VWgsmG0aYCMsliS3xSFlsJ6eYpT-Idlm2hy_Yw7jPZ6TpI83D_4LsjG5Lw8Dqfqq9-fQrLA6ObPTNwDD4WYF6QRdexW-IqQ3hhw" />
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed tracking-tight">Wasteman</h1>
          </div>
          <button aria-label="Location" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95 duration-150 text-primary dark:text-primary-fixed">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>location_on</span>
          </button>
        </header>
        {/* Main Content Canvas */}
        <main className="flex-1 px-margin pb-[100px] flex flex-col gap-xl overflow-y-auto mt-6">
          {/* Toggle & Header */}
          <div className="flex flex-col gap-4">
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Impact &amp; Stats</h2>
            {/* Segmented Control */}
            <div className="bg-surface-container-high rounded-full p-1 flex w-full relative">
              <div className="absolute inset-y-1 left-1 w-[calc(33.33%-4px)] bg-background rounded-full shadow-sm transition-transform duration-300 ease-in-out z-0"></div>
              <button className="flex-1 py-2 font-body-md text-body-md font-semibold text-primary relative z-10 text-center">Me</button>
              <button className="flex-1 py-2 font-body-md text-body-md font-medium text-on-surface-variant relative z-10 text-center">My ward</button>
              <button className="flex-1 py-2 font-body-md text-body-md font-medium text-on-surface-variant relative z-10 text-center">City</button>
            </div>
          </div>
          {/* Hero Stat Card (Deep Teal / Primary) */}
          <div className="bg-primary rounded-[24px] p-6 shadow-elevated relative overflow-hidden flex flex-col gap-2">
            {/* Decorative background element */}
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-secondary opacity-10 rounded-full blur-xl"></div>
            <div className="flex items-center gap-2 text-primary-fixed-dim relative z-10">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>recycling</span>
              <span className="font-micro-label text-micro-label uppercase tracking-widest">Total Waste Diverted</span>
            </div>
            <div className="flex items-end gap-3 relative z-10">
              <span className="font-headline-lg text-[48px] leading-[48px] font-extrabold text-white tracking-tighter">1,240</span>
              <span className="font-body-md text-body-md text-primary-fixed pb-1 font-medium">kg</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 bg-tertiary-container/40 rounded-full px-3 py-1.5 self-start border border-tertiary-container relative z-10">
              <span className="material-symbols-outlined text-secondary-fixed text-[16px]">trending_up</span>
              <span className="font-caption text-caption text-secondary-fixed font-medium">+12% vs last month</span>
            </div>
          </div>
          {/* 2x2 Stats Grid */}
          <div className="grid grid-cols-2 gap-md">
            {/* Stat 1 */}
            <div className="bg-surface rounded-xl p-4 border border-warm-taupe/30 shadow-soft flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined text-[18px]">report</span>
              </div>
              <div>
                <div className="font-headline-md text-headline-md text-primary font-bold">42</div>
                <div className="font-caption text-caption text-on-surface-variant mt-0.5">Issues Reported</div>
              </div>
            </div>
            {/* Stat 2 */}
            <div className="bg-surface rounded-xl p-4 border border-warm-taupe/30 shadow-soft flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
              </div>
              <div>
                <div className="font-headline-md text-headline-md text-primary font-bold">38</div>
                <div className="font-caption text-caption text-on-surface-variant mt-0.5">Issues Resolved</div>
              </div>
            </div>
            {/* Stat 3 */}
            <div className="bg-surface rounded-xl p-4 border border-warm-taupe/30 shadow-soft flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center text-[#B37415]">
                <span className="material-symbols-outlined text-[18px]">star</span>
              </div>
              <div>
                <div className="font-headline-md text-headline-md text-primary font-bold">850</div>
                <div className="font-caption text-caption text-on-surface-variant mt-0.5">Civic Points</div>
              </div>
            </div>
            {/* Stat 4 */}
            <div className="bg-surface rounded-xl p-4 border border-warm-taupe/30 shadow-soft flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
              </div>
              <div>
                <div className="font-headline-md text-headline-md text-primary font-bold">14<span className="text-title-sm font-title-sm">d</span></div>
                <div className="font-caption text-caption text-on-surface-variant mt-0.5">Active Streak</div>
              </div>
            </div>
          </div>
          {/* Horizontal Bar Chart: Waste Types */}
          <div className="bg-surface rounded-[20px] p-5 border border-warm-taupe/30 shadow-soft flex flex-col gap-4">
            <h3 className="font-title-sm text-title-sm text-primary">Waste Breakdown</h3>
            <div className="flex flex-col gap-4 mt-2">
              {/* Bar 1 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="font-body-md text-body-md font-medium text-on-surface">Recyclables</span>
                  <span className="font-caption text-caption text-on-surface-variant">540 kg (43%)</span>
                </div>
                <div className="bar-chart-track">
                  <div className="bar-chart-fill w-[43%] bg-secondary"></div>
                </div>
              </div>
              {/* Bar 2 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="font-body-md text-body-md font-medium text-on-surface">Organic</span>
                  <span className="font-caption text-caption text-on-surface-variant">420 kg (34%)</span>
                </div>
                <div className="bar-chart-track">
                  <div className="bar-chart-fill w-[34%] bg-[#7D9F59]"></div>
                </div>
              </div>
              {/* Bar 3 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="font-body-md text-body-md font-medium text-on-surface">General Waste</span>
                  <span className="font-caption text-caption text-on-surface-variant">180 kg (15%)</span>
                </div>
                <div className="bar-chart-track">
                  <div className="bar-chart-fill w-[15%] bg-outline"></div>
                </div>
              </div>
              {/* Bar 4 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="font-body-md text-body-md font-medium text-on-surface">E-Waste</span>
                  <span className="font-caption text-caption text-on-surface-variant">100 kg (8%)</span>
                </div>
                <div className="bar-chart-track">
                  <div className="bar-chart-fill w-[8%] bg-amber"></div>
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

export default Statistics;
