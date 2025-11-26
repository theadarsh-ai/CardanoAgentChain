import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, CheckCircle2, Activity } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";

const DEMO_QUERIES = [
  { agent: "SocialGenie", query: "Create a viral social media post about AI agents" },
  { agent: "YieldMaximizer", query: "What are the best DeFi protocols for yield farming?" },
  { agent: "ComplianceGuard", query: "Explain AML and KYC verification processes" },
  { agent: "ShopAssist", query: "I want to return a product I ordered last week" },
];

export default function AgentDemo() {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [demoResponse, setDemoResponse] = useState<string>("");

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 3000,
  });

  const demoMutation = useMutation({
    mutationFn: async ({ agent, query }: { agent: string; query: string }) => {
      const convResponse = await apiRequest("POST", "/api/conversations", {
        title: `Agent Demo - ${agent}`,
      });
      const conversation = await convResponse.json();

      const response = await apiRequest("POST", "/api/chat", {
        conversationId: conversation.id,
        message: query,
        agentName: agent,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setDemoResponse(data.agentMessage.content);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
  });

  const runDemo = (agent: string, query: string) => {
    setSelectedDemo(agent);
    setDemoResponse("");
    demoMutation.mutate({ agent, query });
  };

  const recentTransactions = (transactions || []).slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary" data-testid="card-agent-demo">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Live Agent Demo</CardTitle>
              <CardDescription>Test agents in real-time and see them in action</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Query Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Try these agent queries:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEMO_QUERIES.map((demo, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="justify-start h-auto p-3 text-left hover-elevate"
                  onClick={() => runDemo(demo.agent, demo.query)}
                  disabled={demoMutation.isPending}
                  data-testid={`button-demo-${demo.agent.toLowerCase()}`}
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">{demo.agent}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{demo.query}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Demo Response */}
          {selectedDemo && (
            <div className="space-y-2" data-testid="demo-response-box">
              <div className="flex items-center gap-2">
                <Badge variant="default">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {selectedDemo}
                </Badge>
                {!demoMutation.isPending && demoResponse && <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />}
              </div>
              {demoMutation.isPending && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground animate-pulse">Processing request via LangGraph agent...</p>
                </div>
              )}
              {demoResponse && (
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="text-sm whitespace-pre-wrap line-clamp-6">{demoResponse}</p>
                </div>
              )}
              {demoMutation.isError && (
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm text-destructive">Error: Agent encountered an issue. Please try again.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Transaction Feed */}
      <Card data-testid="card-live-transactions">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Live Transactions</CardTitle>
              <CardDescription>Real-time Hydra Layer 2 micropayments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm"
                  data-testid={`tx-item-${tx.id}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-mono text-xs bg-background px-2 py-1 rounded truncate">
                      {(tx.txHash || tx.tx_hash || 'N/A').substring(0, 12)}...
                    </span>
                    <span className="truncate text-muted-foreground text-xs">
                      {(tx.fromAgentName || tx.from_agent_name || 'User')} → {(tx.toAgentName || tx.to_agent_name || 'Agent')}
                    </span>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    ${tx.amount}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              Run a demo to generate transactions
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
