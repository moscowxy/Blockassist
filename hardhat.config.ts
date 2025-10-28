import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const { BASE_MAINNET_RPC_URL, BASE_SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500
      }
    }
  },
  networks: {
    hardhat: {},
    base: {
      url: BASE_MAINNET_RPC_URL || "https://mainnet.base.org",
      accounts,
      chainId: 8453
    },
    "base-sepolia": {
      url: BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts,
      chainId: 84532
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || ""
  }
};

export default config;
