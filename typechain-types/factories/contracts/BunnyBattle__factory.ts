/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../common";
import type {
  BunnyBattle,
  BunnyBattleInterface,
} from "../../contracts/BunnyBattle";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IBoardVerifier",
        name: "_boardVerifier",
        type: "address",
      },
      {
        internalType: "contract IMoveVerifier",
        name: "_moveVerifier",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
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
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
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
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
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
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
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
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
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
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
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
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
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
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
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
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "accumulatedFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "boardVerifier",
    outputs: [
      {
        internalType: "contract IBoardVerifier",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimCommission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameID",
        type: "uint256",
      },
    ],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_proof",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "_boardHash",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_betAmount",
        type: "uint256",
      },
    ],
    name: "createGame",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_gameID",
        type: "uint32",
      },
    ],
    name: "game",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "player1",
            type: "address",
          },
          {
            internalType: "address",
            name: "player2",
            type: "address",
          },
          {
            internalType: "address",
            name: "winner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "player1Hash",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "player2Hash",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalBetAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "nextMoveDeadline",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "x",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "y",
                type: "uint256",
              },
              {
                internalType: "bool",
                name: "isHit",
                type: "bool",
              },
            ],
            internalType: "struct IBunnyBattle.Move[]",
            name: "moves",
            type: "tuple[]",
          },
        ],
        internalType: "struct IBunnyBattle.GamePublicMetadata",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_gameID",
        type: "uint32",
      },
      {
        internalType: "bytes",
        name: "_proof",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "_boardHash",
        type: "uint256",
      },
    ],
    name: "joinGame",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "makeMoveTimestamp",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minBetAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "moveVerifier",
    outputs: [
      {
        internalType: "contract IMoveVerifier",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextGameID",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_gameID",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "_moveX",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_moveY",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_proof",
        type: "bytes",
      },
      {
        internalType: "bool",
        name: "isPreviousMoveAHit",
        type: "bool",
      },
    ],
    name: "submitMove",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60c06040523480156200001157600080fd5b5060405162002e2c38038062002e2c8339818101604052810190620000379190620002b6565b33600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603620000ad5760006040517f1e4fbdf7000000000000000000000000000000000000000000000000000000008152600401620000a491906200030e565b60405180910390fd5b620000be816200012f60201b60201c565b508173ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff16815250508073ffffffffffffffffffffffffffffffffffffffff1660a08173ffffffffffffffffffffffffffffffffffffffff168152505050506200032b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006200022582620001f8565b9050919050565b6000620002398262000218565b9050919050565b6200024b816200022c565b81146200025757600080fd5b50565b6000815190506200026b8162000240565b92915050565b60006200027e8262000218565b9050919050565b620002908162000271565b81146200029c57600080fd5b50565b600081519050620002b08162000285565b92915050565b60008060408385031215620002d057620002cf620001f3565b5b6000620002e0858286016200025a565b9250506020620002f3858286016200029f565b9150509250929050565b620003088162000218565b82525050565b6000602082019050620003256000830184620002fd565b92915050565b60805160a051612acd6200035f600039600081816110b901526119040152600081816106fb01526112140152612acd6000f3fe6080604052600436106100e85760003560e01c8063ac744a2c1161008a578063f2fde38b11610059578063f2fde38b146102b6578063f8ce3164146102df578063fa968eea1461030a578063fad99f9814610335576100e8565b8063ac744a2c146101fc578063ae169a5014610239578063c894cafe14610262578063d173bf9c1461028b576100e8565b80637d9a69d7116100c65780637d9a69d71461014b578063833b52be1461017b5780638da5cb5b146101a65780639fbaa613146101d1576100e8565b80631ea6beb6146100ed578063673ee37c14610109578063715018a614610134575b600080fd5b61010760048036038101906101029190611d7d565b61034c565b005b34801561011557600080fd5b5061011e61057d565b60405161012b9190611e00565b60405180910390f35b34801561014057600080fd5b50610149610583565b005b61016560048036038101906101609190611e1b565b610597565b6040516101729190611e00565b60405180910390f35b34801561018757600080fd5b506101906106cb565b60405161019d9190611e00565b60405180910390f35b3480156101b257600080fd5b506101bb6106d0565b6040516101c89190611ed0565b60405180910390f35b3480156101dd57600080fd5b506101e66106f9565b6040516101f39190611f4a565b60405180910390f35b34801561020857600080fd5b50610223600480360381019061021e9190611f65565b61071d565b604051610230919061216c565b60405180910390f35b34801561024557600080fd5b50610260600480360381019061025b919061218e565b61096a565b005b34801561026e57600080fd5b50610289600480360381019061028491906121e7565b610a6c565b005b34801561029757600080fd5b506102a06110b7565b6040516102ad91906122a2565b60405180910390f35b3480156102c257600080fd5b506102dd60048036038101906102d891906122e9565b6110db565b005b3480156102eb57600080fd5b506102f4611161565b6040516103019190611e00565b60405180910390f35b34801561031657600080fd5b5061031f611167565b60405161032c9190611e00565b60405180910390f35b34801561034157600080fd5b5061034a611172565b005b6001548463ffffffff161061038d576040517fbbec4dc200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000600360008663ffffffff16815260200190815260200160002090503373ffffffffffffffffffffffffffffffffffffffff168160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610433576040517fb474227200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146104bd576040517fb474227200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6104c88484846111ff565b6104d78563ffffffff16611422565b338160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550818160040181905550603c426105309190612345565b81600801819055508463ffffffff167f45c4f9cbafe186141862608c493f28b823fde4c2142bedc3f5169961a73fdd223360405161056e9190611ed0565b60405180910390a25050505050565b60015481565b61058b6114cf565b6105956000611556565b565b60006105a48585856111ff565b66038d7ea4c680008210156105e5576040517f6d14158600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000600154905060018060008282546105fe9190612345565b925050819055506000600360008381526020019081526020016000209050338160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508481600301819055506000816007018190555083816005018190555061068482611422565b817f7dfb67e9ff596fca4da65c7eedb128cd1aac553af54b3c0cb733625a2480d8bd33866040516106b6929190612379565b60405180910390a28192505050949350505050565b603c81565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b7f000000000000000000000000000000000000000000000000000000000000000081565b610725611be8565b6001548263ffffffff1610610766576040517fbbec4dc200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000600360008463ffffffff16815260200190815260200160002090506000816007015467ffffffffffffffff8111156107a3576107a26123a2565b5b6040519080825280602002602001820160405280156107dc57816020015b6107c9611c6f565b8152602001906001900390816107c15790505b50905060005b82600701548110156108685782600901600082815260200190815260200160002060405180606001604052908160008201548152602001600182015481526020016002820160009054906101000a900460ff1615151515815250508282815181106108505761084f6123d1565b5b602002602001018190525080806001019150506107e2565b506040518061010001604052808360000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018360010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018360020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001836003015481526020018360040154815260200183600601548152602001836008015481526020018281525092505050919050565b600060036000838152602001908152602001600020905042816008015411806109e45750600073ffffffffffffffffffffffffffffffffffffffff168160020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614155b15610a1b576040517f87d228f600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610a25823361161a565b338160020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050565b6001548663ffffffff1610610aad576040517fbbec4dc200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6000600360008863ffffffff1681526020019081526020016000209050600073ffffffffffffffffffffffffffffffffffffffff168160020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610b54576040517f68a4ebce00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008160080154118015610b6b5750428160080154105b15610ba2576040517f2c5d969600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600081600301549050600060028360070154610bbe919061242f565b03610c51578160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610c4c576040517f8c29db9e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610ce2565b8160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610cda576040517f8c29db9e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b816004015490505b600087108015610cf3575060038710155b15610d2a576040517f66f5040100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600086108015610d3b575060038610155b15610d72576040517fda72af9600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600082600701541115610e3a57600082600901600060018560070154610d989190612460565b81526020019081526020016000209050610dbe86868487856000015486600101546118ef565b838160020160006101000a81548160ff0219169083151502179055508315610e385782600a0160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000815480929190610e3290612494565b91905055505b505b600282600a0160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205403610fca57600060028360070154610e96919061242f565b14610ec5578160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16610eeb565b8160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff165b8260020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610f618863ffffffff168360020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1661161a565b8763ffffffff167ff5d92df6ae1a0b46d0a0c57c2e1da0d75d7591d2804ad086cb1e27ba67de7aaf8360020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff168460070154604051610fc1929190612379565b60405180910390a25b60405180606001604052808881526020018781526020016000151581525082600901600084600701548152602001908152602001600020600082015181600001556020820151816001015560408201518160020160006101000a81548160ff021916908315150217905550905050600182600701600082825461104d9190612345565b92505081905550603c426110619190612345565b82600801819055508763ffffffff167ff9c787b51d3d2c862fa452a9a2a6c109cbc1c62fe6ea54982e74bc967ccc7899338989876040516110a594939291906124eb565b60405180910390a25050505050505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b6110e36114cf565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036111555760006040517f1e4fbdf700000000000000000000000000000000000000000000000000000000815260040161114c9190611ed0565b60405180910390fd5b61115e81611556565b50565b60025481565b66038d7ea4c6800081565b61117a6114cf565b60006002549050600081036111bb576040517f969bf72800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6111c53382611b38565b7f812744101ebaaf6b793a9a3057b00dff294aa41e3665594c617fc101fb0387dc816040516111f49190611e00565b60405180910390a150565b60008383810190611210919061263e565b90507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166343753b4d60405180604001604052808460006008811061126d5761126c6123d1565b5b602002015181526020018460016008811061128b5761128a6123d1565b5b602002015181525060405180604001604052806040518060400160405280876002600881106112bd576112bc6123d1565b5b60200201518152602001876003600881106112db576112da6123d1565b5b60200201518152508152602001604051806040016040528087600460088110611307576113066123d1565b5b6020020151815260200187600560088110611325576113246123d1565b5b602002015181525081525060405180604001604052808660066008811061134f5761134e6123d1565b5b602002015181526020018660076008811061136d5761136c6123d1565b5b60200201518152506040518060200160405280888152506040518563ffffffff1660e01b81526004016113a3949392919061288a565b6020604051808303816000875af11580156113c2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113e691906128e6565b61141c576040517f1f21ce1400000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b50505050565b600060036000838152602001908152602001600020905080600501543414611476576040517f6d14158600000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b3481600601600082825461148a9190612345565b92505081905550817f6e9a1c016f5e0e310166cd88e5d74d0ff5c3b973c235306d52d697b7522cb1fc33346040516114c3929190612379565b60405180910390a25050565b6114d7611be0565b73ffffffffffffffffffffffffffffffffffffffff166114f56106d0565b73ffffffffffffffffffffffffffffffffffffffff161461155457611518611be0565b6040517f118cdaa700000000000000000000000000000000000000000000000000000000815260040161154b9190611ed0565b60405180910390fd5b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6000600360008481526020019081526020016000209050600073ffffffffffffffffffffffffffffffffffffffff168160020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614611717578060020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614611712576040517f93a5f3c700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b611855565b428160080154101561185457600060028260070154611736919061242f565b036117c9578060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16146117c4576040517f93a5f3c700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b611853565b8060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614611852576040517f93a5f3c700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5b5b5b600061271061ffff16606461ffff1683600601546118739190612913565b61187d9190612955565b905080600260008282546118919190612345565b925050819055506118b1838284600601546118ac9190612460565b611b38565b837fcbfb271d31de435b2658dcefeb94270068149bf36b21c36d4f48f5ee96d70f04826040516118e19190611e00565b60405180910390a250505050565b60008686810190611900919061263e565b90507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16635fe8c13b60405180604001604052808460006008811061195d5761195c6123d1565b5b602002015181526020018460016008811061197b5761197a6123d1565b5b602002015181525060405180604001604052806040518060400160405280876002600881106119ad576119ac6123d1565b5b60200201518152602001876003600881106119cb576119ca6123d1565b5b602002015181525081526020016040518060400160405280876004600881106119f7576119f66123d1565b5b6020020151815260200187600560088110611a1557611a146123d1565b5b6020020151815250815250604051806040016040528086600660088110611a3f57611a3e6123d1565b5b6020020151815260200186600760088110611a5d57611a5c6123d1565b5b602002015181525060405180608001604052808a611a7c576000611a7f565b60015b60ff1681526020018b8152602001898152602001888152506040518563ffffffff1660e01b8152600401611ab69493929190612a0a565b6020604051808303816000875af1158015611ad5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611af991906128e6565b611b2f576040517f2b5e157a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b50505050505050565b60008273ffffffffffffffffffffffffffffffffffffffff1682604051611b5e90612a82565b60006040518083038185875af1925050503d8060008114611b9b576040519150601f19603f3d011682016040523d82523d6000602084013e611ba0565b606091505b5050905080611bdb576040517fa9c98a4b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b505050565b600033905090565b604051806101000160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001600073ffffffffffffffffffffffffffffffffffffffff16815260200160008152602001600081526020016000815260200160008152602001606081525090565b604051806060016040528060008152602001600081526020016000151581525090565b6000604051905090565b600080fd5b600080fd5b600063ffffffff82169050919050565b611cbf81611ca6565b8114611cca57600080fd5b50565b600081359050611cdc81611cb6565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f840112611d0757611d06611ce2565b5b8235905067ffffffffffffffff811115611d2457611d23611ce7565b5b602083019150836001820283011115611d4057611d3f611cec565b5b9250929050565b6000819050919050565b611d5a81611d47565b8114611d6557600080fd5b50565b600081359050611d7781611d51565b92915050565b60008060008060608587031215611d9757611d96611c9c565b5b6000611da587828801611ccd565b945050602085013567ffffffffffffffff811115611dc657611dc5611ca1565b5b611dd287828801611cf1565b93509350506040611de587828801611d68565b91505092959194509250565b611dfa81611d47565b82525050565b6000602082019050611e156000830184611df1565b92915050565b60008060008060608587031215611e3557611e34611c9c565b5b600085013567ffffffffffffffff811115611e5357611e52611ca1565b5b611e5f87828801611cf1565b94509450506020611e7287828801611d68565b9250506040611e8387828801611d68565b91505092959194509250565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000611eba82611e8f565b9050919050565b611eca81611eaf565b82525050565b6000602082019050611ee56000830184611ec1565b92915050565b6000819050919050565b6000611f10611f0b611f0684611e8f565b611eeb565b611e8f565b9050919050565b6000611f2282611ef5565b9050919050565b6000611f3482611f17565b9050919050565b611f4481611f29565b82525050565b6000602082019050611f5f6000830184611f3b565b92915050565b600060208284031215611f7b57611f7a611c9c565b5b6000611f8984828501611ccd565b91505092915050565b611f9b81611eaf565b82525050565b611faa81611d47565b82525050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b60008115159050919050565b611ff181611fdc565b82525050565b60608201600082015161200d6000850182611fa1565b5060208201516120206020850182611fa1565b5060408201516120336040850182611fe8565b50505050565b60006120458383611ff7565b60608301905092915050565b6000602082019050919050565b600061206982611fb0565b6120738185611fbb565b935061207e83611fcc565b8060005b838110156120af5781516120968882612039565b97506120a183612051565b925050600181019050612082565b5085935050505092915050565b6000610100830160008301516120d56000860182611f92565b5060208301516120e86020860182611f92565b5060408301516120fb6040860182611f92565b50606083015161210e6060860182611fa1565b5060808301516121216080860182611fa1565b5060a083015161213460a0860182611fa1565b5060c083015161214760c0860182611fa1565b5060e083015184820360e086015261215f828261205e565b9150508091505092915050565b6000602082019050818103600083015261218681846120bc565b905092915050565b6000602082840312156121a4576121a3611c9c565b5b60006121b284828501611d68565b91505092915050565b6121c481611fdc565b81146121cf57600080fd5b50565b6000813590506121e1816121bb565b92915050565b60008060008060008060a0878903121561220457612203611c9c565b5b600061221289828a01611ccd565b965050602061222389828a01611d68565b955050604061223489828a01611d68565b945050606087013567ffffffffffffffff81111561225557612254611ca1565b5b61226189828a01611cf1565b9350935050608061227489828a016121d2565b9150509295509295509295565b600061228c82611f17565b9050919050565b61229c81612281565b82525050565b60006020820190506122b76000830184612293565b92915050565b6122c681611eaf565b81146122d157600080fd5b50565b6000813590506122e3816122bd565b92915050565b6000602082840312156122ff576122fe611c9c565b5b600061230d848285016122d4565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061235082611d47565b915061235b83611d47565b925082820190508082111561237357612372612316565b5b92915050565b600060408201905061238e6000830185611ec1565b61239b6020830184611df1565b9392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600061243a82611d47565b915061244583611d47565b92508261245557612454612400565b5b828206905092915050565b600061246b82611d47565b915061247683611d47565b925082820390508181111561248e5761248d612316565b5b92915050565b600061249f82611d47565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036124d1576124d0612316565b5b600182019050919050565b6124e581611fdc565b82525050565b60006080820190506125006000830187611ec1565b61250d6020830186611df1565b61251a6040830185611df1565b61252760608301846124dc565b95945050505050565b6000601f19601f8301169050919050565b61254a82612530565b810181811067ffffffffffffffff82111715612569576125686123a2565b5b80604052505050565b600061257c611c92565b90506125888282612541565b919050565b600067ffffffffffffffff8211156125a8576125a76123a2565b5b602082029050919050565b60006125c66125c18461258d565b612572565b905080602084028301858111156125e0576125df611cec565b5b835b8181101561260957806125f58882611d68565b8452602084019350506020810190506125e2565b5050509392505050565b600082601f83011261262857612627611ce2565b5b60086126358482856125b3565b91505092915050565b6000610100828403121561265557612654611c9c565b5b600061266384828501612613565b91505092915050565b600060029050919050565b600081905092915050565b6000819050919050565b60006126988383611fa1565b60208301905092915050565b6000602082019050919050565b6126ba8161266c565b6126c48184612677565b92506126cf82612682565b8060005b838110156127005781516126e7878261268c565b96506126f2836126a4565b9250506001810190506126d3565b505050505050565b600060029050919050565b600081905092915050565b6000819050919050565b600081905092915050565b61273c8161266c565b6127468184612728565b925061275182612682565b8060005b83811015612782578151612769878261268c565b9650612774836126a4565b925050600181019050612755565b505050505050565b60006127968383612733565b60408301905092915050565b6000602082019050919050565b6127b881612708565b6127c28184612713565b92506127cd8261271e565b8060005b838110156127fe5781516127e5878261278a565b96506127f0836127a2565b9250506001810190506127d1565b505050505050565b600060019050919050565b600081905092915050565b6000819050919050565b6000602082019050919050565b61283c81612806565b6128468184612811565b92506128518261281c565b8060005b83811015612882578151612869878261268c565b965061287483612826565b925050600181019050612855565b505050505050565b6000610120820190506128a060008301876126b1565b6128ad60408301866127af565b6128ba60c08301856126b1565b6128c8610100830184612833565b95945050505050565b6000815190506128e0816121bb565b92915050565b6000602082840312156128fc576128fb611c9c565b5b600061290a848285016128d1565b91505092915050565b600061291e82611d47565b915061292983611d47565b925082820261293781611d47565b9150828204841483151761294e5761294d612316565b5b5092915050565b600061296082611d47565b915061296b83611d47565b92508261297b5761297a612400565b5b828204905092915050565b600060049050919050565b600081905092915050565b6000819050919050565b6000602082019050919050565b6129bc81612986565b6129c68184612991565b92506129d18261299c565b8060005b83811015612a025781516129e9878261268c565b96506129f4836129a6565b9250506001810190506129d5565b505050505050565b600061018082019050612a2060008301876126b1565b612a2d60408301866127af565b612a3a60c08301856126b1565b612a486101008301846129b3565b95945050505050565b600081905092915050565b50565b6000612a6c600083612a51565b9150612a7782612a5c565b600082019050919050565b6000612a8d82612a5f565b915081905091905056fea2646970667358221220c5d4bfa47f9509036524fea676758fed13c673e3e47ca2e3a91c78aee5f5412964736f6c63430008180033";

type BunnyBattleConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BunnyBattleConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BunnyBattle__factory extends ContractFactory {
  constructor(...args: BunnyBattleConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _boardVerifier: AddressLike,
    _moveVerifier: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(
      _boardVerifier,
      _moveVerifier,
      overrides || {}
    );
  }
  override deploy(
    _boardVerifier: AddressLike,
    _moveVerifier: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(
      _boardVerifier,
      _moveVerifier,
      overrides || {}
    ) as Promise<
      BunnyBattle & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): BunnyBattle__factory {
    return super.connect(runner) as BunnyBattle__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BunnyBattleInterface {
    return new Interface(_abi) as BunnyBattleInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): BunnyBattle {
    return new Contract(address, _abi, runner) as unknown as BunnyBattle;
  }
}
