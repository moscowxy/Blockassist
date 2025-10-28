# Base Blackjack UI Blueprint

This document transcribes the product requirements into concrete UI modules ready for a Base miniapp or standard web dApp.

## Dashboard Panels

Implement a two-tab navigation bar pinned to the top of the canvas:

- **Main Menu:** default active tab that surfaces the dashboard panels below.
- **Token:** secondary tab that, until the token launches, renders the hero copy `$Black Soon` and a footer note `Coming soon—your engagement boosts your future share.` to set expectations for early participants.

Persist the tab state in client storage so Farcaster users returning via deep links land on their last viewed section.

| Component | Data Source | Notes |
|-----------|-------------|-------|
| Weekly Reward Pool card | `getWeeklyStats().estimatedRewardPool` and `getWeeklyStats().totalGames` | Highlight live USD estimate, growth delta, and games played. Trigger pool milestone notifications when thresholds (`$1k`, `$5k`, `$10k`) are crossed. |
| Player Snapshot | `weeklyWins(msg.sender)`, `estimateUserReward(msg.sender)`, `totalGamesPlayed` mapping | Display Win count, estimated payout, total games, and win rate. Encourage another play with CTA `Start Game - $1.00`. |
| Countdown Banner | `getWeeklyStats().timeUntilDistribution` | Drive urgency inside the final 24 hours with highlighted timer + "Pool grows in real time" subtitle. |
| Pool Growth Widget | Stream `PoolGrowth` and `CardDealt` events | Render sparkline and show `+$X (last hour)` with aggregated event deltas. |
| Leaderboard | Off-chain indexer (e.g., The Graph, Supabase) fed by `GameWon` events | Show top wallets, wins, and estimated payouts. Always surface the current user row even if off-screen. |

## Game Screen

```
┌────────────────────────────┐
│  🃏 DEALER ({{dealerScore}})       │
│  {{dealerCards}}                 │
│                                │
│  🎴 YOU ({{playerScore}})          │
│  {{playerCards}}                 │
│                                │
│  [  HIT  ]   [  STAND  ]       │
│                                │
│  This Week:                     │
│  • Your Wins: {{weeklyWins}}     │
│  • Pool: ${{poolUsd}} 💰          │
│  • Estimate: ${{estimateUsd}}     │
└────────────────────────────┘
```

- Disable the HIT button when `playerScore > 21` or when the game transitions to `FINISHED`.
- After each `GameStarted` event, optimistically update the pool widget for instant feedback before the VRF callback fires.
- Treat `CardDealt` events with `recipient == address(0)` as dealer draws when syncing UI state client-side.

## Result Modal

```
┌────────────────────────────┐
│ {{resultEmoji}} {{resultCopy}} │
│                                │
│ You: {{playerScore}}           │
│ Dealer: {{dealerScore}}       │
│                                │
│ {{winCopy}}                    │
│ Total Wins: {{weeklyWins}}     │
│                                │
│ Estimated Reward: ${{estimate}} │
│ Pool: ${{poolBefore}} → ${{poolAfter}} │
│                                │
│ [PLAY AGAIN - $1.00]          │
└────────────────────────────┘
```

Use celebratory animations when `result == win` and mellow tones for losses to maintain motivation. Trigger short fanfares on `GameWon` and muted swishes on `GameLost` to match the reference arcade implementation.

## Notifications & FOMO Hooks

Implement lightweight toasts based on contract state:

```ts
if (pool >= 1_000 && previousPool < 1_000) toast.success("🎉 The pool just crossed $1,000! Rewards are ramping up!");
if (timeUntilDistribution < 24 * 60 * 60) toast.warn(`⏰ Final 24 hours! Pool: $${pool}`);
if (userWins === 10) toast.info("🏆 10 Wins! You're climbing the reward ladder!");
```

Consider piping `PoolGrowth` and `WeekFinalized` events into Farcaster casts via the miniapp backend to amplify virality.

## Audio & Haptics

- **Card deals:** Listen for `CardDealt` events and play a soft card-flick sound plus a light haptic (if supported) for player cards.
- **Wins/Losses:** Layer celebratory or subtle defeat tones on top of the result modal; keep samples under 1s to remain frame-friendly.
- **Pool milestones:** Reuse milestone toasts but add a faint crowd-cheer cue when the `$5k` or `$10k` thresholds are crossed.

## Responsive Layout Cheatsheet

- Minimum canvas width: 320px. Collapse the two-column dashboard into a single column under 480px.
- For mobile, move the leaderboard below the game canvas and pin the CTA button to the bottom with `position: sticky`.
- Scale card sprites with `aspect-ratio` so they remain legible on high-density screens without stretching.
- Reserve ~64px of vertical space for system UI overlays on iOS (safe-area insets).

## Analytics Checklist

- Persist `PoolGrowth` deltas for hourly growth charts.
- Track conversion rate from dashboard view → `startGame` transaction.
- Estimate final pool size by extrapolating `totalGamesThisWeek / elapsedHours` to the remaining window.

## Miniapp Implementation Notes

1. Host the UI on Vercel with a Miniapp manifest referencing the `/canvas` route.
2. Use Neynar’s frame signing utilities so only authenticated casts can submit `startGame` transactions.
3. Leverage Base WalletKit to deep-link to the transaction pre-populated with the `startGame` calldata and `value` equal to `getRequiredETHAmount()`.
4. Cache `estimateUserReward` responses per user for 15 seconds to avoid RPC overload during peak hours.

These guidelines keep the on-chain mechanics and off-chain experience tightly aligned with the specification.
