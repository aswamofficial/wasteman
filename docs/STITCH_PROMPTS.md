# Wasteman — Google Stitch Prompts

Stitch produces its best work one screen at a time. The workflow is:

1. Paste **Block 0 (Design System)** into Stitch first and let it establish the style.
2. Then paste **one screen block** per generation. Each screen block repeats the
   critical style constraints, so it also works standalone in a fresh chat.
3. When a screen is close, refine conversationally ("make the status chips
   larger", "use a bottom sheet instead of a dialog") rather than re-prompting.

Screens are ordered by value — 05, 06–10 and 11 are the heart of the product;
design those first.

---

## Block 0 — Design System

> Design a mobile app UI for **Wasteman**, a civic waste-reporting app. Citizens photograph illegally dumped waste anywhere they find it, tag it with GPS, and track it until a municipal team clears it. AI classifies the waste type from the photo and routes it to the right admin team.
>
> **Platform:** Android and iOS mobile, 390×844 portrait.
>
> **Visual style:** clean, trustworthy, civic-tech. Generous whitespace, soft rounded corners (20px cards, 14px inputs, full-pill buttons), soft diffused shadows, minimal hard borders. Friendly but serious — this is a public-service tool, not a game. Photography-forward: user photos are the hero content on most screens.
>
> **Colour palette — use exactly these hex values:**
> - Deep Teal `#0F5257` — primary brand, app bars, headings, primary text, dark filled surfaces
> - Turquoise `#5BC0BE` — primary action colour: buttons, active tabs, selected states, progress indicators
> - Pale Aqua `#BFEDEF` — light containers, chips, selected backgrounds, map marker halos
> - Warm Ivory `#FFF9F1` — page background, cards sitting on dark surfaces
> - Warm Taupe `#D6CCC2` — dividers, input borders, disabled states, secondary surfaces
> - Amber `#E8A33D` — reserved strictly for "pending / unresolved" status pins and badges
>
> **Text colours:** `#0F5257` primary, `#5A6B6C` secondary, `#FFF9F1` on dark teal.
>
> **Typography:** "Plus Jakarta Sans" for headings (600/700 weight), "Inter" for body and labels (400/500). Headline 28px/32, Title 20px, Body 15px, Caption 12px. Uppercase micro-labels at 11px with 0.08em letter-spacing.
>
> **Icons:** Material Symbols Rounded, outlined, 24px.
>
> **Navigation:** bottom navigation bar on Warm Ivory with 5 items — Home, Map, **Report**, Activity, Profile. "Report" is a raised 60px circular Turquoise FAB in the centre with a white camera icon, floating above the bar. Active tab icon and label in Deep Teal, inactive in `#5A6B6C`.
>
> **Status system — use consistently everywhere:**
> - `PENDING` — Amber `#E8A33D` pill, white text
> - `IN PROGRESS` — Turquoise `#5BC0BE` pill, Deep Teal text
> - `RESOLVED` — Deep Teal `#0F5257` pill, Warm Ivory text
>
> Acknowledge this design system, then wait for me to describe individual screens.

---

## 01 — Splash & Onboarding

> Design a **splash screen and 3 onboarding slides** for Wasteman, a civic waste-reporting mobile app. 390×844.
>
> **Splash:** full-bleed Deep Teal `#0F5257`. Centred logomark — a location pin whose inner shape is a leaf — in Turquoise `#5BC0BE`, with "Wasteman" beneath in Plus Jakarta Sans 700, Warm Ivory `#FFF9F1`. Small tagline below in Inter 400: "Report waste. Track the fix."
>
> **Onboarding slides:** Warm Ivory `#FFF9F1` background. Top 55% is a friendly flat illustration drawn in Deep Teal and Turquoise line-work on Pale Aqua `#BFEDEF` blob shapes. Below: headline in Plus Jakarta Sans 700 28px Deep Teal, one line of body copy in Inter 400 15px `#5A6B6C`. Three-dot progress indicator — inactive dots Warm Taupe `#D6CCC2`, active dot Turquoise, elongated. Full-width pill "Next" button in Turquoise with Deep Teal text. "Skip" text link top-right.
>
> Slide content:
> 1. **"Spot it, snap it"** — Photograph dumped waste anywhere you find it. It takes ten seconds.
> 2. **"AI sorts it out"** — Our AI identifies the waste type and flags it straight to the right municipal team.
> 3. **"Watch it get fixed"** — Get a photo notification the moment your report is cleared.
>
> Final slide's button reads "Get started".

---

## 02 — Login

> Design a **login screen** for Wasteman, a civic waste-reporting mobile app. 390×844.
>
> Warm Ivory `#FFF9F1` background. Top third is a Deep Teal `#0F5257` curved panel (large bottom-left corner radius, ~40px) containing the leaf-in-pin logomark in Turquoise `#5BC0BE` and "Welcome back" in Plus Jakarta Sans 700 Warm Ivory, with "Sign in to keep your neighbourhood clean" beneath in Inter 400.
>
> Form on the ivory area:
> - Email input — 14px radius, 1px Warm Taupe `#D6CCC2` border, mail icon leading, floating label "Email address"
> - Password input — same treatment, lock icon leading, eye toggle trailing
> - "Forgot password?" right-aligned text link in Turquoise
> - Full-width pill **"Sign in"** button, Turquoise `#5BC0BE` fill, Deep Teal text, Plus Jakarta Sans 600
> - Divider row: thin Warm Taupe lines either side of "or continue with" in 12px `#5A6B6C`
> - **"Continue with Google"** button — full-width pill, Warm Ivory fill, 1px Warm Taupe border, full-colour Google G logo leading, Deep Teal label
> - Bottom centred: "New here? **Create an account**" with the second half a Turquoise link
>
> Show the email field in a focused state with a Turquoise border.

---

## 03 — Sign Up

> Design a **sign-up screen** for Wasteman, a civic waste-reporting mobile app. 390×844, scrollable.
>
> Warm Ivory `#FFF9F1` background, Deep Teal `#0F5257` back arrow top-left. Headline "Create your account" in Plus Jakarta Sans 700 28px Deep Teal, subcopy "Phone and email are both required so we can send you updates when your reports are resolved." in Inter 400 15px `#5A6B6C`.
>
> Stacked inputs, all 14px radius with 1px Warm Taupe `#D6CCC2` borders and leading Material Symbols icons:
> - Full name
> - **Email address** — with a small Turquoise "Required" micro-label
> - **Phone number** — country-code selector chip (+91 with flag) fused to the left of the field, small Turquoise "Required" micro-label
> - Password — with a strength meter beneath: a 4-segment bar, filled segments Turquoise, empty segments Warm Taupe, caption "Strong password"
> - Confirm password
>
> Checkbox row with a Turquoise checked box: "I agree to the Terms of Service and Privacy Policy" (both links in Turquoise).
>
> Full-width pill **"Create account"** button in Turquoise with Deep Teal text. Below it, a "Sign up with Google" outlined pill button. Footer: "Already have an account? **Sign in**".

---

## 04 — Phone Verification (OTP)

> Design an **OTP verification screen** for Wasteman. 390×844.
>
> Warm Ivory `#FFF9F1` background, back arrow top-left. A centred 88px circle in Pale Aqua `#BFEDEF` containing a Deep Teal message/shield icon. Headline "Verify your number" in Plus Jakarta Sans 700 Deep Teal. Body: "We sent a 6-digit code to **+91 98765 43210**" with the number in 600 weight, and a small "Change number" Turquoise link.
>
> Six separate square OTP boxes, 52×56px, 14px radius, Warm Ivory fill with 1px Warm Taupe `#D6CCC2` border. The first four are filled with digits and have Turquoise `#5BC0BE` borders; the fifth shows an active cursor with a 2px Turquoise border; the sixth is empty.
>
> Beneath: "Resend code in **00:24**" in 13px `#5A6B6C` with the timer in Deep Teal. Full-width pill **"Verify"** button in Turquoise with Deep Teal text, shown slightly dimmed because the code is incomplete.

---

## 05 — Home / Dashboard

> Design the **home dashboard** for Wasteman, a civic waste-reporting mobile app. 390×844, scrollable.
>
> Warm Ivory `#FFF9F1` background.
>
> **Header:** Deep Teal `#0F5257` panel with a large 32px bottom-left radius. Inside: circular avatar left, "Good morning," in Inter 400 Pale Aqua and "Ravi Kumar" in Plus Jakarta Sans 700 Warm Ivory beneath, notification bell top-right with an Amber `#E8A33D` unread dot. Below that, a location row with a pin icon: "Gandhipuram, Coimbatore" in Pale Aqua `#BFEDEF`, with a small "Change" link.
>
> **Hero card**, overlapping the bottom of the teal panel: Warm Ivory card, 20px radius, soft shadow. Left side reads "See waste nearby? Report it in 10 seconds." in Plus Jakarta Sans 600 Deep Teal; right side a 56px circular Turquoise `#5BC0BE` button with a white camera icon.
>
> **Stats row:** three equal cards with Pale Aqua `#BFEDEF` fills, each with an icon, a big number in Plus Jakarta Sans 700 Deep Teal and an 11px uppercase label in `#5A6B6C` — "12 Reported", "9 Resolved", "340 kg Cleared".
>
> **Map preview card:** rounded 20px map snippet ~180px tall showing a few Amber `#E8A33D` pending pins and Deep Teal resolved pins, with a "View full map" pill overlaid bottom-right in Warm Ivory.
>
> **"Your recent reports"** section header with a "See all" Turquoise link, followed by two horizontal report cards. Each card: 72px rounded thumbnail photo of dumped waste on the left; on the right the AI-detected type in Plus Jakarta Sans 600 ("Mixed household waste"), a street address in 13px `#5A6B6C`, a relative timestamp, and a status pill — one Amber "PENDING", one Deep Teal "RESOLVED".
>
> **Bottom navigation:** Warm Ivory bar, 5 items (Home, Map, Report, Activity, Profile) with the centre "Report" as a raised 60px circular Turquoise FAB with a white camera icon. Home tab active in Deep Teal.

---

## 06 — Report Step 1: Capture Photo

> Design a **camera capture screen** for Wasteman's waste-reporting flow. 390×844.
>
> Full-bleed live camera viewfinder showing a pile of dumped waste on a roadside. A dark scrim gradient at the top and bottom for legibility.
>
> **Top bar:** a white X close icon left; centre shows a 4-step progress indicator as four short bars — the first filled Turquoise `#5BC0BE`, the rest translucent white; a flash toggle icon right.
>
> **Framing guide:** thin white rounded-corner brackets forming a centre frame, with a small Pale Aqua `#BFEDEF` hint pill beneath reading "Get the whole pile in frame".
>
> **GPS chip** floating at the top of the lower scrim: pill in translucent Deep Teal `#0F5257` with a white location icon and "GPS locked · ±4 m" in Inter 500 white.
>
> **Bottom controls:** a gallery thumbnail button left, a large 76px white shutter button with a Turquoise ring in the centre, and a camera-flip icon right. Caption beneath in white 13px: "Step 1 of 4 — Photo".

---

## 07 — Report Step 2: AI Analysis Result

> Design an **AI analysis result screen** for Wasteman's reporting flow. 390×844.
>
> Warm Ivory `#FFF9F1` background. Top bar: back arrow, title "AI analysis" in Plus Jakarta Sans 600 Deep Teal, 4-step progress bars with the first two filled Turquoise `#5BC0BE`.
>
> **Photo card:** the captured waste photo at the top, 20px radius, ~260px tall. Overlaid at its bottom-left, a translucent Deep Teal pill with a sparkle/auto-awesome icon reading "Analysed in 1.2s".
>
> **Result card** below, Warm Ivory with 1px Warm Taupe `#D6CCC2` border, 20px radius:
> - 11px uppercase Turquoise micro-label "DETECTED WASTE TYPE"
> - "Mixed household waste" in Plus Jakarta Sans 700 22px Deep Teal
> - A confidence row: "94% confident" with a slim progress bar filled Turquoise on a Warm Taupe track
> - A wrapped row of category chips in Pale Aqua `#BFEDEF` with Deep Teal text: "Plastic", "Organic", "Paper"
> - A divider, then two labelled rows: **Severity** — an Amber `#E8A33D` pill reading "HIGH"; **Est. volume** — "≈ 40 kg"
> - **Routed to** — a small row with a building icon: "Ward 12 Sanitation Team"
>
> Below the card, a subtle text link in Turquoise: "Not right? Change waste type".
>
> Bottom: full-width pill **"Looks correct — continue"** button in Turquoise with Deep Teal text, and a secondary "Retake photo" text button beneath.

---

## 08 — Report Step 3: Confirm Location

> Design a **confirm location screen** for Wasteman's reporting flow. 390×844.
>
> Top bar: back arrow, title "Confirm location" in Plus Jakarta Sans 600 Deep Teal, 4-step progress with three bars filled Turquoise `#5BC0BE`.
>
> **Map** filling the upper two-thirds — a clean light-toned street map. A single large draggable marker in the centre: a Turquoise `#5BC0BE` pin with a white waste icon, sitting on a soft Pale Aqua `#BFEDEF` accuracy halo circle. A small floating Warm Ivory pill above the pin reads "Drag to adjust". A circular "recentre" button floats at the map's bottom-right in Warm Ivory with a Deep Teal crosshair icon.
>
> **Bottom sheet**, Warm Ivory `#FFF9F1`, 24px top radius, with a Warm Taupe grabber handle:
> - 11px uppercase micro-label "PIN LOCATION"
> - Address in Plus Jakarta Sans 600 17px Deep Teal: "142, Cross Cut Road, Gandhipuram, Coimbatore 641012"
> - Coordinates in 13px `#5A6B6C`: "11.0168° N, 76.9558° E · ±4 m"
> - A "Add a landmark (optional)" input, 14px radius with a Warm Taupe border
> - Full-width pill **"Confirm location"** button in Turquoise with Deep Teal text

---

## 09 — Report Step 4: Details & Submit

> Design a **report details and submit screen** for Wasteman. 390×844, scrollable.
>
> Warm Ivory `#FFF9F1` background. Top bar: back arrow, "Add details", 4-step progress fully filled Turquoise `#5BC0BE`.
>
> **Summary card** — Warm Ivory, 20px radius, 1px Warm Taupe `#D6CCC2` border, containing a compact row: 64px rounded photo thumbnail, then "Mixed household waste" in Plus Jakarta Sans 600 Deep Teal with "94% confidence" beneath in 13px `#5A6B6C`, and a small "Edit" Turquoise link. A divider, then a location row with a pin icon and the truncated address.
>
> **Form:**
> - "How long has it been here?" — a row of selectable pill chips: "Today", "A few days", "Over a week", "Don't know". The second chip is selected, filled Pale Aqua `#BFEDEF` with a Deep Teal border.
> - "Is it blocking anything?" — chips: "Road", "Footpath", "Drain", "Nothing". "Drain" selected.
> - "Add a note (optional)" — a 4-line textarea, 14px radius, Warm Taupe border, placeholder "Anything the clean-up team should know?"
> - "Add more photos" — a horizontal strip: one filled thumbnail plus two dashed-border Warm Taupe add-tiles with Turquoise plus icons
>
> **Privacy note** — a small Pale Aqua `#BFEDEF` info bar with a shield icon: "Your name and contact are shared only with the assigned municipal team."
>
> Sticky bottom bar with a full-width pill **"Submit report"** button in Turquoise with Deep Teal text.

---

## 10 — Report Submitted (Success)

> Design a **success confirmation screen** for Wasteman after a citizen submits a waste report. 390×844.
>
> Warm Ivory `#FFF9F1` background, no app bar. Centred vertically:
>
> A 120px circle in Pale Aqua `#BFEDEF` containing a Deep Teal `#0F5257` checkmark, with two concentric faint Turquoise ripple rings expanding outward.
>
> Headline "Report submitted" in Plus Jakarta Sans 700 28px Deep Teal. Body in Inter 400 15px `#5A6B6C`: "Ward 12 Sanitation Team has been notified with your photo and location."
>
> **Reference card** — Warm Ivory, 20px radius, 1px Warm Taupe `#D6CCC2` border: 11px uppercase micro-label "REPORT ID", then "#WN-24817" in Plus Jakarta Sans 700 Deep Teal with a copy icon. Beneath, a divider and a row: clock icon with "Typically resolved in 2–4 days".
>
> A small Pale Aqua `#BFEDEF` bar with a bell icon: "We'll send you a photo the moment it's cleared."
>
> Bottom: full-width pill **"Track this report"** button in Turquoise with Deep Teal text, and a "Back to home" text button beneath in `#5A6B6C`.

---

## 11 — Map Explorer

> Design a **full-screen map explorer** for Wasteman, showing reported and resolved waste locations. 390×844.
>
> Full-bleed clean light street map of an Indian city.
>
> **Floating search bar** at the top: Warm Ivory `#FFF9F1` pill with a soft shadow, search icon leading, placeholder "Search an area", and a circular filter button trailing in Pale Aqua `#BFEDEF` with a Deep Teal tune icon.
>
> **Filter chips** in a horizontal scroll row beneath: "All" (selected — filled Deep Teal `#0F5257`, Warm Ivory text), "Pending" (Warm Ivory with Amber `#E8A33D` border and a small amber dot), "Resolved" (Warm Ivory with Deep Teal border and dot), "Plastic", "Organic", "Construction debris".
>
> **Map markers:**
> - Pending reports — Amber `#E8A33D` teardrop pins with a white waste icon
> - Resolved reports — Deep Teal `#0F5257` pins with a white check icon
> - A cluster bubble showing "12" in a Turquoise `#5BC0BE` circle with a Pale Aqua halo
> - One selected pin, enlarged with a Pale Aqua `#BFEDEF` glow ring
>
> **Legend chip** floating bottom-left: small Warm Ivory card with two rows — an amber dot "Pending" and a teal dot "Resolved".
>
> **Bottom sheet** (peeking, ~40% height), Warm Ivory with 24px top radius and a grabber: header "3 reports nearby" in Plus Jakarta Sans 600 Deep Teal, then a horizontally swipeable row of compact report cards — each with a rounded photo, AI waste type, distance ("120 m away"), and a status pill.
>
> Bottom navigation bar with the Map tab active.

---

## 12 — My Reports (Activity)

> Design a **"My reports" list screen** for Wasteman. 390×844, scrollable.
>
> Warm Ivory `#FFF9F1` background. Top bar: "My reports" in Plus Jakarta Sans 700 Deep Teal, with a search icon right.
>
> **Segmented tabs** beneath, as a pill-shaped track in Pale Aqua `#BFEDEF` with the active segment filled Deep Teal `#0F5257` with Warm Ivory text: "All (12)", "Pending (3)", "In progress (2)", "Resolved (7)". "All" is active.
>
> **Report cards**, stacked with 12px gaps — Warm Ivory, 20px radius, 1px Warm Taupe `#D6CCC2` border, soft shadow. Each card:
> - An 84px rounded-square photo of dumped waste on the left
> - Right column: status pill at top (Amber "PENDING", Turquoise "IN PROGRESS", or Deep Teal "RESOLVED"), then the AI waste type in Plus Jakarta Sans 600 16px Deep Teal, then a location line with a pin icon in 13px `#5A6B6C`, then a bottom row with report ID "#WN-24817" and a relative date
> - Resolved cards additionally show a slim Deep Teal bar at the bottom with a check icon: "Cleared on 18 Aug · View after photo"
>
> Show five cards covering all three statuses. Bottom navigation with the Activity tab active.

---

## 13 — Report Detail & Timeline

> Design a **report detail screen** for Wasteman. 390×844, scrollable.
>
> **Hero:** the reported waste photo full-bleed at the top, ~300px, with a dark top scrim carrying a white back arrow and a share icon. A photo-count pill "1 / 3" bottom-right of the image.
>
> Content sheet in Warm Ivory `#FFF9F1` with a 28px top radius overlapping the photo:
> - Row with a Turquoise `#5BC0BE` "IN PROGRESS" pill and "#WN-24817" in 13px `#5A6B6C`
> - "Mixed household waste" in Plus Jakarta Sans 700 24px Deep Teal
> - Address row with a pin icon, and a small "Open in Maps" Turquoise link
>
> **AI analysis card** — Pale Aqua `#BFEDEF` fill, 20px radius, sparkle icon header "AI analysis": a 2×2 grid of label/value pairs in Deep Teal — "Type: Mixed household", "Confidence: 94%", "Severity: High", "Est. volume: ≈40 kg".
>
> **Assigned team card** — Warm Ivory with a Warm Taupe border: building icon, "Ward 12 Sanitation Team", and a small "Contact" outlined pill button.
>
> **Timeline** — a vertical stepper with a Turquoise connector line. Completed steps have filled Deep Teal `#0F5257` circles with white check icons; the current step has a Turquoise ring with a pulsing dot; future steps are hollow Warm Taupe circles. Steps: "Report submitted — 16 Aug, 8:42 AM", "AI verified & routed — 16 Aug, 8:42 AM", "Team assigned — 16 Aug, 11:20 AM", "Clean-up in progress — 18 Aug" (current), "Resolved" (pending, greyed).
>
> Sticky bottom bar with an outlined pill "Add an update" button in Deep Teal.

---

## 14 — Resolved Report (Before & After)

> Design a **resolved report screen** for Wasteman showing the before-and-after result. 390×844, scrollable.
>
> Warm Ivory `#FFF9F1` background. Top bar: back arrow, "Report resolved" in Plus Jakarta Sans 600 Deep Teal, share icon right.
>
> **Celebration banner** — a Deep Teal `#0F5257` card, 20px radius, with a Warm Ivory checkmark badge, headline "This spot is clean again" in Plus Jakarta Sans 700 Warm Ivory, and subcopy in Pale Aqua `#BFEDEF`: "Cleared by Ward 12 Sanitation Team on 18 Aug, 3:10 PM".
>
> **Before / after comparison** — the centrepiece. Two stacked photo cards, each 20px radius: the top one is the original dumped-waste photo with a small Amber `#E8A33D` "BEFORE" label pill in its corner; the bottom is the same street now clean, with a Deep Teal "AFTER" label pill. A thin Turquoise `#5BC0BE` connector with a downward arrow between them.
>
> **Impact strip** — three Pale Aqua `#BFEDEF` stat tiles: "≈40 kg removed", "2 days to fix", "18 neighbours notified".
>
> **Rating card** — Warm Ivory with a Warm Taupe border: "How was the clean-up?" in Plus Jakarta Sans 600 Deep Teal, a row of five star icons with four filled Turquoise, and a "Leave a comment (optional)" input.
>
> Bottom: full-width pill **"Submit feedback"** button in Turquoise with Deep Teal text, and a "Report this spot again" text link in `#5A6B6C`.

---

## 15 — Notifications

> Design a **notifications screen** for Wasteman. 390×844, scrollable.
>
> Warm Ivory `#FFF9F1` background. Top bar: "Notifications" in Plus Jakarta Sans 700 Deep Teal, with a "Mark all read" Turquoise text link right.
>
> Grouped under 11px uppercase section headers in `#5A6B6C`: "TODAY", "THIS WEEK".
>
> Notification rows — unread rows have a very subtle Pale Aqua `#BFEDEF` tint and a small Turquoise dot on the left edge; read rows are plain Warm Ivory. Each row: a 44px circular icon badge on the left, then title in Plus Jakarta Sans 600 15px Deep Teal, body in Inter 400 14px `#5A6B6C`, and a timestamp top-right in 12px.
>
> Include these, in order:
> 1. **Resolved** — Deep Teal `#0F5257` badge with a check icon, plus a 56px rounded thumbnail of the cleaned-up street on the right. "Your report was resolved" / "Ward 12 cleared the waste at Cross Cut Road. Tap to see the after photo." · 2h
> 2. **In progress** — Turquoise `#5BC0BE` badge with a truck icon. "Clean-up started" / "A team has been dispatched to #WN-24817." · 5h
> 3. **AI verified** — Pale Aqua `#BFEDEF` badge with a sparkle icon. "Report verified" / "AI classified your report as mixed household waste and routed it to Ward 12." · 1d
> 4. **Community** — Warm Taupe `#D6CCC2` badge with a group icon. "3 new reports near you" / "Gandhipuram has 3 open reports this week." · 2d
> 5. **Pending reminder** — Amber `#E8A33D` badge with a clock icon. "Still awaiting pickup" / "#WN-24712 has been pending for 6 days. We've escalated it." · 3d

---

## 16 — Statistics / My Impact

> Design a **statistics and impact screen** for Wasteman. 390×844, scrollable.
>
> Warm Ivory `#FFF9F1` background. Top bar: "My impact" in Plus Jakarta Sans 700 Deep Teal. A segmented pill toggle beneath in Pale Aqua `#BFEDEF`: "Me" (active, filled Deep Teal) / "My ward" / "City".
>
> **Hero stat card** — Deep Teal `#0F5257`, 24px radius: 11px uppercase Pale Aqua label "TOTAL WASTE CLEARED", then "1,240 kg" in Plus Jakarta Sans 700 40px Warm Ivory, and a small Turquoise `#5BC0BE` trend pill with an up-arrow reading "+18% vs last month".
>
> **Stat grid** — 2×2 Warm Ivory cards with 1px Warm Taupe `#D6CCC2` borders, each with an icon, a large Deep Teal number, and an 11px uppercase label: "12 Reports filed", "9 Resolved", "75% Resolution rate", "2.4 days Avg. fix time".
>
> **Waste type breakdown** — a card with a horizontal stacked bar chart, segments in Deep Teal, Turquoise, Pale Aqua and Warm Taupe, with a legend list beneath: "Plastic 42%", "Organic 28%", "Construction 18%", "Other 12%".
>
> **Monthly trend** — a card with a smooth line/area chart, Turquoise `#5BC0BE` line on a Pale Aqua gradient fill, Warm Taupe gridlines, month labels along the x-axis. Title "Reports over time".
>
> **Contribution streak** — a card with a 7-column grid of small rounded squares in Pale Aqua and Deep Teal shades, like a heatmap, labelled "Your reporting streak — 6 weeks".
>
> **Badges row** — three circular achievement badges in Pale Aqua with Deep Teal icons and captions: "First report", "10 reports", "Ward hero". The third is greyed in Warm Taupe with a progress ring.
>
> Bottom navigation bar.

---

## 17 — Profile

> Design a **profile screen** for Wasteman. 390×844, scrollable.
>
> **Header:** Deep Teal `#0F5257` panel with a large 32px bottom-left radius. Centred 88px circular avatar with a 3px Turquoise `#5BC0BE` ring and a small camera-edit badge at its lower-right. Name "Ravi Kumar" in Plus Jakarta Sans 700 22px Warm Ivory. Beneath it a verified row: a Turquoise check icon with "Verified citizen" in Pale Aqua `#BFEDEF`.
>
> **Inline stat strip** at the bottom of the teal panel — three columns divided by thin Turquoise rules: "12 Reports", "9 Resolved", "Ward 12".
>
> **Contact card** overlapping the panel — Warm Ivory `#FFF9F1`, 20px radius, soft shadow: two rows with leading icons, each with an 11px uppercase micro-label and value — "EMAIL / ravi.kumar@gmail.com" with a small Turquoise "Verified" pill, and "PHONE / +91 98765 43210" with a Turquoise "Verified" pill. A trailing "Edit" text link.
>
> **Settings list** — grouped Warm Ivory cards with Warm Taupe `#D6CCC2` dividers between rows. Each row: leading Deep Teal icon, label in Inter 500 15px Deep Teal, trailing chevron.
> - Group 1: "Edit profile", "Change password", "Saved locations"
> - Group 2: "Notification preferences" (with a Turquoise toggle switch, on), "Location & GPS accuracy", "Language — English"
> - Group 3: "Help & support", "Terms and privacy", "About Wasteman"
>
> **Log out** row at the bottom in a standalone card, label and icon in a muted red-brown `#A8564C`.
>
> Bottom navigation bar with the Profile tab active.

---

## 18 — Edit Profile

> Design an **edit profile screen** for Wasteman. 390×844.
>
> Warm Ivory `#FFF9F1` background. Top bar: back arrow, "Edit profile" in Plus Jakarta Sans 600 Deep Teal, and a "Save" text button in Turquoise `#5BC0BE` right.
>
> Centred at the top: a 96px circular avatar with a Turquoise ring and a 32px Turquoise circular camera badge overlapping its lower-right. Beneath, a "Change photo" Turquoise text link.
>
> Form fields, each 14px radius with 1px Warm Taupe `#D6CCC2` borders, floating labels and leading icons:
> - Full name — "Ravi Kumar"
> - Email address — "ravi.kumar@gmail.com", with a trailing Turquoise check badge and a small caption beneath in `#5A6B6C`: "Verified · Required"
> - Phone number — "+91 98765 43210" with a country-code chip, trailing Turquoise check badge, caption "Verified · Required"
> - Home ward — a select field showing "Ward 12 — Gandhipuram" with a chevron
> - Address (optional) — a 3-line textarea
>
> A Pale Aqua `#BFEDEF` info bar with a shield icon: "Your contact details are only shared with the municipal team assigned to your reports."
>
> Sticky bottom full-width pill **"Save changes"** button in Turquoise with Deep Teal text.

---

# Admin Screens

The admin experience is a separate surface. Start a fresh Stitch chat with
Block 0, then use these.

## A1 — Admin Dashboard

> Design an **admin dashboard** for Wasteman, the municipal side of a civic waste-reporting app. 390×844, scrollable. Use the same design system, but lean darker and denser — this is an operational tool.
>
> **Header:** Deep Teal `#0F5257` panel — "Ward 12 Sanitation" in Plus Jakarta Sans 700 Warm Ivory, "Coimbatore Municipal Corporation" beneath in Pale Aqua `#BFEDEF`, avatar and a notification bell with an Amber `#E8A33D` count badge "7" top-right.
>
> **Alert strip** — an Amber `#E8A33D` tinted card with a warning icon: "3 reports overdue (>5 days)" with a "Review" pill button.
>
> **KPI grid** — 2×2 Warm Ivory cards with Warm Taupe `#D6CCC2` borders: "18 New today" (Amber accent), "24 In progress" (Turquoise accent), "156 Resolved this month" (Deep Teal accent), "2.4d Avg. resolution".
>
> **Queue section** — header "Incoming reports" with a filter icon and sort control. A list of dense report rows, each: 64px photo thumbnail, AI waste type in Plus Jakarta Sans 600, a severity pill (Amber "HIGH" / Turquoise "MEDIUM"), the address in 12px `#5A6B6C`, time since submission, and a trailing chevron. Overdue rows carry a thin Amber left edge bar.
>
> **Mini map card** — a heatmap-style map preview with clustered Amber hotspots and a "Open ward map" link.
>
> Bottom navigation with admin items: Dashboard, Queue, Map, Teams, Profile.

## A2 — Admin: Incoming Report Detail

> Design an **admin report detail screen** for Wasteman. 390×844, scrollable. Dense, operational, same palette.
>
> **Hero:** the citizen's waste photo full-bleed, ~280px, with a dark scrim, back arrow, and a "1 / 3" photo counter. An Amber `#E8A33D` "PENDING" pill overlaid bottom-left.
>
> Content sheet in Warm Ivory `#FFF9F1`, 28px top radius:
> - "#WN-24817" in 13px `#5A6B6C` with a "Submitted 2h ago" timestamp
> - "Mixed household waste" in Plus Jakarta Sans 700 24px Deep Teal
>
> **AI analysis card** — Pale Aqua `#BFEDEF`, sparkle header "AI classification": rows for "Type: Mixed household waste", "Confidence: 94%", "Severity: HIGH" (Amber pill), "Est. volume: ≈40 kg", "Detected items: plastic bags, food waste, cardboard", "Recommended crew: 2 workers + 1 truck".
>
> **Location card** — a small embedded map thumbnail with a Turquoise pin, the full address, coordinates, and "Open in Maps" / "Get directions" outlined pill buttons.
>
> **Reporter card** — Warm Ivory with a Warm Taupe border, header "Reported by": circular avatar, "Ravi Kumar", a Turquoise "Verified citizen" pill, then rows for email and phone each with a trailing call/mail circular icon button in Pale Aqua. A caption in 12px `#5A6B6C`: "4 previous reports · 100% valid".
>
> Sticky bottom action bar with two buttons: an outlined "Reject" pill in `#A8564C` and a filled Turquoise **"Assign team"** pill with Deep Teal text.

## A3 — Admin: Assign & Update Status

> Design an **assign and update status bottom sheet** for Wasteman's admin app. 390×844, showing the sheet over a dimmed report detail screen.
>
> Bottom sheet, Warm Ivory `#FFF9F1`, 28px top radius, Warm Taupe grabber handle, occupying ~75% of the screen.
>
> - Title "Assign & update" in Plus Jakarta Sans 700 22px Deep Teal
> - 11px uppercase micro-label "STATUS" then a segmented pill row: "Pending" (Amber outline), "In progress" (selected — filled Turquoise `#5BC0BE`), "Resolved" (Deep Teal outline)
> - "ASSIGN TO TEAM" — a select field showing "Ward 12 — Crew B" with a chevron, and beneath it a horizontal row of three assignee avatar chips in Pale Aqua with names
> - "PRIORITY" — chips: "Low", "Normal", "Urgent" with "Urgent" selected in Amber `#E8A33D`
> - "SCHEDULED PICKUP" — a date/time field showing "19 Aug 2026 · 9:00 AM" with a calendar icon
> - "INTERNAL NOTE" — a 3-line textarea with placeholder "Visible to the crew only"
> - "UPLOAD RESOLUTION PHOTO" — a dashed-border Warm Taupe upload tile with a Turquoise camera icon and caption "Required to mark as resolved"
> - A Pale Aqua `#BFEDEF` info bar with a bell icon: "Ravi Kumar will be notified with the after photo."
>
> Full-width pill **"Update report"** button in Turquoise with Deep Teal text.

## A4 — Admin: Ward Map & Heatmap

> Design an **admin ward map screen** for Wasteman. 390×844.
>
> Full-bleed street map of a city ward with a **density heatmap overlay** — warm Amber `#E8A33D` blooms over hotspot areas fading to transparent, and cool Deep Teal `#0F5257` shading over well-serviced areas.
>
> **Top controls:** a Warm Ivory search pill "Search ward or street", and a horizontal chip row: "Heatmap" (selected, filled Deep Teal), "Pins", "Routes".
>
> **Filter chips** second row: "All statuses", "Overdue (3)" with an Amber dot, "Urgent", "Unassigned".
>
> **Map content:** Amber teardrop pins for pending reports, Turquoise pins for in-progress, Deep Teal check pins for resolved, plus cluster bubbles with counts. One selected pin enlarged with a Pale Aqua glow.
>
> **Floating stats card** top-right — compact Warm Ivory card: "Ward 12" in 600 weight, then three tiny rows with coloured dots: "18 pending", "24 in progress", "156 resolved".
>
> **Bottom sheet** peeking at ~35%: "Hotspot — Cross Cut Road" in Plus Jakarta Sans 600 Deep Teal, "7 reports in 30 days · recurring dumping site" in 13px `#5A6B6C`, a row of small photo thumbnails, and two pill buttons: "Assign crew" (Turquoise) and "Flag as blackspot" (outlined Deep Teal).

---

## Refinement phrases that work well in Stitch

- "Increase the whitespace between sections and make the cards breathe more."
- "Make the photo the hero — enlarge it and reduce the surrounding chrome."
- "Use the Amber only for the pending status; everything else should stay in the teal family."
- "Show this screen in dark mode using Deep Teal `#0F5257` as the background and Warm Ivory as the text colour."
- "Give me an empty state for this screen."
- "Generate the loading/skeleton state for this screen."
- "Show the error state when GPS is unavailable."

## Notes on the palette

The five supplied colours are all cool teals and warm neutrals, which is calm and
trustworthy but gives no way to distinguish an urgent, unresolved report from a
finished one at a glance — a real problem on a map full of pins. I added one
accent, **Amber `#E8A33D`**, used strictly for "pending / overdue". Drop it from
the prompts if you'd rather stay literal to the five swatches; the fallback is to
use Warm Taupe `#D6CCC2` for pending, which is quieter but much less legible on
a map.
