import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { DecisionLog as DecisionLogType } from "@shared/schema";

export default function DecisionLog() {
  const { data: logs, isLoading } = useQuery<DecisionLogType[]>({
    queryKey: ["/api/decision-logs"],
    refetchInterval: 5000,
  });

  const formatTimestamp = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).replace(",", "");
  };

  return (
    <Card data-testid="card-decision-log">
      <CardHeader>
        <CardTitle>Decision Logging</CardTitle>
        <CardDescription>On-chain audit trail of all agent decisions and collaborations</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 pb-4 border-b">
                <Skeleton className="w-3 h-3 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={log.id}
                className="flex gap-4 pb-4 border-b last:border-b-0"
                data-testid={`log-entry-${log.id}`}
              >
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${log.status === "confirmed" ? "bg-green-500" : "bg-blue-500"} mt-1`} />
                  {index < logs.length - 1 && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-full bg-border" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{log.agentName}</p>
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
                    <span className="font-mono">{formatTimestamp(log.createdAt)}</span>
                    <span>|</span>
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
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No decision logs yet. Start chatting with agents to generate logs.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
