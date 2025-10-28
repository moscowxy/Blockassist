export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  rank: Rank
  suit: Suit
  value: number
}

export interface GameState {
  playerHand: Card[]
  dealerHand: Card[]
  playerScore: number
  dealerScore: number
  gameStatus: 'waiting' | 'playing' | 'player_win' | 'dealer_win' | 'draw' | 'bust' | 'blackjack'
  message: string
}

export class BlackjackGame {
  private deck: Card[]
  public state: GameState

  constructor() {
    this.deck = this.createDeck()
    this.state = this.initializeState()
  }

  private createDeck(): Card[] {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const deck: Card[] = []

    for (const suit of suits) {
      for (const rank of ranks) {
        let value = 0
        if (rank === 'A') value = 11
        else if (['J', 'Q', 'K'].includes(rank)) value = 10
        else value = parseInt(rank)

        deck.push({ rank, suit, value })
      }
    }

    return this.shuffleDeck(deck)
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  private initializeState(): GameState {
    return {
      playerHand: [],
      dealerHand: [],
      playerScore: 0,
      dealerScore: 0,
      gameStatus: 'waiting',
      message: 'Welcome! Place your bet to start.',
    }
  }

  dealInitialCards(): void {
    // Deal initial 2 cards to each player (total 4 cards)
    this.dealCard(true) // Player card 1
    this.dealCard(false) // Dealer card 1
    this.dealCard(true) // Player card 2
    this.dealCard(false) // Dealer card 2
    
    console.log('Dealt cards:', {
      playerCards: this.state.playerHand.length,
      dealerCards: this.state.dealerHand.length
    })

    // Calculate both scores with 2 cards each
    this.updateScores()
    this.checkForBlackjack()
  }

  dealCard(isPlayer: boolean): void {
    if (this.deck.length === 0) {
      this.deck = this.createDeck()
    }

    const card = this.deck.pop()!
    if (isPlayer) {
      this.state.playerHand.push(card)
    } else {
      this.state.dealerHand.push(card)
    }
  }

  hit(): void {
    if (this.state.gameStatus !== 'playing') return

    this.dealCard(true)
    this.updateScores()

    if (this.state.playerScore > 21) {
      this.state.gameStatus = 'bust'
      this.state.message = 'Bust! You went over 21! 💥'
    }
  }

  stand(): void {
    if (this.state.gameStatus !== 'playing') return

    // Calculate dealer score with both cards now (reveal hidden card)
    this.state.dealerScore = this.calculateScore(this.state.dealerHand)

    while (this.state.dealerScore < 17) {
      this.dealCard(false)
      this.updateScores()
    }

    this.determineWinner()
  }

  private updateScores(): void {
    this.state.playerScore = this.calculateScore(this.state.playerHand)
    this.state.dealerScore = this.calculateScore(this.state.dealerHand)
  }

  private calculateScore(hand: Card[]): number {
    let score = 0
    let aces = 0

    for (const card of hand) {
      if (card.rank === 'A') {
        aces++
        score += 11
      } else {
        score += card.value
      }
    }

    while (score > 21 && aces > 0) {
      score -= 10
      aces--
    }

    return score
  }

  private checkForBlackjack(): void {
    if (this.state.playerScore === 21) {
      this.state.gameStatus = 'blackjack'
      this.state.message = 'Blackjack! 🎉 You Win!'
    } else {
      this.state.gameStatus = 'playing'
      this.state.message = 'Your turn! Hit or Stand?'
    }
  }

  private determineWinner(): void {
    const playerScore = this.state.playerScore
    const dealerScore = this.state.dealerScore

    if (dealerScore > 21) {
      this.state.gameStatus = 'player_win'
      this.state.message = 'Dealer Busts! You Win! 🎉'
    } else if (playerScore > dealerScore) {
      this.state.gameStatus = 'player_win'
      this.state.message = `You Win! ${playerScore} beats ${dealerScore} 🎉`
    } else if (dealerScore > playerScore) {
      this.state.gameStatus = 'dealer_win'
      this.state.message = `Dealer Wins! ${dealerScore} beats ${playerScore} 😢`
    } else {
      this.state.gameStatus = 'draw'
      this.state.message = "It's a Push! Same score 🤝"
    }
  }

  reset(): void {
    this.deck = this.createDeck()
    this.state = this.initializeState()
  }
}

export function getCardSymbol(card: Card): string {
  const suits = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }
  return `${card.rank}${suits[card.suit]}`
}

export function getCardColor(card: Card): 'red' | 'black' {
  return card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'
}

