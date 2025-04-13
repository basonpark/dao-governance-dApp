import React from "react";

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">About NexusVoice</h1>
      <div className="space-y-4 text-muted-foreground">
        <p>
          NexusVoice is a decentralized governance platform empowering token
          holders to propose, discuss, and vote on the future direction of the
          protocol.
        </p>
        <p>
          Built using modern web3 technologies including Solidity, Hardhat,
          OpenZeppelin, Next.js, Wagmi, RainbowKit, and Tailwind CSS /
          shadcn/ui.
        </p>
        <p>(This page is currently a placeholder).</p>
        {/* TODO: Add more detailed information about the DAO/project */}
      </div>
    </div>
  );
}
