'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2" suppressHydrationWarning>
        <span className="text-green-200 text-xs">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-semibold"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        console.log('Connect button clicked, connectors:', connectors)
        if (connectors && connectors.length > 0) {
          // Use the second connector (injected provider like MetaMask)
          const connector = connectors[1] || connectors[0]
          console.log('Connecting with:', connector.name, connector.id)
          connect({ connector })
        } else {
          console.error('No connectors available')
        }
      }}
      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-semibold"
    >
      Connect
    </button>
  )
}
