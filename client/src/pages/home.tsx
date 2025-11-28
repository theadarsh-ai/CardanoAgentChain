import HeroSection from "@/components/hero-section";
import MetricsGrid from "@/components/metrics-grid";
import AgentCard from "@/components/agent-card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Mail, ShieldCheck, BarChart3, ShoppingBag, Palette, Banknote, TrendingUp, LucideIcon } from "lucide-react";
import { useAgentChat } from "@/contexts/agent-chat-context";
import type { Agent } from "@shared/schema";

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Mail,
  ShieldCheck,
  BarChart3,
  ShoppingBag,
  Palette,
  Banknote,
  TrendingUp,
};

export default function Home() {
  const { openAgentChat } = useAgentChat();

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const handleDeployAgent = (agent: Agent) => {
    openAgentChat({
      id: agent.id,
      name: agent.name,
      icon: agent.icon,
      domain: agent.domain,
      systemPrompt: agent.systemPrompt,
    });
  };

  const featuredAgents = agents?.slice(0, 4) || [];

  return (
    <div className="space-y-8">
      <HeroSection />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Key Metrics</h2>
        <MetricsGrid />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Featured Agents</h2>
          <a href="/marketplace" className="text-primary hover:underline text-sm" data-testid="link-view-all-agents">
            View all agents
          </a>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAgents.map((agent) => {
              const IconComponent = iconMap[agent.icon] || Sparkles;
              return (
                <AgentCard
                  key={agent.id}
                  name={agent.name}
                  description={agent.description}
                  domain={agent.domain}
                  icon={IconComponent}
                  usesServed={agent.usesServed}
                  avgResponse={`${(agent.avgResponseMs / 1000).toFixed(1)}s`}
                  isVerified={agent.isVerified}
                  onDeploy={() => handleDeployAgent(agent)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
