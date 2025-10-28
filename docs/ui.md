# Base Blackjack UI Blueprint

This document transcribes the product requirements into concrete UI modules ready for a Base miniapp or standard web dApp.

## Dashboard Panels

| Component | Data Source | Notes |
|-----------|-------------|-------|
| Weekly Reward Pool card | `getWeeklyStats().estimatedRewardPool` and `getWeeklyStats().totalGames` | Highlight live USD estimate, growth delta, and games played. Trigger pool milestone notifications when thresholds (`$1k`, `$5k`, `$10k`) are crossed. |
| Player Snapshot | `weeklyWins(msg.sender)`, `estimateUserReward(msg.sender)`, `totalGamesPlayed` mapping | Display Win count, estimated payout, total games, and win rate. Encourage another play with CTA `Start Game - $1.00`. |
| Countdown Banner | `getWeeklyStats().timeUntilDistribution` | Drive urgency inside the final 24 hours with highlighted timer + “Havuz gerçek zamanlı büyür” subtitle. |
| Pool Growth Widget | Stream `PoolGrowth` events | Render sparkline and show `+$X (son 1 saatte)` with aggregated event deltas. |
| Leaderboard | Off-chain indexer (e.g., The Graph, Supabase) fed by `GameWon` events | Show top wallets, wins, and estimated payouts. Always surface the current user row even if off-screen. |

## Game Screen

```
┌────────────────────────────┐
│  🃏 KRUPIYE ({{dealerScore}})       │
│  {{dealerCards}}                 │
│                                │
│  🎴 SEN ({{playerScore}})          │
│  {{playerCards}}                 │
│                                │
│  [  HIT  ]   [  STAND  ]       │
│                                │
│  Bu Hafta:                     │
│  • Win'lerin: {{weeklyWins}}     │
│  • Havuz: ${{poolUsd}} 💰          │
│  • Tahmini: ${{estimateUsd}}     │
└────────────────────────────┘
```

- Disable the HIT button when `playerScore > 21` or when the game transitions to `FINISHED`.
- After each `GameStarted` event, optimistically update the pool widget for instant feedback before the VRF callback fires.

## Result Modal

```
┌────────────────────────────┐
│ {{resultEmoji}} {{resultCopy}} │
│                                │
│ Sen: {{playerScore}}           │
│ Krupiye: {{dealerScore}}       │
│                                │
│ {{winCopy}}                    │
│ Toplam Win: {{weeklyWins}}     │
│                                │
│ Tahmini Ödülün: ${{estimate}} │
│ Havuz: ${{poolBefore}} → ${{poolAfter}} │
│                                │
│ [TEKRAR OYNA - $1.00]          │
└────────────────────────────┘
```

Use celebratory animations when `result == win` and mellow tones for losses to maintain motivation.

## Notifications & FOMO Hooks

Implement lightweight toasts based on contract state:

```ts
if (pool >= 1_000 && previousPool < 1_000) toast.success("🎉 Havuz $1,000'i geçti! Ödüller büyüyor!");
if (timeUntilDistribution < 24 * 60 * 60) toast.warn(`⏰ Son 24 saat! Havuz: $${pool}`);
if (userWins === 10) toast.info("🏆 10 Win! Şimdi daha büyük paydasın!");
```

Consider piping `PoolGrowth` and `WeekFinalized` events into Farcaster casts via the miniapp backend to amplify virality.

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
