# MacroSnap — project brief for every session

Snap your meal, track your macros instantly. A real SaaS built with the Kwop method.
The full owner brief is in `KWOP-BUILD.md` (local only, gitignored: it holds the Kwop key). Read it before working.
Secrets live only in `.env.local` and in Vercel: `KWOP_API`, Supabase keys, `GEMINI_API_KEY`. Never commit them, never put them in browser code.

## RESULT
**your macros** — "Snap my macros" is the main button; the creating screen is "Reading your plate…"; the paywall says "Your plate's macros are ready."

## Step 0 — what already converts (US market)
| App | Landing / headline | First result | Paywall | Plans |
|---|---|---|---|---|
| **MyFitnessPal** | "Fitness starts with what you eat", app-store buttons, feature rows, testimonials | Long onboarding (goals, weight, activity) → account → diary; Meal Scan is Premium | After onboarding, before the first scan | Free; Premium $19.99/mo or $79.99/yr (Meal Scan, Barcode, Voice log); Premium+ $99.99/yr |
| **Lose It!** | "Lose weight the healthy way", goal-first | Onboarding quiz (goal weight, pace) → account → log; Snap It photo logging is Premium | End of onboarding, trial offer | Free; Premium ≈ $9.99/mo, $39.99–79.99/yr |
| **Cal AI** (replaces nothing; it is the photo-first leader, added as the 3rd) | "Track calories just by taking a picture" | Quiz (≈20 screens) → plan → paywall → first photo scan | Hard paywall before any scan | ≈ $9.99–14.99/mo or $39.99/yr, 3-day trial |

Both MyFitnessPal and Lose It! really do this job (photo meal logging), but only as a Premium add-on inside a database-first app.
**Model picked: Cal AI** for structure (photo-first, the photo IS the product). We beat it with Kwop rule 3: the scan works on the landing page with no account and no quiz; the paywall appears over the visitor's own plate.

## Step 0b — the blueprint
- **Funnel: TRY FIRST.** A photo is the only input, AI answers in seconds: the hero IS the scanner. No quiz before value.
- **Hero (first 10 s):** title "Snap your plate. Get your macros." (subtitle: "How I track 500 calories in 2 seconds without typing anything"). Under it a big recipe-card drop zone: "Take a photo of your meal" (opens the camera on phones, `capture="environment"`), "or upload one", plus 3 example plates (avocado toast, chicken bowl, pasta) tried in one tap. Line of true facts: "Free to try · No account · Ready in about 5 seconds".
- **The work (in place, ≥3 s, real Gemini call):** scan lines + points over their own photo, progress ring 0→99 %, 5 named steps: "Finding every food on the plate" → "Estimating portion sizes" → "Matching nutrition data" → "Adding up protein, carbs and fat" → "Checking your totals". Then "Your plate's macros are ready."
- **Teaser:** clear = their photo with detected food labels pinned on it + the food names list + one insight ("Most of the protein comes from the grilled chicken."). Blurred = total calories (big), protein/carbs/fat grams and the per-item breakdown, behind a soft gradient and a lock.
- **Unlock button:** "See my full macros". No account → sign-up sheet "Save this meal to your log" (Google first, email+password). Then the paywall right away, the blurred result behind it.
- **Paywall title:** "Your plate's macros are ready." Personal line: "<N> foods found in your <dish name>. Unlock the numbers and log it in one tap."
- **Plans** (names/prices from Kwop API, quotas below), "What you unlock" in scans a month, detailed breakdowns, history, trends.
- **Unlock film:** "You're on <Plan>" → 3 icons (Scans, Breakdown, Streaks) → "Let's log it".
- **App:** Today (rings for kcal/P/C/F, today's meals, streak), Scan, History (by day, edit/delete), Settings (daily goals), Account (plan, billing, cancel, delete account). Privacy: photos are stored in a private Supabase Storage bucket, only the owner can read them; delete a meal deletes its photo.
- **Magic moment on landing:** the live scanner itself + a phone frame looping a scan in the "How it works" section.
- **Visual direction (Food & cooking):** warm cream `#FBF6EC` background, ink `#1D1A15`, tomato `#E5482F`, olive `#6B7B3A`, lime accent `#C8FF3D` (Kwop brand color, used as the highlight on dark sections and the scan lines), dark sections `#14120E`. Fonts: Fraunces (headings), Inter (text), JetBrains Mono (labels `[ HOW IT WORKS ]`). Signature elements: 1) recipe cards (rounded 20 px, paper texture, punched corner), 2) the scan frame (corner brackets + lime scan line + pinned food labels), 3) macro rings (protein tomato, carbs olive-gold `#D9A441`, fat olive).
- Kwop kit adapted: dark hero `#14120E` with dot grid and a warm glow, light cream sections alternating; floating top bar; breathing pill button; giant faded wordmark footer.
- Honest limits shown in app: macros are AI estimates from a photo (±10–20 %), not medical advice.

## Plans and quotas (option B, saved in Kwop on 2026-11-26; server-counted per billing period)
Names, ids and prices are always read from GET KWOP_API (never hardcoded). Quotas live in `lib/plans.ts`, matched by plan position (cheapest first).
| Plan (Kwop id) | Price | Per day | Yearly (−20 %) | Tag | Quotas |
|---|---|---|---|---|---|
| Snack (1923) | $6.99/mo | $0.23 | $67/yr ($0.18/day) | For casual tracking | 40 scans/month, calorie + macro totals, 30 days of history |
| **Plate (1924)** Most popular | $9.99/mo | $0.33 | $96/yr ($0.26/day) | For daily goals | 150 scans/month, per-food breakdown, unlimited history, streaks + trend charts |
| Feast (1925) | $15.99/mo | $0.53 | $154/yr ($0.42/day) | For strict control | 400 scans/month, all of Plate, week-by-week comparisons, CSV export, priority scans |
Free visitors: 3 scans/day per device + IP, teaser only (foods + one insight; numbers blurred).
Locked on lower plans: Snack sees per-food breakdown and trends blurred ("Unlock with Plate"); Plate sees weekly comparison + CSV export locked ("Unlock with Feast").

## Kwop API (server only, `lib/kwop.ts`)
`KWOP_API` env. GET → plans; POST /checkout {plan, period, email, k} → {embed, ref, fallback_url} (409 payments_off); POST /confirm {ref}; GET /plan?email= (cached 60 s); POST /cancel {email, except_ref?}; POST /event {type, email, detail} fire-and-forget; POST /connect {url}. `k` from ?k= → cookie `kwop_k` 30 days → profiles.k. Tracking script `https://kwop.io/flow.js` data-site `s_8619cfc2b1` on public pages only.

## Stack
Next.js App Router + TS + Tailwind + shadcn-style components + framer-motion + lucide-react. Supabase (Postgres, Auth, Storage, RLS on every table; SQL in supabase/migrations). Vercel. AI only in `lib/ai.ts` (Gemini Flash).

## Verification loop (after every feature)
`npm run dev`, `node scripts/shot.mjs` screenshots at 390×844 and 1440×900, look at every image, zero console errors, fix, 3 passes, commit. `tests/e2e.spec.ts` covers the funnel (never pays).

## Build status (2026-11-26)
Built and verified locally (screenshots at 390 and 1440, zero console errors, `npm run build` + `npm run lint` clean):
landing page with the live scanner, scan animation, locked teaser, motion VSL; sign-up sheet, /signup, /login, /forgot, /reset, Google callback;
paywall (real Kwop plans), in-page Whop checkout sheet, confirm + unlock film, /pricing, /dashboard return; app: Today, Scan, History (trends, week by week, CSV), Settings (goals), Account (billing, cancel, delete); meal page (edit portions, delete, share); public share page + OG images; legal pages, 404/error, manifest + icons.
Kwop: plans saved (option B) and `/checkout` verified to return a Whop embed.

### Not done yet — needs the owner's keys (cloud environment "Business" → Edit → Environment variables), then a new session
- `SUPABASE_ACCESS_TOKEN` (supabase.com/dashboard/account/tokens): create project `macrosnap-3`, push `supabase/migrations`, auth config (mailer_autoconfirm true, site_url, uri_allow_list). Hosts `api.supabase.com` and `*.supabase.co` must be allowed.
- `VERCEL_TOKEN` (vercel.com/account/tokens): project `macrosnap-3`, env vars from `.env.example`, deploy. Hosts `api.vercel.com` / `vercel.com` must be allowed.
- `GEMINI_API_KEY` (aistudio.google.com/apikey): the scanner answers "opens in a moment" until it is set.
- Then: Google sign-in (set `NEXT_PUBLIC_GOOGLE_AUTH=1` once enabled), run `npm run e2e` against the live URL, POST KWOP_API/connect with the production URL, security pass (RLS test with two users).

### Dev notes
- Example plates on the landing scanner are real photos (`public/examples/*.jpg`, Wikimedia Commons, credited at /credits). The SVG illustrations are only used inside the VSL / demo animations.
- Locked results never send numbers to the browser (`lib/meals.ts` `toView`).
- `scripts/shot.mjs` (screenshots), `scripts/flow-shot.mjs` (funnel states with a mocked AI answer, dev only), `tests/e2e.spec.ts` (real funnel, needs live services).

## Live (2026-11-26)
- Production: https://macrosnap-3.vercel.app (Vercel project `macrosnap-3`, team slyqordigital-bot). Supabase project `macrosnap-3` (ref `ugucwehaptrmkctpibdl`, us-east-1, org "MacroSnap"), migration applied, autoconfirm on, site_url set.
- Tokens for api.supabase.com / api.vercel.com are saved as network secrets on the "Business" environment (use `--token proxyinjected` with the Vercel CLI).
- Gemini key is on Vercel as `Gemini_Api_Key` (lib/ai.ts reads either spelling). `lib/ai.ts` lists the key's Flash models and uses the newest (gemini-3.8-flash on 2026-11-26), falls back to the next one; gemini-2.5-flash is retired.
- Gemini billing enabled 2026-11-26 (paid tier); live scans take ~5 s on gemini-3.8-flash. The free tier (20 requests/day) is too small for production.
- Kwop connected (POST /connect ok): https://kwop.io/macrosnap-3/app → the app.
- Verified live: e2e funnel 3× on phone and computer (Whop checkout iframe loads in the sheet, never paid); RLS check with a second user (no cross-user reads/writes, photos private).
- AI accuracy check 2026-11-26 (31 real photos via owner-only `/api/admin/analyze`, bearer CRON_SECRET): 29/31 dish names right, 2 close (omelette read as fried egg; chocolate smoothie bowl as chocolate pudding); 4–7 s each on gemini-3.8-flash. Average 1,193 input + ~430 output/thinking tokens ≈ $0.0025 per scan at 2026 prices ($0.005 from 2027-01-01).
- Left to do: Google sign-in (owner creates the OAuth client, then PATCH config/auth + NEXT_PUBLIC_GOOGLE_AUTH=1 and redeploy); Lighthouse pass.
- Note: the Whop checkout shows the owner's Whop store name ("Whop Wealth Academy") as the seller.
- Test account created on live: livecheck+1795730387788@macrosnap-test.com.

## Other app in this repository
`snackquest/` is **SnackQuest**, a separate product (own Vercel project `snackquest`, own Supabase project, own Kwop key). Root configs exclude it (`tsconfig.json`, `eslint.config.mjs`, `.vercelignore`). Work on it from inside `snackquest/` with its own `CLAUDE.md`.
