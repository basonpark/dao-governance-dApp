import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      // Configuration for the default hardhat network (local in-memory)
    },
    localhost: {
      // Configuration for connecting to a separate hardhat node (npx hardhat node)
      url: "http://127.0.0.1:8545", // Default hardhat node RPC URL
      chainId: 31337, // Default hardhat node chain ID
    },
    // Add other networks like sepolia, mainnet, etc. here
    /*
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    */
  },
  // Optional: Specify paths if they differ from default
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // Optional: Typechain configuration
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6", // Ensure this matches your ethers version
  },
  // Optional: Gas reporter configuration
  /*
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    // gasPriceApi: "...",
    // token: "ETH",
  },
  */
  // Optional: Etherscan configuration for verification
  /*
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  */
};

export default config;
