import { ethers } from 'hardhat'
import { BunnyBattle, Groth16Verifier } from '../typechain-types';
import { genBoardProof, genMoveProof } from '../utils/proofs';
import { areCoordinatesSame, BunniesCoordinates, calculateProtocolFee, Coordinates, EmptyProof, generateBetAmount, generateBetAmountInWei, generateDummyCreateProof, generateDummySolidityProof, generateRandomCoordinates, getBalance, getRandomInt, MakeMoveTimestamp, PlayerCreateGame, randomCreatePlayerBoard } from '../utils/utils';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import {time} from '@nomicfoundation/hardhat-network-helpers'
import { parseEther, ZeroAddress } from 'ethers';
import { expect } from 'chai';


interface CreateGameArgs {
  player1: HardhatEthersSigner,
  player2: HardhatEthersSigner,
  betAmountInEth: number
  gameId: number // current (next) game id 
}

interface Move {
  x: number
  y: number
  isHit: boolean
}

interface SubmitMoveArgs {
  players: [HardhatEthersSigner, HardhatEthersSigner] // player1 (creator), player2 (whi joined)
  playersCreate: [PlayerCreateGame, PlayerCreateGame]
  gameId: number
  makeHit: boolean
}

const TestNotImplementedYet = () => expect.fail("Test not implemented yet")

describe("BunnyBattle", async () => {
  // Vairables
  let boardVerifier: Groth16Verifier;
  let moveVerifier: Groth16Verifier
  let bunnyBattle: BunnyBattle
  let owner: HardhatEthersSigner;
  let players: HardhatEthersSigner[];

  // Helper functions
  const createGame = async (args: CreateGameArgs) => {
    const player1Create = randomCreatePlayerBoard()
    const player1CreateGameProof = await genBoardProof(player1Create);
    const gameBetAmountEther = parseEther(args.betAmountInEth.toString())

    await bunnyBattle.connect(args.player1).createGame(player1CreateGameProof.solidityProof, player1CreateGameProof.inputs[0], gameBetAmountEther, { value: gameBetAmountEther });

    let game = await bunnyBattle.game(args.gameId)
    expect(game.player1).to.be.eq(args.player1.address)
    expect(game.player2).to.be.eq(ZeroAddress)
    expect(game.player1Hash).to.be.eq(BigInt(player1CreateGameProof.inputs[0]))
    expect(game.player2Hash).to.be.eq(BigInt(0))
    expect(game.winner).to.be.eq(ZeroAddress)

    const player2Create = randomCreatePlayerBoard()
    const player2JoinGameProof = await genBoardProof(player2Create);

    await bunnyBattle.connect(args.player2).joinGame(args.gameId, player2JoinGameProof.solidityProof, player2JoinGameProof.inputs[0], { value: gameBetAmountEther });

    game = await bunnyBattle.game(0);
    expect(game.player1).to.equal(args.player1.address);
    expect(game.player2).to.equal(args.player2.address);
    expect(game.player1Hash).to.eq(BigInt(player1CreateGameProof.inputs[0]));
    expect(game.player2Hash).to.eq(BigInt(player2JoinGameProof.inputs[0]));
    expect(game.winner).to.be.eq(ZeroAddress)
    expect(game.moves.length).to.equal(0);

    return { game, player1Create, player2Create }
  }

  const submitMove = async (args: SubmitMoveArgs) => {
    let game = await bunnyBattle.game(args.gameId)

    const moves = game.moves.map((item) => ([Number(item.x), Number(item.y)] as Coordinates))
    const playerIndexTurn = moves.length % 2 === 0 ? 0 : 1
    const opponentPlayerIndex = playerIndexTurn === 0 ? 1 : 0
    const player1Moves = moves.filter((_, index) => index % 2 === 0)
    const player2Moves = moves.filter((_, index) => index % 2 !== 0);

    const currentPlayer = args.players[playerIndexTurn]
    const currentPlayerCreate = args.playersCreate[playerIndexTurn]
    const currentPlayerBunnies = args.playersCreate[playerIndexTurn]
    const opponentPlayerBunnies = args.playersCreate[opponentPlayerIndex].bunnies
    const currentPlayerMoves = playerIndexTurn === 0 ? player1Moves : player2Moves

    const getMoveCoordinates = () => {
      if (args.makeHit) {
        const hitMove = opponentPlayerBunnies.find((bunnyCoordinates) => {
          return !currentPlayerMoves.some((move) => areCoordinatesSame(bunnyCoordinates, move))
        })

        if (!hitMove) {
          throw new Error('Can not make hit move');
        }

        return hitMove
      }

      const unavailableMoves = [...currentPlayerMoves, ...opponentPlayerBunnies]
      return generateRandomCoordinates(unavailableMoves)
    }

    const moveCoordinates = getMoveCoordinates()

    if (!moves.length) {
      await bunnyBattle.connect(currentPlayer).submitMove(args.gameId, moveCoordinates[0], moveCoordinates[1], EmptyProof, false);
    } else {
      const currentPlayerBoardHash = playerIndexTurn === 0 ? game.player1Hash : game.player2Hash;
      const prevMove = moves[moves.length - 1];
      const isHit = currentPlayerBunnies.bunnies.some((bunny) => areCoordinatesSame(bunny, prevMove))

      // console.log(prevMove, currentPlayerCreate, playerIndexTurn)

      const moveProof = await genMoveProof({
        'boardHash': currentPlayerBoardHash.toString(),
        'guess': prevMove,
        'nonce': currentPlayerCreate.nonce,
        'bunnies': currentPlayerCreate.bunnies,
      });

      await bunnyBattle.connect(currentPlayer).submitMove(args.gameId, moveCoordinates[0], moveCoordinates[1], moveProof.solidityProof, isHit);
    }

    game = await bunnyBattle.game(args.gameId);
    expect(game.moves.length).to.be.eq(moves.length + 1);

    if (game.moves.length > 1) {
      const prevMove = moves[moves.length - 1];
      const isHit = currentPlayerBunnies.bunnies.some((bunny) => areCoordinatesSame(bunny, prevMove))

      expect(game.moves[game.moves.length - 2].isHit).to.be.eq(isHit)
    }

    const prevMove = game.moves[game.moves.length - 1]
    expect([Number(prevMove[0]), Number(prevMove[1]), false]).to.eql([moveCoordinates[0], moveCoordinates[1], false])

    return { move: moveCoordinates, moveIndex: game.moves.length - 1, movesCount: game.moves.length }
  }

  const playGame = async (gameId: number, players: [HardhatEthersSigner, HardhatEthersSigner]) => {
    const bet = generateBetAmount()

    const { player1Create, player2Create } = await createGame({
      player1: players[0],
      player2: players[1],
      betAmountInEth: bet,
      gameId,
    })

    const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create]
    const hitMovesOrder = [false, true, true, false, true, false];

    for (const makeHit of hitMovesOrder) {
      await submitMove({
        gameId,
        makeHit,
        players,
        playersCreate
      })
    }

    return { bet, playersCreate }
  }

  const playWinGame = async (gameId: number, players: [HardhatEthersSigner, HardhatEthersSigner], betAmount: number) => {
    const { player1Create, player2Create } = await createGame({ player1: players[0], player2: players[1], gameId, betAmountInEth: betAmount });
    const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create];

    await submitMove({ players: players, playersCreate, gameId, makeHit: true });
    await submitMove({ players: players, playersCreate, gameId, makeHit: true });
    await submitMove({ players: players, playersCreate, gameId, makeHit: true });
    await submitMove({ players: players, playersCreate, gameId, makeHit: true });
  }

  // Actual tests
  beforeEach(async () => {
    [owner, ...players] = await ethers.getSigners();

    const BoardVerifier = await ethers.getContractFactory("contracts/boardVerifier.sol:Groth16Verifier");
    boardVerifier = (await BoardVerifier.deploy()) as Groth16Verifier;
    await boardVerifier.waitForDeployment();

    const MoveVerifier = await ethers.getContractFactory("contracts/moveVerifier.sol:Groth16Verifier");
    moveVerifier = (await MoveVerifier.deploy()) as Groth16Verifier;
    await moveVerifier.waitForDeployment();

    const BunnyBattle = await ethers.getContractFactory("BunnyBattle");
    bunnyBattle = await BunnyBattle.deploy(boardVerifier.getAddress(), moveVerifier.getAddress());
    await bunnyBattle.waitForDeployment();
  })

  describe('General', async () => {
    it('should create game successfully', async () => {
      await createGame({
        player1: players[0],
        player2: players[1],
        betAmountInEth: generateBetAmount(),
        gameId: 0,
      });
    })

    it('should reduce players and increate BunnyBattle contract balances on game cration', async () => {
      const gameId = 0
      const betAmountInWei = generateBetAmountInWei()

      const player1Create = randomCreatePlayerBoard()
      const player2Create = randomCreatePlayerBoard()
      const player1CreateGameProof = await genBoardProof(player1Create);
      const player2JoinGameProof = await genBoardProof(player2Create);

      const player1BalanceBeforeCreate = await getBalance(players[0])
      const player2BalanceBeforeCreate = await getBalance(players[1])

      const contractBalanceInitial = await getBalance(bunnyBattle)
      expect(contractBalanceInitial).to.be.eq(0)

      await bunnyBattle.connect(players[0]).createGame(player1CreateGameProof.solidityProof, player1CreateGameProof.inputs[0], betAmountInWei, { value: betAmountInWei });

      const contractBalanceAfterPlayer1Create = await getBalance(bunnyBattle)
      expect(contractBalanceAfterPlayer1Create).to.be.eq(betAmountInWei)

      await bunnyBattle.connect(players[1]).joinGame(gameId, player2JoinGameProof.solidityProof, player2JoinGameProof.inputs[0], { value: betAmountInWei });

      const contractBalanceAfterPlayer2Join = await getBalance(bunnyBattle)
      expect(contractBalanceAfterPlayer2Join).to.be.eq(betAmountInWei * 2n)

      const player1BalanceAfterCreate = await getBalance(players[0])
      const player2BalanceAfterCreate = await getBalance(players[1])

      expect(player1BalanceAfterCreate).to.be.lte(player1BalanceBeforeCreate - betAmountInWei)
      expect(player2BalanceAfterCreate).to.be.lte(player2BalanceBeforeCreate - betAmountInWei)
    })

    it('should allow users to submit move and send winner funds', async () => {
      const gameId = 0;
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]]

      const { game, player1Create, player2Create } = await createGame({
        player1: players[0],
        player2: players[1],
        betAmountInEth: generateBetAmount(),
        gameId,
      })

      const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create]

      // player1 1st move, miss
      await submitMove({
        gameId,
        makeHit: false,
        players: gamePlayers,
        playersCreate
      })

      // player2 1st move, hit
      await submitMove({
        gameId,
        makeHit: true,
        players: gamePlayers,
        playersCreate
      })
    })

    it('should correctly finish game and give winner prize', async () => {
      const gameId = 0;
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]]
      const bet = generateBetAmount()
      const betInEth = parseEther(bet.toString())
      const protocolFee = calculateProtocolFee(bet)

      const { player1Create, player2Create } = await createGame({
        player1: players[0],
        player2: players[1],
        betAmountInEth: bet,
        gameId,
      })

      const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create]

      // player1 1st move, miss
      await submitMove({
        gameId,
        makeHit: false,
        players: gamePlayers,
        playersCreate
      })

      // player2 1st move, hit
      await submitMove({
        gameId,
        makeHit: true,
        players: gamePlayers,
        playersCreate
      })

      // player1 2nd move, hit
      await submitMove({
        gameId,
        makeHit: true,
        players: gamePlayers,
        playersCreate
      })

      // player2 2nd move, miss
      await submitMove({
        gameId,
        makeHit: false,
        players: gamePlayers,
        playersCreate
      })

      // player1 3rd move, hit, winning move
      await submitMove({
        gameId,
        makeHit: true,
        players: gamePlayers,
        playersCreate
      })

      const expectedWinner = gamePlayers[0]
      const balanceBefore = await getBalance(expectedWinner.address)

      // player2 3rd move, hit, move after winning move, send reward to winner (player 1)
      await submitMove({
        gameId,
        makeHit: true,
        players: gamePlayers,
        playersCreate
      })

      const balanceAfter = await getBalance(expectedWinner.address)
      const contractBalance = await getBalance(bunnyBattle)

      const game = await bunnyBattle.game(gameId);
      expect(game.winner).to.be.eq(gamePlayers[0].address);
      expect(balanceAfter).to.be.gt(balanceBefore + betInEth - protocolFee);
      expect(contractBalance).to.be.eq(protocolFee);
    })
  })

  describe('createGame()', async () => {
    it('should revert when bad proof', async () => {
      const dummyCreateProof = generateDummyCreateProof()
      const bet = generateBetAmountInWei()

      await expect(bunnyBattle.connect(players[0]).createGame(dummyCreateProof.solidityProof, dummyCreateProof.inputs[0], bet, { value: bet })).to.be.revertedWithCustomError(bunnyBattle, "InvalidBoardStateZK")
    })
    it('should  revert when bunnies have same position', async () => {
      const bunnyCoordinates = generateRandomCoordinates()
      const playerCreate = { nonce: getRandomInt(1000, 1000000), bunnies: [bunnyCoordinates, bunnyCoordinates] }
      await expect(genBoardProof(playerCreate)).to.be.rejected;
    })
  })
  describe('joinGame()', async () => {
    it('should revert when bad proof', async () => {
      const dummyJoinProof = generateDummyCreateProof()
      const bet = generateBetAmountInWei()
      const gameId = 0;

      const player1Create = randomCreatePlayerBoard()
      const player1CreateGameProof = await genBoardProof(player1Create);
      await bunnyBattle.connect(players[0]).createGame(player1CreateGameProof.solidityProof, player1CreateGameProof.inputs[0], bet, { value: bet });

      await expect(bunnyBattle.connect(players[1]).joinGame(gameId, dummyJoinProof.solidityProof, dummyJoinProof.inputs[0], { value: bet })).to.be.revertedWithCustomError(bunnyBattle, "InvalidBoardStateZK")
    })
    it('should revert when join to own game (player0 == player1)', async () => {
      const gameId = 0;
      const bet = generateBetAmountInWei()

      const player = players[0]
      const playerCreate = randomCreatePlayerBoard()
      const playerCreateGameProof = await genBoardProof(playerCreate);

      await bunnyBattle.connect(player).createGame(playerCreateGameProof.solidityProof, playerCreateGameProof.inputs[0], bet, { value: bet });

      const playerJoin = randomCreatePlayerBoard()
      const playerJoinProof = await genBoardProof(playerJoin);

      await expect(bunnyBattle.connect(player).joinGame(gameId, playerJoinProof.solidityProof, playerJoinProof.inputs[0], { value: bet })).to.be.revertedWithCustomError(bunnyBattle, "NotAllowedJoinGame");
    })
    it('should revert when game already started', async () => {
      const gameId = 0;
      const betAmountInEth = generateBetAmount()
      const betAmountInWei = parseEther(betAmountInEth.toString())

      await createGame({ player1: players[0], player2: players[1], gameId, betAmountInEth })

      const player3Join = randomCreatePlayerBoard()
      const player3JoinGameProof = await genBoardProof(player3Join);

      await expect(bunnyBattle.connect(players[3]).joinGame(gameId, player3JoinGameProof.solidityProof, player3JoinGameProof.inputs[0], { value: betAmountInWei })).to.be.revertedWithCustomError(bunnyBattle, "NotAllowedJoinGame");
    })
    it('should revert when game doen\'t exist', async () => {
      const gameId = 100;
      const betAmountInEth = generateBetAmount()

      await expect(createGame({ player1: players[0], player2: players[1], gameId, betAmountInEth })).to.be.revertedWithCustomError(bunnyBattle, "InvalidGameID");
    })
  })
  describe('submitMove()', async () => {
    it('should revert when invalid proof', async () => {
      const gameId = 0;
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]]
      const { player1Create, player2Create, game } = await createGame({ player1: gamePlayers[0], player2: gamePlayers[1], gameId, betAmountInEth: generateBetAmount() })

      const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create]

      const isFirstMoveHit = true;
      const isSecondMoveHit = true;
      // player1 1st move, hit
      const { move: move1Coordinates } = await submitMove({ gameId, makeHit: isFirstMoveHit, players: gamePlayers, playersCreate })

      // player2 1st move, wrong proof that enemy didn't hit
      const wrongMove2Coordinates = generateRandomCoordinates()
      const wrongMove2Proof = await genMoveProof({
        'boardHash': game.player2Hash.toString(),
        'guess': move1Coordinates,
        'nonce': player2Create.nonce,
        'bunnies': player2Create.bunnies,
      });

      await expect(bunnyBattle.connect(gamePlayers[1]).submitMove(gameId, wrongMove2Coordinates[0], wrongMove2Coordinates[1], wrongMove2Proof.solidityProof, !isFirstMoveHit)).to.be.revertedWithCustomError(bunnyBattle, "InvalidMoveZK");
      await expect(bunnyBattle.connect(gamePlayers[1]).submitMove(gameId, wrongMove2Coordinates[0], wrongMove2Coordinates[1], generateDummySolidityProof(), !isFirstMoveHit)).to.be.revertedWithCustomError(bunnyBattle, "InvalidMoveZK");

      // player2 1st move, correct proof
      const { move: move2Coordinates } = await submitMove({ gameId, makeHit: isSecondMoveHit, players: gamePlayers, playersCreate })

      // player1 2nd move, wrong proof that enemy didn't hit
      const wrongMove3Coordinates = generateRandomCoordinates([move1Coordinates])
      const wrongMove3Proof = await genMoveProof({
        'boardHash': game.player1Hash.toString(),
        'guess': move2Coordinates,
        'nonce': player1Create.nonce,
        'bunnies': player1Create.bunnies,
      });

      await expect(bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, wrongMove3Coordinates[0], wrongMove3Coordinates[1], wrongMove3Proof.solidityProof, !isSecondMoveHit)).to.be.revertedWithCustomError(bunnyBattle, "InvalidMoveZK");
      await expect(bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, wrongMove3Coordinates[0], wrongMove3Coordinates[1], generateDummySolidityProof(), !isSecondMoveHit)).to.be.revertedWithCustomError(bunnyBattle, "InvalidMoveZK");

      // can not use empty proof on non-first move
      await expect(bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, wrongMove3Coordinates[0], wrongMove3Coordinates[1], EmptyProof, isSecondMoveHit)).to.be.reverted;

      // player1 2nd move, miss
      await submitMove({ gameId, makeHit: false, players: gamePlayers, playersCreate })
    })
    it('should revert when it is not current player move', async () => {
      const gameId = 0;
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]]
      const { player1Create, player2Create, game } = await createGame({ player1: gamePlayers[0], player2: gamePlayers[1], gameId, betAmountInEth: generateBetAmount() })
      const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create]

      const moveCoordinates = generateRandomCoordinates()

      // 1. [Fail] player2 tries to make first move
      await expect(bunnyBattle.connect(gamePlayers[1]).submitMove(gameId, moveCoordinates[0], moveCoordinates[1], EmptyProof, false)).to.be.revertedWithCustomError(bunnyBattle, 'InvalidTurn')

      // 2. [Correct] player1 make first move
      const { move: move1Coordinates } = await submitMove({ gameId, makeHit: false, players: gamePlayers, playersCreate })

      // 3. [Fail] player1 tries to make second move
      const wrongMove2Coordinates = generateRandomCoordinates()
      const wrongMove2Proof = await genMoveProof({
        'boardHash': game.player1Hash.toString(),
        'guess': move1Coordinates,
        'nonce': player1Create.nonce,
        'bunnies': player1Create.bunnies,
      });

      await expect(bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, wrongMove2Coordinates[0], wrongMove2Coordinates[1], wrongMove2Proof.solidityProof, false)).to.be.revertedWithCustomError(bunnyBattle, 'InvalidTurn')
    })
    it('should revert when player have not joined game', async () => { 
      let gameId = 0;
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]];
      await createGame({ player1: gamePlayers[0], player2: gamePlayers[1], gameId, betAmountInEth: generateBetAmount() });

      const moveCoordinates = generateRandomCoordinates();
      const nonParticipant = players[2];

      // [Fail] non participant can not make move
      await expect(bunnyBattle.connect(nonParticipant).submitMove(gameId, moveCoordinates[0], moveCoordinates[1], EmptyProof, false))
        .to.be.revertedWithCustomError(bunnyBattle, 'InvalidTurn');

      // [Fail] player1 can not make move before player 2 joins
      const player1Create = randomCreatePlayerBoard();
      const player1CreateGameProof = await genBoardProof(player1Create);
      const betAmountInWei = parseEther(generateBetAmount().toString());

      ++gameId;
      await bunnyBattle.connect(gamePlayers[0]).createGame(player1CreateGameProof.solidityProof, player1CreateGameProof.inputs[0], betAmountInWei, { value: betAmountInWei });

      await expect(bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, moveCoordinates[0], moveCoordinates[1], EmptyProof, false))
        .to.be.revertedWithCustomError(bunnyBattle, 'PlayerTwoNotJoinedYet');
    })
    it('should revert when move has x or y bigger than 2', async () => { 
      const gameId = 0;
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]];
      const { player1Create, player2Create } = await createGame({ player1: gamePlayers[0], player2: gamePlayers[1], gameId, betAmountInEth: generateBetAmount() });
      const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create];

      // Try to submit a move with x > 2
      await expect(
        bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, 3, 1, EmptyProof, false)
      ).to.be.revertedWithCustomError(bunnyBattle, 'InvalidMoveX');

      // Try to submit a move with y > 2
      await expect(
        bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, 1, 3, EmptyProof, false)
      ).to.be.revertedWithCustomError(bunnyBattle, 'InvalidMoveY');

      // Try to submit a move with both x and y > 2
      await expect(
        bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, 3, 3, EmptyProof, false)
      ).to.be.revertedWithCustomError(bunnyBattle, 'InvalidMoveX');

      // Verify that a valid move (0 <= x, y <= 2) succeeds
      await expect(
        bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, 2, 2, EmptyProof, false)
      ).to.not.be.reverted;
    })
    it('should revert when user has already made the same move', async () => { 
      const gameId = 0;
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]];
      const { player1Create, player2Create, game } = await createGame({ player1: gamePlayers[0], player2: gamePlayers[1], gameId, betAmountInEth: generateBetAmount() });
      const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create];

      // Make an initial move
      const initialMove: Coordinates = generateRandomCoordinates([...player2Create.bunnies]);
      await bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, initialMove[0], initialMove[1], EmptyProof, false);

      // Player 2 makes a move
      const {move: move2Coordinates} = await submitMove({ players: gamePlayers, playersCreate, gameId, makeHit: false });

      // player1 | Try to make the same move again
      const move3Proof = await genMoveProof({
        'boardHash': game.player1Hash.toString(),
        'guess': move2Coordinates,
        'nonce': player1Create.nonce,
        'bunnies': player1Create.bunnies,
      });

      await expect(bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, initialMove[0], initialMove[1], move3Proof.solidityProof, false)).to.be.reverted;
      // await bunnyBattle.connect(gamePlayers[0]).submitMove(gameId, initialMove[0], initialMove[1], move3Proof.solidityProof, false)

      const makeSameHitMoves = async () => {
        // player2 move, hit 
        const {move: move4Coordinates} = await submitMove({ players: gamePlayers, playersCreate, gameId, makeHit: true });

        // player1 move, miss
        const {move: move5Coordinates} = await submitMove({ players: gamePlayers, playersCreate, gameId, makeHit: false });

        // player2 move, hit, same bunnies coordinates
        const move6Proof = await genMoveProof({
          'boardHash': game.player2Hash.toString(),
          'guess': move5Coordinates,
          'nonce': player2Create.nonce,
          'bunnies': player2Create.bunnies,
        });

        // submit same bunnies coordinates
        await bunnyBattle.connect(gamePlayers[1]).submitMove(gameId, move4Coordinates[0], move4Coordinates[1], move6Proof.solidityProof, false);

        // player2 move
        await submitMove({ players: gamePlayers, playersCreate, gameId, makeHit: false });

        const gameData = await bunnyBattle.game(gameId);
        expect(gameData.winner).to.equal(gamePlayers[0].address);
      }
`      // await makeSameHitMoves()`
      await expect(makeSameHitMoves()).to.be.reverted;
    })
    it('should revert when move after deadline', async () => { 
      const gameId = 0;
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]];
      const { player1Create, player2Create } = await createGame({ player1: gamePlayers[0], player2: gamePlayers[1], gameId, betAmountInEth: generateBetAmount() });
      const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create];

      await submitMove({ players: gamePlayers, playersCreate, gameId, makeHit: false });
      await submitMove({ players: gamePlayers, playersCreate, gameId, makeHit: false });

      await time.increase(MakeMoveTimestamp);

      // [Fail] make move after deadline
      await expect(
        submitMove({ players: gamePlayers, playersCreate, gameId, makeHit: false })
      ).to.be.revertedWithCustomError(bunnyBattle, 'TechnicalLose');
    })
  })
  describe('claimCommission()', async () => {
    it('should claim 0 when no commission accumulated', async () => {       
      const accumulatedFee = await bunnyBattle.getAccumulatedFee();
      expect(accumulatedFee).to.equal(0);

      await expect(bunnyBattle.connect(owner).claimCommission()).to.be.revertedWithCustomError(bunnyBattle, 'NothingToClaim');
    })
    it('should claim correct amount and reset variable', async () => { 
      const gameId = 0;
      const betAmount = generateBetAmount();

      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]];
      await playWinGame(gameId, gamePlayers, betAmount);

      expect((await bunnyBattle.game(gameId)).winner).to.equal(gamePlayers[0].address);

      const accumulatedFee = await bunnyBattle.getAccumulatedFee();
      expect(accumulatedFee).to.equal(calculateProtocolFee(betAmount));
      
      const ownerBalanceBeforeClaim = await getBalance(owner.address);
      await bunnyBattle.connect(owner).claimCommission();
      const ownerBalanceAfterClaim = await getBalance(owner.address);

      expect(ownerBalanceAfterClaim).to.closeTo(ownerBalanceBeforeClaim + accumulatedFee, 10 ** 14);
      expect(await bunnyBattle.getAccumulatedFee()).to.equal(0);
    })
    it('should revert when called by non-owner', async () => {
      const gameId = 0;
      const betAmount = generateBetAmount();
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]];
      
      await playWinGame(gameId, gamePlayers, betAmount);

      const accumulatedFee = await bunnyBattle.getAccumulatedFee();
      expect(accumulatedFee).to.equal(calculateProtocolFee(betAmount));
      
      await expect(bunnyBattle.connect(players[0]).claimCommission())
        .to.be.revertedWithCustomError(bunnyBattle, 'OwnableUnauthorizedAccount')
        .withArgs(players[0].address);
    })
  })
  describe('claimRewardOnOpponentTimeout()', async () => {
    it('should revert when there game doesn\'t exist', async () => { 
      const gameId = 0;
      await expect(bunnyBattle.connect(players[0]).claimRewardOnOpponentTimeout(gameId)).to.be.reverted;
    })
    it('should revert when there moveDeadline is not yet reached', async () => { 
      const gameId = 0;
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]];
      const { player1Create, player2Create } = await createGame({ player1: gamePlayers[0], player2: gamePlayers[1], gameId, betAmountInEth: generateBetAmount() });
      const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create];

      await submitMove({ players: gamePlayers, playersCreate, gameId, makeHit: false });
      await submitMove({ players: gamePlayers, playersCreate, gameId, makeHit: false });

      await expect(bunnyBattle.connect(players[0]).claimRewardOnOpponentTimeout(gameId)).to.be.revertedWithCustomError(bunnyBattle, 'FailedToClaimReward');

      const deadline = (await bunnyBattle.game(gameId)).nextMoveDeadline;

      await time.setNextBlockTimestamp(Number(deadline) + 1);

      await expect(bunnyBattle.connect(players[1]).claimRewardOnOpponentTimeout(gameId)).to.not.be.reverted;
    })
    it('should revert when game ended', async () => { 
      const gameId = 0;
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]];
      const betAmount = generateBetAmount();

      await playWinGame(gameId, gamePlayers, betAmount);

      await expect(bunnyBattle.connect(players[0]).claimRewardOnOpponentTimeout(gameId)).to.be.revertedWithCustomError(bunnyBattle, 'FailedToClaimReward');
      await expect(bunnyBattle.connect(players[1]).claimRewardOnOpponentTimeout(gameId)).to.be.revertedWithCustomError(bunnyBattle, 'FailedToClaimReward');
     })
    it('should send winner reward', async () => { 
      const gameId = 0;
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]];
      const gamePlayersInitialBalance = [await getBalance(gamePlayers[0].address), await getBalance(gamePlayers[1].address)];
      const betAmount = generateBetAmount();
      const betAmountInWei = parseEther(betAmount.toString());
      const { player1Create, player2Create } = await createGame({ player1: gamePlayers[0], player2: gamePlayers[1], gameId, betAmountInEth: betAmount });
      const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create];

      await submitMove({ players: gamePlayers, playersCreate, gameId, makeHit: false });
      await submitMove({ players: gamePlayers, playersCreate, gameId, makeHit: false });

      await time.increase(MakeMoveTimestamp);

      // [Fail] player1 can not claim reward
      await expect(bunnyBattle.connect(gamePlayers[0]).claimRewardOnOpponentTimeout(gameId)).to.be.revertedWithCustomError(bunnyBattle, 'InvalidWinner');

      // [Success] player2 can claim reward
      await expect(bunnyBattle.connect(gamePlayers[1]).claimRewardOnOpponentTimeout(gameId)).to.not.be.reverted;

      const fee = calculateProtocolFee(betAmount);
      const winnerAmount = parseEther((betAmount * 2).toString()) - fee;
      const game = await bunnyBattle.game(gameId);
      expect(game.winner).to.equal(gamePlayers[1].address);

      expect(await getBalance(gamePlayers[1])).to.closeTo(gamePlayersInitialBalance[1] - betAmountInWei + winnerAmount, 10n ** 16n);
      expect(await bunnyBattle.getAccumulatedFee()).to.equal(fee);

      // [Fail] can not claim reward second time
      await expect(bunnyBattle.connect(gamePlayers[1]).claimRewardOnOpponentTimeout(gameId)).to.be.revertedWithCustomError(bunnyBattle, 'FailedToClaimReward');
     })
  })
  describe('game()', async () => {
    it('should return correct data for game', async () => { 
      const gameId = 0;
      const betAmount = generateBetAmount();
      const betAmountInWei = parseEther(betAmount.toString());
      const gamePlayers: [HardhatEthersSigner, HardhatEthersSigner] = [players[0], players[1]];

      // Create game
      const player1Create = randomCreatePlayerBoard();
      const player1CreateGameProof = await genBoardProof(player1Create);
      await bunnyBattle.connect(gamePlayers[0]).createGame(player1CreateGameProof.solidityProof, player1CreateGameProof.inputs[0], betAmountInWei, { value: betAmountInWei });

      let gameData = await bunnyBattle.game(gameId);
      expect(gameData.player1).to.equal(gamePlayers[0].address);
      expect(gameData.player2).to.equal(ZeroAddress);
      expect(gameData.winner).to.equal(ZeroAddress);
      expect(gameData.player1Hash).to.equal(BigInt(player1CreateGameProof.inputs[0]));
      expect(gameData.player2Hash).to.equal(0);
      expect(gameData.totalBetAmount).to.equal(betAmountInWei);
      expect(gameData.nextMoveDeadline).to.equal(0);
      expect(gameData.moves).to.be.empty;

      // Join game
      const player2Create = randomCreatePlayerBoard();
      const player2JoinGameProof = await genBoardProof(player2Create);
      await bunnyBattle.connect(gamePlayers[1]).joinGame(gameId, player2JoinGameProof.solidityProof, player2JoinGameProof.inputs[0], { value: betAmountInWei });

      gameData = await bunnyBattle.game(gameId);
      expect(gameData.player2).to.equal(gamePlayers[1].address);
      expect(gameData.player2Hash).to.equal(BigInt(player2JoinGameProof.inputs[0]));
      expect(gameData.totalBetAmount).to.equal(betAmountInWei * 2n);
      expect(gameData.nextMoveDeadline).to.be.gt(0);

      // Make moves
      const playersCreate: [PlayerCreateGame, PlayerCreateGame] = [player1Create, player2Create];
      const moves: Move[] = [];

      for (let i = 0; i < 3; i++) {
        const { move, moveIndex } = await submitMove({
          gameId,
          makeHit: i % 2 === 1, // Make every second move a hit
          players: gamePlayers,
          playersCreate
        });
        moves.push({ x: move[0], y: move[1], isHit: i % 2 === 1 });

        gameData = await bunnyBattle.game(gameId);
        expect(gameData.moves.length).to.equal(i + 1);
        expect(Number(gameData.moves[i].x)).to.equal(move[0]);
        expect(Number(gameData.moves[i].y)).to.equal(move[1]);
        if (i > 0) {
          expect(gameData.moves[i - 1].isHit).to.equal(i % 2 === 0);
        }
      }

      // Verify final game state
      expect(gameData.winner).to.equal(ZeroAddress); // Game should not be finished yet
      expect(gameData.moves.map(move => ({
        x: Number(move.x),
        y: Number(move.y),
        isHit: move.isHit
      }))).to.deep.equal(moves);
      expect(gameData.nextMoveDeadline).to.be.gt(0);
    });
  });
})