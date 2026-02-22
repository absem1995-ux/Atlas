# FastTrack Phase 1 - Testing Guide

**Goal:** Verify all core components work before Phase 2

---

## Unit Tests (Code Logic)

### FastingStats Calculation
```swift
// Test 1: Streak Calculation
let fasts = [
    FastLog(date: Date(timeIntervalSinceNow: 0), completed: true),
    FastLog(date: Date(timeIntervalSinceNow: -86400), completed: true),
    FastLog(date: Date(timeIntervalSinceNow: -172800), completed: true),
]
let stats = FastingStats.calculate(fasts: fasts, weights: [])
assert(stats.current_streak == 3) // Should be 3 day streak
```

### FastLog Duration Calculation
```swift
// Test 2: Duration Calculation
let startTime = Date(timeIntervalSinceNow: -14400) // 4 hours ago
let endTime = Date()
let fast = FastLog(start_time: startTime, end_time: endTime, completed: true)
assert(fast.duration_hours == 4.0)
assert(fast.duration_minutes == 240)
```

### Weight Log Integration
```swift
// Test 3: Weight Change Calculation
let weights = [
    WeightLog(date: Date(timeIntervalSinceNow: -604800), weight: 200), // 1 week ago
    WeightLog(date: Date(), weight: 195), // today
]
let stats = FastingStats.calculate(fasts: [], weights: weights)
assert(stats.weight_change == -5.0) // Lost 5 lbs
```

---

## Integration Tests (Managers)

### FastManager - Local Caching
```swift
// Test 4: Cache & Persistence
let manager = FastManager()

// Log a fast
manager.startFast(protocol: .sixteen_eight)
// ... time passes ...
manager.endCurrentFast()

// Restart app simulation
let newManager = FastManager()
assert(newManager.fasts.count == 1) // Should load from UserDefaults
assert(newManager.stats.total_fasts_completed == 1)
```

### FastManager - Stats Recalculation
```swift
// Test 5: Stats Update
let manager = FastManager()
assert(manager.stats.current_streak == 0)

manager.startFast(protocol: .sixteen_eight)
manager.endCurrentFast()

assert(manager.stats.current_streak == 1)
assert(manager.stats.total_fasts_completed == 1)
```

### Weight Logging
```swift
// Test 6: Weight Tracking
let manager = FastManager()
manager.logWeight(200)
manager.logWeight(199)

assert(manager.weights.count == 2)
assert(manager.stats.weight_change == -1.0)
```

---

## UI Tests (Manual in Simulator)

### Test A: Onboarding Flow
1. Open app
2. See login screen
3. Enter email (test@example.com)
4. Enter password (testpass123)
5. Tap Sign Up
6. **Expected:** Dashboard appears, no errors

### Test B: Timer Functionality
1. Go to "Fast" tab
2. See protocol buttons (16:8, 18:6, etc.)
3. Select 16:8
4. Tap "Start Fast"
5. **Expected:** Timer starts counting down from 57600 (16 hours)
6. Wait 5 seconds
7. Tap "End Fast"
8. **Expected:** Timer stops, fast logs, Dashboard updates

### Test C: Stats Display
1. After Test B, go to Dashboard
2. **Expected:**
   - Streak: 1 day
   - Total Fasts: 1
   - Longest Streak: 1
   - Avg Duration: ~5 seconds (or actual duration)
   - Consistency: 100%

### Test D: Weight Logging
1. Go to History tab
2. Tap "Log Weight"
3. Enter 150
4. Add note: "post-workout"
5. Tap Save
6. **Expected:** Modal closes, weight appears in list
7. Go to Dashboard
8. **Expected:** "Weight Change" card appears (if multiple weights logged)

### Test E: History View
1. Go to History tab
2. **Expected:**
   - Fast from Test B appears
   - Shows protocol, date, duration
   - Marked as "Completed"
   - Weight from Test D appears

### Test F: Settings
1. Go to Settings tab
2. See profile email
3. Toggle notifications ON
4. Set reminder time to 9:00 AM
5. Tap Logout
6. **Expected:** Return to login screen

### Test G: Persistence
1. Perform Test B-E (fasts + weights)
2. Swipe up to kill app
3. Reopen app
4. Go to Dashboard
5. **Expected:** All stats persist, no data lost

### Test H: State Transitions
1. Start a fast (don't end it)
2. Switch to Dashboard tab
3. Switch to History tab
4. Switch to Settings tab
5. Return to Fast tab
6. **Expected:** Timer still counting down, state preserved
7. End the fast
8. **Expected:** Logged successfully

---

## Performance Benchmarks

| Operation | Target | Acceptable |
|-----------|--------|-----------|
| Timer update frequency | 1 per second | ±0.1s |
| Stats recalculation | <50ms | <100ms |
| Data persistence | <10ms | <50ms |
| App cold start | <2s | <3s |
| Tab switch | <100ms | <200ms |

---

## Crash Testing

**Stress Test:** Rapid Actions
1. Start fast
2. End fast
3. Log weight
4. Switch tabs
5. Change protocol
6. Restart app
7. Repeat 5x

**Expected:** No crashes, all data preserved

---

## Verification Checklist

- [ ] All unit tests pass (streak calc, duration, weight change)
- [ ] All integration tests pass (caching, stats, weight)
- [ ] All 8 UI tests pass (A-H above)
- [ ] No console errors/warnings
- [ ] No crashes on stress test
- [ ] Data persists across app restart
- [ ] Timer accuracy is <1 second drift per minute

---

## Known Issues to Watch

1. **Timer Drift** - System timers can drift; acceptable if <1% over 1 hour
2. **Firebase Not Connected** - Fasts/weights won't sync to cloud in Phase 1
3. **Notifications Not Wired** - Toggles work, but no actual notifications yet
4. **Apple Watch Code Absent** - Stub only, real functionality in Phase 2

---

## How to Report Issues

Format:
```
**Bug:** [Short description]
**Steps to reproduce:**
1. 
2. 
3. 
**Expected:** 
**Actual:** 
**Frequency:** [Always / Sometimes / Rare]
**Device:** [iPhone 15 Pro Simulator / etc.]
```

Example:
```
**Bug:** Timer doesn't stop after tapping "End Fast"
**Steps:** 
1. Tap Start Fast
2. Wait 5 sec
3. Tap End Fast
**Expected:** Timer resets, fast logs
**Actual:** Timer still counting, no log
**Frequency:** Always
**Device:** iPhone 15 Simulator iOS 17.2
```
