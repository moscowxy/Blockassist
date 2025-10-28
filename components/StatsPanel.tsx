'use client'

import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

export function StatsPanel() {
  const { address, isConnected, chainId } = useAccount()
  const [stats, setStats] = useState({
    weeklyPool: '0',
    totalGames: '0',
    playerWins: '0',
    playerReward: '0',
  })

  useEffect(() => {
    if (isConnected && chainId) {
      // In a real app, you would fetch this from the contract
      // For now, we'll use placeholder data
      setStats({
        weeklyPool: '1,234.56',
        totalGames: '1234',
        playerWins: '7',
        playerReward: '45.67',
      })
    }
  }, [isConnected, chainId])

  if (!isConnected) {
    return (
      <div className="bg-green-900/50 backdrop-blur-sm rounded-lg p-2 mb-2">
        <p className="text-center text-green-200 text-[10px] leading-tight">
          Connect wallet
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 mb-3">
      <div className="bg-green-900/50 backdrop-blur-sm rounded-lg p-2 border border-green-700">
        <div className="text-green-300 text-[10px] mb-0.5">Pool</div>
        <div className="text-sm font-bold text-white truncate">${stats.weeklyPool} 💰</div>
      </div>
      
      <div className="bg-green-900/50 backdrop-blur-sm rounded-lg p-2 border border-green-700">
        <div className="text-green-300 text-[10px] mb-0.5">Games</div>
        <div className="text-sm font-bold text-white">{stats.totalGames}</div>
      </div>
      
      <div className="bg-green-900/50 backdrop-blur-sm rounded-lg p-2 border border-green-700">
        <div className="text-green-300 text-[10px] mb-0.5">Wins</div>
        <div className="text-sm font-bold text-white">{stats.playerWins}</div>
      </div>
      
      <div className="bg-green-900/50 backdrop-blur-sm rounded-lg p-2 border border-green-700">
        <div className="text-green-300 text-[10px] mb-0.5">Reward</div>
        <div className="text-sm font-bold text-white truncate">${stats.playerReward}</div>
      </div>
    </div>
  )
}
