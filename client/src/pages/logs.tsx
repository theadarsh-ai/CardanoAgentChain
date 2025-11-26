import DecisionLog from "@/components/decision-log";
import TransactionItem from "@/components/transaction-item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const recentTransactions = [
  {
    from: "SocialGenie",
    to: "StyleAdvisor",
    amount: "$0.004",
    timestamp: "10:45:32",
    status: "confirmed" as const,
    txId: "0xa1b2c3...d4e5f6",
  },
  {
    from: "ComplianceGuard",
    to: "InsightBot",
    amount: "$0.004",
    timestamp: "10:44:18",
    status: "confirmed" as const,
    txId: "0xf6e5d4...c3b2a1",
  },
  {
    from: "YieldMaximizer",
    to: "TradeMind",
    amount: "$0.004",
    timestamp: "10:42:50",
    status: "pending" as const,
    txId: "0x7h8i9j...k0l1m2",
  },
  {
    from: "ShopAssist",
    to: "StyleAdvisor",
    amount: "$0.004",
    timestamp: "10:40:15",
    status: "confirmed" as const,
    txId: "0x3n4o5p...q6r7s8",
  },
];

export default function Logs() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Audit Trail</h1>
        <p className="text-muted-foreground">
          Complete on-chain logging of all agent decisions and micropayments
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <DecisionLog />

        <Card data-testid="card-transaction-history">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Hydra Layer 2 micropayments between agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <TransactionItem key={tx.txId} {...tx} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-transparency-features">
        <CardHeader>
          <CardTitle>Transparency Features</CardTitle>
          <CardDescription>How AgentHub ensures complete visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Verified DIDs</h3>
              <p className="text-sm text-muted-foreground">
                Masumi DIDs ensure trusted agent identities with cryptographic verification
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Micropayments</h3>
              <p className="text-sm text-muted-foreground">
                Hydra enables ~$0.004 per transaction with instant settlement
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Audit Trails</h3>
              <p className="text-sm text-muted-foreground">
                Every decision recorded on Cardano for complete transparency
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
