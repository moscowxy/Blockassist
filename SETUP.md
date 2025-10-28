# Quick Setup Guide

## Install All Dependencies

```bash
# Install smart contract dependencies (if not already installed)
npm install

# Install frontend dependencies
npm install next@latest react@latest react-dom@latest viem wagmi @tanstack/react-query framer-motion clsx lucide-react

# Install dev dependencies for frontend
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom typescript
```

## Create Environment File

Create `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=your_sepolia_contract_address_here
```

## Add Sound Files (Optional)

Place these files in `public/sounds/`:
- card-flip.mp3
- win.mp3
- lose.mp3
- blackjack.mp3
- bust.mp3
- chip.mp3

## Run Development Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

## Test the Game

1. The game works in demo mode without any blockchain connection
2. Click "Start Game" to play
3. Use "Hit" to draw more cards
4. Use "Stand" to end your turn
5. Try it on mobile - it's fully responsive!

## Connect Wallet (Optional)

1. Install MetaMask browser extension
2. Add Base Sepolia network to MetaMask
3. Click "Connect Wallet" button
4. (Contract mode coming soon)

## Deploy Contract (For On-Chain Game)

```bash
# Make sure your .env has all required values
PRIVATE_KEY=your_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
VRF_COORDINATOR=0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B07
PRICE_FEED_ADDRESS=0xåaDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1
VRF_SUBSCRIPTION_ID=your_sub_id
VRF_KEY_HASH=0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae

# Deploy
npx hardhat run scripts/deploy.ts --network base-sepolia

# Copy the deployed contract address to .env.local
```

## Deploy Frontend to Vercel (For Production)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts
# Add environment variables in Vercel dashboard
```

## What's Working

✅ Complete blackjack game with proper rules
✅ Mobile responsive design
✅ Sound effects support
✅ Smooth animations
✅ Wallet connection ready
✅ Smart contract integration ready
✅ Farcaster miniapp ready

## Next Steps

1. Test the game in demo mode
2. Add sound files for better experience
3. Deploy your contract to Base Sepolia
4. Update contract addresses in .env.local
5. Test wallet connection
6. Deploy frontend to Vercel
7. Share with users!

## Support

- Demo mode works without any setup
- Sound files are optional
- Contract integration is optional
- Works great on mobile browsers
- Perfect for Farcaster miniapps

Enjoy your new blackjack game! 🎰

