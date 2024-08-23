/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  IBunnyBattle,
  IBunnyBattleInterface,
} from "../../../contracts/interfaces/IBunnyBattle";

const _abi = [
  {
    inputs: [],
    name: "FailedEtherSend",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedToClaimReward",
    type: "error",
  },
  {
    inputs: [],
    name: "GameIsFinished",
    type: "error",
  },
  {
    inputs: [],
    name: "IncorrectBetAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidBoardStateZK",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidGameID",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMoveX",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMoveY",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMoveZK",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidTurn",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidWinner",
    type: "error",
  },
  {
    inputs: [],
    name: "NotAllowedJoinGame",
    type: "error",
  },
  {
    inputs: [],
    name: "NothingToClaim",
    type: "error",
  },
  {
    inputs: [],
    name: "TechnicalLose",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint32",
        name: "gameId",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "commission",
        type: "uint256",
      },
    ],
    name: "CommissionAccumulated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "accumulatedFee",
        type: "uint256",
      },
    ],
    name: "CommissionClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint32",
        name: "gameId",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "participant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "betAmount",
        type: "uint256",
      },
    ],
    name: "EtherDeposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint32",
        name: "gameId",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "betAmount",
        type: "uint256",
      },
    ],
    name: "GameCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint32",
        name: "gameId",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "moveSize",
        type: "uint256",
      },
    ],
    name: "GameFinished",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint32",
        name: "gameId",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "participant",
        type: "address",
      },
    ],
    name: "GameJoined",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint32",
        name: "gameId",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "participant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_moveX",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_moveY",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isPreviousMoveAHit",
        type: "bool",
      },
    ],
    name: "MoveSubmitted",
    type: "event",
  },
] as const;

const _bytecode =
  "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea26469706673582212207bc7c4be9b31d5bb9a77d5280ec8fc0e4208d138d64196962821babb4ba59a9264736f6c63430008180033";

type IBunnyBattleConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: IBunnyBattleConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class IBunnyBattle__factory extends ContractFactory {
  constructor(...args: IBunnyBattleConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      IBunnyBattle & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): IBunnyBattle__factory {
    return super.connect(runner) as IBunnyBattle__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): IBunnyBattleInterface {
    return new Interface(_abi) as IBunnyBattleInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IBunnyBattle {
    return new Contract(address, _abi, runner) as unknown as IBunnyBattle;
  }
}
