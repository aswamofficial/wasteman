/*
 * Render the source images @capacitor/assets expands into every launcher icon
 * and splash density.
 *
 * Built from the app's own public/icon.svg through headless Chrome rather than
 * an image library, so the launcher icon and the mark inside the app cannot
 * drift apart, and so nothing has to be installed to regenerate them.
 *
 *   node assets/make-assets.cjs && npx @capacitor/assets generate --android
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/xampp2/htdocs/agency-erp-wa/node_modules/puppeteer');

const ROOT = path.resolve(__dirname, '..');
const OUT = __dirname;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const GRADIENT = 'linear-gradient(135deg, #0B57D0 0%, #1A73E8 52%, #34A853 100%)';
const svg = fs.readFileSync(path.join(ROOT, 'public/icon.svg'), 'utf8');

/** The figure alone, no plate — the plate becomes the adaptive background. */
const figureOnly = svg
  .replace('<rect width="512" height="512" rx="114" fill="url(#wm-grad)"/>', '')
  .replace('<svg', '<svg width="100%" height="100%"');

const page = (w, h, inner) => `<!doctype html><html><body style="margin:0">
  <div style="position:relative;width:${w}px;height:${h}px;overflow:hidden">${inner}</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars'],
  });

  const shoot = async (name, w, h, inner, transparent = false) => {
    const p = await browser.newPage();
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await p.setContent(page(w, h, inner), { waitUntil: 'networkidle0' });
    // The adaptive foreground MUST keep its alpha: it is composited over the
    // background layer, and a baked-in white page would hide the gradient
    // completely and ship a white square as the icon.
    await p.screenshot({ path: path.join(OUT, name), omitBackground: transparent });
    await p.close();
    console.log(`  ${name}  ${w}x${h}${transparent ? '  (alpha)' : ''}`);
  };

  // Legacy square icon: the mark as shipped, filling the canvas.
  await shoot('icon.png', 1024, 1024,
    `<div style="position:absolute;inset:0">${svg.replace('<svg', '<svg width="1024" height="1024"')}</div>`);

  /*
   * Adaptive icon, Android 8+. The launcher crops this to whatever shape the
   * device uses — circle, squircle, teardrop — and only the middle ~66% is
   * guaranteed visible, so the figure is inset to 60% and centred. Drawn at
   * full bleed it would lose its head to a circular mask.
   */
  await shoot('icon-foreground.png', 1024, 1024,
    `<div style="position:absolute;inset:20%">${figureOnly}</div>`, true);

  await shoot('icon-background.png', 1024, 1024,
    `<div style="position:absolute;inset:0;background:${GRADIENT}"></div>`);

  /*
   * Splash. Square and oversized because it is centre-cropped to every aspect
   * ratio from a tall phone to a landscape tablet; the mark sits in the middle
   * third so no crop can clip it.
   */
  const splash = (bg) => `
    <div style="position:absolute;inset:0;background:${bg};display:flex;
         align-items:center;justify-content:center">
      <div style="width:22%;aspect-ratio:1">${svg.replace('<svg', '<svg width="100%" height="100%"')}</div>
    </div>`;

  await shoot('splash.png', 2732, 2732, splash(GRADIENT));
  // Dark-mode variant: same mark, deeper ground, so the launch does not flash
  // white on a phone in dark theme.
  await shoot('splash-dark.png', 2732, 2732, splash('#071B3A'));

  await browser.close();
  console.log('\nNow run:  npx @capacitor/assets generate --android');
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
