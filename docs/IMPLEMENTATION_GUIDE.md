# CalmBet 2.0 - Implementation Guide
## Upgrade from 7.5/10 → 10.1/10

This document outlines all changes needed to transform CalmBet into a world-class matched betting calculator with industry-leading harm minimisation.

---

## 📋 Table of Contents

1. [Overview of Changes](#overview-of-changes)
2. [New Features](#new-features)
3. [Enhanced Features](#enhanced-features)
4. [File Changes](#file-changes)
5. [Database Schema](#database-schema)
6. [Testing Requirements](#testing-requirements)
7. [Deployment Checklist](#deployment-checklist)

---

## 🎯 Overview of Changes

### Core Additions
- ✅ Horse Racing Calculator with Each-Way Support
- ✅ Sport Switching (Football ⚽ / Horse Racing 🐴)
- ✅ Statistical Anomaly Detection
- ✅ Enhanced Harm Minimisation (Reality Checks, Cooling Periods, Loss Limits)
- ✅ Advanced Filtering System
- ✅ Persistent Data Storage
- ✅ Reality Check Modals
- ✅ Self-Exclusion Functionality

### Enhanced Existing Features
- ✅ Strengthened Safety Interventions (Blocks instead of warnings)
- ✅ Weekly/Monthly Stake Tracking
- ✅ Consecutive Loss/Win Streak Detection
- ✅ Time-Based Session Analytics
- ✅ Enhanced GambleAware Integration

---

## 🆕 New Features

### 1. Horse Racing Support 🐴

**Files to Create:**
- `components/HorseRacingCard.tsx` - Display horse racing opportunities
- `app/horse-racing/[id].tsx` - Horse racing bet details screen
- `mocks/horseRacingOpportunities.ts` - Mock horse racing data

**Key Functions:**
```typescript
// In utils/calculations.ts
calculateHorseRacingOpportunity(
  opportunity: HorseRacingOpportunity,
  backStake: number,
  commission: number,
  betType: 'standard' | 'each-way'
): CalculatedHorseRacingOpportunity
```

**Each-Way Calculator Logic:**
- Split stake equally between win and place bets
- Calculate place odds using bookmaker terms (1/4 or 1/5)
- Three profit scenarios: Win, Place Only, Lose
- Display all three outcomes clearly

**UI Requirements:**
- Show horse name, race course, race time
- Display win odds and place odds separately
- Show place terms (e.g., "1/4 odds, 3 places")
- Each-way toggle switch
- Clear breakdown of win/place stakes and liabilities

### 2. Sport Switching

**Implementation:**
```typescript
// In contexts/AppContext.tsx
const [currentSport, setCurrentSport] = useState<Sport>('football');

// Filter opportunities by sport
const filteredOpportunities = opportunities.filter(
  opp => opp.sport === currentSport
);
```

**UI Components:**
- Sport selector in header/navigation
- Visual icons: ⚽ Football, 🐴 Horse Racing
- Smooth tab switching animation
- Persist selection in AsyncStorage

### 3. Statistical Anomaly Detection

**Detection Algorithm:**
```typescript
export function detectAnomaly(opportunity: Opportunity): {
  type: 'boost' | 'liquidity' | 'margin' | null;
  severity: 'low' | 'medium' | 'high';
  description: string;
} | null
```

**Anomaly Types:**
1. **Odds Boost** - Bookmaker promotional odds (5%+ better than typical)
2. **Liquidity Spike** - Unusually high Betfair liquidity (2.5x+ average)
3. **Tight Margin** - Unusually low overround (<1% margin)

**UI Display:**
- Badge on opportunity cards: "⚡ Boost" / "💧 High Liquidity" / "📊 Low Margin"
- Color-coded severity (green = low, orange = medium, red = high)
- Filter to show only anomalies
- Explanation tooltips for each anomaly type

### 4. Reality Check System

**Trigger Conditions:**
- Every 60 minutes (default, configurable)
- After completing 10 actions in one session
- When daily stake exceeds 50% of limit
- After 3 consecutive losses

**Modal Display:**
```typescript
interface RealityCheckData {
  sessionDuration: number; // minutes
  totalStaked: number;
  netProfit: number;
  actionsCompleted: number;
  averageStake: number;
}
```

**UI Requirements:**
- Full-screen modal (cannot be dismissed quickly)
- Display session stats prominently
- Two clear buttons: "Continue" and "Take a Break"
- If "Continue" → require 5-second hold button
- If losses exceed £50 → suggest taking a break
- Link to GambleAware resources

### 5. Enhanced Harm Minimisation

**New Intervention Levels:**
```typescript
enum InterventionLevel {
  NONE = 'none',
  GENTLE_NUDGE = 'gentle_nudge',     // Dismissible message
  WARNING = 'warning',                // Modal with continue option
  MANDATORY_BREAK = 'mandatory_break', // 15-min forced break
  BLOCKED = 'blocked'                 // Action completely prevented
}
```

**Intervention Types:**

**A. Loss Limit Enforcement**
- Track daily/weekly/monthly losses
- Level progression:
  - 50% of limit → GENTLE_NUDGE
  - 80% of limit → WARNING
  - 100% of limit → BLOCKED (no override)
- Display time until limit resets

**B. Consecutive Loss Detection**
- Track consecutive losing actions
- 3 losses → GENTLE_NUDGE ("Consider taking a break")
- 5 losses → WARNING ("You're on a losing streak")
- 7 losses → MANDATORY_BREAK (15 minutes)

**C. Time-Based Interventions**
- Session >2 hours → GENTLE_NUDGE
- Session >3 hours → WARNING
- Session >4 hours → MANDATORY_BREAK

**D. Stake Escalation Detection**
- If stake is 2x average → WARNING
- If stake is 3x average → Require justification
- Prevent chasing losses

### 6. Self-Exclusion

**Implementation:**
```typescript
interface SelfExclusionSettings {
  isActive: boolean;
  exclusionUntil: Date | null;
  duration: 24 | 48 | 168 | 720 hours; // 1 day, 2 days, 1 week, 1 month
  canReduceDuration: boolean;
}
```

**UI Flow:**
1. Settings → "Take a Break from Betting"
2. Choose duration: 24h, 48h, 1 week, 1 month
3. Confirmation screen with warning
4. During exclusion:
   - App displays countdown timer
   - All betting features disabled
   - Access to educational resources only
   - Links to GambleAware, GamCare, GamStop
5. Cannot reduce duration (can only extend)

### 7. Advanced Filtering

**Filter Options:**
```typescript
interface OpportunityFilters {
  sports: Sport[];
  bookmakers: Bookmaker[];
  minQualifyingLoss: number;
  maxQualifyingLoss: number;
  minLiquidity: number;
  timeUntilKickoff: { min: number; max: number }; // hours
  competitions: string[];
  showBoostsOnly: boolean;
  showArbsOnly: boolean;
  sortBy: 'best-ql' | 'time' | 'liquidity' | 'bookmaker';
}
```

**UI Implementation:**
- Filter button opens bottom sheet modal
- Toggle switches for each bookmaker
- Sliders for numeric ranges
- "Apply Filters" saves to AsyncStorage
- Show active filter count badge

---

## 🔧 Enhanced Features

### 1. Data Persistence (AsyncStorage)

**Keys to Store:**
```typescript
const STORAGE_KEYS = {
  USER_SETTINGS: '@calmbet:settings',
  SESSION_STATS: '@calmbet:session',
  COMPLETED_HISTORY: '@calmbet:history',
  DISMISSED_NUDGES: '@calmbet:nudges',
  LAST_REALITY_CHECK: '@calmbet:reality',
  SELF_EXCLUSION: '@calmbet:exclusion',
  FILTER_PREFERENCES: '@calmbet:filters',
};
```

**Implementation:**
```typescript
// In contexts/AppContext.tsx
useEffect(() => {
  const loadSettings = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (stored) setSettings(JSON.parse(stored));
  };
  loadSettings();
}, []);

useEffect(() => {
  AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
}, [settings]);
```

### 2. Enhanced Settings Screen

**New Settings Sections:**

**A. Sport Preferences**
- Default sport selection
- Hide/show specific bookmakers per sport
- Minimum liquidity per sport

**B. Safety Limits** (Enhanced)
- Loss limits (daily/weekly/monthly) with ENFORCEMENT
- Time limits (session duration warning thresholds)
- Cooling-off period duration (15, 30, 60 minutes)
- Consecutive loss limit before break

**C. Reality Checks**
- Enable/disable reality checks
- Frequency (30, 60, 90, 120 minutes)
- Trigger after X actions

**D. Notifications** (Future)
- Odds movement alerts
- New opportunity notifications
- Safety intervention reminders

**E. Support Resources** (Enhanced)
- GambleAware (existing)
- GamCare (existing)
- GamStop (NEW) - National Self-Exclusion Scheme
- National Gambling Helpline: 0808 8020 133
- "If you're struggling" section with assessment quiz

### 3. Enhanced History Screen

**New Analytics:**
```typescript
interface HistoryAnalytics {
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  winRate: number;
  avgStake: number;
  bestBookmaker: Bookmaker;
  profitByDay: { date: string; profit: number }[];
  profitBySport: { sport: Sport; profit: number }[];
}
```

**UI Sections:**
- Overall statistics card
- Profit trend chart (last 7/30 days)
- Breakdown by sport
- Breakdown by bookmaker
- List of all completed opportunities
- Export history to CSV button

### 4. Enhanced Opportunity Cards

**Additional Information:**
- Anomaly badges (boost, liquidity, margin)
- Time until kickoff with color coding:
  - Red: < 30 minutes
  - Orange: < 2 hours
  - Green: > 2 hours
- Match confidence percentage
- Liquidity status indicator
- Quick action buttons (bookmark, hide)

### 5. Enhanced Opportunity Detail Screen

**New Features:**
- Stake adjustment with live recalculation
- Profit scenarios visualization
- Liquidity health indicator
- Odds movement history (if available)
- Similar opportunities section
- "Report Issue" button

---

## 📁 File Changes

### New Files to Create

```
calmbet-upgraded/
├── components/
│   ├── HorseRacingCard.tsx          # Horse racing opportunity display
│   ├── SportSelector.tsx            # Sport switching component
│   ├── AnomalyBadge.tsx             # Display anomaly indicators
│   ├── RealityCheckModal.tsx        # Reality check intervention
│   ├── SafetyInterventionModal.tsx  # Enhanced safety modals
│   ├── FilterSheet.tsx              # Advanced filtering UI
│   ├── SelfExclusionModal.tsx       # Self-exclusion interface
│   └── StatsCard.tsx                # Reusable stats display
│
├── contexts/
│   ├── StorageContext.tsx           # AsyncStorage abstraction
│   └── FilterContext.tsx            # Filter state management
│
├── utils/
│   ├── storage.ts                   # Storage helper functions
│   ├── analytics.ts                 # Analytics calculations
│   └── validators.ts                # Input validation
│
├── hooks/
│   ├── useRealityCheck.ts           # Reality check logic
│   ├── useSafetyCheck.ts            # Safety intervention logic
│   └── useFilters.ts                # Filter management
│
├── mocks/
│   ├── horseRacingOpportunities.ts  # Horse racing mock data
│   └── mockAnalytics.ts             # Analytics mock data
│
└── screens/ (or app/)
    └── horse-racing/
        └── [id].tsx                 # Horse racing details
```

### Files to Modify

**High Priority:**
1. `types/index.ts` - ✅ COMPLETED (add horse racing, enhanced settings)
2. `utils/calculations.ts` - ✅ COMPLETED (add horse racing calculations)
3. `contexts/AppContext.tsx` - Add storage, sport switching, enhanced tracking
4. `contexts/HarmMinimisationContext.tsx` - Add enhanced interventions
5. `app/(tabs)/(feed)/index.tsx` - Add sport filtering, anomaly display
6. `app/(tabs)/settings/index.tsx` - Add new settings sections
7. `app/(tabs)/history/index.tsx` - Add analytics dashboard
8. `app/opportunity/[id].tsx` - Add anomaly info, enhanced actions
9. `constants/colors.ts` - Add colors for anomaly badges

**Medium Priority:**
10. `components/OpportunityCard.tsx` - Add anomaly badges, sport icons
11. `components/NudgeModal.tsx` - Enhance with intervention levels
12. `app/_layout.tsx` - Add storage initialization
13. `package.json` - Add @react-native-async-storage/async-storage

---

## 🗄️ Database Schema (AsyncStorage)

### User Settings
```json
{
  "defaultBackStake": 10,
  "commission": 2,
  "defaultSport": "football",
  "maxDailyStake": 500,
  "maxWeeklyStake": 2000,
  "maxMonthlyStake": 5000,
  "lossLimitEnabled": true,
  "lossLimitAmount": 100,
  "realityCheckEnabled": true,
  "realityCheckInterval": 60,
  "coolingOffPeriodMinutes": 15,
  "hiddenBookmakers": [],
  "quietHoursEnabled": true,
  "quietHoursStart": "23:30",
  "quietHoursEnd": "07:00"
}
```

### Session Stats
```json
{
  "sessionStartTime": "2026-01-31T15:00:00Z",
  "lastActionTime": "2026-01-31T16:30:00Z",
  "lastRealityCheck": "2026-01-31T16:00:00Z",
  "currentSessionActions": 8,
  "todayStake": 120.00,
  "todayProfit": -5.50,
  "todayLoss": 5.50,
  "weeklyStake": 450.00,
  "weeklyProfit": 12.30,
  "monthlyStake": 1250.00,
  "monthlyProfit": 45.80,
  "consecutiveLosses": 2,
  "consecutiveWins": 0,
  "totalSessionTime": 90
}
```

### Completed History
```json
{
  "opportunities": [
    {
      "id": "c1",
      "completedAt": "2026-01-31T15:45:00Z",
      "status": "done",
      "sport": "football",
      "backStake": 10,
      "actualProfit": -0.32,
      "bookmaker": "bet365"
    }
  ],
  "lastUpdated": "2026-01-31T16:30:00Z"
}
```

### Self-Exclusion State
```json
{
  "isActive": true,
  "exclusionUntil": "2026-02-01T15:00:00Z",
  "startedAt": "2026-01-31T15:00:00Z",
  "duration": 24,
  "canReduceDuration": false
}
```

---

## 🧪 Testing Requirements

### Unit Tests
1. Horse racing calculation accuracy
2. Each-way bet profit scenarios
3. Anomaly detection algorithm
4. Safety intervention trigger logic
5. Loss limit calculations
6. Reality check timing

### Integration Tests
1. Storage persistence across app restarts
2. Sport switching maintains state
3. Filter application updates feed correctly
4. Self-exclusion blocks all betting actions
5. Reality check appears at correct intervals

### User Acceptance Tests
1. Complete a standard football bet
2. Complete an each-way horse racing bet
3. Trigger all safety interventions
4. Enable self-exclusion and verify lock
5. Adjust filters and verify results
6. Reality check appears and displays correct stats
7. Loss limit blocks betting when reached

### Accessibility Tests
1. VoiceOver/TalkBack support for all new screens
2. Color contrast for anomaly badges
3. Text scaling support
4. Keyboard navigation for filter sheet

---

## 🚀 Deployment Checklist

### Pre-Launch
- [ ] All calculations tested and verified
- [ ] Horse racing each-way formula double-checked
- [ ] Safety interventions cannot be bypassed
- [ ] Self-exclusion cannot be reduced
- [ ] All AsyncStorage keys properly namespaced
- [ ] Reality check tested at all intervals
- [ ] Anomaly detection calibrated with real data

### App Store Compliance
- [ ] Age restriction: 18+ (required for gambling apps)
- [ ] Gambling disclaimer in app description
- [ ] Privacy policy updated for data storage
- [ ] Links to GambleAware, GamCare, GamStop
- [ ] Screenshots show responsible gambling features
- [ ] App Store category: Utilities or Finance (NOT Games)

### Legal Requirements (UK)
- [ ] "18+" displayed prominently
- [ ] "BeGambleAware.org" link visible in settings
- [ ] Self-exclusion functionality clearly advertised
- [ ] No encouragement to gamble more
- [ ] No targeting of vulnerable individuals
- [ ] Clear explanation this is a CALCULATOR, not a betting platform

### Post-Launch Monitoring
- [ ] Track reality check acceptance rate
- [ ] Monitor self-exclusion activation rate
- [ ] Analyze intervention effectiveness
- [ ] Collect feedback on horse racing calculator
- [ ] Monitor for calculation errors
- [ ] Track user retention after safety interventions

---

## 📊 Success Metrics

### Harm Minimisation Effectiveness
- **Reality Check Engagement:** >60% take action after viewing
- **Self-Exclusion Usage:** >5% of users activate at some point
- **Break Acceptance:** >40% accept break suggestions
- **Loss Limit Adherence:** <5% attempt to override
- **Session Duration:** Average <45 minutes

### Feature Adoption
- **Horse Racing Usage:** >30% of users try within first week
- **Each-Way Calculator:** >50% of horse racing users
- **Anomaly Filter:** >40% enable boost filter
- **Advanced Filters:** >25% customize beyond defaults

### User Satisfaction
- **App Store Rating:** >4.5 stars
- **Crash-Free Rate:** >99.5%
- **Load Time:** <2 seconds
- **Calculation Accuracy:** 100% (zero reported errors)

---

## 🎯 Next Phase Ideas

After achieving 10.1/10, consider:

1. **API Integration** - Live odds from bookmakers
2. **Push Notifications** - Opportunity alerts
3. **Account Linking** - Track actual bets placed
4. **Social Features** - Tips sharing (with caution)
5. **AI Recommendations** - Personalized opportunities
6. **Multi-Currency** - Support USD, EUR
7. **Dutching Calculator** - Multiple selections
8. **Arbitrage Finder** - Guaranteed profit opportunities
9. **Profit Tracker** - Integration with banking APIs
10. **Educational Content** - In-app tutorials

---

**Document Version:** 2.0  
**Last Updated:** January 31, 2026  
**Status:** Ready for Implementation  
**Target Rating:** 10.1/10 ⭐⭐⭐⭐⭐
