import { Wallet, ZeroAddress } from "ethers";

const { ethers, run } = require("hardhat");

async function main() {
  await verifyContract("0xd05B233d64eC4B4DB664a335ECa7389dc2859772",
    "0x658284aE600752926d30de58b771690F1df5F8B9",
    "0xF51FC88a3d6E7780fC0241682c9dF203322b7ff3");
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