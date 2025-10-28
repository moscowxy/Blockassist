# Base Blackjack Frontend

A modern, mobile-responsive blackjack game frontend built with Next.js, designed for Farcaster miniapps.

## Features

- 🎮 Complete blackjack game logic with proper rules
- 🔊 Sound effects for game actions (card flips, wins, losses)
- 📱 Fully responsive design for mobile and desktop
- ✨ Smooth animations with Framer Motion
- 🎨 Modern casino-themed UI with Tailwind CSS
- 🔗 Ready for blockchain integration with Wagmi
- 🚀 Optimized for Farcaster miniapps

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the game.

### Adding Sound Effects

1. Create a `public/sounds/` directory
2. Add the following sound files:
   - `card-flip.mp3` - Sound when a card is drawn
   - `win.mp3` - Sound when player wins
   - `lose.mp3` - Sound when player loses
   - `blackjack.mp3` - Sound when player gets blackjack
   - `bust.mp3` - Sound when player goes over 21
   - `chip.mp3` - Sound for placing bet

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=your_sepolia_contract_address
```

### Game Rules

The game follows standard blackjack rules:

- **Goal**: Get closer to 21 than the dealer without going over
- **Card Values**: 
  - Ace = 1 or 11 (automatically chosen for best score)
  - Face cards (J, Q, K) = 10
  - Number cards = their face value
- **Actions**:
  - **Hit**: Draw another card
  - **Stand**: Keep current hand and let dealer play
- **Dealer**: Must hit until score is at least 17
- **Blackjack**: Ace + 10-value card = automatic win
- **Bust**: Going over 21 = automatic loss

## Game Logic Improvements

### Error Fixes

1. **Proper Ace Handling**: Aces are now correctly calculated as 1 or 11 based on current score
2. **Score Calculation**: Fixed edge cases in score computation
3. **Game State Management**: Proper state transitions between game phases
4. **Dealer Logic**: Dealer follows correct blackjack rules (hits until 17+)

### UI/UX Improvements

1. **Mobile Responsive**: Cards scale appropriately on small screens
2. **Touch-Friendly**: Large buttons optimized for mobile taps
3. **Visual Feedback**: Smooth animations for card flips and game state changes
4. **Sound Toggle**: Users can enable/disable sound effects
5. **Responsive Layout**: Works seamlessly on all screen sizes

### Additional Features

- Card flip animations
- Winner/loser animations with shake effects
- Real-time score updates
- Visual feedback for game state changes
- Mobile-first design approach

## Building for Production

```bash
npm run build
npm start
```

## Deployment

The app is ready for deployment to:
- Vercel (recommended for Farcaster miniapps)
- Netlify
- Any static hosting service

## Farcaster Integration

To integrate with Farcaster:

1. Follow the [Farcaster miniapps guide](https://miniapps.farcaster.xyz/docs/getting-started)
2. Add Neynar authentication
3. Connect wallet functionality
4. Deploy to Vercel with proper manifest configuration

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Wagmi**: Ethereum connection management
- **Viem**: Ethereum utilities

## Browser Support

- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

