import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield } from "lucide-react";

interface BlockchainPanelProps {
  type: "hydra" | "cardano";
}

export default function BlockchainPanel({ type }: BlockchainPanelProps) {
  if (type === "hydra") {
    return (
      <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20" data-testid="card-hydra-layer">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-500" />
            <CardTitle>Hydra Layer 2</CardTitle>
          </div>
          <CardDescription>Speed layer for instant microtransactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Throughput</span>
              <span className="font-mono font-semibold text-emerald-500" data-testid="text-hydra-throughput">1000+ TPS</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Finality</span>
              <span className="font-mono font-semibold text-emerald-500" data-testid="text-hydra-finality">&lt;1s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cost per service</span>
              <span className="font-mono font-semibold text-emerald-500" data-testid="text-hydra-cost">~$0.004</span>
            </div>
          </div>
          <div className="pt-3 border-t border-emerald-500/20">
            <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-500" data-testid="badge-hydra-status">
              <Zap className="h-3 w-3 mr-1" /> Instant micropayments
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border-teal-500/20" data-testid="card-cardano-layer">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-500" />
          <CardTitle>Cardano Layer 1</CardTitle>
        </div>
        <CardDescription>Security layer for final settlement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Settlement</span>
            <span className="font-mono font-semibold text-teal-500" data-testid="text-cardano-settlement">Secure</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Records</span>
            <span className="font-mono font-semibold text-teal-500" data-testid="text-cardano-records">Immutable</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Credentials</span>
            <span className="font-mono font-semibold text-teal-500" data-testid="text-cardano-credentials">DID verified</span>
          </div>
        </div>
        <div className="pt-3 border-t border-teal-500/20">
          <Badge variant="outline" className="bg-teal-500/10 border-teal-500/30 text-teal-500" data-testid="badge-cardano-status">
            <Shield className="h-3 w-3 mr-1" /> Smart contracts
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
