'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, parseGwei } from 'viem'
import { getContractAddress } from '@/lib/wagmi'
import { blackjackABI } from '@/lib/contract'
import { Address } from 'viem'
import { BlackjackGame, getCardSymbol, getCardColor, type Card } from '@/lib/blackjack'
import { motion } from 'framer-motion'

type BetAmount = 1 | 5 | 10

export function PlayScreen({ initialBet, onBack }: { initialBet?: number; onBack?: () => void }) {
  const { isConnected, chainId } = useAccount()
  const contractAddress = chainId ? getContractAddress(chainId) : ''
  
  const [game] = useState(() => new BlackjackGame())
  const [state, setState] = useState(game.state)
  const [selectedBet, setSelectedBet] = useState<BetAmount | null>((initialBet as BetAmount) || null)
  const [showWalletWarning, setShowWalletWarning] = useState(false)
  const [isGameActive, setIsGameActive] = useState(false)
  const [ethPrice, setEthPrice] = useState<number>(2500)
  
  // Get live ETH price from CoinGecko
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        const data = await res.json()
        const price = data.ethereum.usd
        console.log('Live ETH price:', price)
        setEthPrice(price)
      } catch (error) {
        console.error('Failed to fetch ETH price:', error)
        setEthPrice(2500)
      }
    }
    
    fetchPrice()
    // Update every 30 seconds
    const interval = setInterval(fetchPrice, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  const { writeContractAsync, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash })

  const betOptions: BetAmount[] = [1]

  const startGame = async () => {
    console.log('startGame called:', { isConnected, selectedBet, contractAddress, chainId })
    
    if (!isConnected) {
      console.log('Not connected, showing warning')
      setShowWalletWarning(true)
      setTimeout(() => setShowWalletWarning(false), 3000)
      return
    }

    if (!selectedBet || !contractAddress) {
      console.log('Missing selectedBet or contractAddress:', { selectedBet, contractAddress })
      return
    }

    // Calculate ETH amount based on USD bet - include 1% slippage like contract
    const betAmountUSD = BigInt(selectedBet * 1e18) // Convert to wei format
    // Match contract's calculation exactly (betAmountUSD / ethPrice + 1% slippage)
    const baseEthAmount = selectedBet / ethPrice
    const slippageAmount = baseEthAmount * 0.01 // 1% slippage
    const totalEthAmount = baseEthAmount + slippageAmount
    const ethValue = parseEther(totalEthAmount.toFixed(8))
    
    console.log('Payment calculation:', { 
      selectedBet: `$${selectedBet}`,
      ethPrice: `$${ethPrice}`,
      ethValue: ethValue.toString(),
      ethValueETH: (Number(ethValue) / 1e18).toFixed(6) + ' ETH'
    })
    
    console.log('Sending transaction:', { contractAddress, ethValue: ethValue.toString() })
    
    try {
      console.log('About to call writeContract', { contractAddress, ethValue: ethValue.toString() })
      
      // Send blockchain transaction - this will open MetaMask popup
      // Force minimum gas for Base L2 (cheapest possible)
      const result = await writeContractAsync({
        address: contractAddress as Address,
        abi: blackjackABI,
        functionName: 'startGame',
        args: [betAmountUSD],
        value: ethValue,
      })
      
      console.log('Transaction sent, hash:', result)
      
      // Start demo game after transaction
      if (result) {
        console.log('Transaction successful, starting game...')
        game.reset()
        game.dealInitialCards()
        setState({ ...game.state })
        setIsGameActive(true)
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      alert('Transaction failed: ' + (error as Error).message)
    }
  }

  const reset = () => {
    game.reset()
    setState({ ...game.state })
    if (onBack) {
      onBack()
    } else {
      setSelectedBet(null)
    }
    setIsGameActive(false)
  }

  const tryAgain = () => {
    game.reset()
    game.dealInitialCards()
    setState({ ...game.state })
    setIsGameActive(true)
  }

  // Auto-start transaction when initialBet is provided
  useEffect(() => {
    if (initialBet && !selectedBet && state.gameStatus === 'waiting') {
      console.log('Auto-starting with initialBet:', initialBet)
      setSelectedBet(initialBet as BetAmount)
      // Trigger startGame after a short delay to ensure state is updated
      setTimeout(() => {
        startGame()
      }, 100)
    }
  }, [initialBet])

  const hit = () => {
    game.hit()
    setState({ ...game.state })
  }

  const stand = () => {
    game.stand()
    setState({ ...game.state })
  }

  const renderCard = (card: Card, index: number) => (
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

  // Auto-start when selectedBet changes
  useEffect(() => {
    if (selectedBet && !isGameActive && state.gameStatus === 'waiting') {
      console.log('Starting game for bet:', selectedBet)
      startGame()
    }
  }, [selectedBet])

  // Bet selection screen
  if (state.gameStatus === 'waiting' && !selectedBet) {
    return (
      <div className="casino-table">
        {showWalletWarning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600 text-white p-2 rounded-lg mb-3 text-xs text-center"
          >
            Please connect your wallet first!
          </motion.div>
        )}
        <div className="text-center">
          <div className="text-4xl mb-2">🃏</div>
          <p className="text-white text-sm font-bold mb-2">Choose Your Bet</p>
          <div className="flex flex-col gap-2">
            {betOptions.map((bet) => (
              <button
                key={bet}
                onClick={() => setSelectedBet(bet)}
                className="w-full px-4 py-3 bg-gold hover:bg-gold-dark text-black font-bold rounded-lg text-sm transition-all shadow-lg"
              >
                ${bet} - Win {bet} Share{bet > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Game screen
  if (state.gameStatus !== 'waiting') {
    return (
      <div className="casino-table h-full flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-bold text-white">Bet: ${selectedBet}</h3>
          <div className="text-[10px] text-green-200">
            Win: {state.gameStatus === 'player_win' ? selectedBet : 0} shares
          </div>
        </div>

        {/* Dealer */}
        <div className="mb-2 flex-1 flex flex-col justify-center">
          <div className="text-sm font-semibold text-white mb-3 text-center">
            🃏 Dealer {state.dealerScore > 0 && `(${state.dealerScore})`}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[100px] items-center justify-center">
            {state.dealerHand.map((card, index) => {
              const showCard = isGameActive && index === 0 && state.gameStatus === 'player_turn' ? false : true
              return showCard ? renderCard(card, index) : (
                <div key={index} className="card" style={{ background: '#1e40af', color: 'white' }}>
                  🂠
                </div>
              )
            })}
          </div>
        </div>

        {/* Player */}
        <div className="mb-3 flex-1 flex flex-col justify-center">
          <div className="text-sm font-semibold text-white mb-3 text-center">
            🎴 You {state.playerScore > 0 && `(${state.playerScore})`}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[100px] items-center justify-center">
            {state.playerHand.map((card, index) => renderCard(card, index))}
          </div>
        </div>

        {/* Message and Buttons */}
        <div className="mt-auto">
          {/* Message */}
          <div className="text-center mb-2">
            <motion.p
              key={state.message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-bold text-white"
            >
              {state.message}
            </motion.p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            {state.gameStatus === 'playing' && (
              <>
                <button
                  onClick={hit}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-base shadow-lg"
                >
                  Hit
                </button>
                <button
                  onClick={stand}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-base shadow-lg"
                >
                  Stand
                </button>
              </>
            )}
            {(state.gameStatus === 'player_win' || state.gameStatus === 'dealer_win' || 
              state.gameStatus === 'draw' || state.gameStatus === 'bust' || 
              state.gameStatus === 'blackjack') && (
              <>
                <button
                  onClick={tryAgain}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-base shadow-lg"
                >
                  Try Again
                </button>
                <button
                  onClick={reset}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-base shadow-lg"
                >
                  New Game
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // No play button - should not reach here
  return null
}
