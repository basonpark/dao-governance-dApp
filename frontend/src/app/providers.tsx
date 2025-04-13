"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
  darkTheme, // Optional: Or lightTheme
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { hardhat } from "wagmi/chains"; // Import hardhat chain
// Import other chains as needed, e.g.:
// import { mainnet, sepolia, polygon, optimism, arbitrum, base } from 'wagmi/chains';

// --- RainbowKit/Wagmi Configuration --- //

// Get project ID from WalletConnect Cloud (https://cloud.walletconnect.com/)
// It's recommended to store this in an environment variable
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  // In a real app, you might want to handle this more gracefully
  // For example, show a message or disable wallet connection.
  // For now, we throw an error during development if it's missing.
  throw new Error(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env.local. Please get a Project ID from WalletConnect Cloud."
  );
}

// Configure chains
// Start with Hardhat for local development
const chainsToUse = [hardhat] as const; // Use 'as const' for type safety
// Example for adding more chains:
// const chainsToUse = [hardhat, sepolia, mainnet] as const;

// Get default wallets and add others if desired
const { wallets } = getDefaultWallets();

// Create Wagmi config
const config = getDefaultConfig({
  appName: "DAO Governance DApp", // Your app name
  projectId: projectId, // WalletConnect project ID
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: chainsToUse,
  ssr: true, // Important for Next.js App Router
});

// --- Query Client --- //
const queryClient = new QueryClient();

// --- Providers Component --- //

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            // Customize theme if needed
            accentColor: "#7b3fe4",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
