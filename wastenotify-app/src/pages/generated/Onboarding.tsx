// AUTO-GENERATED from the Stitch export `01_splash_onboarding`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
import { IonContent, IonPage } from '@ionic/react';

const Onboarding: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="bg-background text-on-background h-screen w-full overflow-hidden flex flex-col font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container">
        {/* Splash Screen */}
        <div className="fixed inset-0 z-50 bg-primary-container flex flex-col items-center justify-center splash-anim-out" id="splashScreen">
          <div className="relative flex flex-col items-center">
            {/* Icon */}
            <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center shadow-lg mb-6">
              <span className="material-symbols-outlined text-primary-container text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            {/* Typography Anchor */}
            <h1 className="font-headline-lg text-headline-lg text-on-primary font-extrabold tracking-tight">Wasteman</h1>
          </div>
        </div>
        {/* Onboarding Container */}
        <div className="flex-1 relative w-full h-full max-w-md mx-auto bg-surface overflow-hidden shadow-2xl md:rounded-3xl md:h-[850px] md:mt-10">
          {/* Slider Track */}
          <div className="w-full h-full relative" id="sliderTrack">
            {/* Slide 1 */}
            <div className="slide-visible w-full h-full flex flex-col pt-16 px-margin pb-xl" data-index="0">
              <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Blob background */}
                <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-40">
                  <svg className="w-72 h-72 fill-primary-fixed" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,87.6,-1.4C85.2,13.5,77.7,27.1,68.6,38.7C59.5,50.3,48.7,60,35.6,67.3C22.5,74.6,7.1,79.5,-7.9,78.8C-22.9,78.1,-37.6,71.8,-49.4,62.2C-61.2,52.6,-70.2,39.6,-76.5,25.4C-82.8,11.2,-86.4,-4.3,-82.9,-18.2C-79.4,-32.1,-68.8,-44.4,-55.9,-52.3C-43,-60.2,-27.9,-63.7,-13.7,-67.2C0.5,-70.7,14.7,-74.2,30.7,-83.6L44.7,-76.4Z" transform="translate(100 100)"></path>
                  </svg>
                </div>
                {/* Illustration */}
                <div className="w-64 h-64 mb-10 relative">
                  <img className="object-contain w-full h-full" data-alt="A clean, modern flat illustration showing a person holding a smartphone and taking a picture of a messy pile of garbage on a sidewalk. The color palette uses warm ivory backgrounds, bright turquoise accents, and deep teal lines. The style is safe, corporate, civic-minded, and optimistic, emphasizing community resolution and modern technological innovation." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkVRjGoWMTC0xaU_mukKpb-mEiLhIGLLMuaiVNvFzD01snGA0Z3hsUiNPndith9ygBdP5dvzA7DxqvL4AiM9hbBb4jbVJOCLm6QK5rrrBQwLWKX9HqSkuyVv9Otcx6yJ0EisnQd8I4iRUazsL4L5x_f42s0rJ7-kVLGiyoBSbIsVv-gWGLcufQYDAshDE3HABf64Yg9c4bA1idFU2I1LPQvp2J4rJjBgmovkyTdXSuebeo9qG0BJT_Zg" />
                </div>
                {/* Content */}
                <div className="text-center w-full">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Spot it, snap it</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-[280px] mx-auto">See an issue in your neighborhood? Just take a quick photo. It's the first step to keeping our community clean.</p>
                </div>
              </div>
            </div>
            {/* Slide 2 */}
            <div className="slide-hidden w-full h-full flex flex-col pt-16 px-margin pb-xl" data-index="1">
              <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Blob background */}
                <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-40">
                  <svg className="w-72 h-72 fill-primary-fixed" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path d="M47.7,-66.3C58.8,-53.4,63,-34.5,67.6,-16.1C72.2,2.3,77.2,20.1,69.5,33.5C61.8,46.9,41.4,55.9,23.3,62.1C5.2,68.3,-10.5,71.6,-25.1,68.1C-39.7,64.6,-53.2,54.3,-62.8,40.6C-72.4,26.9,-78.1,9.8,-75,-5.8C-71.9,-21.4,-60,-35.5,-46.8,-48.1C-33.6,-60.7,-19.1,-71.8,-1.7,-69.6C15.7,-67.4,36.6,-79.2,47.7,-66.3Z" transform="translate(100 100)"></path>
                  </svg>
                </div>
                {/* Illustration */}
                <div className="w-64 h-64 mb-10 relative">
                  <img className="object-contain w-full h-full" data-alt="A clean, modern flat illustration showing a glowing smartphone screen where artificial intelligence is sorting a reported issue into a categorized digital folder. The UI elements in the illustration are abstract, neat, and structured. The color palette features deep teal (#003a3e) and bright turquoise against a warm ivory background. The mood is efficient, organized, and reliable." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFq5ouBlrijlf_37jd8FECLHz44aje6qAqVv1v4zma4mubVWMnc9CIFWADMXsYuFMSj1kouWLXP18jVVklvMNMrLNu6BVu7akLUbpFjoZ9nNQO3FeOQsgfe3ZI0L9ioPS4ooX4EU6yhu_p-pNwLE2Z7LWZGNM4QH1rfdYmJxaTYD7bWnvZOZ6blz3mgScyV-7zE5SbMwleqPDVNz1I0y4GdHfIT0F2GVNHr0zP6gD_5AF7O1I5HigoFA" />
                </div>
                {/* Content */}
                <div className="text-center w-full">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">AI sorts it out</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-[280px] mx-auto">Our smart system automatically categorizes your report and routes it to the right department instantly.</p>
                </div>
              </div>
            </div>
            {/* Slide 3 */}
            <div className="slide-hidden w-full h-full flex flex-col pt-16 px-margin pb-xl" data-index="2">
              <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Blob background */}
                <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-40">
                  <svg className="w-72 h-72 fill-primary-fixed" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path d="M54.1,-63.9C68.9,-54.1,78.8,-36.5,82,-18.2C85.2,0.1,81.7,19.1,71.2,34.4C60.7,49.7,43.2,61.3,24.1,67.6C5,73.9,-15.7,74.9,-32.8,68.4C-49.9,61.9,-63.4,47.9,-70.7,31.7C-78,15.5,-79.1,-2.9,-73.4,-19.1C-67.7,-35.3,-55.2,-49.3,-40.4,-59.1C-25.6,-68.9,-8.5,-74.5,6.5,-82.2C21.5,-89.9,39.3,-73.7,54.1,-63.9Z" transform="translate(100 100)"></path>
                  </svg>
                </div>
                {/* Illustration */}
                <div className="w-64 h-64 mb-10 relative">
                  <img className="object-contain w-full h-full" data-alt="A clean, modern flat illustration showing a municipal worker fixing a street issue while a citizen looks on happily holding their phone. A large green checkmark floats above them. The setting is bright and sunny. The color palette relies on warm ivory, deep teal lines, and vibrant turquoise highlights. The mood conveys trust, resolution, and successful civic engagement." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS0TaavwaQXJJdrBbgL4-qtlvSRfJjg3x8TNzuPTGF3SXNP0833DtQSbFTzRzNWazZEkmIT2wJU9uxyd1hnfZbp3brV8xx_0uc6Arpg83pQFAXOIOFY1_YlCtuYulQdMamJK7_71pxO14j0QWUx3nFQPviDLYFtIoLvVbiwooPmH6i5HsLR-scz4wLZyDVIRQLm-vG2jP23OHvQpo2Sgn5te9msgpixWJwVRFl6TF1pqRdhwBI-VaGpA" />
                </div>
                {/* Content */}
                <div className="text-center w-full">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Watch it get fixed</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-[280px] mx-auto">Track the status of your reports in real-time. We'll notify you the moment the issue is resolved.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Navigation Controls (Bottom Fixed) */}
          <div className="absolute bottom-0 left-0 w-full px-margin pb-10 pt-4 bg-gradient-to-t from-surface via-surface to-transparent">
            <div className="flex items-center justify-between">
              {/* Page Indicators */}
              <div className="flex gap-2" id="indicators">
                <div className="w-8 h-2 rounded-full bg-secondary transition-all duration-300"></div>
                <div className="w-2 h-2 rounded-full bg-surface-variant transition-all duration-300"></div>
                <div className="w-2 h-2 rounded-full bg-surface-variant transition-all duration-300"></div>
              </div>
              {/* Next Button */}
              <button className="bg-secondary text-on-secondary px-8 py-3 rounded-full font-title-sm text-title-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all" id="nextBtn">
                Next
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default Onboarding;
