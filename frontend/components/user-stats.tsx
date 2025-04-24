import { Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function UserStats() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Governance Stats</CardTitle>
          <CardDescription>Your voting power and token balance</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Connected Wallet</p>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>
              <p className="text-lg font-medium">0x71C...1F3d</p>
              <p className="text-xs text-muted-foreground">Connected 3 days ago</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Token Balance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-medium">1,250 GOV</p>
                <span className="text-xs text-green-500">+125 (30d)</span>
              </div>
              <p className="text-xs text-muted-foreground">≈ $3,750 USD</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Voting Power</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-medium">1,250 votes</p>
                <span className="text-xs text-muted-foreground">0.05% of total</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: "0.05%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Delegation Status</p>
              <p className="text-lg font-medium">Self-delegated</p>
              <p className="text-xs text-muted-foreground">Since Apr 15, 2023</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Voting History</p>
            <div className="flex items-center justify-between text-xs">
              <span>Participation Rate</span>
              <span className="font-medium">78%</span>
            </div>
            <Progress value={78} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>27 votes cast</span>
              <span>35 total proposals</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 shadow-sm bg-gradient-to-r from-background to-muted/30">
              Delegate Votes
            </Button>
            <Button className="flex-1 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90">
              Claim Rewards
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
