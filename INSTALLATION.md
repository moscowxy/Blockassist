# Blackjack Game Installation Guide

This guide will help you set up the complete blackjack game frontend with smart contract integration.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A code editor (VS Code recommended)

## Installation Steps

### 1. Install Backend Dependencies (Already Done)

The smart contract dependencies are already installed. Run:

```bash
npm install
npm run build
```

### 2. Install Frontend Dependencies

The forgLCM dependencies need to be installed separately. Rename the frontend package.json and install:

```bash
# Option A: Create a new frontend directory
mkdir frontend
cd frontend

# Copy frontend files here or install separately
npm install next@latest react@latest react-dom@latest
npm install viem wagmi @tanstack/react-query
npm install framer-motion clsx lucide-react
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node @types/react @types/react-dom typescript
```

```bash
# Option B: Install all dependencies in root (recommended for development)
npm install next@latest react@latest react-dom@latest viem wagmi @tanstack/react-query framer-motion clsx lucide-react
npm install -D tailwindcss postcss autoprefixer @types/node @types/react @types/react-dom typescript
```

### 3. Initialize Tailwind CSS

```bash
npx tailwindcss init -p
```

This will create `tailwind.config.js` and `postcss.config.js` (already created in project).

### 4. Add Sound Effects

Create sound files or download free casino sounds:

```bash
mkdir -p public/sounds
```

Add the following files:
- `card-flip.mp3` - Card dealing sound
- `win.mp3` - Victory sound  
- `lose.mp3` - Loss sound
- `blackjack.mp3` - Blackjack sound
- `bust.mp3` - Bust sound
- `chip.mp3` - Chip/bet sound

Recommended sources for free sounds:
- Freesound.org
- Mixkit.co
- Zapsplat.com

### 5. Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_mainnet_contract_address
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=your_sepolia_contract_address

# Optional: Add your own RPC endpoints
NEXT_PUBLIC_RPC_URL_MAINNET=https://mainnet.base.org
NEXT_PUBLIC_RPC_URL_SEPOLIA=https://sepolia.base.org
```

### 6. Deploy Smart Contract (Optional for testing)

If you want to test with the contract:

```bash
# Set up environment
cp .env.example .env

# Add your values
PRIVATE_KEY=your_private_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
VRF_COORDINATOR=0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B07
PRICE_FEED_ADDRESS=0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1
VRF_SUBSCRIPTION_ID=your_subscription_id
VRF_KEY_HASH=0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae

# Deploy
npx hardhat run scripts/deploy.ts --network base-sepolia
```

### 7. Run Development Server

```bash
# Run frontend development server
npm run dev

# Or if using separate directories
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
Blockassist/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   ├── providers.tsx      # Wagmi providers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── GameScreen.tsx    # Main game UI
│   ├── StatsPanel.tsx    # Statistics display
│   ├── WalletButton.tsx  # Wallet connection
│   ├── ContractGameScreen.tsx # Contract integration
│   └── ui/               # UI components
├── lib/                  # Utilities
│   ├── blackjack.ts      # Game logic
│   ├── wagmi.ts         # Wagmi config
│   └── contract.ts      # Contract ABI
├── contracts/           # Smart contracts
├── public/              # Static files
│   └── sounds/         # Sound effects
└── tailwind.config.js   # Tailwind configuration
```

## Features Implemented

### ✅ Game Logic
- Complete blackjack rules implementation
- Proper Ace handling (1 or 11)
- Dealer logic (hits until 17+)
- Score calculation
- Win/lose/bust detection
- Blackjack detection

### ✅ UI/UX
- Mobile-responsive design
- Smooth animations (Framer Motion)
- Card flip animations
- Visual feedback for actions
- Casino-themed styling

### ✅ Sound Effects
- Card flip sounds
- Win/lose sounds
- Blackjack sound
- Bust sound
- Sound toggle button

### ✅ Blockchain Integration
- Wagmi setup for wallet connection
- Contract interaction hooks
- Base chain support
- Transaction handling
- Real-time state updates

### ✅ Mobile Optimization
- Touch-friendly buttons
- Responsive card sizes
- Mobile-first CSS
- Viewport optimization
- Farcaster miniapp ready

## Troubleshooting

### Common Issues

**1. Tailwind not working:**
```bash
# Make sure you have the config files
npx tailwindcss init -p
# Restart dev server
```

**2. Wagmi connection issues:**
- Make sure you're on a supported network (Base or Base Sepolia)
- Check that contract addresses are set in .env.local

**3. Sounds not playing:**
- Check that sound files exist in public/sounds/
- Use MP3 format for best compatibility
- Check browser console for errors

**4. Type errors:**
```bash
# Make sure TypeScript dependencies are installed
npm install -D @types/react @types/react-dom @types/node typescript
```

## Development Tips

1. **Test in demo mode first** - The demo mode works without connecting to a blockchain
2. **Use MetaMask** - Most compatible wallet for testing
3. **Check console logs** - The game logs important state changes
4. **Mobile testing** - Use Chrome DevTools device emulation
5. **Hot reload** - Next.js supports hot reload for instant updates

## Next Steps

1. Add your smart contract addresses to .env.local
2. Test wallet connection with MetaMask
3. Try demo mode to test game logic
4. Test on mobile device or emulator
5. Customize sounds and styling
6. Deploy to Vercel for production

## Support

For issues or questions:
- Check the README files
- Review smart contract documentation
- Test in demo mode first
- Check browser console for errors

