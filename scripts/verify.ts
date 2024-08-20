import { Wallet, ZeroAddress } from "ethers";

const { ethers, run } = require("hardhat");

async function main() {
  await verifyContract("0xcee8c1e903d1d40952e86d9ed5779b896c5f52d2",
    "0x5f4438cf0B4C6c7f40CD5dF95236d973F885Dd78",
    "0x9B48830B98De9AaBc3bb240DBf41F746896b8fFC");
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