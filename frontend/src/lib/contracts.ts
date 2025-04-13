import MyGovernorABI from '@/contracts/generated/MyGovernor.json';
import GovernanceTokenABI from '@/contracts/generated/GovernanceToken.json';
import deploymentInfo from '@/contracts/generated/deployment-info.json';

import { Address } from 'viem';

// Type assertion for ABIs if necessary, or use as any
// const governorAbi = MyGovernorABI.abi as any;
// const tokenAbi = GovernanceTokenABI.abi as any;

// Directly use the ABI arrays
export const governorAbi = MyGovernorABI.abi;
export const tokenAbi = GovernanceTokenABI.abi;

// Ensure addresses are typed correctly for Viem/Wagmi
export const governorAddress = deploymentInfo.governorAddress as Address;
export const tokenAddress = deploymentInfo.governanceTokenAddress as Address;

// Optionally export other deployment info if needed
export const chainId = deploymentInfo.chainId;

// Define contract configurations for Wagmi
export const governorContractConfig = {
    address: governorAddress,
    abi: governorAbi,
} as const; // Use 'as const' for better type inference with Wagmi hooks

export const tokenContractConfig = {
    address: tokenAddress,
    abi: tokenAbi,
} as const; 