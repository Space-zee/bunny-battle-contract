// const snarkjs = require('snarkjs')
import { groth16 } from 'snarkjs'
import { readFile, writeFile } from 'fs/promises'
import { BunniesCoordinates, Coordinates, toHex32 } from './utils'

const boardWC = require('../circom/board/board_js/witness_calculator.js');
const boardWasm = './circom/board/board_js/board.wasm'
const boardZkey = './circom/board/board_0001.zkey'
const moveWC = require('../circom/move/move_js/witness_calculator.js');
const moveWasm = './circom/move/move_js/move.wasm'
const moveZkey = './circom/move/move_0001.zkey'

const WITNESS_FILE = '/tmp/witness'

export const genBoardProof = async (input: any) => {
  const buffer = await readFile(boardWasm);
  const witnessCalculator = await boardWC(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(input);
  // The package methods read from files only, so we just shove it in /tmp/ and hope
  // there is no parallel execution.
  await writeFile(WITNESS_FILE, buff);
  const { proof, publicSignals } = await groth16.prove(boardZkey, WITNESS_FILE);
  const solidityProof = proofToSolidityInput(proof);
  return {
    solidityProof: solidityProof,
    inputs: publicSignals,
  }
}

interface GenMoveProofArgs {
  boardHash: string, // board hash, stored in contract
  guess: Coordinates, // coordinates of previous (opponent) move
  nonce: number, // player nonce
  bunnies: BunniesCoordinates, // coordinates of player bunnies
}
export const genMoveProof = async (input: any) => {
  const buffer = await readFile(moveWasm);
  const witnessCalculator = await moveWC(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(input);
  await writeFile(WITNESS_FILE, buff);
  const { proof, publicSignals } = await groth16.prove(moveZkey, WITNESS_FILE);
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
export const proofToSolidityInput = (proof: any): string => {
  const proofs: string[] = [
    proof.pi_a[0], proof.pi_a[1],
    proof.pi_b[0][1], proof.pi_b[0][0],
    proof.pi_b[1][1], proof.pi_b[1][0],
    proof.pi_c[0], proof.pi_c[1],
  ];
  const flatProofs = proofs.map(p => BigInt(p));
  return "0x" + flatProofs.map(x => toHex32(x)).join("")
}
