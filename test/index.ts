import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { Address } from "cluster";
import { ContractTransactionReceipt, parseEther, ZeroAddress } from "ethers";
import { ethers } from "hardhat";
import { BunnyBattle } from "../typechain-types";

const player1Create = {
  "nonce": 12345,
  "bunnies": [
    [2, 2],
    [0, 0]
  ],
};

const player2Create = {
  "nonce": 23456,
  "bunnies": [
    [2, 2],
    [2, 1]
  ],
};

let account1: HardhatEthersSigner, account2: HardhatEthersSigner, owner: HardhatEthersSigner;
let boardVerifier, moveVerifier;
let bunnyBattle: BunnyBattle;

describe("Bunnies Battle", function () {
  beforeEach(async ()=>{
    [owner, account1, account2] = await ethers.getSigners();

    const BoardVerifier = await ethers.getContractFactory("contracts/boardVerifier.sol:Groth16Verifier");
    boardVerifier = await BoardVerifier.deploy();
    await boardVerifier.waitForDeployment();

    const MoveVerifier = await ethers.getContractFactory("contracts/moveVerifier.sol:Groth16Verifier");
    moveVerifier = await MoveVerifier.deploy();
    await moveVerifier.waitForDeployment();

    const BunnyBattle = await ethers.getContractFactory("BunnyBattle");
    bunnyBattle = await BunnyBattle.deploy(boardVerifier.getAddress(), moveVerifier.getAddress());
    await bunnyBattle.waitForDeployment();

  })
  it("Should play properly", async function () {
    const proof1 = await genBoardProof(player1Create);
    await bunnyBattle.connect(account1).createGame(proof1.solidityProof, proof1.inputs[0], parseEther("1"), { value: parseEther("1") });
    let game = await bunnyBattle.game(0);
    expect(game.player1 === account1.address);
    expect(game.player2 === '0x0000000000000000000000000000000000000000');
    expect(game.player1Hash).to.eq(BigInt(proof1.inputs[0]));

    const proof2 = await genBoardProof(player2Create);
    await bunnyBattle.connect(account2).joinGame(0, proof2.solidityProof, proof2.inputs[0],  { value: parseEther("1") });
    game = await bunnyBattle.game(0);
    expect(game.player1).to.equal(account1.address);
    expect(game.player2).to.equal(account2.address);
    expect(game.player1Hash).to.eq(BigInt(proof1.inputs[0]));
    expect(game.player2Hash).to.eq(BigInt(proof2.inputs[0]));
    expect(game.moves.length).to.equal(0);

    await bunnyBattle.connect(account1).submitMove(0, 1, 2, emptyProof, false);
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(1);
    let prevMove = game.moves[0];
    expect(prevMove.x).to.eq(BigInt(1));
    expect(prevMove.y).to.eq(BigInt(2));


    const proof3 = await genMoveProof({
      // Public Inputs
      'boardHash': game.player2Hash.toString(),
      'guess': [prevMove.x, prevMove.y],
      // Private Inputs:
      'nonce': player2Create.nonce,
      'bunnies': player2Create.bunnies,
    });
    await bunnyBattle.connect(account2).submitMove(0, 0, 0, proof3.solidityProof, false);
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(2);
    expect(game.moves[0].isHit).to.equal(false);
    prevMove = game.moves[1];
    expect(prevMove.x).to.eq(BigInt(0));
    expect(prevMove.y).to.eq(BigInt(0));

    const proof4 = await genMoveProof({
      // Public Inputs
      'boardHash': game.player1Hash.toString(),
      'guess': [prevMove.x, prevMove.y],
      // Private Inputs:
      'nonce': player1Create.nonce,
      'bunnies': player1Create.bunnies,
    });
    await bunnyBattle.connect(account1).submitMove(0, 2, 1, proof4.solidityProof, true);
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(3);

  });

  it("Should deposit correct once game is created", async function () {
    const proof1 = await genBoardProof(player1Create);
    await bunnyBattle.connect(account1).createGame(proof1.solidityProof, proof1.inputs[0], parseEther("1"), { value: parseEther("1") });
    let game = await bunnyBattle.game(0);
    expect(game.player1 === account1.address);
    expect(game.player2 === '0x0000000000000000000000000000000000000000');
    expect(game.player1Hash).to.eq(BigInt(proof1.inputs[0]));
    expect(game.totalBetAmount).to.eq(parseEther("1"));
    expect(await ethers.provider.getBalance(bunnyBattle.getAddress())).to.be.eq(parseEther("1"))
  })

  it("Should deposit correct once join game", async function () {
    const proof1 = await genBoardProof(player1Create);
    await bunnyBattle.connect(account1).createGame(proof1.solidityProof, proof1.inputs[0], parseEther("1"), { value: parseEther("1") });
    
    const proof2 = await genBoardProof(player2Create);
    await bunnyBattle.connect(account2).joinGame(0, proof2.solidityProof, proof2.inputs[0],  { value: parseEther("1") });

    let game = await bunnyBattle.game(0);
    expect(game.player1 === account1.address);
    expect(game.player2 === account2.address);
    expect(game.player1Hash).to.eq(BigInt(proof1.inputs[0]));
    expect(game.totalBetAmount).to.eq(parseEther("2"));
    expect(await ethers.provider.getBalance(bunnyBattle.getAddress())).to.be.eq(parseEther("2"))
  })

  it("Should not make move before second player joins", async function() {
    const proof1 = await genBoardProof(player1Create);
    await bunnyBattle.connect(account1).createGame(proof1.solidityProof, proof1.inputs[0], parseEther("1"), { value: parseEther("1") });

    expect(bunnyBattle.connect(account1).submitMove(0, 1, 2, emptyProof, false)).to.be.revertedWithCustomError(bunnyBattle, "PlayerTwoNotJoinedYet");
  })

  it("Should detect winner correct and claim commission", async function () {
    const proof1 = await genBoardProof(player1Create);
    await bunnyBattle.connect(account1).createGame(proof1.solidityProof, proof1.inputs[0], parseEther("1"), { value: parseEther("1") });
    let game = await bunnyBattle.game(0);
    expect(game.player1 === account1.address);
    expect(game.player2 === '0x0000000000000000000000000000000000000000');
    expect(game.player1Hash).to.eq(BigInt(proof1.inputs[0]));

    const proof2 = await genBoardProof(player2Create);
    await bunnyBattle.connect(account2).joinGame(0, proof2.solidityProof, proof2.inputs[0],  { value: parseEther("1") });
    game = await bunnyBattle.game(0);
    expect(game.player1).to.equal(account1.address);
    expect(game.player2).to.equal(account2.address);
    expect(game.player1Hash).to.eq(BigInt(proof1.inputs[0]));
    expect(game.player2Hash).to.eq(BigInt(proof2.inputs[0]));
    expect(game.moves.length).to.equal(0);

    await bunnyBattle.connect(account1).submitMove(0, 1, 2, emptyProof, false);
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(1);
    let prevMove = game.moves[0];
    expect(prevMove.x).to.eq(BigInt(1));
    expect(prevMove.y).to.eq(BigInt(2));


    const proof3 = await genMoveProof({
      // Public Inputs
      'boardHash': game.player2Hash.toString(),
      'guess': [prevMove.x, prevMove.y],
      // Private Inputs:
      'nonce': player2Create.nonce,
      'bunnies': player2Create.bunnies,
    });
    await bunnyBattle.connect(account2).submitMove(0, 0, 0, proof3.solidityProof, false);
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(2);
    expect(game.moves[0].isHit).to.equal(false);
    prevMove = game.moves[1];
    expect(prevMove.x).to.eq(BigInt(0));
    expect(prevMove.y).to.eq(BigInt(0));

    const proof4 = await genMoveProof({
      // Public Inputs
      'boardHash': game.player1Hash.toString(),
      'guess': [prevMove.x, prevMove.y],
      // Private Inputs:
      'nonce': player1Create.nonce,
      'bunnies': player1Create.bunnies,
    });
    await bunnyBattle.connect(account1).submitMove(0, 2, 1, proof4.solidityProof, true);
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(3);

    prevMove = game.moves[2];
    const proof5 = await genMoveProof({
      // Public Inputs
      'boardHash': game.player2Hash.toString(),
      'guess': [prevMove.x, prevMove.y],
      // Private Inputs:
      'nonce': player2Create.nonce,
      'bunnies': player2Create.bunnies,
    });
    await bunnyBattle.connect(account2).submitMove(0, 2, 2, proof5.solidityProof, true);
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(4);
    expect(game.moves[2].isHit).to.equal(true);

    prevMove = game.moves[3];
    const proof6 = await genMoveProof({
      // Public Inputs
      'boardHash': game.player1Hash.toString(),
      'guess': [prevMove.x, prevMove.y],
      // Private Inputs:
      'nonce': player1Create.nonce,
      'bunnies': player1Create.bunnies,
    });
    const prevBalanceAccount2 = await ethers.provider.getBalance(account2.address)
    await bunnyBattle.connect(account1).submitMove(0, 1, 1, proof6.solidityProof, true);
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(5);
    expect(game.moves[3].isHit).to.equal(true);
    expect(game.winner).to.equal(account2);
    const commission =  parseEther("2") *  parseEther("1") /  parseEther("100");
    expect(await ethers.provider.getBalance(account2.address)).to.be.eq(prevBalanceAccount2 + parseEther("2") - commission)
    expect(await bunnyBattle.getAccumulatedFee()).to.be.eq(commission)
    const prevBalanceOwner = await ethers.provider.getBalance(owner.address)
    const tx = await bunnyBattle.connect(owner).claimCommission();
    const receipt: ContractTransactionReceipt = await tx.wait() as ContractTransactionReceipt;
    // revert if no commision left
    expect(bunnyBattle.connect(owner).claimCommission()).to.be.rejectedWith("NothingToClaim");
    const gasCostForTxn = receipt.gasUsed * receipt.gasPrice
    expect(await ethers.provider.getBalance(bunnyBattle.getAddress())).to.be.eq("0");
    expect(await ethers.provider.getBalance(owner.address)).to.be.eq(prevBalanceOwner + commission - gasCostForTxn);
  });

  it("TechnicalLose possible", async function () {
    const proof1 = await genBoardProof(player1Create);
    await bunnyBattle.connect(account1).createGame(proof1.solidityProof, proof1.inputs[0], parseEther("1"), { value: parseEther("1") });
    let game = await bunnyBattle.game(0);

    const proof2 = await genBoardProof(player2Create);
    await bunnyBattle.connect(account2).joinGame(0, proof2.solidityProof, proof2.inputs[0],  { value: parseEther("1") });
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(0);

    await bunnyBattle.connect(account1).submitMove(0, 1, 2, emptyProof, false);
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(1);
    let prevMove = game.moves[0];

    const proof3 = await genMoveProof({
      // Public Inputs
      'boardHash': game.player2Hash.toString(),
      'guess': [prevMove.x, prevMove.y],
      // Private Inputs:
      'nonce': player2Create.nonce,
      'bunnies': player2Create.bunnies,
    });
    await bunnyBattle.connect(account2).submitMove(0, 0, 0, proof3.solidityProof, false);
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(2);
    expect(game.moves[0].isHit).to.equal(false);
    prevMove = game.moves[1];
    expect(prevMove.x).to.eq(BigInt(0));
    expect(prevMove.y).to.eq(BigInt(0));
    expect(game.winner).to.eq(ZeroAddress);

    let block = await ethers.provider.getBlock("latest");
    let timestamp = block!.timestamp;
    const tmpTimestamp = game.nextMoveDeadline;
    // timestamp is changed correctly
    expect(tmpTimestamp).to.be.greaterThan(timestamp);

    // Move time forward by less than 1 min (58 seconds)
    await ethers.provider.send("evm_increaseTime", [58]);
    await ethers.provider.send("evm_mine", []);
    

    const proof4 = await genMoveProof({
      // Public Inputs
      'boardHash': game.player1Hash.toString(),
      'guess': [prevMove.x, prevMove.y],
      // Private Inputs:
      'nonce': player1Create.nonce,
      'bunnies': player1Create.bunnies,
    });
    await bunnyBattle.connect(account1).submitMove(0, 2, 1, proof4.solidityProof, true);
    game = await bunnyBattle.game(0);
    prevMove = game.moves[2];
    block = await ethers.provider.getBlock("latest");
    timestamp = block!.timestamp;
    const lastNextTimestamp = game.nextMoveDeadline;
    // timestamp is changed correctly
    expect(lastNextTimestamp).to.be.lessThanOrEqual(tmpTimestamp + BigInt(60)); 

    // Move time forward by 1 min (60 seconds)
    await ethers.provider.send("evm_increaseTime", [60]);
    await ethers.provider.send("evm_mine", []);

    const proof5 = await genMoveProof({
      // Public Inputs
      'boardHash': game.player2Hash.toString(),
      'guess': [prevMove.x, prevMove.y],
      // Private Inputs:
      'nonce': player2Create.nonce,
      'bunnies': player2Create.bunnies,
    });

    block = await ethers.provider.getBlock("latest");
    expect(lastNextTimestamp).to.be.lessThanOrEqual(block?.timestamp); // timestamp is changed correctly 
    await expect(bunnyBattle.connect(account2).submitMove(0, 2, 2, proof5.solidityProof, true)).to.be.rejectedWith("TechnicalLose");

    game = await bunnyBattle.game(0);
    expect(game.winner).to.eq(ZeroAddress);
    
    expect(game.winner).to.equal(ZeroAddress);

    // revert claim for non-winner 
    await expect(bunnyBattle.connect(account2).claimRewardOnOpponentTimeout(0)).to.be.rejectedWith("InvalidWinner");

    const prevBalanceAccount2 = await ethers.provider.getBalance(account1.address);
    const tx = await bunnyBattle.connect(account1).claimRewardOnOpponentTimeout(0);

    const receipt: ContractTransactionReceipt = await tx.wait() as ContractTransactionReceipt;
    const gasCostForTxn = receipt.gasUsed * receipt.gasPrice
    const commission =  parseEther("2") *  parseEther("1") /  parseEther("100");
    expect(await ethers.provider.getBalance(account1.address)).to.be.eq(prevBalanceAccount2 + parseEther("2") - commission - gasCostForTxn)
  
    game = await bunnyBattle.game(0);
    expect(game.winner).to.equal(account1);
  });

  it("claimRewards works for game without moves", async function () {
    const proof1 = await genBoardProof(player1Create);
    await bunnyBattle.connect(account1).createGame(proof1.solidityProof, proof1.inputs[0], parseEther("1"), { value: parseEther("1") });
    let game = await bunnyBattle.game(0);

    const proof2 = await genBoardProof(player2Create);
    await bunnyBattle.connect(account2).joinGame(0, proof2.solidityProof, proof2.inputs[0],  { value: parseEther("1") });
    
    await expect(bunnyBattle.connect(account1).claimRewardOnOpponentTimeout(0)).to.be.rejectedWith("FailedToClaimReward");
    await expect(bunnyBattle.connect(account2).claimRewardOnOpponentTimeout(0)).to.be.rejectedWith("FailedToClaimReward");

    // Move time forward by 1 min (55 seconds)
    await ethers.provider.send("evm_increaseTime", [55]);
    await ethers.provider.send("evm_mine", []);

    await expect(bunnyBattle.connect(account1).claimRewardOnOpponentTimeout(0)).to.be.rejectedWith("FailedToClaimReward");
    await expect(bunnyBattle.connect(account2).claimRewardOnOpponentTimeout(0)).to.be.rejectedWith("FailedToClaimReward");

    // Move time to be > 1 min since start (+5 sec) 
    await ethers.provider.send("evm_increaseTime", [5]);
    await ethers.provider.send("evm_mine", []);

    await expect(bunnyBattle.connect(account1).claimRewardOnOpponentTimeout(0)).to.be.rejectedWith("InvalidWinner");
    await bunnyBattle.connect(account2).claimRewardOnOpponentTimeout(0);

    game = await bunnyBattle.game(0);
    // check the winner
    expect(game.winner).to.equal(account2);
  })
  
  it("claimRewards works for game without 2nd move", async function () {
    const proof1 = await genBoardProof(player1Create);
    await bunnyBattle.connect(account1).createGame(proof1.solidityProof, proof1.inputs[0], parseEther("1"), { value: parseEther("1") });
    let game = await bunnyBattle.game(0);

    const proof2 = await genBoardProof(player2Create);
    await bunnyBattle.connect(account2).joinGame(0, proof2.solidityProof, proof2.inputs[0],  { value: parseEther("1") });

    await bunnyBattle.connect(account1).submitMove(0, 1, 2, emptyProof, false);
    game = await bunnyBattle.game(0);
    expect(game.moves.length).to.equal(1);
    
    // Move time forward by 1 min (55 seconds)
    await ethers.provider.send("evm_increaseTime", [55]);
    await ethers.provider.send("evm_mine", []);

    await expect(bunnyBattle.connect(account1).claimRewardOnOpponentTimeout(0)).to.be.rejectedWith("FailedToClaimReward");
    await expect(bunnyBattle.connect(account2).claimRewardOnOpponentTimeout(0)).to.be.rejectedWith("FailedToClaimReward");

    // Move time to be > 1 min since start (+5 sec) 
    await ethers.provider.send("evm_increaseTime", [5]);
    await ethers.provider.send("evm_mine", []);

    await expect(bunnyBattle.connect(account2).claimRewardOnOpponentTimeout(0)).to.be.rejectedWith("InvalidWinner");
    
    await bunnyBattle.connect(account1).claimRewardOnOpponentTimeout(0);
    game = await bunnyBattle.game(0);
    // check the winner
    expect(game.winner).to.equal(account1);
  })
});

// Utils (should be split out of test/)

const snarkjs = require('snarkjs')
const fs = require('fs')

const emptyProof = '0x0000000000000000000000000000000000000000000000000000000000000000';

const boardWC = require('../circom/board/board_js/witness_calculator.js');
const boardWasm = './circom/board/board_js/board.wasm'
const boardZkey = './circom/board/board_0001.zkey'
const moveWC = require('../circom/move/move_js/witness_calculator.js');
const moveWasm = './circom/move/move_js/move.wasm'
const moveZkey = './circom/move/move_0001.zkey'

const WITNESS_FILE = '/tmp/witness'

const genBoardProof = async (input: any) => {
  const buffer = fs.readFileSync(boardWasm);
  const witnessCalculator = await boardWC(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(input);
  // The package methods read from files only, so we just shove it in /tmp/ and hope
  // there is no parallel execution.
  fs.writeFileSync(WITNESS_FILE, buff);
  const { proof, publicSignals } = await snarkjs.groth16.prove(boardZkey, WITNESS_FILE);
  const solidityProof = proofToSolidityInput(proof);
  return {
    solidityProof: solidityProof,
    inputs: publicSignals,
  }
}

const genMoveProof = async (input: any) => {
  const buffer = fs.readFileSync(moveWasm);
  const witnessCalculator = await moveWC(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(input);
  fs.writeFileSync(WITNESS_FILE, buff);
  const { proof, publicSignals } = await snarkjs.groth16.prove(moveZkey, WITNESS_FILE);
  const solidityProof = proofToSolidityInput(proof);
  return {
    solidityProof: solidityProof,
    inputs: publicSignals,
  }
}

// Instead of passing in a large array of numbers (annoying), we
// just make proof a single string (which will be decompiled as a uint32
// in the contract)
// Copied from Tornado's websnark fork:
// https://github.com/tornadocash/websnark/blob/master/src/utils.js
const proofToSolidityInput = (proof: any): string => {
  const proofs: string[] = [
    proof.pi_a[0], proof.pi_a[1],
    proof.pi_b[0][1], proof.pi_b[0][0],
    proof.pi_b[1][1], proof.pi_b[1][0],
    proof.pi_c[0], proof.pi_c[1],
  ];
  const flatProofs = proofs.map(p => BigInt(p));
  return "0x" + flatProofs.map(x => toHex32(x)).join("")
}

const toHex32 = (num: BigInt) => {
  let str = num.toString(16);
  while (str.length < 64) str = "0" + str;
  return str;
}
