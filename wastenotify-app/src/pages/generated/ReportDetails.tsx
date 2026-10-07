// AUTO-GENERATED from the Stitch export `09_details_submit`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const ReportDetails: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
        {/* Top Navigation Area */}
        <header className="bg-background dark:bg-inverse-surface rounded-br-3xl w-full top-0 sticky shadow-sm dark:shadow-none z-40">
          <div className="flex justify-between items-center px-margin py-md w-full">
            <button className="text-on-surface-variant p-2 active:scale-95 duration-150 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl" data-icon="arrow_back">arrow_back</span>
            </button>
            <div className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
              Review Report
            </div>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>
          {/* Progress Bar */}
          <div className="w-full px-margin pb-4">
            <div className="flex justify-between text-caption font-caption text-secondary-text mb-2">
              <span>Step 4 of 4</span>
              <span>Final Review</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-full" style={{ width: "100%" }}></div>
            </div>
          </div>
        </header>
        {/* Main Content Canvas */}
        <main className="flex-1 px-margin py-xl flex flex-col gap-xl max-w-2xl mx-auto w-full pb-32">
          {/* Summary Card */}
          <section className="bg-surface-container-lowest rounded-[20px] shadow-[0_4px_20px_rgba(0,106,104,0.06)] overflow-hidden">
            <div className="flex flex-row">
              {/* Thumbnail */}
              <div className="w-1/3 aspect-square relative">
                <img className="w-full h-full object-cover" data-alt="A close-up photograph of assorted plastic waste piled on a city sidewalk next to a storm drain. The lighting is overcast daylight, emphasizing the realistic textures of the materials. The overall composition feels documentary and civic-minded within a warm ivory color palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUULeHWHS6EomFQO5IAqxaid4F-sRAUJNPHrcnuSdPtfmpdmbIBskRwCSCFGL6l8Gt86MtE4IG6C17aOPGCQ-jI3aHhI99pu7RLtfyr-Udn44wuX9Zz9AdN7zzLSDGqu3Odo8AGnE59wqlsrCpQwZpLP5-rfNm4VXkyUTIsjzGR_eXXJ3nJaV2ixx7vLy5VXPKAJxBdIW6hhhDBXesSUGrKDgo1pmN5o9XTT5Of_aYXKqvxeztLmRHhQ" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <button className="absolute bottom-2 right-2 text-white bg-black/40 p-1.5 rounded-full backdrop-blur-sm">
                  <span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
                </button>
              </div>
              {/* Details */}
              <div className="w-2/3 p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-lg" data-icon="category">category</span>
                  <span className="font-micro-label text-micro-label text-primary uppercase tracking-wider">AI Detected</span>
                </div>
                <h3 className="font-title-sm text-title-sm text-on-surface mb-2">Plastic &amp; Packaging</h3>
                <div className="flex items-start gap-2 text-on-surface-variant font-caption text-caption">
                  <span className="material-symbols-outlined text-base mt-0.5" data-icon="location_on">location_on</span>
                  <p>124 Civic Center Drive, Northwest Corner</p>
                </div>
              </div>
            </div>
          </section>
          {/* Dynamic Context Selection */}
          <section className="flex flex-col gap-md">
            <h4 className="font-title-sm text-title-sm text-on-surface mb-sm">Additional Details</h4>
            <div className="bg-surface-container-low p-4 rounded-[20px] border border-surface-variant">
              <p className="font-caption text-caption text-on-surface-variant mb-3">How long has this been here?</p>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-full border border-warm-taupe text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors">Just today</button>
                <button className="px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container border border-secondary-container font-body-md text-body-md shadow-sm">A few days</button>
                <button className="px-4 py-2 rounded-full border border-warm-taupe text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors">Over a week</button>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-[20px] border border-surface-variant">
              <p className="font-caption text-caption text-on-surface-variant mb-3">Is it blocking anything?</p>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-full border border-warm-taupe text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors">Sidewalk</button>
                <button className="px-4 py-2 rounded-full border border-warm-taupe text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors">Road</button>
                <button className="px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container border border-secondary-container font-body-md text-body-md shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" data-icon="check">check</span> Drain
                </button>
                <button className="px-4 py-2 rounded-full border border-warm-taupe text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors">None</button>
              </div>
            </div>
          </section>
          {/* Notes Input */}
          <section className="flex flex-col gap-xs">
            <label className="font-title-sm text-title-sm text-on-surface ml-1" htmlFor="notes">Additional Notes (Optional)</label>
            <textarea className="w-full rounded-[14px] border-warm-taupe bg-surface-container-lowest text-on-surface focus:border-secondary focus:ring-secondary placeholder:text-on-surface-variant/50 font-body-md text-body-md p-4 shadow-inner" id="notes" placeholder="Any extra details for the collection team..." rows={3}></textarea>
            <p className="font-caption text-caption text-on-surface-variant ml-2 mt-1">Avoid entering personal information.</p>
          </section>
          {/* Privacy Banner */}
          <div className="bg-primary-container/10 border border-primary-container/20 rounded-[14px] p-4 flex items-start gap-3 mt-4">
            <span className="material-symbols-outlined text-primary mt-0.5" data-icon="privacy_tip">privacy_tip</span>
            <div>
              <h5 className="font-body-md text-body-md font-bold text-primary mb-1">Privacy Protected</h5>
              <p className="font-caption text-caption text-on-surface-variant">Your personal details are hidden from public view. Only the municipal service team can contact you regarding this report.</p>
            </div>
          </div>
        </main>
        {/* Fixed Bottom Action Area */}
        <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-md border-t border-surface-variant p-margin pb-safe z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <button className="py-3 px-6 rounded-full border border-warm-taupe text-on-surface font-title-sm text-title-sm hover:bg-surface-container active:scale-95 transition-all">
              Cancel
            </button>
            <button className="flex-1 py-3 px-6 rounded-full bg-secondary text-on-secondary font-title-sm text-title-sm hover:bg-secondary/90 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,106,104,0.3)] flex justify-center items-center gap-2">
              <span className="material-symbols-outlined" data-icon="send">send</span>
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default ReportDetails;
