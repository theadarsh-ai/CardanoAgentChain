import DecisionLog from "@/components/decision-log";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@shared/schema";

export default function Logs() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 5000,
  });

  const formatTimestamp = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

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
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <Card key={tx.id} className="p-4" data-testid={`transaction-${tx.id}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 bg-[#10FF00] blur-md opacity-40 rounded-full" />
                          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#10FF00] to-[#00FF88]">
                            <Zap className="h-5 w-5 text-black" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium truncate">{tx.fromAgentName}</span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="font-medium truncate">{tx.toAgentName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="font-mono">{formatTimestamp(tx.createdAt)}</span>
                            <span>|</span>
                            <span className="font-mono truncate">{tx.txHash}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="font-mono font-semibold">${tx.amount}</p>
                          <p className="text-xs text-muted-foreground">Hydra L2</p>
                        </div>
                        <Badge variant={tx.status === "confirmed" ? "default" : "secondary"}>
                          {tx.status === "confirmed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No transactions yet. Start chatting with agents to generate transactions.
              </p>
            )}
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
