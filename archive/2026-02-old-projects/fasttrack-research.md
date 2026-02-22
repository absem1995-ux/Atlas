# FastTrack Research - Competitive Analysis

**Date:** 2026-02-16  
**Goal:** Build MVP fasting app for ehi  
**Timeline:** 7-10 days to iOS MVP

---

## Market Landscape

### Zero (Leader)
- **Free tier:** Timer, streaks, basic insights
- **Paid ($70/year):** Photo food logging, macro tracking, protein scoring, personalized insights
- **Strength:** Beautiful UX, non-aggressive paywall
- **Weakness:** Free tier is really solid; hard to convert at $70/year price point

### Fastic (Competitor)
- **Free tier:** Full fasting timer available free
- **Paid:** Fastic PLUS (monthly $2.50-$10 depending on promotion)
- **Strength:** Large user base, multiple features
- **Weakness:** Aggressive paywall/push notifications (users complain), confusing pricing

### Market Insights
- **Free timers work.** Both leaders keep core timer free
- **Price sensitivity is high.** Fastic discounts to $2.50/month to compete
- **Paywall must be non-aggressive.** Zero succeeds by being gentle; Fastic's pushiness causes complaints
- **Food logging is valuable,** but also highest friction
- **Wearable integration** (Apple Watch) is table stakes

---

## Our Advantage (FastTrack MVP)

**What existing apps lack:**
1. **Weekly PDF report** with trends + analysis (not just raw data)
2. **Customizable payoff/goal animations** (debt vs health)
3. **Non-intrusive monetization** (light touch vs aggressive)
4. **Notification-driven engagement** (reminders that feel helpful, not spammy)

**What we'll keep simple:**
- ❌ Don't build food logging (takes time, low conversion on MVP)
- ❌ Don't build wearable integration yet (can add later)
- ✅ Do build simple weight tracking (single number per day)
- ✅ Do build beautiful streak counter (psychological hook)
- ✅ Do build weekly PDF export (email + in-app)

---

## FastTrack MVP Spec

### Free Tier (Forever Free)
- Timer with presets: 16:8, 18:6, 20:4, OMAD, custom
- Streak counter (days)
- Weight log (1 entry per day)
- Notifications (optional)
- Dashboard: Current streak, weight trend, fasting protocol

### Paid Tier ($8/month, $60/year)
- Weekly PDF report with:
  - Streak chart
  - Weight trend line
  - Fasting consistency %
  - Average fasting duration
  - Custom insights
- Advanced notifications (smart timing)
- Custom reminders
- Apple Watch support (basic)
- No ads

### Paywall Strategy
- **Free tier:** Full experience
- **Paywall trigger:** After 5 completed fasts OR day 7 (whichever comes first)
- **Hook:** "Unlock your weekly progress report" (light, not pushy)
- **Messaging:** "See your progress in PDF you can share" (vs Fastic's aggressive discounting)

---

## Tech Stack

### Frontend
- **SwiftUI** (iOS 15+)
- State: @State, @EnvironmentObject
- Local persistence: UserDefaults + FileManager (small data)

### Backend
- **Firebase Realtime Database** (or Supabase alternative)
  - `/users/{uid}/fasts/` - fast logs
  - `/users/{uid}/weight/` - weight logs
  - `/users/{uid}/subscription/` - subscription status

### Monetization
- **Superwall** (recommended for indie developers)
  - Handles paywall UI
  - A/B testing paywalls
  - Stripe integration built-in
- Alternative: **Stripe + custom paywall**

### Analytics
- **Firebase Analytics** (free, built-in)
- Segment: Fasts completed, weight logged, paywall shown, conversion

---

## Build Phases

### Phase 1: Core (Days 1-3)
- [ ] Firebase project setup
- [ ] SwiftUI app structure
- [ ] Timer with presets
- [ ] Streak counter
- [ ] Persistence layer

### Phase 2: Features (Days 4-6)
- [ ] Weight log + chart
- [ ] Push notifications
- [ ] Weekly PDF generation (use Swift PDF libraries)
- [ ] Basic onboarding

### Phase 3: Monetization (Days 7-8)
- [ ] Superwall integration
- [ ] Paywall logic
- [ ] Subscription status sync
- [ ] Analytics events

### Phase 4: Polish & Testing (Days 9-10)
- [ ] TestFlight beta
- [ ] Bug fixes
- [ ] App Store submission

---

## Success Metrics (First 30 Days)

- **Acquisition:** 100+ installs
- **Retention:** 30% day-7 retention
- **Conversion:** 5-10% paywall conversion
- **LTV:** $1-2 per user (first month)

---

## Open Questions
1. Push notification strategy? (Daily, smart timing, optional?)
2. PDF delivery: Email attachment or in-app download?
3. Apple Watch immediately or in v1.1?
4. Social sharing? (Streak badges on Instagram)
