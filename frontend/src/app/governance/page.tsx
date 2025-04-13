"use client"; // This page needs client-side interactivity

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther, encodeFunctionData, Address } from "viem";
import { governorContractConfig, tokenContractConfig } from "@/lib/contracts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// --- Voting Power Component ---
function VotingPowerInfo() {
  const { address: accountAddress, isConnected } = useAccount();

  // Fetch token balance
  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    ...tokenContractConfig,
    functionName: "balanceOf",
    args: [accountAddress!],
    query: {
      enabled: isConnected && !!accountAddress,
    },
  });

  // Fetch voting power (delegated votes)
  const {
    data: votingPowerData,
    isLoading: isLoadingVotes,
    refetch: refetchVotes,
  } = useReadContract({
    ...tokenContractConfig,
    functionName: "getVotes",
    args: [accountAddress!],
    query: {
      enabled: isConnected && !!accountAddress,
    },
  });

  // Delegate votes hook
  const {
    writeContract: delegateVotes,
    data: delegateHash,
    isPending: isDelegating,
  } = useWriteContract();
  const { isLoading: isConfirmingDelegate, isSuccess: isDelegateSuccess } =
    useWaitForTransactionReceipt({
      hash: delegateHash,
    });

  useEffect(() => {
    if (isConfirmingDelegate) {
      toast.loading("Delegating votes...", {
        description: "Waiting for confirmation.",
      });
    }
    if (delegateHash && isDelegateSuccess) {
      toast.success("Delegation Successful!", {
        description: "Your voting power is now active.",
        id: delegateHash.toString(),
      });
      refetchVotes();
      refetchBalance();
    }
  }, [
    isConfirmingDelegate,
    isDelegateSuccess,
    delegateHash,
    refetchVotes,
    refetchBalance,
  ]);

  const handleDelegate = () => {
    if (!accountAddress) return;
    toast.info("Sending delegate transaction...");
    delegateVotes(
      {
        ...tokenContractConfig,
        functionName: "delegate",
        args: [accountAddress],
      },
      {
        onSuccess: (hash) =>
          toast.loading("Transaction sent", {
            description: `Hash: ${hash}`,
            id: hash.toString(),
          }),
        onError: (error) =>
          toast.error("Delegation Failed", { description: error.message }),
      }
    );
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Connect your wallet to view voting power.
          </p>
        </CardContent>
      </Card>
    );
  }

  const balance =
    typeof balanceData === "bigint" ? formatEther(balanceData) : "0";
  const votes =
    typeof votingPowerData === "bigint" ? formatEther(votingPowerData) : "0";
  const needsDelegation =
    typeof balanceData === "bigint" &&
    typeof votingPowerData === "bigint" &&
    votingPowerData === 0n &&
    balanceData > 0n;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Voting Influence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          Token Balance:{" "}
          {isLoadingBalance
            ? "Loading..."
            : `${balance} ${tokenContractConfig.address.substring(0, 6)}...`}
        </p>
        <p>Voting Power: {isLoadingVotes ? "Loading..." : `${votes}`}</p>
        {needsDelegation && (
          <p className="text-sm text-amber-500">
            You have tokens but haven't delegated voting power to yourself yet.
          </p>
        )}
      </CardContent>
      {needsDelegation && (
        <CardFooter>
          <Button
            onClick={handleDelegate}
            disabled={isDelegating || isConfirmingDelegate}
          >
            {isDelegating || isConfirmingDelegate
              ? "Delegating..."
              : "Delegate Votes to Self"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// --- Proposal List Component (Simplified) ---
// TODO: Add proper event fetching and state mapping
function ProposalList() {
  // For simplicity, we are not fetching proposal details here yet.
  // In a real app, you'd fetch ProposalCreated events or call governor functions.
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposals</CardTitle>
        <CardDescription>View past and present proposals.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Proposal list feature coming soon.
        </p>
        {/*
                    TODO: Fetch and display proposals.
                    - Use useReadContract to get proposal count or events.
                    - Map through proposals, displaying ID, description, status.
                    - Add voting buttons for active proposals.
                 */}
      </CardContent>
    </Card>
  );
}

// --- Create Proposal Form Component ---
function CreateProposalForm() {
  const [description, setDescription] = useState("");
  const [targetAddress, setTargetAddress] = useState<Address>("0x"); // Example: Start empty or with Timelock addr
  const [targetValue, setTargetValue] = useState("0");
  const [calldata, setCalldata] = useState<Address>("0x"); // Example: Start empty hex

  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Submitting Proposal...", {
        description: "Waiting for confirmation.",
      });
    }
    if (isSuccess) {
      toast.success("Proposal Submitted!", {
        description: "Your proposal is now pending.",
        id: hash?.toString(),
      });
      // Reset form
      setDescription("");
      setTargetAddress("0x");
      setTargetValue("0");
      setCalldata("0x");
    }
  }, [isConfirming, isSuccess, hash]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !targetAddress || !calldata) {
      toast.error("Missing Fields", {
        description: "Please fill in all proposal details.",
      });
      return;
    }

    // Basic validation (more robust checks needed in production)
    if (!targetAddress.startsWith("0x") || targetAddress.length !== 42) {
      toast.error("Invalid Target Address", {
        description: "Please enter a valid Ethereum address (0x...).",
      });
      return;
    }
    if (!calldata.startsWith("0x")) {
      toast.error("Invalid Calldata", {
        description: "Calldata must be a valid hex string (starting with 0x).",
      });
      return;
    }

    try {
      const valueWei = parseEther(targetValue || "0");
      toast.info("Preparing proposal transaction...");

      writeContract(
        {
          ...governorContractConfig,
          functionName: "propose",
          args: [
            [targetAddress],
            [valueWei],
            [calldata as Address], // Cast might be needed depending on ABI strictness
            description,
          ],
        },
        {
          onSuccess: (hash) =>
            toast.loading("Transaction sent", {
              description: `Hash: ${hash}`,
              id: hash.toString(),
            }),
          onError: (error) =>
            toast.error("Proposal Failed", { description: error.message }),
        }
      );
    } catch (error: any) {
      console.error("Proposal creation error:", error);
      toast.error("Error Preparing Proposal", {
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Proposal</CardTitle>
        <CardDescription>
          Outline the action you want the DAO to take.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your proposal clearly... (e.g., Fund project X with 100 MGT)"
              required
            />
          </div>
          <div>
            <label
              htmlFor="targetAddress"
              className="block text-sm font-medium mb-1"
            >
              Target Contract Address
            </label>
            <Input
              id="targetAddress"
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value as Address)}
              placeholder="0x... (Address to interact with)"
              required
            />
          </div>
          <div>
            <label
              htmlFor="targetValue"
              className="block text-sm font-medium mb-1"
            >
              Value (ETH to send)
            </label>
            <Input
              id="targetValue"
              type="number"
              step="any"
              min="0" // Ensure non-negative
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label
              htmlFor="calldata"
              className="block text-sm font-medium mb-1"
            >
              Calldata (Hex)
            </label>
            <Input
              id="calldata"
              type="text"
              value={calldata}
              onChange={(e) => setCalldata(e.target.value as Address)}
              placeholder="0x... (e.g., function signature and encoded args)"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Encode function calls using tools like Etherscan or Viem's
              encodeFunctionData. Example:
              0xa9059cbb000000000000000000000000RecipientAddress0000000000000000000000000000000000000000000000000de0b6b3a7640000
              (transfer 1 token)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending || isConfirming}>
            {isPending || isConfirming ? "Submitting..." : "Submit Proposal"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// --- Main Governance Page ---
export default function GovernancePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Governance Dashboard</h1>
      <VotingPowerInfo />
      <Separator />
      <ProposalList />
      <Separator />
      <CreateProposalForm />
    </div>
  );
}
