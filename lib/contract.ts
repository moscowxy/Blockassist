import { Address, parseAbi } from 'viem'

const rawABI = [
  'function startGame(uint256 betAmountUSD) payable returns (uint256)',
  'function hit(uint256 gameId)',
  'function stand(uint256 gameId)',
  'function getGame(uint256 gameId) view returns ((address player, uint256 betAmount, uint8 state, uint256 startedAt, uint256 finishedAt, uint256 randomSeed, uint8 cardsDrawn, uint8 playerScore, uint8 dealerScore, bool playerBlackjack, bool dealerBlackjack, uint8[] playerCards, uint8[] dealerCards))',
  'function getRequiredETHAmount(uint256 betAmountUSD) view returns (uint256)',
  'function weeklyWins(address) view returns (uint256)',
  'function estimateUserReward(address) view returns (uint256)',
  'function getWeeklyStats() view returns (uint256,uint256,uint256,uint256,uint256,uint256)',
  'function claimWeeklyReward()',
  'event GameStarted(uint256 indexed, address indexed, uint256)',
  'event GameWon(uint256 indexed, address indexed, uint256)',
  'event GameLost(uint256 indexed, address indexed)',
  'event PoolGrowth(uint256, uint256)',
]

export const blackjackABI = parseAbi(rawABI)

export interface GameData {
  player: Address
  betAmount: bigint
  state: number
  startedAt: bigint
  finishedAt: bigint
  randomSeed: bigint
  cardsDrawn: number
  playerScore: number
  dealerScore: number
  playerBlackjack: boolean
  dealerBlackjack: boolean
  playerCards: number[]
  dealerCards: number[]
}

export const GAME_STATES = {
  NONE: 0,
  WAITING_FOR_RANDOMNESS: 1,
  PLAYING: 2,
  FINISHED: 3,
} as const

