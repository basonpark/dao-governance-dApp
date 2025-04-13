import { ethers, network } from "hardhat";
import { MyGovernor, GovernanceToken, TimelockController } from "../typechain-types";
import * as fs from "fs";
import { ADDRESS_ZERO, developmentChains, VOTING_PERIOD, VOTING_DELAY, MIN_DELAY } from "../helper-hardhat-config"; // Assuming these are added/available

// --- CONFIGURATION --- //
const DEPLOYMENT_INFO_PATH = "./deployment-info.json";
const PROPOSAL_DESCRIPTION = "Proposal #1: Test proposal to call updateDelay on Timelock";
// Example Target Interaction (calling updateDelay on Timelock itself)
const TARGET_FUNCTION = "updateDelay"; // Function to call
const NEW_DELAY_VALUE = 3601; // New delay value (example)
// --- END CONFIGURATION --- //

async function runProposalFlow() {
    // 1. Load Deployment Info
    if (!fs.existsSync(DEPLOYMENT_INFO_PATH)) {
        console.error(`Error: Deployment info file not found at ${DEPLOYMENT_INFO_PATH}`);
        console.error("Run deployment script first (e.g., npx hardhat run scripts/deploy.ts --network localhost)");
        process.exit(1);
    }
    const deploymentInfo = JSON.parse(fs.readFileSync(DEPLOYMENT_INFO_PATH, "utf8"));
    const governorAddress = deploymentInfo.governorAddress;
    const tokenAddress = deploymentInfo.governanceTokenAddress;
    const timelockAddress = deploymentInfo.timelockAddress;
    const deployerAddress = deploymentInfo.deployerAddress; // Get deployer for voting

    console.log(`Using deployment info from network: ${deploymentInfo.network} (chainId: ${deploymentInfo.chainId})`);
    console.log(`Governor: ${governorAddress}`);
    console.log(`Token: ${tokenAddress}`);
    console.log(`Timelock: ${timelockAddress}`);

    // 2. Get Signers and Contract Instances
    const [deployer] = await ethers.getSigners(); // Assuming deployer runs this script
    if (deployer.address !== deployerAddress) {
        console.warn("Warning: Script runner address differs from deployer address in deployment-info.json");
    }

    const governor: MyGovernor = await ethers.getContractAt("MyGovernor", governorAddress, deployer);
    const token: GovernanceToken = await ethers.getContractAt("GovernanceToken", tokenAddress, deployer);
    const timelock: TimelockController = await ethers.getContractAt("TimelockController", timelockAddress, deployer);

    // 3. Create Proposal
    console.log("\nCreating proposal...");

    // Encode the function call data
    const encodedFunctionCall = timelock.interface.encodeFunctionData(TARGET_FUNCTION, [NEW_DELAY_VALUE]);

    const proposeTx = await governor.propose(
        [timelockAddress],      // targets: Address of the contract to call
        [0],                    // values: ETH value to send (0 for this call)
        [encodedFunctionCall],  // calldatas: Encoded function call
        PROPOSAL_DESCRIPTION    // description
    );

    console.log("Waiting for proposal transaction...");
    const proposeReceipt = await proposeTx.wait(1);

    // Extract proposal ID from the event emitted by the Governor contract
    let proposalId: bigint | undefined;
    if (proposeReceipt?.logs) {
        const relevantLog = proposeReceipt.logs.find(log => log.address === governorAddress);
        if (relevantLog) {
            const parsedLog = governor.interface.parseLog(relevantLog as any); // Cast needed for parseLog
            if (parsedLog?.name === "ProposalCreated") {
                proposalId = parsedLog.args.proposalId;
                console.log(`Proposal created successfully! Proposal ID: ${proposalId}`);
            } else {
                console.error("Could not find ProposalCreated event in transaction logs.");
                process.exit(1);
            }
        } else {
             console.error("Could not find relevant log in transaction receipt.");
             process.exit(1);
        }
    } else {
        console.error("Proposal transaction receipt or logs not found.");
        process.exit(1);
    }

    if (proposalId === undefined) {
        console.error("Failed to extract Proposal ID.");
        process.exit(1);
    }

    // --- Check Proposal State (Pending) ---
    let proposalStateBigInt = await governor.state(proposalId);
    console.log(`Current proposal state: ${ProposalState[Number(proposalStateBigInt)]} (${proposalStateBigInt})`);

    // If on development chain, move blocks forward past voting delay
    if (developmentChains.includes(network.name)) {
        console.log("Moving blocks forward past voting delay...");
        // Add 1 block margin for safety
        await moveBlocks(VOTING_DELAY + 1);
    }

    // --- Check Proposal State (Active) ---
    proposalStateBigInt = await governor.state(proposalId);
    console.log(`Current proposal state: ${ProposalState[Number(proposalStateBigInt)]} (${proposalStateBigInt})`);

    // 4. Vote on Proposal
    console.log("\nCasting vote...");
    // Vote options: 0 = Against, 1 = For, 2 = Abstain
    const voteOption = 1; // Vote FOR
    const reason = "I support this test proposal"; // Optional reason string
    const voteTx = await governor.castVoteWithReason(proposalId, voteOption, reason);
    await voteTx.wait(1);
    console.log(`Vote cast by ${deployer.address} (Option: ${voteOption})`);

    // If on development chain, move blocks forward past voting period
    if (developmentChains.includes(network.name)) {
        console.log("Moving blocks forward past voting period...");
        // Add 1 block margin for safety
        await moveBlocks(VOTING_PERIOD + 1);
    }

    // --- Check Proposal State (Succeeded) ---
    proposalStateBigInt = await governor.state(proposalId);
    console.log(`Current proposal state: ${ProposalState[Number(proposalStateBigInt)]} (${proposalStateBigInt})`);

    // 5. Queue Proposal
    console.log("\nQueueing proposal...");
    // Need to hash the description to queue
    const descriptionHash = ethers.id(PROPOSAL_DESCRIPTION);
    const queueTx = await governor.queue(
        [timelockAddress],
        [0],
        [encodedFunctionCall],
        descriptionHash
    );
    await queueTx.wait(1);
    console.log("Proposal queued successfully.");

    // --- Check Proposal State (Queued) ---
    proposalStateBigInt = await governor.state(proposalId);
    console.log(`Current proposal state: ${ProposalState[Number(proposalStateBigInt)]} (${proposalStateBigInt})`);

    // If on development chain, move time forward past min delay
    if (developmentChains.includes(network.name)) {
        console.log("Moving time forward past timelock delay...");
        // Add 1 second margin for safety
        await moveTime(MIN_DELAY + 1);
        // Need to mine a block after moving time for changes to take effect
        await moveBlocks(1);
    }

    // --- Check Proposal State (Executable - Should be Succeeded or Queued still, execution makes it Executed) ---
    // Note: OpenZeppelin Governor doesn't have an 'Executable' state distinct from Queued before execution attempt.
    proposalStateBigInt = await governor.state(proposalId);
    console.log(`Current proposal state (after delay): ${ProposalState[Number(proposalStateBigInt)]} (${proposalStateBigInt})`);

    // 6. Execute Proposal
    console.log("\nExecuting proposal...");
    const executeTx = await governor.execute(
        [timelockAddress],
        [0],
        [encodedFunctionCall],
        descriptionHash
    );
    await executeTx.wait(1);
    console.log("Proposal executed successfully!");

    // --- Check Proposal State (Executed) ---
    proposalStateBigInt = await governor.state(proposalId);
    console.log(`Final proposal state: ${ProposalState[Number(proposalStateBigInt)]} (${proposalStateBigInt})`);

    // Optional: Verify the action took place (e.g., check the Timelock delay)
    const currentDelay = await timelock.getMinDelay();
    console.log(`Timelock minDelay after execution: ${currentDelay}`);
    if (currentDelay === BigInt(NEW_DELAY_VALUE)) {
        console.log("Verification: Timelock delay updated successfully.");
    } else {
        console.warn("Verification Warning: Timelock delay did not match expected value after execution.");
    }
}

// --- Helper Functions for Local Development --- //

// Mapping for ProposalState enum for better logging
// Note: Ensure this matches the enum in IGovernor.sol
const ProposalState = [
    "Pending",
    "Active",
    "Canceled",
    "Defeated",
    "Succeeded",
    "Queued",
    "Expired",
    "Executed",
];

async function moveBlocks(amount: number) {
    console.log(`Moving ${amount} blocks...`);
    for (let i = 0; i < amount; i++) {
        await network.provider.request({ method: "evm_mine", params: [] });
    }
    console.log(`Moved ${amount} blocks.`);
}

async function moveTime(amount: number) {
    console.log(`Moving time forward by ${amount} seconds...`);
    await network.provider.send("evm_increaseTime", [amount]);
    console.log(`Moved time by ${amount} seconds.`);
}

// --- Run Script --- //
runProposalFlow()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Proposal flow failed:", error);
        process.exit(1);
    }); 