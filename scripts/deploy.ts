import { Wallet, ZeroAddress } from "ethers";

const { ethers, run } = require("hardhat");

async function main() {
  const BoardVerifier = await ethers.getContractFactory("contracts/boardVerifier.sol:Groth16Verifier");
  const boardVerifier = await BoardVerifier.deploy();
  await boardVerifier.waitForDeployment();
  console.log("BoardVerifier: ", await boardVerifier.getAddress());

  const MoveVerifier = await ethers.getContractFactory("contracts/moveVerifier.sol:Groth16Verifier");
  const moveVerifier = await MoveVerifier.deploy();
  await moveVerifier.waitForDeployment();
  console.log("MoveVerifier: ", await moveVerifier.getAddress());

  const BunnyBattle = await ethers.getContractFactory("BunnyBattle");
  const bunnyBattle = await BunnyBattle.deploy(await boardVerifier.getAddress(), await moveVerifier.getAddress());
  await bunnyBattle.waitForDeployment();
  console.log("BunnyBattle: ", await bunnyBattle.getAddress());


 await verifyContract(await bunnyBattle.getAddress(), await boardVerifier.getAddress(), await moveVerifier.getAddress());
}

function getScrollscanUrl(networkName: string) {
  switch (networkName) {
    case "scrollMainnet":
      return "https://scrollscan.com";
    case "scrollTestnet":
      return "https://sepolia.scrollscan.com";
    default:
      return "https://scrollscan.com";
  }
}

async function verifyContract(bunnyBattle: string, boardVerifier: string, moveVerifier: string) {
  try {
    console.log("Starting verification process...");
    await run("verify:verify", {
      address: bunnyBattle,
      constructorArguments: [await boardVerifier, await moveVerifier]
    });
    const network = await ethers.provider.getNetwork();
    // Determine the network and construct the Scrollscan URL
    const scrollscanUrl = getScrollscanUrl(network.name);

    console.log(`Contract verified. Check on Scrollscan: ${scrollscanUrl}/address/${bunnyBattle}`);
  } catch (error) {
    console.error("Error during verification:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
Dev
BoardVerifier:  0x61337f6c8dadED8394aD00a6A8376f565F9dB740
MoveVerifier:  0x2A8475b5e8fb557620dC2a780dfD8377D64B61F3
BunnyBattle:  0xc4B774f0eCbA3C8d3B96eC373aACF5d9DB280866
*/
