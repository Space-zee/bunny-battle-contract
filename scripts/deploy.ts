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

//______                          ______       _   _   _
//| ___ \                         | ___ \     | | | | | |
//| |_/ /_   _ _ __  _ __  _   _  | |_/ / __ _| |_| |_| | ___
//| ___ \ | | | '_ \| '_ \| | | | | ___ \/ _` | __| __| |/ _ \
//| |_/ / |_| | | | | | | | |_| | | |_/ / (_| | |_| |_| |  __/
//\____/ \__,_|_| |_|_| |_|\__, | \____/ \__,_|\__|\__|_|\___|
//                          __/ |
//                          |___/
//_ _ _ ____ _  _ ___    ___ ____     _ ____ _ _  _    ___ _  _ ____    ___ ____ ____ _  _ __.
//| | | |__| |\ |  |      |  |  |     | |  | | |\ |     |  |__| |___     |  |___ |__| |\/|  _]
//|_|_| |  | | \|  |      |  |__|    _| |__| | | \|     |  |  | |___     |  |___ |  | |  |  .
//
//
//Tell us what you’d like to improve → Telegram: @AkstonBunny
