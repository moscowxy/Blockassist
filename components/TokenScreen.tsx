'use client'

import { useAccount, useReadContract } from 'wagmi'
import { Address } from 'viem'
import { blackjackABI } from '@/lib/contract'
import { getContractAddress } from '@/lib/wagmi'

export function TokenScreen() {
  const { isConnected, address, chainId } = useAccount()
  const contractAddress = chainId ? getContractAddress(chainId) : ''

  // Read weekly wins for the user
  const { data: weeklyWins } = useReadContract({
    address: contractAddress as Address,
    abi: blackjackABI,
    functionName: 'weeklyWins',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!contractAddress },
  })

  // Read estimated user reward
  const { data: estimatedReward } = useReadContract({
    address: contractAddress as Address,
    abi: blackjackABI,
    functionName: 'estimateUserReward',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!contractAddress },
  })

  // Read weekly stats
  const { data: weeklyStats } = useReadContract({
    address: contractAddress as Address,
    abi: blackjackABI,
    functionName: 'getWeeklyStats',
    query: { enabled: !!contractAddress },
  })

  // Parse weekly stats if available
  const [
    weeklyPoolBalance,
    totalWeeklyWins,
    totalGames,
    weeklyProgress,
    totalPlayers,
    platformFee
  ] = weeklyStats || [0n, 0n, 0n, 0n, 0n, 0n]

  return (
    <div className="casino-table">
      {!isConnected ? (
        <div className="text-center text-green-200 text-sm">
          <p>Connect your wallet to see your stats</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-green-900/50 rounded-lg p-2 border border-green-700">
            <div className="text-xs text-green-300 mb-1">Your Address</div>
            <div className="text-[10px] text-white font-mono break-all">
              {address}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-900/50 rounded-lg p-2 border border-green-700">
              <div className="text-[10px] text-green-300 mb-0.5">Total Wins</div>
              <div className="text-base font-bold text-white">{totalWeeklyWins?.toString() || '0'}</div>
            </div>
            <div className="bg-green-900/50 rounded-lg p-2 border border-green-700">
              <div className="text-[10px] text-green-300 mb-0.5">Win Shares</div>
              <div className="text-base font-bold text-white">{weeklyWins?.toString() || '0'}</div>
            </div>
          </div>

          <div className="bg-green-900/50 rounded-lg p-2 border border-green-700">
            <div className="text-[10px] text-green-300 mb-1">Weekly Prize Pool</div>
            <div className="text-xl font-bold text-white">
              ${(Number(weeklyPoolBalance || 0n) / 1e18).toFixed(2)} 💰
            </div>
            <div className="text-[10px] text-green-200 mt-1">
              Total Games: {totalGames?.toString() || '0'}
            </div>
          </div>

          <div className="bg-green-900/50 rounded-lg p-2 border border-green-700">
            <div className="text-[10px] text-green-300 mb-0.5">Est. Reward</div>
            <div className="text-base font-bold text-white">
              ${estimatedReward ? (Number(estimatedReward) / 1e18).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
