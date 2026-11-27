# SnackQuest — project brief for every session

Made for gamers who love snacks. The gamified rewards app for hungry gamers: link your games, take on absurd snack quests, earn points, redeem gear.
Built with the Kwop method, PREMIUM build. The full owner brief is in `KWOP-BUILD.md` (local only, gitignored: it holds the Kwop key). Read it before working.
Secrets live only in `.env.local` and in Vercel: `KWOP_API`, Supabase keys, `GEMINI_API_KEY`, `STEAM_API_KEY`. Never commit them, never put them in browser code.
(This repo used to hold MacroSnap; that code stays on `main`. This branch is SnackQuest.)

## RESULT
**your Snack Quest**: main button "Start my Snack Quest"; creating screen "Building your Snack Quest…"; paywall "Your <game> × <snack> quest is ready."; notifications "Quest cleared · +120 pts".

## Step 0 — what already converts (US market)
| App | Landing / headline | Sign-up → first result | Paywall | Plans |
|---|---|---|---|---|
| **BUFF.Game** (Overwolf) | "Who said gaming doesn't give you anything?" Play → earn Buffs → redeem in the Marketplace; supported-games grid, rewards wall | Download, link game account (Riot/Steam/PS), play, points appear after the match | Premium upsell inside the app (boosted earnings), never before value | Free; Premium $3.99/mo ($35.99/yr: 50 monthly Buffs, +150 % game earnings, premium items); Premium Plus $5.99/mo ($53.99/yr); Premium Elite $7.99/mo ($69.99/yr: 200 monthly Buffs, +300 % earnings, +200 % daily rewards). Gift cards ≈600 Buffs, Steam codes 900–1,500 |
| **Mistplay** (replaces SideQuest) | "Play games, earn rewards"; Units → gift cards (Amazon, Google Play, Nintendo, Visa) | Android app, pick a game, Units per minute played | No paid plan: loyalty status tiers (Bronze → Platinum) | Free; $5 gift card ≈1,800 Units; $550/yr redemption cap |
| **Habitica** (the "progress made visible" leader) | "Gamify your life": habits become quests, XP, streaks | Sign up → create avatar → first daily tasks right away | Soft: subscription offered inside the app | Free; $4.99/mo, $14.99/3 mo, $47.99/yr (extras, gems) |

SideQuest was checked and dropped: it is a VR app store (plus unrelated "sidequest" habit apps), not a gamer rewards app. Mistplay does the job (rewards for playing).
**Model picked: BUFF.Game** for structure (link games → earn points while playing → challenges → marketplace), plus Habitica's quest/streak loop. We beat them with Kwop's personal flow: sign-up → 4 one-tap questions → a real AI-built quest run with your own goal date, before any price.

## Step 0b — the blueprint
- **Funnel: PERSONAL FLOW.** The result needs who they are (game, snack, goal), so: landing → sign-up → 4 questions → the one input (gamer tag / Steam profile, example filled) → the work → locked result → paywall. Why: like Buff, value comes from linking your games; we make that first session happen in under a minute.
- **Hero (first 10 s):** title "Snack. Play. Unlock real gear." (second line in gradient). Sentence: "Turn your **snack breaks** into quests and your **playtime** into points you trade for gear." Button "Start my Snack Quest →". Facts line: "Free to start · No card · Your quest in 60 seconds". Right (under the button on a phone): a CSS iPhone (dynamic island, live time, lock-screen clock) with SnackQuest notifications sliding in on Kwop timings (0 / 0.9 / 1.8 s, then every 2.6 s; 3 visible desktop, 2 phone; older dim, "now" → "1m ago"): "Quest cleared: Pizza-slice clutch · +120 pts", "Fortnite session synced · 48 min · +96 pts", "Streak 6 days. Shield ready", "Reward unlocked: Pro Gaming Headset" (example values).
- **VSL (under hero, 6 scenes ≈ 60 s, HTML/CSS):** 1 the problem ("Gear costs $$$. You snack anyway.") → 2 the click ("What if every chip counted?") → 3 SnackQuest in action (quest card + photo check) → 4 the RESULT (points bar filling to a headset) → 5 what changes (streak, rewards) → 6 CTA. Script in VSL.md; public/vsl.mp4 replaces it when present.
- **Sections:** [ THE PROBLEM ] · [ HOW IT WORKS ] 3 steps in animated phone frames (Connect · Snack & Play · Collect) · [ IN ACTION ] feature loops (Game Sync, Snack Quests, Reward Shop, Streak Tracker) · [ THE USUAL WAY ] comparison · [ QUESTIONS ] 6 · final block "Tonight: one pizza, one match, your first +120." · footer with giant wordmark. No prices anywhere.
- **Sign-up** (centered card on a calm dark background): "Sign up so SnackQuest can build your quest." Google (hidden until enabled) / email + password / "Already have an account? Log in" / Terms·Privacy line.
- **Personal flow (typed question, square ticks, drawer line, 1.3 s auto-advance, thin progress bar, ← Previous question):**
  1. "What do you play the most?" Fortnite · Valorant · Minecraft · Call of Duty · League of Legends · Roblox · Something else
  2. "And what's your go-to <game> snack?" Pizza · Chips · Wings · Candy · Energy drinks · Healthy stuff
  3. "When do you usually grind?" After school/work · Late night · Weekends · All the time
  4. "What gear do you want to unlock first?" Headset · Controller · Keyboard · Mouse · Game gift card
  5. The one input: "Link your Steam profile (optional)" with example `https://steamcommunity.com/id/gaben`, plus "Skip, I play on console / Epic" (honest: the session timer counts those).
- **The work (≥6 s, real Gemini call + real computation):** 5 steps: "Reading your gamer profile" → "Syncing your games" (real Steam call when linked) → "Cooking up snack quests" (Gemini writes 7 absurd quests for their game + snack) → "Pricing your reward" → "Plotting your 30-day run". Percent 0→99 %, holds until done, retry once, then "Try again". Then "Your Snack Quest is ready."
- **Teaser:** CLEAR = quest #1 (title, rule, +points), streak "Day 1 started", their goal reward card. BLURRED = quests 2–7, the 30-day projection ("<Headset> unlocked around <date>") and the points chart, soft gradient + lock.
- **Unlock button:** "Unlock my quests". Sticky bar after ✕: "Unlock my quests · $0.33 / day".
- **Paywall title:** "Your <Fortnite> × <pizza> quest is ready." Personal line: "7 quests built around your <late-night> sessions. Unlock them and start earning toward your <headset>."
- **Unlock film:** "You're on <Plan>" → 3 icons (Quests, Points boost, Rewards) → "Let's play". Track "aha".
- **App** (sidebar desktop / bottom tabs phone): Dashboard (points, streak, today's quest, sessions, projection), Quests (today + run, complete with snack photo checked by Gemini, regenerate, history), Rewards (shop, redeem, my redemptions with status), Profile (Game Sync: Steam link + session timer, stats, share card), Account (plan, billing, cancel, delete).
- **Honest limits shown in the app:** websites can't read console/Epic games, so Game Sync = Steam Web API (public profiles, recent playtime) + an in-browser session timer (tab must stay open, capped per day). Rewards are fulfilled by the SnackQuest team by hand; status updates in Rewards. Not affiliated with Epic, Valve, Riot or any game.
- **Visual direction (Gaming, neon on dark):** bg `#07060D`, deep purple panels `#140F24` / `#1C1533`, borders `rgb(255 255 255 / .09)`, cyan `#22E1FF`, violet `#8B5CF6`, brand lime `#C8FF3D` (main buttons, points), hot pink `#FF4D8D` (snack accents), light sections `#F5F3FA` ink `#0E0B18`. Fonts: Rajdhani 700 (display, used sparingly), Inter (text), JetBrains Mono (labels `[ HOW IT WORKS ]`). Signature elements: 1) HUD panels with clipped corners + glowing edge, 2) XP bar (segmented, lime fill, shimmer), 3) quest cards with a rarity stripe (common cyan / rare violet / legendary lime).

## Plans and quotas (option B, saved in Kwop on 2026-11-26; server-counted per billing period)
Names, ids and prices are always read from GET KWOP_API (never hardcoded; Kwop prefixes names with "SnackQuest ", `shortName()` strips it). Quotas live in `lib/plans.ts`, matched by plan position (cheapest first).
| Plan (Kwop id) | Price | Per day | Yearly (−20 %) | Tag | Quotas |
|---|---|---|---|---|---|
| Snacker (1926) | $6.99/mo | $0.23 | $67/yr ($0.18/day) | For casual snackers | 20 quests/month, 1 linked game, 1× points, 30 days of history |
| **Grinder (1927)** Most popular | $9.99/mo | $0.33 | $96/yr ($0.26/day) | For daily grinders | 60 quests/month, 3 games, 1.5× points, streak shields, 30-day projection, full history |
| Legend (1928) | $16.99/mo | $0.57 | $163/yr ($0.45/day) | For hardcore players | 150 quests/month, 10 games, 2× points, custom quests from a snack photo, rewards handled first |
Free accounts: build up to 4 quest runs a day (AI cost cap), see quest #1 only; the app requires a paid plan.
Locked on lower plans: Snacker sees the projection blurred ("Unlock with Grinder") and custom quests locked; Grinder sees custom quests locked ("Unlock with Legend").

### Points economy (owner-tunable: `POINTS` in lib/plans.ts and the `rewards` table in Supabase)
Quest: common 40, rare 60, legendary 100 pts × plan multiplier. Play: 1 pt per 5 min (timer beats every 60 s while the tab is visible, or new Steam playtime), max 180 counted min/day. Photo checks: 20/day max. Catalog seed: $10 Steam/PSN/Xbox cards 3,000 · mouse 12,000 · controller 20,000 · keyboard 24,000 · headset 30,000. Redemptions: points held at once, status requested → processing → shipped → delivered, set by the owner in Supabase (table `redemptions`, add `tracking`). Max 3 open redemptions per user; cancel while "requested" refunds.

## Dev notes
- Node in this cloud container needs `NODE_USE_ENV_PROXY=1` to reach Supabase through the proxy (`NODE_USE_ENV_PROXY=1 npm run dev`).
- Gemini: the free key is limited to ~20 requests/day per model; `lib/ai.ts` falls through gemini-flash-lite-latest → 3.5-flash-lite → 3.1-flash-lite (fast, ~1–2 s). The full Flash models were 90 s+ here. Use a billing-enabled key for real traffic.
- Steam sync stays hidden until `STEAM_API_KEY` is set (session timer covers every game meanwhile).
- `scripts/shot.mjs` (screenshots), `scripts/icons.mjs` (icons from app/icon.svg), `tests/e2e.spec.ts` (real funnel, never pays).

## Kwop API (server only, `lib/kwop.ts`)
`KWOP_API` env. GET → plans; POST /checkout {plan, period, email, k} → {embed, ref, fallback_url} (409 payments_off); POST /confirm {ref}; GET /plan?email= (cached 60 s); POST /cancel {email, except_ref?}; POST /event {type, email, detail} fire-and-forget; POST /connect {url}. `k` from ?k= → cookie `kwop_k` 30 days → profiles.k. Tracking script `https://kwop.io/flow.js` data-site `s_6522168370` on public pages only.

## Stack
Next.js App Router + TS + Tailwind + shadcn-style components + framer-motion + lucide-react. Supabase (Postgres, Auth, Storage, RLS on every table; SQL in supabase/migrations). Vercel. AI only in `lib/ai.ts` (Gemini Flash).

## Verification loop (after every feature)
`npm run dev`, `node scripts/shot.mjs` screenshots at 390×844 and 1440×900, look at every image, zero console errors, fix, 3 passes, commit. `tests/e2e.spec.ts` covers the funnel (never pays).
