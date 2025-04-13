export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

// --- Governance Configuration --- //
// NOTE: Values are examples, adjust for your network and needs

// Timelock
export const MIN_DELAY = 3600; // 1 hour (in seconds)

// Governor
// Values in blocks (adjust based on chain's block time)
export const VOTING_DELAY = 1;       // 1 block delay before voting starts
export const VOTING_PERIOD = 10;     // 10 blocks voting period (shortened for local testing)
export const PROPOSAL_THRESHOLD = 0; // No minimum token balance required to propose
export const QUORUM_PERCENTAGE = 4;  // 4% of total supply needed to reach quorum
// --- End Governance Configuration --- //

// Add other network-specific or general configuration constants here if needed
// e.g., network specific contract addresses, block confirmations, etc.

export interface networkConfigItem {
    blockConfirmations?: number;
    // Add other potential config items
}

export interface networkConfigInfo {
    [key: number]: networkConfigItem;
}

// Example structure if you were to add network configs:
/*
export const networkConfig: networkConfigInfo = {
    31337: { // hardhat/localhost
        blockConfirmations: 1,
    },
    11155111: { // sepolia
        blockConfirmations: 6,
    },
    // Add other networks
}
*/

export const developmentChains = ["hardhat", "localhost"]; 