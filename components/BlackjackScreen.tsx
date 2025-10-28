'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlayScreen } from './PlayScreen'
import { ContractGameScreen } from './ContractGameScreen'
import { DemoGameScreen } from './DemoGameScreen'
import { useAccount } from 'wagmi'

export default function BlackjackApp() {
  const [screen, setScreen] = useState('menu')
  const [selectedBet, setSelectedBet] = useState<number | null>(null)
  const { isConnected } = useAccount()

  const startGame = async (bet: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first!')
      return
    }
    // Set bet and navigate to game screen
    // The transaction will start automatically when PlayScreen loads with initialBet
    setSelectedBet(bet)
    setScreen('game')
  }

  if (screen === 'game' && selectedBet) {
    return (
      <div className="h-full w-full">
        <PlayScreen initialBet={selectedBet} onBack={() => setScreen('menu')} />
      </div>
    )
  }

  if (screen === 'demo') {
    return (
      <div className="h-full w-full">
        <DemoGameScreen onBack={() => setScreen('menu')} />
      </div>
    )
  }

  if (screen === 'info') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center px-4 min-h-[100dvh] bg-gradient-to-b from-green-900 to-green-800"
      >
        <h2 className="text-2xl font-bold text-gold mb-4 mt-8">Game Information</h2>
        
        <div className="space-y-4 text-left max-w-md">
          <div className="bg-green-900/50 p-4 rounded-lg">
            <h3 className="text-gold font-bold mb-2">🎮 Play Game (Demo)</h3>
            <p className="text-white text-sm">
              Play Blackjack without any real money. Play 5 rounds and compete to win!
            </p>
          </div>
          
          <div className="bg-green-900/50 p-4 rounded-lg">
            <h3 className="text-gold font-bold mb-2">💰 Play Game</h3>
            <p className="text-white text-sm">
              Connect your wallet and place real bets. Win and earn shares in the Weekly Reward Pool!
            </p>
          </div>
          
          <div className="bg-green-900/50 p-4 rounded-lg">
            <h3 className="text-gold font-bold mb-2">🎫 Token (Soon)</h3>
            <p className="text-white text-sm">
              More features coming soon! Stay tuned for token rewards.
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => setScreen('menu')}
          className="mt-8 bg-gold text-black px-6 py-2 rounded-lg font-semibold"
        >
          Back
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col justify-between items-center min-h-[100dvh] text-white w-full"
      style={{
        background: 'linear-gradient(135deg, #0f5132 0%, #198754 100%)',
      }}
    >
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-3xl font-bold mt-4 mb-2"
      >
        🃏 Blackjack
      </motion.h1>

      {screen === 'menu' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 flex-1 w-full"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen('demo')}
            className="bg-yellow-600 text-white font-bold px-8 py-4 rounded-lg shadow-md w-full max-w-xs text-lg"
          >
            Play Game (Demo)
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen('bet')}
            className="bg-gold text-black font-bold px-8 py-4 rounded-lg shadow-md w-full max-w-xs text-lg"
          >
            Play Game
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen('token')}
            className="bg-green-700 text-white font-bold px-8 py-4 rounded-lg shadow-md w-full max-w-xs text-lg"
          >
            Token (Soon)
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScreen('info')}
            className="bg-blue-700 text-white font-bold px-8 py-4 rounded-lg shadow-md w-full max-w-xs text-lg"
          >
            INFO
          </motion.button>
        </motion.div>
      )}

      {screen === 'token' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center px-4"
        >
          <h2 className="text-2xl font-bold text-gold mb-2">Token Coming Soon!</h2>
          <p className="text-sm max-w-xs text-green-200 mb-4">Play and win rewards!</p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setScreen('menu')}
            className="bg-gold text-black px-6 py-2 rounded-lg font-semibold"
          >
            Back
          </motion.button>
        </motion.div>
      )}

      {screen === 'bet' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <h2 className="text-2xl font-bold mb-2">Choose Your Bet</h2>
          {[1].map((bet) => (
            <motion.button
              key={bet}
              whileHover={{ scale: 1.1, boxShadow: '0px 0px 15px rgba(255, 215, 0, 0.7)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startGame(bet)}
              className="bg-gold text-black font-bold px-8 py-3 rounded-lg shadow-md w-full max-w-xs"
            >
              ${bet}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setScreen('menu')}
            className="mt-4 bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Back
          </motion.button>
        </motion.div>
      )}

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="w-full text-center py-3 text-sm text-green-300"
      >
        Powered by Moscow
      </motion.footer>
    </motion.div>
  )
}

