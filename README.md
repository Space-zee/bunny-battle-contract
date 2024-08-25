# BunnyBattle
BunnyBattle integrates zk-SNARKs to create a secure and fair version of the classic Battleship game. The project involves writing smart contracts in Solidity and using libraries like Circom and Snarkjs to implement the zk-SNARK logic. The project aims to demonstrate how zk-SNARKs can be used to ensure fairness and privacy in a decentralized environment and PvP games.

Try running some of the following tasks:

### Additionally, install circom compiler and snarkjs globally
- https://docs.circom.io/getting-started/installation/

```shell

yarn install
# Compile the circuits
cd scripts && ./circuits.sh && cd ./..
# Compile the contracts
yarn hardhat compile
# Run the tests to simulate dumbattle 
yarn hardhat test

# hardhat commands
yarn hardhat help
yarn hardhat test
REPORT_GAS=true yarn hardhat test
yarn hardhat node
yarn hardhat ignition deploy ./ignition/modules/Lock.ts
```
