import { ethers, network } from "hardhat";
import { TimelockController, TimelockController__factory, GovernanceToken, GovernanceToken__factory, MyGovernor, MyGovernor__factory } from "../typechain-types";
import { ADDRESS_ZERO } from "../helper-hardhat-config";
import * as fs from "fs"; // Import Node.js file system module

// Path to store deployment addresses
const DEPLOYMENT_INFO_PATH = "./deployment-info.json";

// --- CONFIGURATION --- //
const TOKEN_NAME = "MyGovernanceToken";
const TOKEN_SYMBOL = "MGT";
const INITIAL_SUPPLY = ethers.parseUnits("1000000", 18); // 1 Million tokens with 18 decimals

// Timelock configuration
const MIN_DELAY = 3600; // 1 hour in seconds - Required delay before execution

// Governor configuration (values in blocks - adjust based on chain's block time)
// Note: These are examples, adjust for your target network
const VOTING_DELAY = 1;       // 1 block delay before voting starts
const VOTING_PERIOD = 10;  // Shortened for local testing (~2 mins)
const PROPOSAL_THRESHOLD = 0; // No minimum token balance required to propose
const QUORUM_PERCENTAGE = 4;  // 4% of total supply needed to reach quorum
// --- END CONFIGURATION --- //

async function deployAndSetupGovernance() {
    console.log("Deploying contracts...");
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);

    // 1. Deploy GovernanceToken
    const tokenFactory: GovernanceToken__factory = await ethers.getContractFactory("GovernanceToken");
    const governanceToken: GovernanceToken = await tokenFactory.deploy(
        TOKEN_NAME,
        TOKEN_SYMBOL,
        INITIAL_SUPPLY,
        deployer.address, // Initial supply holder (deployer)
        deployer.address  // Initial owner (deployer)
    );
    await governanceToken.waitForDeployment();
    const tokenAddress = await governanceToken.getAddress();
    console.log(`GovernanceToken deployed to: ${tokenAddress}`);

    // Delegate voting power to deployer for initial setup/testing
    console.log(`Delegating initial voting power from ${deployer.address} to ${deployer.address}`);
    const delegateTx = await governanceToken.delegate(deployer.address);
    await delegateTx.wait(1);
    console.log(`Delegated. Current votes: ${await governanceToken.getVotes(deployer.address)}`);

    // 2. Deploy TimelockController
    // Roles are initially granted to deployer, then configured below
    const timelockFactory: TimelockController__factory = await ethers.getContractFactory("TimelockController");
    const timelock: TimelockController = await timelockFactory.deploy(
        MIN_DELAY,
        [], // Proposers - will be set to Governor contract later
        [], // Executors - will be set to ADDRESS_ZERO (anyone) later
        deployer.address // Admin - initially deployer, will be renounced
    );
    await timelock.waitForDeployment();
    const timelockAddress = await timelock.getAddress();
    console.log(`TimelockController deployed to: ${timelockAddress}`);

    // 3. Deploy Governor Contract
    const governorFactory: MyGovernor__factory = await ethers.getContractFactory("MyGovernor");
    const governor: MyGovernor = await governorFactory.deploy(
        tokenAddress,       // IVotes token instance
        timelockAddress,    // TimelockController instance
        VOTING_DELAY,
        VOTING_PERIOD,
        PROPOSAL_THRESHOLD,
        QUORUM_PERCENTAGE
    );
    await governor.waitForDeployment();
    const governorAddress = await governor.getAddress();
    console.log(`MyGovernor deployed to: ${governorAddress}`);

    // --- 4. Configure Timelock Roles --- //
    console.log("Configuring Timelock roles...");

    // Fetch roles using ethers.id() for robustness
    const proposerRole = ethers.id("PROPOSER_ROLE");
    const executorRole = ethers.id("EXECUTOR_ROLE");
    const adminRole = ethers.id("TIMELOCK_ADMIN_ROLE");
    const cancellerRole = ethers.id("CANCELLER_ROLE");

    // Grant PROPOSER_ROLE to Governor
    console.log(`Granting PROPOSER_ROLE to Governor (${governorAddress})`);
    const proposerTx = await timelock.grantRole(proposerRole, governorAddress);
    await proposerTx.wait(1);

    // Grant EXECUTOR_ROLE to ADDRESS_ZERO (anyone can execute)
    console.log(`Granting EXECUTOR_ROLE to ADDRESS_ZERO (${ADDRESS_ZERO})`);
    const executorTx = await timelock.grantRole(executorRole, ADDRESS_ZERO);
    await executorTx.wait(1);

    // Grant CANCELLER_ROLE to Governor (allows Governor to cancel proposals)
    // Alternatively, grant to deployer/admin initially if needed
    console.log(`Granting CANCELLER_ROLE to Governor (${governorAddress})`);
    const cancellerTx = await timelock.grantRole(cancellerRole, governorAddress);
    await cancellerTx.wait(1);

    // Revoke deployer's admin role on Timelock
    console.log(`Revoking TIMELOCK_ADMIN_ROLE from deployer (${deployer.address})`);
    const revokeTx = await timelock.revokeRole(adminRole, deployer.address);
    await revokeTx.wait(1);

    console.log("Timelock roles configured.");

    // --- 5. Save Deployment Info --- //
    console.log(`Saving deployment info to ${DEPLOYMENT_INFO_PATH}...`);
    const deploymentInfo = {
        network: network.name,
        chainId: network.config.chainId,
        governanceTokenAddress: tokenAddress,
        timelockAddress: timelockAddress,
        governorAddress: governorAddress,
        deployerAddress: deployer.address
    };
    fs.writeFileSync(DEPLOYMENT_INFO_PATH, JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved.");

    console.log("Deployment and setup complete!");

    // Optional: Verify roles (read-only calls)
    const hasProposerRole = await timelock.hasRole(proposerRole, governorAddress);
    const hasExecutorRole = await timelock.hasRole(executorRole, ADDRESS_ZERO);
    const deployerIsAdmin = await timelock.hasRole(adminRole, deployer.address);
    console.log(`Governor has PROPOSER_ROLE: ${hasProposerRole}`);
    console.log(`ADDRESS_ZERO has EXECUTOR_ROLE: ${hasExecutorRole}`);
    console.log(`Deployer has TIMELOCK_ADMIN_ROLE: ${deployerIsAdmin} (Should be false after revoke)`);

}

deployAndSetupGovernance()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 