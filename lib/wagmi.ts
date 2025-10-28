import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

export const base = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
}

export const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://sepolia.basescan.org' },
  },
}

export const config = createConfig({
  chains: [baseSepolia, base], // Base Sepolia first for testing
  connectors: [
    injected(),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
})

export function getContractAddress(chainId: number): string {
  if (chainId === baseSepolia.id) {
    return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || ''
  }
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
}
