import AgentCard from "@/components/agent-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Mail, ShieldCheck, BarChart3, ShoppingBag, Palette, Banknote, TrendingUp, LucideIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
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

const domains = ["All", "Workflow Automation", "Data & Compliance", "Customer Support", "DeFi Services"];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const { toast } = useToast();
  const { openAgentChat } = useAgentChat();

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const deployMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const response = await apiRequest("POST", `/api/agents/${agentId}/deploy`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Agent Deployed",
        description: `${data.message}. Transaction: ${data.txHash}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/decision-logs"] });
    },
    onError: () => {
      toast({
        title: "Deployment Failed",
        description: "Failed to deploy agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeployAgent = (agent: Agent) => {
    deployMutation.mutate(agent.id);
    openAgentChat({
      id: agent.id,
      name: agent.name,
      icon: agent.icon,
      domain: agent.domain,
      systemPrompt: agent.systemPrompt,
    });
  };

  const filteredAgents = (agents || []).filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === "All" || agent.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Agent Marketplace</h1>
        <p className="text-muted-foreground">
          Discover and deploy specialized AI agents across four domains
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name or description..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-agents"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {domains.map((domain) => (
          <Badge
            key={domain}
            variant={selectedDomain === domain ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setSelectedDomain(domain)}
            data-testid={`badge-filter-${domain.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {domain}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
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

      {!isLoading && filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No agents found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
