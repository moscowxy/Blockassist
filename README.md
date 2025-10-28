# Base Blackjack dApp

Base Blackjack is an on-chain blackjack experience for the Base network that uses a dynamic, contribution-driven reward pool. The design follows the Base get-started guide and Farcaster miniapps developer playbook so that the same smart contract can power a Base miniapp, a traditional web dApp, or any other client that can speak to the contract.

## Features

- **On-chain blackjack** powered by Chainlink VRF derived randomness and a provably-fair one-deck shoe that prevents duplicate draws.
- **Dynamic $1 buy-in** that converts the USD price to ETH on-chain using a Chainlink price feed.
- **Cumulative weekly reward pool** that grows with each game and is distributed proportionally to weekly wins.
- **Transparent metrics** helpers (`estimateUserReward`, `getWeeklyStats`) and granular `CardDealt` events for dashboards, audio cues, and Farcaster casts.
- **Operator controls** to finalise a week, allow players to claim, and roll the game into a fresh epoch without redeploying.

## Contract Overview

The main contract lives in [`contracts/BaseBlackjack.sol`](contracts/BaseBlackjack.sol) and exposes the core game loop:

1. `startGame` validates the caller has paid $1 worth of ETH, requests randomness from Chainlink VRF, and increments the live prize pool.
2. The VRF callback distributes the first four cards to the player and dealer, emitting `CardDealt` events that include card rank/suit metadata for the UI layer while bootstrapping blackjack checks.
3. Players use `hit` and `stand` to complete their hand. Dealer logic runs automatically to 17 and the result is finalised.
4. Weekly wins and aggregate counters grow organically, feeding the live reward pool.
5. Every Monday (or when `WEEK_DURATION` elapses) the operator finalises the week, takes the 20% platform fee, and freezes rewards for claiming.
6. Players claim with `claimWeeklyReward`, and a new epoch can begin with `startNewWeek`.

### Economic Parameters

- `GAME_COST_USD`: hard-coded to $1.00 (18 decimals) with a 1% slippage buffer when converting to ETH.
- `PLATFORM_FEE_PERCENT`: 20% fee collected on finalisation and transferred to the owner wallet.
- `REWARD_POOL_PERCENT`: 80% of inflows are earmarked for the player reward pool.
- `WEEK_DURATION`: default of seven days, aligned with Monday 00:00 UTC distributions.

### VRF Configuration

The constructor accepts the coordinator address, subscription ID, key hash, and gas options so you can target either Base mainnet or Base Sepolia. Update them post-deploy with `updateVRFConfig` without redeploying the contract.

### Public Analytics & Telemetry APIs

- `estimateUserReward(address)` returns a real-time projection of a player’s eventual payout based on current pool size and wins.
- `getWeeklyStats()` surfaces the live pool, total wins, total games, countdown timer, and the inferred platform fee so dashboards can update in real time.
- `weeklyWins(address)` and `hasClaimed(address)` provide week-scoped player state that is automatically rolled forward during epoch transitions.
- `cardMetadata(uint8)` and `cardPointValue(uint8)` expose deterministic decoding helpers so the front end can render suits/ranks without re-implementing contract logic (dealer deals surface as `recipient == address(0)` in `CardDealt`).

## Development Environment

This repository ships with a Hardhat configuration targeting Base:

```bash
cp .env.example .env
# populate PRIVATE_KEY, BASE_SEPOLIA_RPC_URL, and ETHERSCAN_API_KEY
npm install
npm run build
```

The default `hardhat.config.ts` exposes `base` and `base-sepolia` networks. Point `BASE_SEPOLIA_RPC_URL` at `https://sepolia.base.org` per the [Base get started guide](https://docs.base.org/get-started/build-app), and configure a Chainlink VRF subscription before deploying.

### Deployment Script Skeleton

Create a script in `scripts/deploy.ts` similar to:

```ts
import { ethers } from "hardhat";

async function main() {
  const priceFeed = "<CHAINLINK_ETH_USD_FEED>"; // Base Sepolia/mainnet address
  const coordinator = "<VRF_COORDINATOR>";
  const subscriptionId = 0; // replace with your sub ID
  const keyHash = "<KEY_HASH>";

  const gasLimit = 500000;
  const confirmations = 3;
  const numWords = 1;

  const Blackjack = await ethers.getContractFactory("BaseBlackjack");
  const blackjack = await Blackjack.deploy(
    priceFeed,
    coordinator,
    subscriptionId,
    keyHash,
    gasLimit,
    confirmations,
    numWords
  );

  await blackjack.waitForDeployment();
  console.log(`BaseBlackjack deployed to ${await blackjack.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Local Testing

- Mock the Chainlink price feed and VRF coordinator to unit test deterministic card draws.
- Use Hardhat’s time helpers to simulate week boundaries, finalisation, and reward claiming flows.
- Run `npm run build` to compile and `npx hardhat test` once mocks are in place.

## Miniapp & Frontend Blueprint

To plug this contract into a Farcaster miniapp, follow the [Miniapps getting started guide](https://miniapps.farcaster.xyz/docs/getting-started):

1. Expose the `getWeeklyStats`, `estimateUserReward`, and `weeklyWins` views through a lightweight API route (Next.js / Vercel Edge functions work well).
2. Authenticate casts with Neynar (per the docs) and trigger transactions using the Base WalletKit.
3. Use the provided UI wireframes in `docs/ui.md` as a starting point—cards, pool growth widgets, and leaderboard components map 1:1 to the contract state.
4. Subscribe to contract events via `eth_subscribe` to deliver real-time updates inside the miniapp canvas.
5. Attach blackjack SFX and haptic feedback to `CardDealt`, `GameWon`, and `GameLost` events to mirror the open-source arcade implementation referenced in the product brief.

### Responsive & Mobile-first Guidance

- Optimise the Farcaster frame canvas for 375px wide viewports; stack dashboard cards vertically under 480px while preserving marquee pool data at the top.
- Use CSS clamp-based typography so pool totals remain legible across iOS/Android devices.
- Reserve a persistent bottom CTA (`Start Game - $1.00`) that expands to a full-width button on mobile and aligns right on desktop.
- Prefer lightweight Lottie/SVG animations for pool milestone celebrations to keep bundle size low within the miniapp constraints.

A conventional web dApp can reuse the same components; simply hydrate them with `viem` or `ethers` connected to Base.

## Directory Structure

```
contracts/
  BaseBlackjack.sol           # Core smart contract
  interfaces/                 # Chainlink interfaces (price feed + VRF)
  utils/                      # Minimal Ownable/Reentrancy/VRF consumer helpers
scripts/
  deploy.ts (example in README)
.env.example                  # Environment variables for Hardhat networks
hardhat.config.ts             # Base-focused Hardhat config
```

## Next Steps

- Build a React/Next.js miniapp wrapper that consumes the contract’s read methods and surfaces the live pool dashboard.
- Add Hardhat tests with mocked VRF + price feed contracts.
- Extend analytics by emitting additional events (e.g., per-game card draws) for richer telemetry in Dune or custom dashboards.

Feel free to iterate on the UI/UX blueprint to incorporate milestone alerts, countdown nudges, and social proof—everything required to deliver the viral growth scenarios outlined in the specification.
