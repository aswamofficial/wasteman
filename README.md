# Wasteman

Cross-platform (web + Android + iOS) app scaffolded on the same stack as CleanWashroom.

| Layer | Technology |
| --- | --- |
| Backend | Laravel 12 (PHP 8.2 via XAMPP2), Sanctum 4 (token auth), Spatie laravel-permission 6 (roles) |
| Frontend | Ionic React 8 + Capacitor 8, Vite 5, TypeScript 5.9, Tailwind CSS 3 |
| Database | MariaDB 10.4 (XAMPP2) on **port 3307**, database `wastenotify` |
| HTTP client | axios, bearer token stored via `@capacitor/preferences` |

## Layout

```
wastenotify/
├── wastenotify-api/     Laravel 12 API
├── wastenotify-app/     Ionic React + Capacitor client
├── start-wastenotify.bat
└── README.md
```

## Ports

| Service | Port |
| --- | --- |
| Vite dev server | 5299 (CleanWashroom uses 5199) |
| MariaDB | 3307 |
| Apache (API) | 80 |

## Running it

```bash
C:\xampp2\htdocs\wastenotify\start-wastenotify.bat
```

That starts MariaDB on 3307, prompts for Apache via the XAMPP Control Panel if it
isn't running, starts the Vite dev server on 5299, and opens the browser.

Manually:

```bash
cd C:\xampp2\htdocs\wastenotify\wastenotify-app && npm run dev -- --port 5299
```

- App: <http://localhost:5299/home>
- API: <http://localhost/wastenotify/wastenotify-api/public/api>
- Health check: <http://localhost/wastenotify/wastenotify-api/public/api/health>

The home page calls `/api/health` on load, so it doubles as an end-to-end check
of Vite → axios → Apache → Laravel → MariaDB.

## Environment notes

- **MariaDB is on 3307, not 3306.** A standalone MySQL80 Windows service holds
  3306 on this machine. `wastenotify-api/.env` already points at 3307.
- PHP CLI: `C:\xampp2\php\php.exe`; Composer: `C:\xampp2\php\composer.bat`.
  Add `C:\xampp2\php` to `PATH` or composer scripts fail silently.
- Capacitor 8 needs **JDK 21** for Android builds
  (`C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot`). JDK 17 fails with
  "invalid source release: 21".
- Android SDK: `C:\Users\Lenovo\AppData\Local\Android\Sdk`.

## Android build

```bash
cd C:\xampp2\htdocs\wastenotify\wastenotify-app && npm run build && npx cap sync android
```

```bash
cd C:\xampp2\htdocs\wastenotify\wastenotify-app\android && ./gradlew.bat assembleDebug
```

APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Screens

19 screens designed in Google Stitch are ported into the app as Ionic React
pages under `wastenotify-app/src/pages/generated/`. Walk all of them from the
index at <http://localhost:5299/screens>.

These are **auto-generated** — don't hand-edit them. To re-import after a new
Stitch export, drop the export folders in and re-run:

```bash
python C:\xampp2\htdocs\wastenotify\wastenotify-app\scripts\convert_stitch.py
```

The converter turns each `code.html` into JSX, lifts the repeated bottom nav out
into `src/components/BottomNav.tsx`, and collects screen-specific CSS into
`src/styles/stitch-screens.css`. Design tokens from the Stitch design system
(`docs/design-system/DESIGN.md`) live in `tailwind.config.js`; reference
renders are in `docs/stitch-screens/`.

Fonts (Plus Jakarta Sans, Inter, Material Symbols) are installed as npm
packages — the app pulls nothing from a CDN at runtime.

## Auth

Token auth via Sanctum. Phone **and** email are both required at signup, and
new accounts get the `citizen` role automatically.

| Method | Endpoint | Notes |
| --- | --- | --- |
| POST | `/api/auth/register` | name, email, phone, password (+confirmation) |
| POST | `/api/auth/login` | returns a bearer token |
| GET | `/api/auth/me` | current user, requires the token |
| POST | `/api/auth/logout` | revokes only the calling token |
| GET | `/api/dashboard` | personal stats, ward totals, recent reports, pins |
| GET | `/api/reports/map` | map pins + filter counts + waste types |
| GET | `/api/reports/{id}` | single report |

`/api/reports/map` accepts `status` (comma-separated), `type`, `mine=1`, and
`lat`/`lng`/`radius_km`. With an origin it sorts by a SQL haversine distance and
returns `distance_km` on each report.

Login is rate-limited on email+IP *and* IP alone, so one attacker can't lock a
victim out from another address. Register uses a looser per-IP limit.

On the client, `AuthProvider` stores the token in Capacitor Preferences and
verifies it against `/auth/me` on boot rather than trusting its presence.
`ProtectedRoute` guards signed-in routes and takes `adminOnly` for the admin
section.

**Seeded accounts** (password `password` for both):

- `demo@wastenotify.com` — citizen, has 6 sample reports
- `admin@wastenotify.com` — admin, lands on `/admin`

Reseed with:

```bash
C:\xampp2\php\php.exe artisan migrate:fresh --seed
```

## Maps

The Map tab (`/map`) uses the **Google Maps JavaScript API** via
`@googlemaps/js-api-loader` (v2 functional API — `setOptions()` /
`importLibrary()`, not the deprecated `Loader` class).

Set the key in `wastenotify-app/.env`:

```bash
VITE_GOOGLE_MAPS_API_KEY=your-key-here
```

**The key currently in `.env` belongs to the CleanWashroom Google Cloud
project on this machine** — usage bills there. Swap in a Wasteman key.
Only the *Maps JavaScript API* needs enabling; there's no Places or Geocoding
dependency. Without a key the screen renders a clear "add your key" state
rather than a blank page.

Deliberately a **raster** map, not vector: vector rendering needs a `mapId`,
and a `mapId` disables the inline `styles`, moving the palette into the Cloud
console. Raster keeps the basemap styling in `src/lib/googleMaps.ts`.

Pins are teardrop SVG data URIs coloured by status (amber / blue / green),
clustered with `@googlemaps/markerclusterer`, and the selected pin renders
larger with a halo.

`components/MapSnippet.tsx` is the small, inert version used inside cards —
Home (nearby pins), report detail (Open in Maps) and admin report detail
(Directions). Gestures are off and the canvas is `pointer-events-none`, so the
snippet never steals a tap from the card wrapping it, and it degrades to a
labelled "Map unavailable" tile rather than a blank grey box.

## Report module

The full lifecycle: citizen submits → AI classifies → admin assigns and
resolves with an after-photo → citizen is notified.

| Method | Endpoint | Notes |
| --- | --- | --- |
| POST | `/api/reports/analyse` | upload a photo, get a classification; **no report created yet** |
| POST | `/api/reports` | create the report from the analysed photo + location + details |
| GET | `/api/reports` | the citizen's own reports + status tab counts |
| GET | `/api/reports/{id}` | report + timeline |
| POST | `/api/reports/{id}/rate` | 1–5 stars once resolved |
| GET | `/api/notifications` | in-app notifications + unread count |
| GET | `/api/admin/reports` | ward queue, KPIs, overdue count (admin only) |
| POST | `/api/admin/reports/{id}` | assign / re-prioritise / change status / upload the after-photo |

**AI classification.** `App\Services\Ai\WasteClassifier` has two
implementations. With `ANTHROPIC_API_KEY` set, `ClaudeWasteClassifier` sends the
photo to `claude-opus-5` using **structured outputs**, so the model must return
the exact schema in `WasteAssessment` (type, confidence, severity, weight,
detected items, is-it-actually-waste). Without a key it falls back to
`StubWasteClassifier`, which is deterministic (seeded from the file's own hash)
so the same photo always classifies the same way. A live call that fails —
outage, rate limit, malformed response — also degrades to the stub rather than
failing the submission: losing a classification is recoverable, losing the
citizen's report is not.

```bash
php artisan tinker --execute="echo config('services.anthropic.key') ? 'live' : 'stub';"
```

**Lifecycle rules** live in `App\Services\ReportWorkflow` — the single place
that changes status, writes the timeline event and creates the notification.
Two invariants it enforces:

- Illegal transitions are refused (you can't resolve a rejected report).
- **A report cannot be marked resolved without an after-photo.** That photo is
  what the citizen is sent; a resolve without one would be an empty promise.

## Activity & profile

**Activity** is one section with two views, joined by a segmented control:
`/reports` (the report list with status tabs) and `/statistics` (impact).

`GET /api/stats?scope=me|ward|city` returns the headline cleared-kg with a
30-day-over-30-day trend, four summary stats, a waste-type breakdown, a
six-month series and achievement badges. Two things it does deliberately:

- Rejected reports are excluded everywhere — they were judged not to be waste,
  so counting them would inflate "reported" with things no crew acted on.
- The six-month series is built from a pre-seeded month map, so a month with no
  reports renders as a real zero instead of being skipped, which would make the
  line chart misrepresent the gaps.

Badges are always personal even when the chart is scoped to the ward or city —
an achievement that changed when you toggled scope would be meaningless.

**Profile** (`/profile`) covers view, inline edit, avatar upload and password
change:

| Method | Endpoint |
| --- | --- |
| GET | `/api/profile` |
| POST | `/api/profile` |
| POST | `/api/profile/avatar` |
| POST | `/api/profile/password` |

Changing an email or phone **clears that field's verified badge** — an
unverified new address must not inherit the old one's trust. Changing a
password revokes every other token but the current one, since the usual reason
to change it is believing it was compromised.

## Not yet done

- **Live:** login, signup, dashboard, map, the report flow, my reports, report
  detail, notifications, impact, profile, admin queue and admin report detail.
  Only onboarding and the admin ward map are still static design imports — see
  the `Live` badges at `/screens`.
- **Email/phone verification is not implemented.** The badges reflect a
  `*_verified_at` column that only the seeder sets; there's no OTP or
  confirmation-link flow yet (Stitch screen 04 is still missing).
- **No Anthropic key is set**, so classification currently runs the stub. Add
  `ANTHROPIC_API_KEY` to `wastenotify-api/.env` for real vision.
- Reverse geocoding on the location step needs the Geocoding API enabled on the
  Maps key; without it the address field falls back to raw coordinates.
- **Two screens still missing from the export**: 04 OTP, 18 edit profile.
  (03 sign up was hand-built to match the design system.)
- **Google sign-in is not implemented** — the button is visibly disabled rather
  than pretending to work.
- **No logout button in the UI yet** — the profile screen isn't wired.
- **Two Stitch demo scripts were dropped** in conversion and need re-implementing
  in React: the onboarding slider (`/onboarding` shows slide 1; Next does
  nothing) and a button handler on `/report/submitted`.
- Report photos are seeded as remote URLs; there's no upload flow yet.
- iOS platform not added (no Mac in this environment).
