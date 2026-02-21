# FastTrack iOS - Build Instructions (Phase 1)

**Goal:** Get the app running in Xcode simulator, pass all tests.

**Time:** ~30 minutes total

---

## Prerequisites

- Xcode 15.0+ installed
- CocoaPods installed (`sudo gem install cocoapods` if needed)
- Apple ID (for signing)
- 5GB free disk space

---

## Step 1: Create Xcode Project (5 minutes)

### 1.1 Open Xcode
```bash
open /Applications/Xcode.app
```

### 1.2 Create New Project
- File → New → Project
- Select: **iOS → App**
- Click **Next**

### 1.3 Configure Project
- **Product Name:** `FastTrack`
- **Team:** (select your team or personal account)
- **Organization Identifier:** `com.yourname.fasttrack` (or `com.fasttrack.app`)
- **Interface:** SwiftUI
- **Language:** Swift
- **Storage:** None (we're using Firebase)
- **Use Core Data:** No
- **Include Tests:** Yes
- Click **Next** → Choose folder → **Create**

### 1.4 Project Structure Should Look Like
```
FastTrack/
├── FastTrack/
│   ├── FastTrackApp.swift (will replace)
│   ├── ContentView.swift (will replace)
│   ├── Assets.xcassets/
│   └── Preview Content/
├── FastTrackTests/
├── FastTrack.xcodeproj/
└── Podfile (will create)
```

---

## Step 2: Set Up CocoaPods (5 minutes)

### 2.1 Open Terminal

```bash
cd ~/path/to/FastTrack
# (wherever you saved the Xcode project)
```

### 2.2 Create Podfile

Copy the `Podfile` from this directory into your project root:

```bash
cp /home/openclaw/.openclaw/workspace/projects/fasttrack-ios/Podfile .
```

Or create manually:
```bash
pod init
```

Then replace the Podfile contents with the provided Podfile.

### 2.3 Install Pods

```bash
pod install
```

**Expected output:**
```
Analyzing dependencies
...
Pod installation complete! There are X dependencies from the Podfile...
✓ Pods project has been created ...
✓ Workspace 'FastTrack.xcworkspace' has been created
```

### 2.4 Close Xcode, Open Workspace

⚠️ **IMPORTANT:** Close `FastTrack.xcodeproj`, open the workspace instead:

```bash
xed FastTrack.xcworkspace
# or double-click FastTrack.xcworkspace
```

---

## Step 3: Copy Swift Source Files (5 minutes)

### 3.1 In Xcode, Delete Default Files
- Click `ContentView.swift` → Delete → Remove Reference
- Keep `FastTrackApp.swift` for now

### 3.2 Copy Our Swift Files

**Option A: Drag & Drop (Easiest)**
1. Open Finder: `/home/openclaw/.openclaw/workspace/projects/fasttrack-ios/`
2. Select all `.swift` files:
   - `FasttrackApp.swift`
   - `Models.swift`
   - `Managers.swift`
   - `Views.swift`
3. Drag into Xcode project (left sidebar)
4. Make sure "Copy items if needed" is checked
5. Target: FastTrack
6. Click Add

**Option B: Command Line**
```bash
cp /home/openclaw/.openclaw/workspace/projects/fasttrack-ios/*.swift FastTrack/FastTrack/
```

Then in Xcode:
- File → Add Files to "FastTrack"
- Select the `.swift` files you just copied
- Add

### 3.3 Verify in Xcode
You should see in left sidebar:
```
FastTrack/
├── FastTrackApp.swift
├── Models.swift
├── Managers.swift
├── Views.swift
├── ContentView.swift (can delete if still there)
├── Assets.xcassets/
└── Preview Content/
```

---

## Step 4: Configure Firebase (3 minutes)

### 4.1 Get GoogleService-Info.plist

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: **FastTrack**
3. Add iOS app
4. Bundle ID: `com.yourname.fasttrack` (must match Xcode)
5. Download `GoogleService-Info.plist`

### 4.2 Add to Xcode

1. In Xcode: File → Add Files to "FastTrack"
2. Select `GoogleService-Info.plist`
3. ✓ Copy items if needed
4. Target: FastTrack
5. Click Add

---

## Step 5: Build & Run (7 minutes)

### 5.1 Select Simulator

In Xcode top toolbar:
- Click the device selector
- Choose: **iPhone 15** (or any simulator)
- If no simulators, go to Window → Devices and Simulators → Create simulator

### 5.2 Build

```
Cmd+B
```

**Expected:** Build succeeds with 0 errors, 0 warnings

If errors:
- Check Podfile installation (`pod install` again)
- Verify GoogleService-Info.plist is added
- Check bundle ID matches Firebase

### 5.3 Run

```
Cmd+R
```

**Expected:** App launches in simulator → Onboarding screen (sign up form)

---

## Step 6: Run Test Suite (10 minutes)

### 6.1 Onboarding Test (Test A)

1. App is open in simulator
2. See: "FastTrack" title + sign up form
3. Enter email: `testuser@fasttrack.app`
4. Enter password: `TestPassword123!`
5. Enter confirm password: `TestPassword123!`
6. Tap **Sign Up**
7. **Expected:** Dashboard appears, no errors
8. ✅ **Test A: PASS**

### 6.2 Timer Test (Test B)

1. Tap **Fast** tab (timer icon, bottom)
2. See: Protocol buttons (16:8, 18:6, 20:4, OMAD)
3. Select **16:8**
4. Tap **Start Fast** (green button)
5. **Expected:** Timer starts, displays HH:MM:SS countdown, progress circle fills
6. Wait **5 seconds**
7. Tap **End Fast** (red button)
8. **Expected:** Timer stops, modal appears, fast logs
9. ✅ **Test B: PASS**

### 6.3 Dashboard Test (Test C)

1. Tap **Dashboard** tab (grid icon, bottom)
2. **Expected:** See:
   - Streak card: **1** day
   - Stats grid showing:
     - Total Fasts: **1**
     - Longest Streak: **1**
     - Avg Duration: ~5 seconds (or actual time from Test B)
     - Consistency: **100%**
3. ✅ **Test C: PASS**

### 6.4 Weight Logging Test (Test D)

1. Tap **History** tab (calendar icon, bottom)
2. Tap **Log Weight** (blue button at top)
3. Modal opens: "Log Weight"
4. Enter weight: **150**
5. Enter notes: **"post-workout"**
6. Tap **Save Weight**
7. **Expected:** Modal closes, return to History
8. See weight **150** in list
9. Go back to **Dashboard** tab
10. **Expected:** "Weight Change" card appears
11. ✅ **Test D: PASS**

### 6.5 History Test (Test E)

1. Tap **History** tab
2. **Expected:** See two items:
   - Fast from Test B (protocol, date, duration, "Completed" badge)
   - Weight from Test D (150 lbs)
3. Both sorted by date (newest first)
4. ✅ **Test E: PASS**

### 6.6 Settings Test (Test F)

1. Tap **Settings** tab (gear icon, bottom)
2. See:
   - Profile section: Email, Goal, Protocol
   - Notifications section: Toggle + time picker
   - Account section: **Delete Account** button + **Logout**
   - Support section: **Email Support** link
3. Toggle notifications ON/OFF → works
4. Change time → works
5. Tap **Logout** (red button)
6. **Expected:** Return to sign up screen
7. ✅ **Test F: PASS**

### 6.7 Persistence Test (Test G)

1. Sign up again with same email (testuser@fasttrack.app)
2. Go to **Dashboard**
3. **Expected:** All previous data persists:
   - Streak: **1**
   - Total Fasts: **1**
   - Weight: **150**
   - All stats calculated correctly
4. ✅ **Test G: PASS**

### 6.8 State Preservation Test (Test H)

1. Tap **Fast** tab
2. Tap **Start Fast**
3. Timer counting down...
4. Tap **Dashboard** tab → Timer stops
5. Tap **History** tab → Still showing fast as "In Progress"
6. Tap **Settings** tab → Different tab
7. Tap **Fast** tab again
8. **Expected:** Timer still counting down from where it was
9. Tap **End Fast** → Logs successfully
10. ✅ **Test H: PASS**

---

## Expected Results

| Test | Expected | Status |
|------|----------|--------|
| A: Onboarding | Dashboard appears | ✅ or ❌ |
| B: Timer | Countdown works, logs fast | ✅ or ❌ |
| C: Dashboard | Stats calculate correctly | ✅ or ❌ |
| D: Weight Log | Weight appears in history | ✅ or ❌ |
| E: History | Fast + weight both listed | ✅ or ❌ |
| F: Settings | All controls work | ✅ or ❌ |
| G: Persistence | Data survives app restart | ✅ or ❌ |
| H: State | Timer state preserved | ✅ or ❌ |

**Phase 1 Success:** All 8 tests pass ✅

---

## Troubleshooting

### Build Fails
**Error: "Firebase module not found"**
- Run: `pod install` again
- Close Xcode, reopen `.xcworkspace`
- Cmd+Shift+K (clean build folder)
- Cmd+B (rebuild)

### Simulator Crashes on Launch
**Error: "Crash on startup"**
- Check console (Cmd+Shift+C) for error message
- Most likely: Firebase not configured
- Add GoogleService-Info.plist (Step 4)
- Rebuild

### "Module 'Firebase' not found"
- Verify you opened `.xcworkspace` (not `.xcodeproj`)
- Run `pod install` again
- Restart Xcode

### Timer Not Counting Down
- Expected: Timer updates every 1 second
- If not moving: Simulator may be paused (check debug menu)
- Or: Time.now() not advancing (rare)

### Weight Not Appearing
- Expected: Appears in History immediately
- If missing: UserDefaults caching issue
- Fix: Restart simulator (Device → Erase All Content and Settings)

### Tests Pass But Something Feels Off
- Check simulator device (should be iPhone 14/15)
- Try different device size
- Close and reopen simulator

---

## Success Criteria

✅ **Phase 1 Build Complete When:**
1. Xcode builds with 0 errors, 0 warnings
2. All 8 tests (A-H) pass
3. No crashes on normal usage
4. Data persists across app restart
5. Timer counts down accurately

---

## Next: Report Results

After completing all 8 tests, report:

```
# Phase 1 Build Report

**Date:** [Date]
**Device:** iPhone 14 Simulator / [Your device]
**Xcode Version:** [Your version]

## Test Results

| Test | Result | Notes |
|------|--------|-------|
| A: Onboarding | ✅ / ❌ | |
| B: Timer | ✅ / ❌ | |
| C: Dashboard | ✅ / ❌ | |
| D: Weight Log | ✅ / ❌ | |
| E: History | ✅ / ❌ | |
| F: Settings | ✅ / ❌ | |
| G: Persistence | ✅ / ❌ | |
| H: State | ✅ / ❌ | |

## Issues Found

[List any crashes, bugs, or unexpected behavior]

## Build Status

[Clean build with 0 errors / Warnings present / Errors present]
```

---

## Ready?

Follow these steps in order. If you get stuck, reply with:
- The step you're on
- The exact error message
- A screenshot if helpful

Then I'll help debug. Let's ship! 🚀
