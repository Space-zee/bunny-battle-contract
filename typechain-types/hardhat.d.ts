/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  DeployContractOptions,
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomicfoundation/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "Groth16Verifier",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Groth16Verifier__factory>;
    getContractFactory(
      name: "BunnyBattle",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.BunnyBattle__factory>;
    getContractFactory(
      name: "IBunnyBattle",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBunnyBattle__factory>;
    getContractFactory(
      name: "IBoardVerifier",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBoardVerifier__factory>;
    getContractFactory(
      name: "IMoveVerifier",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IMoveVerifier__factory>;
    getContractFactory(
      name: "Groth16Verifier",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Groth16Verifier__factory>;

    getContractAt(
      name: "Ownable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "Groth16Verifier",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Groth16Verifier>;
    getContractAt(
      name: "BunnyBattle",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.BunnyBattle>;
    getContractAt(
      name: "IBunnyBattle",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IBunnyBattle>;
    getContractAt(
      name: "IBoardVerifier",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IBoardVerifier>;
    getContractAt(
      name: "IMoveVerifier",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IMoveVerifier>;
    getContractAt(
      name: "Groth16Verifier",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Groth16Verifier>;

    deployContract(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Ownable>;
    deployContract(
      name: "Groth16Verifier",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Groth16Verifier>;
    deployContract(
      name: "BunnyBattle",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.BunnyBattle>;
    deployContract(
      name: "IBunnyBattle",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IBunnyBattle>;
    deployContract(
      name: "IBoardVerifier",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IBoardVerifier>;
    deployContract(
      name: "IMoveVerifier",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IMoveVerifier>;
    deployContract(
      name: "Groth16Verifier",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Groth16Verifier>;

    deployContract(
      name: "Ownable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Ownable>;
    deployContract(
      name: "Groth16Verifier",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Groth16Verifier>;
    deployContract(
      name: "BunnyBattle",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.BunnyBattle>;
    deployContract(
      name: "IBunnyBattle",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IBunnyBattle>;
    deployContract(
      name: "IBoardVerifier",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IBoardVerifier>;
    deployContract(
      name: "IMoveVerifier",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IMoveVerifier>;
    deployContract(
      name: "Groth16Verifier",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Groth16Verifier>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
  }
}
