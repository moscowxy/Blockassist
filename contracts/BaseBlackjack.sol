// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "./utils/Ownable.sol";
import {ReentrancyGuard} from "./utils/ReentrancyGuard.sol";
import {VRFConsumerBaseV2Plus} from "./utils/VRFConsumerBaseV2Plus.sol";
import {AggregatorV3Interface} from "./interfaces/AggregatorV3Interface.sol";
import {VRFCoordinatorV2_5Interface} from "./interfaces/VRFCoordinatorV2_5Interface.sol";

/**
 * @title BaseBlackjack
 * @notice Blackjack game designed for Base chain with dynamic weekly reward pool mechanics.
 */
contract BaseBlackjack is Ownable, ReentrancyGuard, VRFConsumerBaseV2Plus {
    enum GameState {
        NONE,
        WAITING_FOR_RANDOMNESS,
        PLAYING,
        FINISHED
    }

    struct Game {
        address player;
        uint256 betAmount;
        GameState state;
        uint256 startedAt;
        uint256 finishedAt;
        uint256 randomSeed;
        uint8 cardsDrawn;
        uint8 playerScore;
        uint8 dealerScore;
        bool playerBlackjack;
        bool dealerBlackjack;
        uint8[] playerCards;
        uint8[] dealerCards;
    }

    // Player statistics
    mapping(address => uint256) public totalGamesPlayed;
    mapping(address => uint256) public totalGamesWon;

    // Weekly accounting
    mapping(address => uint256) private _weeklyWins;
    mapping(address => uint256) private _userWeekId;
    mapping(address => bool) private _hasClaimed;
    mapping(address => uint256) private _claimWeekId;

    uint256 public weeklyPoolBalance;
    uint256 public totalWeeklyWins;
    uint256 public totalGamesThisWeek;
    uint256 public weekStartTime;
    uint256 public currentWeekId;
    bool public weekFinalized;
    uint256 public finalizedRewardPool;
    uint256 public finalizedTotalWins;
    uint256 public lastPlatformFee;

    // Economic parameters
    uint256 public constant GAME_COST_USD = 1e18; // $1 with 18 decimals
    uint256 public constant PLATFORM_FEE_PERCENT = 5;
    uint256 public constant REWARD_POOL_PERCENT = 95;
    uint256 public constant WEEK_DURATION = 7 days;

    // Chainlink configuration
    AggregatorV3Interface public immutable priceFeed;
    VRFCoordinatorV2_5Interface public immutable coordinator;

    uint256 public vrfSubscriptionId;
    bytes32 public vrfKeyHash;
    uint32 public vrfCallbackGasLimit;
    uint16 public vrfRequestConfirmations;
    uint32 public vrfNumWords;

    // Game bookkeeping
    uint256 public nextGameId;
    mapping(uint256 => Game) private _games;
    mapping(uint256 => uint256) private _requestToGame;

    // Events
    event GameStarted(uint256 indexed gameId, address indexed player, uint256 betAmount);
    event GameWon(uint256 indexed gameId, address indexed player, uint256 totalWins);
    event GameLost(uint256 indexed gameId, address indexed player);
    event WeekFinalized(uint256 rewardPool, uint256 totalWins, uint256 totalGames);
    event RewardClaimed(address indexed user, uint256 amount, uint256 wins);
    event NewWeekStarted(uint256 timestamp);
    event PoolGrowth(uint256 newBalance, uint256 gameCount);
    event GameRandomnessRequested(uint256 indexed gameId, uint256 indexed requestId);

    error InvalidGame(uint256 gameId);
    error GameNotReady(uint256 gameId);
    error NotPlayer(uint256 gameId);
    error InvalidState(GameState expected, GameState actual);
    error WeekNotOver();
    error WeekAlreadyFinalized();
    error PoolEmpty();
    error WeekNotFinalized();

    constructor(
        address priceFeedAddress,
        address coordinatorAddress,
        uint256 subscriptionId,
        bytes32 keyHash,
        uint32 callbackGasLimit,
        uint16 requestConfirmations,
        uint32 numWords
    ) VRFConsumerBaseV2Plus(coordinatorAddress) {
        require(priceFeedAddress != address(0), "Invalid price feed");
        require(coordinatorAddress != address(0), "Invalid coordinator");
        require(numWords >= 1, "At least one word required");

        priceFeed = AggregatorV3Interface(priceFeedAddress);
        coordinator = VRFCoordinatorV2_5Interface(coordinatorAddress);

        vrfSubscriptionId = subscriptionId;
        vrfKeyHash = keyHash;
        vrfCallbackGasLimit = callbackGasLimit;
        vrfRequestConfirmations = requestConfirmations;
        vrfNumWords = numWords;

        currentWeekId = 1;
        weekStartTime = block.timestamp;
    }

    // ===================== External game flow =====================

    function startGame() external payable nonReentrant returns (uint256 gameId) {
        require(!weekFinalized, "Week finalized");
        require(block.timestamp < weekStartTime + WEEK_DURATION, "Week needs finalize");

        uint256 requiredETH = getRequiredETHAmount();
        require(msg.value >= requiredETH, "Insufficient payment: need $1 worth of ETH");

        _syncUserWeek(msg.sender);

        weeklyPoolBalance += requiredETH;
        totalGamesThisWeek += 1;
        totalGamesPlayed[msg.sender] += 1;

        gameId = ++nextGameId;
        Game storage game = _games[gameId];
        game.player = msg.sender;
        game.betAmount = requiredETH;
        game.state = GameState.WAITING_FOR_RANDOMNESS;
        game.startedAt = block.timestamp;

        uint256 requestId = coordinator.requestRandomWords(
            vrfKeyHash,
            vrfSubscriptionId,
            vrfRequestConfirmations,
            vrfCallbackGasLimit,
            vrfNumWords
        );

        _requestToGame[requestId] = gameId;

        emit GameStarted(gameId, msg.sender, requiredETH);
        emit GameRandomnessRequested(gameId, requestId);
        emit PoolGrowth(weeklyPoolBalance, totalGamesThisWeek);

        if (msg.value > requiredETH) {
            unchecked {
                payable(msg.sender).transfer(msg.value - requiredETH);
            }
        }
    }

    function hit(uint256 gameId) external {
        Game storage game = _getPlayableGame(gameId, msg.sender);

        _drawCard(gameId, true);

        if (game.playerScore > 21) {
            _endGame(gameId, false);
        }
    }

    function stand(uint256 gameId) external {
        Game storage game = _getPlayableGame(gameId, msg.sender);

        _dealerPlay(gameId);
        bool playerWon = _determineWinner(gameId);
        _endGame(gameId, playerWon);
    }

    // ===================== Weekly economy =====================

    function finalizeWeek() external {
        if (block.timestamp < weekStartTime + WEEK_DURATION) revert WeekNotOver();
        if (weekFinalized) revert WeekAlreadyFinalized();
        if (weeklyPoolBalance == 0) revert PoolEmpty();

        uint256 platformCut = (weeklyPoolBalance * PLATFORM_FEE_PERCENT) / 100;
        weeklyPoolBalance = weeklyPoolBalance - platformCut;
        finalizedRewardPool = weeklyPoolBalance;
        finalizedTotalWins = totalWeeklyWins;
        weekFinalized = true;
        lastPlatformFee = platformCut;

        payable(owner()).transfer(platformCut);

        emit WeekFinalized(finalizedRewardPool, totalWeeklyWins, totalGamesThisWeek);
    }

    function claimWeeklyReward() external nonReentrant {
        if (!weekFinalized) revert WeekNotOver();
        uint256 userWins = weeklyWins(msg.sender);
        require(userWins > 0, "No wins to claim");
        require(!_isClaimed(msg.sender), "Already claimed this week");
        require(finalizedTotalWins > 0, "No wins recorded");

        uint256 reward = (userWins * finalizedRewardPool) / finalizedTotalWins;
        _setClaimed(msg.sender);

        payable(msg.sender).transfer(reward);

        emit RewardClaimed(msg.sender, reward, userWins);
    }

    function startNewWeek() external onlyOwner {
        if (!weekFinalized) revert WeekNotFinalized();

        weekFinalized = false;
        weekStartTime = block.timestamp;
        currentWeekId += 1;
        weeklyPoolBalance = 0;
        totalWeeklyWins = 0;
        totalGamesThisWeek = 0;
        finalizedRewardPool = 0;
        finalizedTotalWins = 0;
        lastPlatformFee = 0;

        emit NewWeekStarted(weekStartTime);
    }

    // ===================== VRF callback =====================

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 gameId = _requestToGame[requestId];
        if (gameId == 0) revert InvalidGame(gameId);
        delete _requestToGame[requestId];

        Game storage game = _games[gameId];
        if (game.state != GameState.WAITING_FOR_RANDOMNESS) revert GameNotReady(gameId);

        game.randomSeed = randomWords[0];
        game.state = GameState.PLAYING;

        // Deal initial hands: player, dealer, player, dealer
        _drawCard(gameId, true);
        _drawCard(gameId, false);
        _drawCard(gameId, true);
        _drawCard(gameId, false);

        // Blackjack checks
        if (game.playerScore == 21) {
            game.playerBlackjack = true;
        }
        if (game.dealerScore == 21) {
            game.dealerBlackjack = true;
        }

        if (game.playerBlackjack || game.dealerBlackjack) {
            bool playerWon = _determineWinner(gameId);
            _endGame(gameId, playerWon);
        }
    }

    // ===================== Views =====================

    function getGame(uint256 gameId) external view returns (Game memory) {
        return _games[gameId];
    }

    function weeklyWins(address user) public view returns (uint256) {
        return _userWeekId[user] == currentWeekId ? _weeklyWins[user] : 0;
    }

    function hasClaimed(address user) public view returns (bool) {
        return _claimWeekId[user] == currentWeekId ? _hasClaimed[user] : false;
    }

    function estimateUserReward(address user) public view returns (uint256) {
        uint256 wins = weeklyWins(user);
        if (wins == 0) {
            return 0;
        }

        uint256 pool = weekFinalized ? finalizedRewardPool : (weeklyPoolBalance * REWARD_POOL_PERCENT) / 100;
        uint256 winsBase = weekFinalized ? finalizedTotalWins : totalWeeklyWins;
        if (winsBase == 0) {
            return 0;
        }

        return (wins * pool) / winsBase;
    }

    function getWeeklyStats()
        external
        view
        returns (
            uint256 currentPool,
            uint256 estimatedRewardPool,
            uint256 totalWins,
            uint256 totalGames,
            uint256 timeUntilDistribution,
            uint256 platformFeeCollected
        )
    {
        currentPool = weeklyPoolBalance;
        if (weekFinalized) {
            estimatedRewardPool = finalizedRewardPool;
            platformFeeCollected = lastPlatformFee;
        } else {
            estimatedRewardPool = (weeklyPoolBalance * REWARD_POOL_PERCENT) / 100;
            platformFeeCollected = (weeklyPoolBalance * PLATFORM_FEE_PERCENT) / 100;
        }
        totalWins = totalWeeklyWins;
        totalGames = totalGamesThisWeek;

        uint256 weekEnd = weekStartTime + WEEK_DURATION;
        timeUntilDistribution = block.timestamp >= weekEnd ? 0 : weekEnd - block.timestamp;
    }

    // ===================== Admin helpers =====================

    function updateVRFConfig(
        bytes32 keyHash,
        uint256 subscriptionId,
        uint32 callbackGasLimit,
        uint16 requestConfirmations,
        uint32 numWords
    ) external onlyOwner {
        require(numWords >= 1, "At least one word required");
        vrfKeyHash = keyHash;
        vrfSubscriptionId = subscriptionId;
        vrfCallbackGasLimit = callbackGasLimit;
        vrfRequestConfirmations = requestConfirmations;
        vrfNumWords = numWords;
    }

    // ===================== Internal helpers =====================

    function _getPlayableGame(uint256 gameId, address player) internal view returns (Game storage) {
        Game storage game = _games[gameId];
        if (game.player != player) revert NotPlayer(gameId);
        if (game.state != GameState.PLAYING) {
            revert InvalidState(GameState.PLAYING, game.state);
        }
        return game;
    }

    function _drawCard(uint256 gameId, bool forPlayer) internal {
        Game storage game = _games[gameId];
        require(game.randomSeed != 0, "Random seed missing");

        uint256 drawIndex = game.cardsDrawn;
        game.cardsDrawn += 1;

        uint256 randomValue = uint256(keccak256(abi.encode(game.randomSeed, drawIndex, gameId)));
        uint8 card = uint8(randomValue % 13) + 1; // 1-13

        if (forPlayer) {
            game.playerCards.push(card);
            game.playerScore = _calculateScore(game.playerCards);
        } else {
            game.dealerCards.push(card);
            game.dealerScore = _calculateScore(game.dealerCards);
        }
    }

    function _calculateScore(uint8[] storage cards) internal view returns (uint8) {
        uint256 total;
        uint256 aces;
        for (uint256 i = 0; i < cards.length; i++) {
            uint8 value = cards[i];
            uint8 points = value > 10 ? 10 : value;
            if (points == 1) {
                points = 11;
                aces += 1;
            }
            total += points;
        }

        while (total > 21 && aces > 0) {
            total -= 10;
            aces -= 1;
        }

        return uint8(total);
    }

    function _dealerPlay(uint256 gameId) internal {
        Game storage game = _games[gameId];
        while (game.dealerScore < 17) {
            _drawCard(gameId, false);
        }
    }

    function _determineWinner(uint256 gameId) internal view returns (bool) {
        Game storage game = _games[gameId];
        if (game.playerBlackjack && !game.dealerBlackjack) {
            return true;
        }
        if (game.dealerBlackjack && !game.playerBlackjack) {
            return false;
        }
        if (game.playerScore > 21) {
            return false;
        }
        if (game.dealerScore > 21) {
            return true;
        }
        if (game.playerScore > game.dealerScore) {
            return true;
        }
        if (game.playerScore < game.dealerScore) {
            return false;
        }
        // Push counts as loss for prize mechanics per requirements
        return false;
    }

    function _endGame(uint256 gameId, bool playerWon) internal {
        Game storage game = _games[gameId];
        if (game.state == GameState.FINISHED) {
            return;
        }

        game.state = GameState.FINISHED;
        game.finishedAt = block.timestamp;

        if (playerWon) {
            _incrementUserWin(game.player);
            totalWeeklyWins += 1;
            totalGamesWon[game.player] += 1;
            emit GameWon(gameId, game.player, weeklyWins(game.player));
        } else {
            emit GameLost(gameId, game.player);
        }
    }

    function _incrementUserWin(address user) internal {
        _syncUserWeek(user);
        _weeklyWins[user] += 1;
    }

    function _syncUserWeek(address user) internal {
        if (_userWeekId[user] != currentWeekId) {
            _userWeekId[user] = currentWeekId;
            _weeklyWins[user] = 0;
            _hasClaimed[user] = false;
            _claimWeekId[user] = currentWeekId;
        }
    }

    function _isClaimed(address user) internal view returns (bool) {
        return _claimWeekId[user] == currentWeekId && _hasClaimed[user];
    }

    function _setClaimed(address user) internal {
        _claimWeekId[user] = currentWeekId;
        _hasClaimed[user] = true;
    }

    // ===================== Pricing =====================

    function getRequiredETHAmount() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");

        uint256 ethAmount = (GAME_COST_USD * 1e8) / uint256(price);
        uint256 slippage = ethAmount / 100; // 1%
        return ethAmount + slippage;
    }
}
