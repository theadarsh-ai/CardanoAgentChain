import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield } from "lucide-react";

interface BlockchainPanelProps {
  type: "hydra" | "cardano";
}

export default function BlockchainPanel({ type }: BlockchainPanelProps) {
  if (type === "hydra") {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20" data-testid="card-hydra-layer">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            <CardTitle>Hydra Layer 2</CardTitle>
          </div>
          <CardDescription>Speed layer for instant microtransactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Throughput</span>
              <span className="font-mono font-semibold" data-testid="text-hydra-throughput">1000+ TPS</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Finality</span>
              <span className="font-mono font-semibold" data-testid="text-hydra-finality">&lt;1s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cost per service</span>
              <span className="font-mono font-semibold" data-testid="text-hydra-cost">~$0.004</span>
            </div>
          </div>
          <div className="pt-3 border-t">
            <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30" data-testid="badge-hydra-status">
              <span className="mr-2">⚡</span> Instant micropayments
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20" data-testid="card-cardano-layer">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <CardTitle>Cardano Layer 1</CardTitle>
        </div>
        <CardDescription>Security layer for final settlement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Settlement</span>
            <span className="font-mono font-semibold" data-testid="text-cardano-settlement">Secure</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Records</span>
            <span className="font-mono font-semibold" data-testid="text-cardano-records">Immutable</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Credentials</span>
            <span className="font-mono font-semibold" data-testid="text-cardano-credentials">DID verified</span>
          </div>
        </div>
        <div className="pt-3 border-t">
          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30" data-testid="badge-cardano-status">
            <span className="mr-2">🔒</span> Smart contracts
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
