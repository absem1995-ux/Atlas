# FastTrack iOS App - App Store Submission Checklist

**Purpose:** Ensure we don't miss any Apple requirements that get apps rejected.

---

## Pre-Submission Requirements

### Account Management
- [ ] **Account Deletion** - Users can delete their account in Settings
  - [ ] Implement: Settings → Account → Delete Account button
  - [ ] Confirmation dialog: "This cannot be undone"
  - [ ] Firebase delete user + profile data
  - [ ] Verification: Test deletion flow works

- [ ] **No "Beta" Labels**
  - [ ] Search entire codebase for "beta", "coming soon", "beta test"
  - [ ] Remove from UI, marketing copy, descriptions
  - [ ] App must be production-ready

- [ ] **No Android References**
  - [ ] If building Android later, don't mention it in iOS app
  - [ ] No "Coming to Android" in app description
  - [ ] No "Download our Android app" links

- [ ] **No Competitor Names**
  - [ ] Remove references to Zero, Fastic, other fasting apps
  - [ ] Don't compare or mention competitors
  - [ ] Only mention your own features

### Safety & Legal
- [ ] **LLM Safeguards** (if applicable later)
  - [ ] If adding AI features, filter explicit content
  - [ ] Age-appropriate responses only
  - [ ] Document any AI usage

- [ ] **No Copyrighted Content**
  - [ ] All UI graphics are original or licensed
  - [ ] Icons are from SF Symbols or original
  - [ ] No copyrighted music/sound
  - [ ] No third-party brand logos

- [ ] **Apple Design Guidelines (HIG)**
  - [ ] Follow spacing/padding recommendations
  - [ ] Use system fonts (SF Pro)
  - [ ] Use system colors (blue, red, green)
  - [ ] Safe area padding on all screens
  - [ ] Back button placement (top-left)
  - [ ] Status bar visibility

---

## Reviewer Requirements

### Test Account
- [ ] **Create Test Account for Reviewers**
  - Email: `testuser@fasttrack.app` (or your domain)
  - Password: `TestPassword123!`
  - Subscription: Free tier enabled
  - [ ] Document in App Store submission notes
  - [ ] Create account before submission
  - [ ] Verify it's usable throughout full feature set

### Screen Recordings
- [ ] **Record Complex Features**
  - [ ] Timer start → countdown → end (15 sec video)
  - [ ] Weight logging + dashboard update (10 sec)
  - [ ] Streak calculation (10 sec)
  - [ ] Save as `.mov` files
  - [ ] Keep under 30 seconds each
  - [ ] Clear, uncluttered
  - [ ] No background music needed

### Documentation
- [ ] **In-App Instructions** (if needed)
  - [ ] First-run tutorial (optional)
  - [ ] Help section in Settings
  - [ ] Clear onboarding flow

---

## App Store Listing

### Landing Page
- [ ] **Website** (yourdomain.com)
  - [ ] Home page explaining FastTrack
  - [ ] Feature overview
  - [ ] Pricing
  - [ ] Download link to App Store
  - [ ] Screenshots
  - [ ] "Download on App Store" button

### Privacy Policy
- [ ] **Privacy Policy URL** (yourdomain.com/privacy)
  - [ ] Explains what data is collected
  - [ ] How data is stored (Firebase)
  - [ ] How data is deleted (user deletion)
  - [ ] Third-party services (Firebase, Stripe)
  - [ ] GDPR/CCPA compliance
  - [ ] Cookie policy (if applicable)
  - Link this URL in App Store listing

### Terms of Service
- [ ] **Terms URL** (yourdomain.com/terms)
  - [ ] Subscription terms
  - [ ] User responsibilities
  - [ ] Limitation of liability
  - [ ] Link in App Store listing

### Pricing & Subscription
- [ ] **Clear Upfront Pricing**
  - [ ] Free tier: Full timer, basic streak, weight log
  - [ ] Premium: $8/month (or $60/year, 20% discount)
  - [ ] Show pricing in app BEFORE paywall
  - [ ] In Settings → Subscription (if purchased)
  - [ ] Easy renew/cancel info
  - [ ] Link to: manage.itunes.apple.com in app
  - [ ] First 3 days free? (Optional, add if desired)

### Contact Information
- [ ] **Support Email** (support@yourdomain.com or name@yourdomain.com)
  - [ ] Display in Settings → Help & Feedback
  - [ ] Add to website footer
  - [ ] Monitor inbox for reviewer questions

### App Description
- [ ] **Clear, Compelling Description**
  - Don't use: "beta", "coming soon", competitor names
  - Do use: "Track your intermittent fasting streaks"
  - Highlight: Timer, streaks, weight tracking, reports
  - Keep under 170 characters (summary)
  - Full description: 4-8 bullet points

Example:
```
FastTrack - Intermittent Fasting Tracker

Track your fasting streaks and reach your goals.

• Simple timer for 16:8, 18:6, 20:4, OMAD, and custom protocols
• Streak counter for daily motivation
• Weight tracking and progress charts
• Weekly reports (Premium)
• Apple Watch support
• Offline mode - works without internet

Privacy first. No ads. No data selling.
```

### Screenshots (5-7 required)
- [ ] **Screenshot 1: Dashboard**
  - [ ] Shows streak (biggest, most impressive number)
  - [ ] Clean, uncluttered
  - [ ] Add overlay text: "Track Your Streak"

- [ ] **Screenshot 2: Timer**
  - [ ] Mid-countdown (timer running)
  - [ ] Overlay: "Simple Fasting Timer"

- [ ] **Screenshot 3: History**
  - [ ] Past fasts listed
  - [ ] Overlay: "View Your Progress"

- [ ] **Screenshot 4: Weight Tracking**
  - [ ] Weight log + chart
  - [ ] Overlay: "Monitor Your Weight"

- [ ] **Screenshot 5: Stats**
  - [ ] Consistency, avg duration
  - [ ] Overlay: "Stay Consistent"

- [ ] **Screenshot 6: Settings (Premium)**
  - [ ] Subscription info
  - [ ] Overlay: "Unlock Premium Features"

- [ ] **Screenshot 7: Apple Watch (if included)**
  - [ ] Watch app interface
  - [ ] Overlay: "On Your Wrist"

**Screenshot Best Practices:**
- Use iPhone 14 Pro (6.1") as reference
- Add 1-2 lines of text per screenshot
- Use Sans-serif font (system)
- No clutter, highlight core features
- Consistent branding/colors
- Test readability on small screens

---

## Age Rating

- [ ] **Complete Age Rating Questionnaire**
  - [ ] Fasting/health app → No violence, explicit content, etc.
  - [ ] Rating: 4+ (General Audiences)
  - [ ] No objectionable content
  - [ ] Safe for all ages

---

## Design & UX Compliance

### Apple Human Interface Guidelines (HIG)
- [ ] **Spacing & Padding**
  - [ ] 16pt padding on left/right
  - [ ] 20pt spacing between sections
  - [ ] Proper safe area insets

- [ ] **Typography**
  - [ ] Title: .system(size: 32, weight: .bold)
  - [ ] Headline: .system(size: 17, weight: .semibold)
  - [ ] Body: .system(size: 17, weight: .regular)
  - [ ] Caption: .system(size: 13, weight: .regular)

- [ ] **Colors**
  - [ ] Use system colors (blue, green, red, orange, purple)
  - [ ] Dark mode support (automatic)
  - [ ] Sufficient contrast (WCAG AA)

- [ ] **Navigation**
  - [ ] Back button always top-left
  - [ ] Tab bar always at bottom (not top)
  - [ ] Swipe back works (NavigationStack)

- [ ] **Status Bar**
  - [ ] Visible on all screens
  - [ ] Time, battery, signal visible
  - [ ] No custom status bar

---

## Testing Checklist

### Device & Screen Size Testing
- [ ] **iPhone SE (2nd gen)** - 4.7"
  - [ ] All buttons reachable
  - [ ] No text overflow
  - [ ] Numbers readable

- [ ] **iPhone 14/15** - 6.1"
  - [ ] Default test device
  - [ ] All features work
  - [ ] Layout correct

- [ ] **iPhone 14/15 Pro Max** - 6.7"
  - [ ] Content doesn't stretch too wide
  - [ ] Proper padding

- [ ] **Landscape mode** (if supported)
  - [ ] Timer view rotates
  - [ ] Stats grid relayouts
  - [ ] No cutoffs

### Feature Testing (Full Walkthrough)
- [ ] **Onboarding**
  - [ ] Sign up works
  - [ ] Sign in works
  - [ ] Test account (testuser@fasttrack.app) created

- [ ] **Timer**
  - [ ] Start fast (16:8)
  - [ ] Wait 10 seconds
  - [ ] Stop fast
  - [ ] Verify logged

- [ ] **Dashboard**
  - [ ] Streak shows 1
  - [ ] Total fasts shows 1
  - [ ] Consistency shows 100%
  - [ ] All stats calculate correctly

- [ ] **Weight Log**
  - [ ] Log weight (150 lbs)
  - [ ] Add notes
  - [ ] Verify appears in history
  - [ ] Dashboard shows weight change

- [ ] **History**
  - [ ] Fast from earlier appears
  - [ ] Weight entry appears
  - [ ] Both sorted by date
  - [ ] Details correct (protocol, duration, date)

- [ ] **Settings**
  - [ ] Profile email displays
  - [ ] Notification toggle works
  - [ ] Time picker works
  - [ ] Logout works (returns to login)

- [ ] **Account Deletion**
  - [ ] Settings → Account → Delete
  - [ ] Confirmation dialog appears
  - [ ] After deletion: Can sign up with same email
  - [ ] No old data remains

- [ ] **Subscription (if Premium)**
  - [ ] Show paywall after 3 fasts
  - [ ] Monthly price displays
  - [ ] Annual price displays
  - [ ] Subscription link works (manage.itunes.apple.com)

- [ ] **Offline Mode**
  - [ ] Turn off WiFi/cellular
  - [ ] App still works (local data)
  - [ ] Timer still counts down
  - [ ] Turn connectivity back on
  - [ ] No crashes

### Performance Testing
- [ ] **App Launch**
  - [ ] Cold start < 2 seconds
  - [ ] Warm start < 1 second
  - [ ] No hanging/freezing

- [ ] **Timer Accuracy**
  - [ ] Start timer, let run for 60 seconds
  - [ ] Actual elapsed ≈ 60 seconds (±1%)
  - [ ] No drift on long runs

- [ ] **Memory**
  - [ ] Open/close app 10x
  - [ ] No memory leaks
  - [ ] RAM usage < 200MB

- [ ] **Battery**
  - [ ] Timer running for 1 hour
  - [ ] Battery drain normal (not excessive)

### Bug Testing
- [ ] **Crash Testing**
  - [ ] Rapid tab switching (50x)
  - [ ] Start/stop fast repeatedly (20x)
  - [ ] No crashes

- [ ] **Edge Cases**
  - [ ] Start fast at 11:59 PM (crosses midnight)
  - [ ] Log weight with decimal (150.5)
  - [ ] Long notes (500+ characters)
  - [ ] All work correctly

- [ ] **Network Errors** (when Firebase active)
  - [ ] Poor connection (throttle network)
  - [ ] Airplane mode → normal
  - [ ] App handles gracefully
  - [ ] No infinite spinners

---

## Before Hitting Submit

### Final Checklist
- [ ] Build in Release mode
- [ ] Test on physical iPhone (not just simulator)
- [ ] Build number bumped (e.g., 1.0.0)
- [ ] Screenshots finalized & uploaded
- [ ] App description finalized
- [ ] Privacy policy URL live
- [ ] Contact email monitored
- [ ] Test account created & verified
- [ ] All 7 manual tests pass (TESTING.md)
- [ ] No beta/coming soon text anywhere
- [ ] No competitor app mentions
- [ ] No console errors/warnings (clean build)
- [ ] Code signed properly
- [ ] TestFlight build successful
- [ ] Version number correct in Info.plist

### Final Review
- [ ] Read your own app description (does it make sense?)
- [ ] Check screenshots (are they clear?)
- [ ] Verify pricing is shown upfront
- [ ] Confirm privacy policy is accessible
- [ ] Make sure help email works
- [ ] App actually launches and works

---

## Common Rejection Reasons (Avoid These!)

❌ **Will Get Rejected:**
- "Beta" anywhere in app
- Account signup but no deletion
- Hidden features or dark patterns
- Misleading screenshots
- Unclear pricing
- No privacy policy
- Copyrighted content
- Crashes on basic features
- "Coming soon" messaging

✅ **Will Get Approved:**
- Clean, simple UI
- Clear pricing upfront
- Account deletion if signup
- Full privacy policy
- Actual working app
- Tested on real devices
- Proper App Store listing

---

## Timeline

| Phase | Task | Days |
|-------|------|------|
| Phase 1 | Core app (DONE) | ✅ |
| Phase 2 | Firebase + PDF + Notifications | 8-12 |
| Phase 3 | Marketing (landing page, privacy policy) | 3-5 |
| Phase 4 | Screenshots + store listing | 2-3 |
| Phase 5 | Full testing on device | 2-3 |
| Phase 6 | TestFlight submit + review | 1 day |
| Phase 7 | App Store review (3-5 days) | 3-5 |

**Total: 21-33 days to App Store approval**

---

## Tracking

Use this checklist in every submission:
- [ ] Copy this entire checklist
- [ ] Check off items as completed
- [ ] Before submit: All items checked
- [ ] If rejection: Note reason here, fix, resubmit

---

## Questions Before Submission?

Ask:
- What is yourdomain.com? (We'll use fasttrack.app or similar)
- Do you want Premium in MVP or launch free-only first?
- Apple Watch in MVP or Phase 2?
- Test account: What email format do you prefer?

All of this is now **locked into the build plan**. No surprises at submission time.
