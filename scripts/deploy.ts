import { ethers } from "hardhat";

async function main() {
  const priceFeed = process.env.PRICE_FEED_ADDRESS ?? "0x0000000000000000000000000000000000000000";
  const coordinator = process.env.VRF_COORDINATOR ?? "0x0000000000000000000000000000000000000000";
  const subscriptionId = Number(process.env.VRF_SUBSCRIPTION_ID ?? 0);
  const keyHash = process.env.VRF_KEY_HASH ?? ethers.ZeroHash;
  const callbackGasLimit = Number(process.env.VRF_CALLBACK_GAS_LIMIT ?? 500000);
  const requestConfirmations = Number(process.env.VRF_REQUEST_CONFIRMATIONS ?? 3);
  const numWords = Number(process.env.VRF_NUM_WORDS ?? 1);

  if (priceFeed === "0x0000000000000000000000000000000000000000") {
    throw new Error("PRICE_FEED_ADDRESS env var is required");
  }
  if (coordinator === "0x0000000000000000000000000000000000000000") {
    throw new Error("VRF_COORDINATOR env var is required");
  }
  if (!process.env.VRF_KEY_HASH) {
    throw new Error("VRF_KEY_HASH env var is required");
  }

  const Blackjack = await ethers.getContractFactory("BaseBlackjack");
  const blackjack = await Blackjack.deploy(
    priceFeed,
    coordinator,
    subscriptionId,
    keyHash,
    callbackGasLimit,
    requestConfirmations,
    numWords
  );

  await blackjack.waitForDeployment();
  console.log(`BaseBlackjack deployed to ${await blackjack.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
