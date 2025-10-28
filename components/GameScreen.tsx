'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { BlackjackGame, getCardSymbol, getCardColor, type Card } from '@/lib/blackjack'
import { motion } from 'framer-motion'

export function GameScreen() {
  const [game] = useState(() => new BlackjackGame())
  const [state, setState] = useState(game.state)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    // Preload sound effects
    if (typeof window !== 'undefined') {
      audioRefs.current = {
        cardFlip: new Audio('/sounds/card-flip.mp3'),
        win: new Audio('/sounds/win.mp3'),
        lose: new Audio('/sounds/lose.mp3'),
        blackjack: new Audio('/sounds/blackjack.mp3'),
        bust: new Audio('/sounds/bust.mp3'),
        chip: new Audio('/sounds/chip.mp3'),
      }
    }
  }, [])

  const playSound = (soundName: string) => {
    if (soundEnabled && audioRefs.current[soundName]) {
      audioRefs.current[soundName].play().catch(() => {
        // Ignore audio playback errors
      })
    }
  }

  const startGame = () => {
    game.reset()
    game.dealInitialCards()
    setState({ ...game.state })
    playSound('cardFlip')
    playSound('chip')
  }

  const hit = () => {
    game.hit()
    setState({ ...game.state })
    playSound('cardFlip')
    
    if (game.state.gameStatus === 'bust') {
      playSound('bust')
    }
  }

  const stand = () => {
    game.stand()
    setState({ ...game.state })
    
    if (game.state.gameStatus === 'player_win') {
      playSound('win')
    } else if (game.state.gameStatus === 'dealer_win' || game.state.gameStatus === 'bust') {
      playSound('lose')
    }
  }

  const reset = () => {
    game.reset()
    setState({ ...game.state })
  }

  const renderCard = (card: Card, index: number, isPlayer: boolean) => (
    <motion.div
      key={index}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`card ${getCardColor(card)}`}
    >
      {getCardSymbol(card)}
    </motion.div>
  )

  const isGameActive = state.gameStatus === 'playing'
  const canHit = isGameActive && state.playerScore < 21
  const canStand = isGameActive

  return (
    <div className="casino-table p-6 md:p-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Blackjack</h2>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="px-2 py-1 bg-green-700 text-white rounded-lg hover:bg-green-600 transition text-sm"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Dealer Section */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <h3 className="text-base font-semibold text-white mr-3">
            🃏 Dealer {state.dealerHand.length > 0 && `(${state.dealerScore})`}
          </h3>
          {(state.gameStatus === 'dealer_win' || state.gameStatus === 'player_win' || state.gameStatus === 'draw' || state.gameStatus === 'bust') && (
            <span className="text-green-200">{state.dealerScore}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 min-h-[120px] items-center">
          {state.dealerHand.map((card, index) => {
            // Show first card face down initially if game is still playing
            const showCard = isGameActive && index === 0 && state.dealerHand.length === 1 ? false : true
            return showCard ? (
              renderCard(card, index, false)
            ) : (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="card"
                style={{ background: '#1e40af', color: 'white' }}
              >
                🂠
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Player Section */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <h3 className="text-base font-semibold text-white mr-3">
            🎴 You {state.playerHand.length > 0 && `(${state.playerScore})`}
          </h3>
          {state.playerHand.length > 0 && (
            <span className="text-green-200">{state.playerScore}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 min-h-[75px] items-center">
          {state.playerHand.map((card, index) => renderCard(card, index, true))}
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center mb-4">
        <motion.p
          key={state.message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold text-white"
        >
          {state.message}
        </motion.p>
      </div>

      {/* Game Buttons - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {state.gameStatus === 'waiting' && (
          <button
            onClick={startGame}
            className="w-full sm:w-auto px-8 py-4 bg-gold hover:bg-gold-dark text-black font-bold rounded-lg text-base sm:text-lg transition-all shadow-lg transform active:scale-95 min-h-[48px] sm:min-h-[auto] touch-manipulation"
          >
            Start Game - $1.00
          </button>
        )}

        {canHit && (
          <button
            onClick={hit}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-base sm:text-lg transition-all shadow-lg transform active:scale-95 min-h-[48px] sm:min-h-[auto] touch-manipulation"
          >
            Hit
          </button>
        )}

        {canStand && (
          <button
            onClick={stand}
            className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-base sm:text-lg transition-all shadow-lg transform active:scale-95 min-h-[48px] sm:min-h-[auto] touch-manipulation"
          >
            Stand
          </button>
        )}

        {(state.gameStatus === 'player_win' || 
          state.gameStatus === 'dealer_win' || 
          state.gameStatus === 'draw' || 
          state.gameStatus === 'bust' ||
          state.gameStatus === 'blackjack') && (
          <button
            onClick={reset}
            className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-base sm:text-lg transition-all shadow-lg transform active:scale-95 min-h-[48px] sm:min-h-[auto] touch-manipulation"
          >
            New Game
          </button>
        )}
      </div>

      {/* Game Info */}
      {state.gameStatus !== 'waiting' && (
        <div className="mt-6 text-center text-green-200">
          <p>Total Games This Week: 0</p>
          <p>Weekly Pool: $0.00 💰</p>
        </div>
      )}
    </div>
  )
}

