import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BaseContract, parseEther } from "ethers";
import { ethers } from "hardhat";

export const getRandomArbitrary = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
}

function getPercentOfNumber(number: number, percent: number): number {
  if (percent < 0 || percent > 100) {
    throw new Error("Percent must be between 0 and 100");
  }
  return (number * percent) / 100;
}

const getRandomElementFromArray = <T>(arr: T[]): T => {
  return arr[(Math.floor(Math.random() * arr.length))]
}

export const getRandomInt = (min: number, max: number) => {
  return Math.trunc(getRandomArbitrary(min, max))
}

export const toHex32 = (num: BigInt) => {
  return num.toString(16).padStart(64, '0');
}

export const EmptyProof = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const MakeMoveTimestamp = 60; // 60 seconds

export type Coordinates = [number, number]

export const getRandomNumberInBoardBounds = () => {
  return getRandomInt(0, 3);
}

export const generateBetAmount = () => {
  return getRandomInt(1, 11)
}

export const generateBetAmountInWei = () => {
  return parseEther(generateBetAmount().toString())
}

export const areCoordinatesSame = (coordinates1: Coordinates, coordinates2: Coordinates) => {
  return coordinates1[0] === coordinates2[0] && coordinates1[1] === coordinates2[1]
}

export const generateRandomCoordinates = (exceptCoordinates: Coordinates[] = []): Coordinates => {
  const tryGenerate = () => {
    const randX = getRandomNumberInBoardBounds()
    const randY = getRandomNumberInBoardBounds()
    const coordinates: Coordinates = [randX, randY]

    const isAlreadyExist = exceptCoordinates.some((coords) => areCoordinatesSame(coords, coordinates));
    if (isAlreadyExist) {
      return tryGenerate()
    }

    return coordinates
  }

  return tryGenerate()
}

export type BunniesCoordinates = [Coordinates, Coordinates];

export const generateBunniesCoordinates = (): BunniesCoordinates => {
  const bunny1Coordinates = generateRandomCoordinates()
  const bunny2Coorinates = generateRandomCoordinates([bunny1Coordinates]);

  return [bunny1Coordinates, bunny2Coorinates]
}

export interface PlayerCreateGame {
  nonce: number
  bunnies: BunniesCoordinates
}

export const randomCreatePlayerBoard = (): PlayerCreateGame => {
  const bunniesCordinates = generateBunniesCoordinates()
  const nonce = getRandomInt(1000, 1000000);

  return { nonce, bunnies: bunniesCordinates }
}

export const calculateProtocolFee = (bet: number) => {
  const feePercentage = 1; // 1%
  return parseEther(getPercentOfNumber(bet * 2, feePercentage).toFixed(6))
}

export const getBalance = async <T extends BaseContract>(entity: string | HardhatEthersSigner | T) => {
  let address: string;

  if (typeof entity === 'string') {
    address = entity
  } else {
    address = await entity.getAddress()
  }

  return ethers.provider.getBalance(address)
}

export const generateDummySolidityProof = () => {
  const characters = 'abcdef0123456789'.split('');
  return "0x" + Array(512).fill(null).map(() => getRandomElementFromArray(characters)).join("")
}

const generateDymmyPublicSignal = () => {
  const lengths = [76, 77];
  const length = getRandomElementFromArray(lengths);
  return getRandomInt(1, 10).toString() + Array(length - 1).fill(null).map(() => getRandomInt(0, 10)).join("")
}

export const generateDummyCreateProof = () => {
  return {
    solidityProof: generateDummySolidityProof(),
    inputs: [
      generateDymmyPublicSignal()
    ]
  }
}

export const generateDummyMoveProof = () => {
  const hitArr = [0, 1]
  const coordinates = generateRandomCoordinates().map((item) => item.toString())

  return {
    solidityProof: generateDummySolidityProof(),
    inputs: [
      getRandomElementFromArray(hitArr).toString(),
      generateDymmyPublicSignal(),
      ...coordinates
    ]
  }
}