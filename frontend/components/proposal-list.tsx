"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { Clock, FileText, Filter, ThumbsDown, ThumbsUp, X, Check, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProposalDialog } from "@/components/proposal-dialog"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

// Mock data for proposals
const proposals = [
  {
    id: "1",
    title: "Treasury diversification: Allocate 5% to stablecoins",
    description:
      "This proposal aims to diversify our treasury by allocating 5% of our assets to stablecoins to reduce volatility and provide a stable reserve for operational expenses during market downturns.",
    status: "active",
    votesFor: 650000,
    votesAgainst: 250000,
    votesAbstain: 100000,
    totalVotes: 1000000,
    endTime: "2023-05-15T14:00:00Z",
    createdBy: "0x8Fc...3Fa2",
    createdAt: "2023-05-08T14:00:00Z",
    category: "Treasury",
    quorum: 4,
    currentQuorum: 2.5,
  },
  {
    id: "2",
    title: "Increase developer grants by 20%",
    description:
      "Increase the budget for developer grants by 20% to attract more builders to our ecosystem and accelerate protocol development. This will be funded from the existing treasury allocation.",
    status: "pending",
    votesFor: 0,
    votesAgainst: 0,
    votesAbstain: 0,
    totalVotes: 0,
    endTime: "2023-05-20T14:00:00Z",
    createdBy: "0x7Bc...9Ad1",
    createdAt: "2023-05-10T10:00:00Z",
    category: "Funding",
    quorum: 4,
    currentQuorum: 0,
  },
  {
    id: "3",
    title: "Reduce voting period to 2 days",
    description:
      "Reduce the voting period from 3 days to 2 days to speed up governance decisions and increase the responsiveness of the DAO to market conditions and opportunities.",
    status: "executed",
    votesFor: 800000,
    votesAgainst: 150000,
    votesAbstain: 50000,
    totalVotes: 1000000,
    endTime: "2023-05-01T14:00:00Z",
    createdBy: "0x9Ac...2Fb3",
    createdAt: "2023-04-28T09:00:00Z",
    category: "Governance",
    quorum: 4,
    currentQuorum: 4.2,
  },
  {
    id: "4",
    title: "Add liquidity to Uniswap V3",
    description:
      "Add $500,000 worth of liquidity to Uniswap V3 to improve token trading depth and reduce slippage for traders. This will be implemented using a concentrated liquidity strategy.",
    status: "defeated",
    votesFor: 400000,
    votesAgainst: 550000,
    votesAbstain: 50000,
    totalVotes: 1000000,
    endTime: "2023-04-25T14:00:00Z",
    createdBy: "0x6Dc...5Ea4",
    createdAt: "2023-04-22T11:00:00Z",
    category: "Treasury",
    quorum: 4,
    currentQuorum: 4.1,
  },
  {
    id: "5",
    title: "Implement protocol fee of 0.05%",
    description:
      "Implement a protocol fee of 0.05% on all transactions to generate sustainable revenue for the DAO treasury and fund ongoing development and marketing initiatives.",
    status: "active",
    votesFor: 320000,
    votesAgainst: 180000,
    votesAbstain: 50000,
    totalVotes: 550000,
    endTime: "2023-05-18T14:00:00Z",
    createdBy: "0x5Eb...7Cd9",
    createdAt: "2023-05-11T08:30:00Z",
    category: "Protocol",
    quorum: 4,
    currentQuorum: 1.8,
  },
]

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "active":
      return "status-active"
    case "pending":
      return "status-pending"
    case "executed":
      return "status-executed"
    case "defeated":
      return "status-defeated"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
      return <Clock className="h-3 w-3" />
    case "pending":
      return <Clock className="h-3 w-3" />
    case "executed":
      return <Check className="h-3 w-3" />
    case "defeated":
      return <X className="h-3 w-3" />
    default:
      return null
  }
}

function formatTimeRemaining(endTimeStr: string) {
  const endTime = new Date(endTimeStr)
  const now = new Date()

  if (now > endTime) return "Ended"

  const diffMs = endTime.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h remaining`
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m remaining`
  } else {
    return `${diffMinutes}m remaining`
  }
}

export function ProposalList({ showFilters = true }: { showFilters?: boolean }) {
  const [selectedProposal, setSelectedProposal] = useState<(typeof proposals)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredProposals = proposals.filter((proposal) => {
    if (activeTab !== "all" && proposal.status !== activeTab) return false
    if (searchQuery && !proposal.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <Card className="enhanced-card">
      <CardHeader className="enhanced-card-header">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Proposals</CardTitle>
          <CardDescription>View and vote on governance proposals</CardDescription>
        </div>
        {showFilters && (
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-[180px] lg:w-[280px]">
              <Input
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/50"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="subtle" size="sm" className="h-9 gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem>All Categories</DropdownMenuItem>
                <DropdownMenuItem>Treasury</DropdownMenuItem>
                <DropdownMenuItem>Governance</DropdownMenuItem>
                <DropdownMenuItem>Protocol</DropdownMenuItem>
                <DropdownMenuItem>Funding</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full justify-start bg-muted/50 p-1">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1">
              Active
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">
              Pending
            </TabsTrigger>
            <TabsTrigger value="executed" className="flex-1">
              Executed
            </TabsTrigger>
            <TabsTrigger value="defeated" className="flex-1">
              Defeated
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredProposals.length > 0 ? (
                    filteredProposals.map((proposal, index) => (
                      <motion.div
                        key={proposal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ProposalCard proposal={proposal} onClick={() => setSelectedProposal(proposal)} />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium">No proposals found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery
                          ? "Try adjusting your search query"
                          : "There are no proposals in this category yet"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </CardContent>

      {selectedProposal && (
        <ProposalDialog
          proposal={selectedProposal}
          open={!!selectedProposal}
          onOpenChange={(open) => !open && setSelectedProposal(null)}
        />
      )}
    </Card>
  )
}

function ProposalCard({
  proposal,
  onClick,
}: {
  proposal: (typeof proposals)[0]
  onClick: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="rounded-lg border border-muted-foreground/10 bg-gradient-to-br from-card/80 to-card/50 p-5 hover:bg-muted/30 transition-colors cursor-pointer shadow-soft hover:shadow-card"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("gap-1", getStatusBadgeClass(proposal.status))}>
              {getStatusIcon(proposal.status)}
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="bg-muted/50">
              {proposal.category}
            </Badge>
            {proposal.status === "active" && (
              <span className="text-xs text-muted-foreground">{formatTimeRemaining(proposal.endTime)}</span>
            )}
          </div>
          <h3 className="font-heading font-medium text-base">{proposal.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Created by {proposal.createdBy}</span>
            <span>ID: {proposal.id}</span>
            {proposal.status !== "pending" && (
              <span>
                Quorum: {proposal.currentQuorum}% / {proposal.quorum}%
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-muted/50">
          <FileText className="h-4 w-4" />
        </Button>
      </div>

      {(proposal.status === "active" || proposal.status === "executed" || proposal.status === "defeated") && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3 vote-for" />
              <span className="vote-for">{Math.round((proposal.votesFor / proposal.totalVotes) * 100)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-3 w-3 vote-against" />
              <span className="vote-against">{Math.round((proposal.votesAgainst / proposal.totalVotes) * 100)}%</span>
            </div>
            <span className="vote-abstain">
              Abstain: {Math.round((proposal.votesAbstain / proposal.totalVotes) * 100)}%
            </span>
          </div>
          <div className="vote-progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="vote-progress-for h-full"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(proposal.votesAgainst / proposal.totalVotes) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="vote-progress-against h-full"
              style={{ marginLeft: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(proposal.votesAbstain / proposal.totalVotes) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="vote-progress-abstain h-full"
              style={{ marginLeft: `${((proposal.votesFor + proposal.votesAgainst) / proposal.totalVotes) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{proposal.votesFor.toLocaleString()} votes</span>
            <span>{proposal.votesAgainst.toLocaleString()} votes</span>
            <span>{proposal.votesAbstain.toLocaleString()} votes</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
