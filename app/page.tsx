'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const WalletButton = dynamic(() => import('@/components/WalletButton').then(mod => ({ default: mod.WalletButton })), { ssr: false })
const BlackjackScreen = dynamic(() => import('@/components/BlackjackScreen'), { ssr: false })
const TokenScreen = dynamic(() => import('@/components/TokenScreen').then(mod => ({ default: mod.TokenScreen })), { ssr: false })

export default function Home() {
  const [activeTab, setActiveTab] = useState<'play' | 'token'>('play')

  return (
    <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-2" style={{ height: '100dvh' }} suppressHydrationWarning>
      <div className="w-full max-w-[480px] mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🃏</div>
            <h1 className="text-lg font-bold text-white">Blackjack</h1>
          </div>
          <WalletButton />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setActiveTab('play')}
            className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'play'
                ? 'bg-gold text-black'
                : 'bg-green-900/50 text-white hover:bg-green-800'
            }`}
          >
            Play
          </button>
          <button
            onClick={() => setActiveTab('token')}
            className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'token'
                ? 'bg-gold text-black'
                : 'bg-green-900/50 text-white hover:bg-green-800'
            }`}
          >
            Rewards
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 mb-2 overflow-hidden">
          {activeTab === 'play' ? <BlackjackScreen /> : <TokenScreen />}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="text-center pt-2 pb-1 border-t border-green-700 flex-shrink-0">
          <p className="text-green-300 text-[10px]">Powered by Moscow</p>
        </div>
      </div>
    </div>
  )
}
