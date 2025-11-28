import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Bot, FolderKanban, Zap, DollarSign, BarChart3, CheckCircle } from "lucide-react";

const metrics = [
  { label: "System Layers", value: "7", icon: Layers, testId: "metric-system-layers" },
  { label: "Specialized Agents", value: "8", icon: Bot, testId: "metric-specialized-agents" },
  { label: "Agent Domains", value: "4", icon: FolderKanban, testId: "metric-agent-domains" },
  { label: "Throughput", value: "1000+ TPS", icon: Zap, testId: "metric-throughput" },
  { label: "Cost/Service", value: "~$0.004", icon: DollarSign, testId: "metric-cost-service" },
  { label: "Platform Fee", value: "10%", icon: BarChart3, testId: "metric-platform-fee" },
  { label: "On-Chain", value: "100%", icon: CheckCircle, testId: "metric-on-chain" },
];

export default function MetricsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-[#10FF00]/20 hover:border-[#10FF00]/40 transition-colors" data-testid={metric.testId}>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-[#10FF00]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-[#10FF00]" data-testid={`value-${metric.testId}`}>
              {metric.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
