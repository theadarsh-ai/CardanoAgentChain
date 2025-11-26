import SystemFlow from "@/components/system-flow";
import BlockchainPanel from "@/components/blockchain-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const techStack = [
  { layer: "L1: Security", tech: "Cardano (Plutus/Aiken)", purpose: "Final settlement, reputation, compliance records" },
  { layer: "L2: Speed", tech: "Hydra State Channels", purpose: "Off-chain micro-transactions (1000+ TPS, <1s finality)" },
  { layer: "Discovery", tech: "Masumi Network", purpose: "Agent marketplace, service discovery, reputation system" },
  { layer: "Frontend/Backend", tech: "Node.js/Python + GraphQL", purpose: "Agent runtime, APIs, data management" },
  { layer: "AI/ML", tech: "LangGraph, LangChain", purpose: "Intelligence layer for all agent services" },
];

export default function Architecture() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">System Architecture</h1>
        <p className="text-muted-foreground">
          Multi-layer architecture powering the AgentHub ecosystem
        </p>
      </div>

      <SystemFlow />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Blockchain Infrastructure</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <BlockchainPanel type="hydra" />
          <BlockchainPanel type="cardano" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
        <Card data-testid="card-tech-stack">
          <CardHeader>
            <CardTitle>Seven-Layer Architecture</CardTitle>
            <CardDescription>From user interface to blockchain settlement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {techStack.map((item, index) => (
                <div
                  key={item.layer}
                  className="flex gap-4 pb-4 border-b last:border-b-0"
                  data-testid={`tech-layer-${index + 1}`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-pink-500 text-primary-foreground text-sm font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.layer}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-mono text-xs">{item.tech}</span> — {item.purpose}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
