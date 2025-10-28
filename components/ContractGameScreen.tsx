'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, Address } from 'viem'
import { blackjackABI, GAME_STATES, type GameData } from '@/lib/contract'
import { getContractAddress } from '@/lib/wagmi'
import { motion } from 'framer-motion'
import { Button } from './ui/Button'

export function ContractGameScreen() {
  const { address, chainId } = useAccount()
  const [gameId, setGameId] = useState<bigint | null>(null)
  const [loading, setLoading] = useState(false)
  const contractAddress = chainId ? getContractAddress(chainId) : ''

  // Read game state
  const { data: gameData, refetch: refetchGame } = useReadContract({
    address: contractAddress as Address,
    abi: blackjackABI,
    functionName: 'getGame',
    args: gameId !== null ? [gameId] : undefined,
    query: { enabled: !!gameId && !!contractAddress },
  }) as { data?: GameData; refetch: () => void }

  // Read required ETH amount
  const { data: requiredETH, refetch: refetchRequiredETH } = useReadContract({
    address: contractAddress as Address,
    abi: blackjackABI,
    functionName: 'getRequiredETHAmount',
    query: { enabled: !!contractAddress },
  })

  // Write contract hooks
  const { writeContract: startGame, data: startHash } = useWriteContract()
  const { writeContract: hit, data: hitHash } = useWriteContract()
  const { writeContract: stand, data: standHash } = useWriteContract()

  // Wait for transactions
  const { isLoading: startingGame } = useWaitForTransactionReceipt({
    hash: startHash,
  })
  const { isLoading: hitting } = useWaitForTransactionReceipt({
    hash: hitHash,
  })
  const { isLoading: standing } = useWaitForTransactionReceipt({
    hash: standHash,
  })

  useEffect(() => {
    if (gameId) {
      const interval = setInterval(() => {
        refetchGame()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [gameId, refetchGame])

  const handleStartGame = async () => {
    if (!requiredETH || !contractAddress) return

    setLoading(true)
    try {
      await startGame({
        address: contractAddress as Address,
        abi: blackjackABI,
        functionName: 'startGame',
        args: [BigInt(selectedBet * 1e18)],
        value: requiredETH,
      })
    } catch (error) {
      console.error('Failed to start game:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHit = async () => {
    if (!gameId || !contractAddress) return

    setLoading(true)
    try {
      await hit({
        address: contractAddress as Address,
        abi: blackjackABI,
        functionName: 'hit',
        args: [gameId],
      })
    } catch (error) {
      console.error('Failed to hit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStand = async () => {
    if (!gameId || !contractAddress) return

    setLoading(true)
    try {
      await stand({
        address: contractAddress as Address,
        abi: blackjackABI,
        functionName: 'stand',
        args: [gameId],
      })
    } catch (error) {
      console.error('Failed to stand:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderCard = (value: number, index: number) => {
    const suit = ['♠', '♥', '♦', '♣'][Math.floor(value / 13) % 4]
    const rank = value % 13
    const rankChar = rank === 0 ? 'A' : rank >= 10 ? ['10', 'J', 'Q', 'K'][rank - 10] : String(rank + 1)
    const isRed = suit === '♥' || suit === '♦'
    
    return (
      <motion.div
        key={index}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className={`card ${isRed ? 'red' : 'black'}`}
      >
        {rankChar}{suit}
      </motion.div>
    )
  }

  if (!contractAddress) {
    return (
      <div className="casino-table p-6 text-center">
        <p className="text-red-300">Please connect to supported network (Base or Base Sepolia)</p>
      </div>
    )
  }

  const isWaiting = gameData?.state === GAME_STATES.WAITING_FOR_RANDOMNESS
  const isPlaying = gameData?.state === GAME_STATES.PLAYING
  const isFinished = gameData?.state === GAME_STATES.FINISHED

  return (
    <div className="casino-table p-6 md:p-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">On-Chain Blackjack</h2>
        <p className="text-green-200 text-sm mt-2">
          Play with real blockchain smart contracts
        </p>
      </div>

      {/* Game Info */}
      {requiredETH && (
        <div className="mb-6 text-center text-green-200">
          Game Cost: {formatEther(requiredETH)} ETH
        </div>
      )}

      {/* Dealer Section */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <h3 className="text-xl font-semibold text-white mr-4">
            🃏 Dealer {gameData?.dealerScore ? `(${gameData.dealerScore})` : ''}
          </h3>
        </div>
        <div className="flex flex-wrap gap-3 min-h-[120px] items-center">
          {gameData?.dealerCards.map((card, index) => {
            // Show dealer's second card face down initially
            if (isPlaying && index === 1 && gameData.dealerCards.length === 2) {
              return (
                <div key={index} className="card" style={{ background: '#1e40af', color: 'white' }}>
                  🂠
                </div>
              )
            }
            return renderCard(card, index)
          })}
        </div>
      </div>

      {/* Player Section */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <h3 className="text-xl font-semibold text-white mr-4">
            🎴 You {gameData?.playerScore ? `(${gameData.playerScore})` : ''}
          </h3>
        </div>
        <div className="flex flex-wrap gap-3 min-h-[120px] items-center">
          {gameData?.playerCards.map((card, index) => renderCard(card, index))}
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center mb-6">
        {isWaiting && (
          <p className="text-xl text-yellow-300">⏳ Waiting for randomness...</p>
        )}
        {isPlaying && (
          <p className="text-xl text-white">🎮 Your turn! Choose an action</p>
        )}
        {isFinished && (
          <p className="text-2xl font-bold text-green-300">
            {gameData?.playerBlackjack ? 'Blackjack! 🎉' : 
             gameData?.playerScore > 21 ? 'Bust! 💥' :
             gameData?.playerScore > gameData?.dealerScore ? 'You Win! 🎉' :
             gameData?.dealerScore > 21 ? 'Dealer Busts! 🎉' :
             gameData?.playerScore < gameData?.dealerScore ? 'Dealer Wins 😢' :
             "It's a Draw 🤝"}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!gameData && (
          <Button
            onClick={handleStartGame}
            disabled={loading || startingGame}
            variant="primary"
            size="lg"
          >
            {loading || startingGame ? 'Starting...' : `Start Game - ${requiredETH ? formatEther(requiredETH) : '0'} ETH`}
          </Button>
        )}

        {isPlaying && (
          <>
            <Button
              onClick={handleHit}
              disabled={loading || hitting || gameData.playerScore >= 21}
              variant="secondary"
              size="lg"
            >
              {loading || hitting ? 'Processing...' : 'Hit'}
            </Button>
            <Button
              onClick={handleStand}
              disabled={loading || standing}
              variant="danger"
              size="lg"
            >
              {loading || standing ? 'Processing...' : 'Stand'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

