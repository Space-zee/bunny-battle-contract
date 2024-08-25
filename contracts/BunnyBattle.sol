//SPDX-License-Identifier: Unlicense

//
//   ______                          ______       _   _   _
//   | ___ \                         | ___ \     | | | | | |
//   | |_/ /_   _ _ __  _ __  _   _  | |_/ / __ _| |_| |_| | ___
//   | ___ \ | | | '_ \| '_ \| | | | | ___ \/ _` | __| __| |/ _ \
//   | |_/ / |_| | | | | | | | |_| | | |_/ / (_| | |_| |_| |  __/
//   \____/ \__,_|_| |_|_| |_|\__, | \____/ \__,_|\__|\__|_|\___|
//                             __/ |
//                            |___/
//   _ _ _ ____ _  _ ___    ___ ____     _ ____ _ _  _    ___ _  _ ____    ___ ____ ____ _  _ __.
//   | | | |__| |\ |  |      |  |  |     | |  | | |\ |     |  |__| |___     |  |___ |__| |\/|  _]
//   |_|_| |  | | \|  |      |  |__|    _| |__| | | \|     |  |  | |___     |  |___ |  | |  |  .
//
//
//   Tell us what you’d like to improve → Telegram: @AkstonBunny
//
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IBunnyBattle} from "./interfaces/IBunnyBattle.sol";
import {IBoardVerifier, IMoveVerifier} from "./interfaces/IProofVerification.sol";

/// @dev BunnyBattle contract that uses zk proof for fair game
contract BunnyBattle is Ownable, IBunnyBattle {
    /// @dev fee percentage amount that subtract from each game pool prize
    uint128 private constant FEE_PERCENTAGE = 100; // 100% = 10000 | 1% = 100
    uint128 private constant BPS = 10000;

    /// @dev time that allowed for user to make a move
    uint256 private constant MAKE_MOVE_TIMESTAMP = 60 seconds;
    /// @dev min bet amount for game deposit
    uint128 private constant MIN_BET_AMOUNT = 0.001 ether;

    /// @dev accumulated fee from the passed games
    uint128 private accumulatedFee;

    /// @dev id of the next game
    uint32 private nextGameID;

    /// @dev proof verifier contracts
    IBoardVerifier private immutable boardVerifier;
    IMoveVerifier private immutable moveVerifier;

    /// @dev info about games
    mapping(uint32 => Game) private games;

    mapping(uint32 gameID => mapping(uint8 => Move)) private moves;
    mapping(uint32 gameID => mapping(address player => uint8)) private totalHits;

    /// @dev Initialize constructor parameters
    /// @param _boardVerifier verifier contract for board creation proof to start or join
    /// @param _moveVerifier verifier contract for making a move proof
    constructor(IBoardVerifier _boardVerifier, IMoveVerifier _moveVerifier) Ownable(msg.sender) {
        boardVerifier = _boardVerifier;
        moveVerifier = _moveVerifier;
    }

    /// @dev Create new game with the first player as msg.sender
    /// @param _proof proof of board creation
    /// @param _boardHash hash of the initial board state, to make sure user doesn't change the initial board view
    /// @param _betAmount amount of the bet for the current game. Both user should pay this amount to join the game.
    /// The user creates game and sets bet amount.
    /// Emits as {GameCreated} event
    function createGame(bytes calldata _proof, uint256 _boardHash, uint128 _betAmount)
        external
        payable
        returns (uint32)
    {
        if (_betAmount < MIN_BET_AMOUNT) revert IncorrectBetAmount();

        _requireCreateProof(_proof, _boardHash);
        _validateDeposit(_betAmount);

        uint32 _currentID = nextGameID;

        unchecked {
            nextGameID += 1;
        }

        games[_currentID] = Game({
            player1: msg.sender,
            player1Hash: _boardHash,
            betAmount: _betAmount,
            totalBetAmount: _betAmount,
            player2: address(0),
            player2Hash: 0,
            winner: address(0),
            movesSize: 0,
            isRewardClaimed: false,
            nextMoveDeadline: 0
        });

        emit GameCreated(_currentID, msg.sender, _betAmount);

        return _currentID;
    }

    /// @dev Join game with id `_gameID`
    /// @param _gameID id of the game to join
    /// @param _proof proof of board creation
    /// @param _boardHash hash of the initial board state, to make sure user doesn't change the initial board view
    /// The user needs to deposit betAmount to join the game
    /// Emits as {GameJoined} event
    function joinGame(uint32 _gameID, bytes calldata _proof, uint256 _boardHash) external payable {
        if (_gameID >= nextGameID) revert InvalidGameID();

        Game memory g = games[_gameID];

        if (g.player1 == msg.sender) revert NotAllowedJoinGame();
        if (g.player2 != address(0)) revert NotAllowedJoinGame();

        _requireCreateProof(_proof, _boardHash);
        _validateDeposit(g.betAmount);

        games[_gameID].player2 = msg.sender;
        games[_gameID].player2Hash = _boardHash;

        unchecked {
            games[_gameID].totalBetAmount += g.betAmount;
            games[_gameID].nextMoveDeadline = block.timestamp + MAKE_MOVE_TIMESTAMP;
        }

        emit GameJoined(_gameID, msg.sender);
    }

    /// @dev Submit move function
    /// @param _gameID id of the game to join
    /// @param _moveX x coordinate of the current move
    /// @param _moveY y coordinate of the current move
    /// @param _proof proof that verify prev move
    /// @param isPreviousMoveAHit point if the prev move was a hit
    /// We check if the user gor 2 hits to detect the winner
    /// User has only 1 minute to make a move otherwise technical lose will appear
    /// Emits as {MoveSubmitted} event and {GameFinished} event
    function submitMove(uint32 _gameID, uint8 _moveX, uint8 _moveY, bytes calldata _proof, bool isPreviousMoveAHit)
        external
    {
        if (_gameID >= nextGameID) revert InvalidGameID();

        Game memory g = games[_gameID];

        if (g.player2 == address(0)) revert PlayerTwoNotJoinedYet();

        uint8 movesSize = g.movesSize;

        if (g.winner != address(0)) revert GameIsFinished();
        if (g.nextMoveDeadline > 0 && g.nextMoveDeadline < block.timestamp) revert TechnicalLose();

        uint256 _boardHash;
        if (movesSize % 2 == 0) {
            if (msg.sender != g.player1) revert InvalidTurn();
            _boardHash = g.player1Hash;
        } else {
            if (msg.sender != g.player2) revert InvalidTurn();
            _boardHash = g.player2Hash;
        }

        if (_moveX >= 3) revert InvalidMoveX();
        if (_moveY >= 3) revert InvalidMoveY();

        uint8 playerTotalHits = totalHits[_gameID][msg.sender];

        // for the not-first move, ensure the previous guess is marked as hit/no-hit
        if (movesSize > 0) {
            Move memory previousMove = moves[_gameID][movesSize - 1];
            _requireMoveProof(_proof, _boardHash, isPreviousMoveAHit, previousMove.x, previousMove.y);

            if (isPreviousMoveAHit) {
                moves[_gameID][movesSize - 1].isHit = isPreviousMoveAHit;

                unchecked {
                    ++playerTotalHits;
                    totalHits[_gameID][msg.sender] = playerTotalHits;
                }
            }
        }

        // check previous player move
        if (playerTotalHits == 2) {
            address winner = movesSize % 2 == 0 ? g.player2 : g.player1;
            g.winner = winner;
        }

        moves[_gameID][movesSize] = Move({x: _moveX, y: _moveY, isHit: false});

        unchecked {
            g.movesSize = movesSize + 1;
            g.nextMoveDeadline = block.timestamp + MAKE_MOVE_TIMESTAMP;
        }

        games[_gameID] = g;

        emit MoveSubmitted(_gameID, msg.sender, _moveX, _moveY, isPreviousMoveAHit);

        if (g.winner != address(0)) {
            _claimReward(_gameID, g.totalBetAmount, g.winner);
            emit GameFinished(_gameID, g.winner, movesSize);
        }
    }

    /// @dev Claim commission accumulated on the contract
    /// Only owner can call the function
    /// Emits as {CommissionClaimed} event
    function claimCommission() external onlyOwner {
        uint128 fee = accumulatedFee;
        if (fee == 0) revert NothingToClaim();
        _sendEther(msg.sender, fee);
        unchecked {
            accumulatedFee = 0;
        }
        emit CommissionClaimed(fee);
    }

    /// @dev Claim reward in the case of the technical lose
    /// If the first player didn't make a first move the second player win
    /// If any of the player miss the move the player with the last turn win
    /// Can't be called if the game was finished natural
    function claimRewardOnOpponentTimeout(uint32 _gameID) external {
        Game memory g = games[_gameID];

        if (g.winner != address(0) || g.isRewardClaimed || g.nextMoveDeadline > block.timestamp) {
            revert FailedToClaimReward();
        }

        address timeoutWinner = g.movesSize % 2 == 0 ? g.player2 : g.player1;

        if (msg.sender != timeoutWinner) {
            revert InvalidWinner();
        }

        games[_gameID].winner = timeoutWinner;
        _claimReward(_gameID, g.totalBetAmount, timeoutWinner);
    }

    /// @dev Return metadata of the game
    /// @param _gameID id of the game required
    function game(uint32 _gameID) external view returns (GamePublicMetadata memory) {
        if (_gameID >= nextGameID) revert InvalidGameID();
        Game memory g = games[_gameID];

        Move[] memory _moves = new Move[](g.movesSize);
        for (uint8 i = 0; i < g.movesSize; i++) {
            _moves[i] = moves[_gameID][i];
        }

        return GamePublicMetadata({
            player1: g.player1,
            player1Hash: g.player1Hash,
            winner: g.winner,
            player2: g.player2,
            player2Hash: g.player2Hash,
            totalBetAmount: g.totalBetAmount,
            nextMoveDeadline: g.nextMoveDeadline,
            moves: _moves
        });
    }

    function _requireCreateProof(bytes calldata _proof, uint256 _boardHash) internal {
        uint256[8] memory p = abi.decode(_proof, (uint256[8]));
        if (!boardVerifier.verifyProof([p[0], p[1]], [[p[2], p[3]], [p[4], p[5]]], [p[6], p[7]], [_boardHash])) {
            revert InvalidBoardStateZK();
        }
    }

    function _requireMoveProof(bytes calldata _proof, uint256 _boardHash, bool isHit, uint256 x, uint256 y) internal {
        uint256[8] memory p = abi.decode(_proof, (uint256[8]));
        if (
            !moveVerifier.verifyProof(
                [p[0], p[1]], [[p[2], p[3]], [p[4], p[5]]], [p[6], p[7]], [isHit ? 1 : 0, _boardHash, x, y]
            )
        ) revert InvalidMoveZK();
    }

    function _validateDeposit(uint128 _betAmount) private {
        if (msg.value != _betAmount) revert IncorrectBetAmount();
    }

    function _calculateReward(uint128 totalBetAmount)
        internal
        pure
        returns (uint128 winnerReward, uint128 treasuryFee)
    {
        treasuryFee = totalBetAmount * FEE_PERCENTAGE / BPS;
        winnerReward = totalBetAmount - treasuryFee;
    }

    function _claimReward(uint32 _gameID, uint128 totalBetAmount, address winner) internal {
        (uint128 winnerReward, uint128 treasuryFee) = _calculateReward(totalBetAmount);

        unchecked {
            accumulatedFee += treasuryFee;
        }

        games[_gameID].isRewardClaimed = true;

        _sendEther(winner, winnerReward);
        emit CommissionAccumulated(_gameID, treasuryFee);
    }

    function _sendEther(address account, uint256 amount) private {
        (bool success,) = account.call{value: amount}("");
        if (!success) revert FailedEtherSend();
    }

    function getAccumulatedFee() external view returns (uint128) {
        return accumulatedFee;
    }
}
