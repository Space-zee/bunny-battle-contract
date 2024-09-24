//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.24;

contract IBunnyBattle {
    struct Move {
        uint8 x;
        uint8 y;
        bool isHit;
    }

    struct Game {
        address player1;
        address player2;
        address winner;
        uint8 movesSize;
        bool isRewardClaimed;
        uint256 player1Hash;
        uint256 player2Hash;
        uint128 betAmount;
        uint128 totalBetAmount;
        uint256 nextMoveDeadline;
    }

    struct GamePublicMetadata {
        address player1;
        address player2;
        address winner;
        uint256 player1Hash;
        uint256 player2Hash;
        uint128 totalBetAmount;
        uint256 nextMoveDeadline;
        Move[] moves;
    }

    error PlayerTwoNotJoinedYet();
    error InvalidBoardStateZK();
    error InvalidMoveZK();
    error InvalidGameID();
    error NotAllowedJoinGame();
    error GameIsFinished();
    error InvalidTurn();
    error InvalidMoveX();
    error InvalidMoveY();
    error IncorrectBetAmount();
    error InvalidWinner();
    error NothingToClaim();
    error FailedEtherSend();
    error TechnicalLose();
    error FailedToClaimReward();
    error RewardIsAlreadyClaimed();

    event GameCreated(uint32 indexed gameId, address creator, uint128 betAmount);
    event GameJoined(uint32 indexed gameId, address participant);
    event MoveSubmitted(
        uint32 indexed gameId, address participant, uint8 _moveX, uint8 _moveY, bool isPreviousMoveAHit
    );
    event GameFinished(uint32 indexed gameId, address winner, uint8 moveSize);
    event EtherDeposited(uint32 indexed gameId, address participant, uint128 betAmount);
    event CommissionAccumulated(uint32 indexed gameId, uint128 commission);
    event CommissionClaimed(uint128 accumulatedFee);
}
