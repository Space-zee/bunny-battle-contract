import { Wallet, ZeroAddress } from "ethers";

const { ethers, run } = require("hardhat");

async function main() {
  await verifyContract("0x5f08612092e16D67bC17bF7733D512e244007b7e",
    "0x8EbCE31Fac9714a2Fa2Ce4845D330c95d91DD81A",
    "0xb73ef72D228F808990CD64A623F2349960d437A1");
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