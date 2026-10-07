// AUTO-GENERATED from the Stitch export `17_profile`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';
import BottomNav from '../../components/BottomNav';

const Profile: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md pb-24">
        {/* TopAppBar */}
        <header className="bg-background dark:bg-inverse-surface rounded-br-3xl w-full top-0 sticky shadow-sm dark:shadow-none flex justify-between items-center px-margin py-md z-40">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-warm-taupe">
              <img alt="User profile photo" className="w-full h-full object-cover" data-alt="A close up professional headshot of an indian man in his 30s. He is wearing a simple casual shirt. Warm lighting, approachable expression. The background is slightly blurred indicating a modern office setting. Shot on high-end camera." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsag7CNAHLjyrp2nSNIWg1bXLTgxzuk2mEsodJGPx1PLtwn5omt_gpyZyIzj0EatVI69rl6Xo4Z-zYL4GCuy_Qels6Lf2GRpqOa9Val_VbbRcgemon7VLSYZebM5KkI9-yTLmgkeM0ZWfEzsmfcDBNqVxj8qjxKeSgz7GmYR10mQglf-qYQXgjlUKLmzS1xgPMZ4CU6xCYXTv6-F8m6sWU8VxzFxztFqsoffStyOEaU9WpZAdy2SgA3g" />
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">Wasteman</h1>
          </div>
          <button className="hover:bg-surface-container transition-colors active:scale-95 duration-150 p-2 rounded-full text-primary dark:text-primary-fixed">
            <span className="material-symbols-outlined" data-icon="location_on">location_on</span>
          </button>
        </header>
        {/* Main Content Canvas */}
        <main className="flex-1 px-margin pt-xl">
          {/* Profile Header Section */}
          <section className="flex flex-col items-center mb-xl">
            <div className="relative mb-md">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-high shadow-sm">
                <img alt="Ravi Kumar" className="w-full h-full object-cover" data-alt="A close up professional headshot of an indian man in his 30s. He is wearing a simple casual shirt. Warm lighting, approachable expression. The background is slightly blurred indicating a modern office setting. Shot on high-end camera." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-JWBrrcjJd-g3pzySAvlMnq_NztvWz04OKq-wanqcQQpH_7OHj8Muwawuu9MzluwTlQmf59ntiPCq45n412ZuvrwV1lskYjp8iE_vo4fESH7b67_sKXyHC032n_bgG80lwfMXYWLkAgMcd_xR8LDhPqr6DTsz9v0uCfTQCqbabBS6PEcM1tgMZxS3d6egeL1ljj9v7bmsWQEQTKN3UBaYLqQUOpAIxA8nU5IarRAYJa5rhjkBwQh7bA" />
              </div>
              <div className="absolute bottom-0 right-0 bg-secondary text-on-secondary rounded-full p-1 border-2 border-background shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            </div>
            <h2 className="font-title-sm text-title-sm text-primary mb-1">Ravi Kumar</h2>
            <div className="flex items-center gap-1 text-secondary-text bg-surface-container rounded-full px-3 py-1">
              <span className="material-symbols-outlined text-[16px]" data-icon="shield" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span className="font-caption text-caption">Verified citizen</span>
            </div>
          </section>
          {/* Stats Bento Grid */}
          <section className="grid grid-cols-3 gap-md mb-xl">
            <div className="bg-surface-container-low border border-warm-taupe rounded-[20px] p-md flex flex-col items-center justify-center shadow-sm">
              <span className="font-headline-md text-headline-md text-primary font-bold">42</span>
              <span className="font-caption text-caption text-on-surface-variant mt-1">Reports</span>
            </div>
            <div className="bg-surface-container-low border border-warm-taupe rounded-[20px] p-md flex flex-col items-center justify-center shadow-sm">
              <span className="font-headline-md text-headline-md text-secondary font-bold">38</span>
              <span className="font-caption text-caption text-on-surface-variant mt-1">Resolved</span>
            </div>
            <div className="bg-surface-container-low border border-warm-taupe rounded-[20px] p-md flex flex-col items-center justify-center shadow-sm">
              <span className="font-headline-md text-headline-md text-tertiary-container font-bold">W4</span>
              <span className="font-caption text-caption text-on-surface-variant mt-1">Ward</span>
            </div>
          </section>
          {/* Contact Info Card */}
          <section className="mb-xl">
            <h3 className="font-micro-label text-micro-label text-on-surface-variant uppercase mb-sm pl-2">Contact Information</h3>
            <div className="bg-surface-container-lowest border border-warm-taupe rounded-[20px] overflow-hidden shadow-sm shadow-primary/5">
              <div className="flex items-center gap-md p-md border-b border-warm-taupe">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" data-icon="mail">mail</span>
                </div>
                <div className="flex-1">
                  <p className="font-body-md text-body-md text-on-surface">ravi.kumar@example.com</p>
                  <p className="font-caption text-caption text-secondary flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Verified
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-md p-md">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" data-icon="call">call</span>
                </div>
                <div className="flex-1">
                  <p className="font-body-md text-body-md text-on-surface">+91 98765 43210</p>
                  <p className="font-caption text-caption text-secondary flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Verified
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* Settings List */}
          <section className="mb-xl">
            <h3 className="font-micro-label text-micro-label text-on-surface-variant uppercase mb-sm pl-2">Account Settings</h3>
            <div className="bg-surface-container-lowest border border-warm-taupe rounded-[20px] overflow-hidden shadow-sm shadow-primary/5">
              <button className="w-full flex items-center justify-between p-md border-b border-warm-taupe hover:bg-surface-container transition-colors active:scale-[0.98] duration-150">
                <div className="flex items-center gap-md">
                  <div className="text-primary-container">
                    <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">Notifications</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant" data-icon="chevron_right">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-md border-b border-warm-taupe hover:bg-surface-container transition-colors active:scale-[0.98] duration-150">
                <div className="flex items-center gap-md">
                  <div className="text-primary-container">
                    <span className="material-symbols-outlined" data-icon="lock">lock</span>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">Privacy &amp; Security</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant" data-icon="chevron_right">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between p-md hover:bg-surface-container transition-colors active:scale-[0.98] duration-150">
                <div className="flex items-center gap-md">
                  <div className="text-error">
                    <span className="material-symbols-outlined" data-icon="logout">logout</span>
                  </div>
                  <span className="font-body-md text-body-md text-error">Log Out</span>
                </div>
              </button>
            </div>
          </section>
        </main>
        {/* BottomNavBar */}
      </div>
    </IonContent>
      <BottomNav active="profile" />
  </IonPage>
);

export default Profile;
