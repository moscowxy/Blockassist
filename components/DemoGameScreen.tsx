'use client'

import { useState, useEffect, useRef } from 'react'
import { BlackjackGame, getCardSymbol, getCardColor, type Card } from '@/lib/blackjack'
import { motion } from 'framer-motion'

export function DemoGameScreen({ onBack }: { onBack: () => void }) {
  const [game] = useState(() => new BlackjackGame())
  const [state, setState] = useState(game.state)
  const [currentRound, setCurrentRound] = useState(1)
  const [rounds, setRounds] = useState<Array<{ round: number; result: 'win' | 'loss' | 'push' }>>([])
  const [finalResult, setFinalResult] = useState<'win' | 'loss' | null>(null)
  const [gameFinished, setGameFinished] = useState(false)
  const initializedRef = useRef(false)

  const TOTAL_ROUNDS = 5

  const handleHit = () => {
    game.hit()
    setState({ ...game.state })
    
    // Auto-end if busted
    if (game.state.gameStatus === 'bust') {
      setTimeout(() => endRound(), 1500)
    }
  }

  const handleStand = () => {
    game.stand()
    setState({ ...game.state })
    
    // Auto-end after result
    setTimeout(() => {
      endRound()
    }, 1500)
  }

  const endRound = () => {
    let result: 'win' | 'loss' | 'push' = 'loss'
    
    if (game.state.gameStatus === 'player_win' || game.state.gameStatus === 'blackjack') {
      result = 'win'
    } else if (game.state.gameStatus === 'draw') {
      result = 'push'
    }
    // 'bust' and 'dealer_win' are already 'loss'

    setRounds([...rounds, { round: currentRound, result }])
    
    if (currentRound < TOTAL_ROUNDS) {
      setTimeout(() => {
        game.reset()
        game.dealInitialCards()
        setState({ ...game.state })
        setCurrentRound(currentRound + 1)
      }, 2000)
    } else {
      // Game finished
      const totalWins = [...rounds, { round: currentRound, result }].filter(r => r.result === 'win').length
      const totalLosses = [...rounds, { round: currentRound, result }].filter(r => r.result === 'loss').length
      setFinalResult(totalWins > totalLosses ? 'win' : 'loss')
      setGameFinished(true)
    }
  }

  // Initialize first game - only once
  useEffect(() => {
    if (!initializedRef.current) {
      console.log('Initializing game - dealing cards')
      game.dealInitialCards()
      setState({ ...game.state })
      initializedRef.current = true
      
      // Auto-end if blackjack on initial deal
      if (game.state.gameStatus === 'blackjack') {
        setTimeout(() => endRound(), 1500)
      }
    }
  }, []) // Empty dependency array - only run once on mount

  const tryAgain = () => {
    game.reset()
    game.dealInitialCards()
    setState({ ...game.state })
    setCurrentRound(1)
    setRounds([])
    setFinalResult(null)
    setGameFinished(false)
  }

  const renderCard = (card: Card, index: number) => (
    <motion.div
      key={index}
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="card flex items-center justify-center text-center text-white font-bold rounded-lg shadow-lg w-16 h-24 sm:w-20 sm:h-28"
      style={{
        backgroundColor: getCardColor(card),
        backgroundImage: card.value === 0 ? 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3), rgba(255,255,255,0)), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.3), rgba(255,255,255,0))' : 'none',
      }}
    >
      {card.value === 0 ? '🎴' : getCardSymbol(card)}
    </motion.div>
  )

  if (gameFinished && finalResult) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-green-900 to-green-800">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center p-6 bg-green-900/90 rounded-lg"
        >
          <h2 className="text-3xl font-bold mb-4">
            {finalResult === 'win' ? '🎉 You Won!' : '😢 You Lost'}
          </h2>
          <div className="mb-4 space-y-2">
            {rounds.map((r) => (
              <div key={r.round} className="text-lg">
                Round {r.round}: {r.result === 'win' ? '✅ Win' : r.result === 'push' ? '🤝 Push' : '❌ Loss'}
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={tryAgain}
              className="bg-gold text-black px-6 py-2 rounded-lg font-semibold"
            >
              Try Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={onBack}
              className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Back to Menu
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="casino-table flex flex-col h-full">
      <div className="flex-1 flex flex-col">
        <div className="text-center mb-3">
          <h2 className="text-2xl font-bold text-white">Round {currentRound} of {TOTAL_ROUNDS}</h2>
          <div className="text-white mt-2">
            Wins: {rounds.filter(r => r.result === 'win').length} | 
            Losses: {rounds.filter(r => r.result === 'loss').length}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="mb-3">
            <div className="text-center text-green-300 mb-2 text-sm">
              🃏 Dealer - Score: {game.state.dealerScore}
            </div>
            <div className="flex justify-center flex-wrap gap-2 min-h-[60px]">
              {state.dealerHand.map((card, index) => renderCard(card, index))}
            </div>
          </div>

          <div className="mt-auto mb-3">
            <div className="text-center text-green-300 mb-2 text-sm">
              🎴 You - Score: {game.state.playerScore}
            </div>
            <div className="flex justify-center flex-wrap gap-2 min-h-[60px]">
              {state.playerHand.map((card, index) => renderCard(card, index))}
            </div>
          </div>
        </div>

        <div className="mt-auto">
          {state.gameStatus === 'playing' && (
            <>
              <div className="text-center text-yellow-300 mb-3 text-lg font-bold">
                Your Turn! Hit or Stand?
              </div>
              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleHit}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-base shadow-lg"
                >
                  Hit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStand}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-base shadow-lg"
                >
                  Stand
                </motion.button>
              </div>
            </>
          )}
          
          {(state.gameStatus === 'player_win' || state.gameStatus === 'dealer_win' || state.gameStatus === 'draw' || state.gameStatus === 'bust' || state.gameStatus === 'blackjack') && (
            <div className="text-center text-yellow-300 text-lg font-bold py-4">
              {state.gameStatus === 'player_win' && '🎉 You Won This Round!'}
              {state.gameStatus === 'dealer_win' && '😢 Dealer Won This Round'}
              {state.gameStatus === 'draw' && '🤝 Push! No Winner'}
              {state.gameStatus === 'bust' && '💥 Bust! Dealer Wins!'}
              {state.gameStatus === 'blackjack' && '🎉 Blackjack! You Win!'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

