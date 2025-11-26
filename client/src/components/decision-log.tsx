import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  txHash: string;
  status: "confirmed" | "pending";
}

const mockLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "2025-11-26 10:45:32",
    agent: "SocialGenie",
    action: "Hired StyleAdvisor for product content generation",
    txHash: "0xa1b2c3...d4e5f6",
    status: "confirmed",
  },
  {
    id: "2",
    timestamp: "2025-11-26 10:44:18",
    agent: "ComplianceGuard",
    action: "Executed AML check via Hydra micropayment",
    txHash: "0xf6e5d4...c3b2a1",
    status: "confirmed",
  },
  {
    id: "3",
    timestamp: "2025-11-26 10:42:50",
    agent: "YieldMaximizer",
    action: "Optimized portfolio allocation",
    txHash: "0x7h8i9j...k0l1m2",
    status: "pending",
  },
];

export default function DecisionLog() {
  return (
    <Card data-testid="card-decision-log">
      <CardHeader>
        <CardTitle>Decision Logging</CardTitle>
        <CardDescription>On-chain audit trail of all agent decisions and collaborations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockLogs.map((log, index) => (
            <div
              key={log.id}
              className="flex gap-4 pb-4 border-b last:border-b-0"
              data-testid={`log-entry-${log.id}`}
            >
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${log.status === "confirmed" ? "bg-green-500" : "bg-blue-500"} mt-1`} />
                {index < mockLogs.length - 1 && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-full bg-border" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{log.agent}</p>
                    <p className="text-sm text-muted-foreground">{log.action}</p>
                  </div>
                  <Badge
                    variant={log.status === "confirmed" ? "default" : "secondary"}
                    className="shrink-0"
                    data-testid={`badge-status-${log.id}`}
                  >
                    {log.status === "confirmed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {log.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{log.timestamp}</span>
                  <span>•</span>
                  <span className="font-mono">{log.txHash}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-primary"
                    data-testid={`button-view-tx-${log.id}`}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
