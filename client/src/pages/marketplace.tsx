import AgentCard from "@/components/agent-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Sparkles, Mail, ShieldCheck, BarChart3, ShoppingBag, Palette, Banknote, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const allAgents = [
  {
    name: "SocialGenie",
    description: "Automate social media content creation and scheduling with AI-powered insights",
    domain: "Workflow Automation",
    icon: Sparkles,
    usesServed: 1247,
    avgResponse: "1.2s",
  },
  {
    name: "MailMind",
    description: "Intelligent email marketing automation with personalization at scale",
    domain: "Workflow Automation",
    icon: Mail,
    usesServed: 892,
    avgResponse: "0.8s",
  },
  {
    name: "ComplianceGuard",
    description: "Real-time AML/KYC monitoring with regulatory compliance automation",
    domain: "Data & Compliance",
    icon: ShieldCheck,
    usesServed: 2103,
    avgResponse: "2.1s",
  },
  {
    name: "InsightBot",
    description: "Advanced business intelligence with predictive analytics and reporting",
    domain: "Data & Compliance",
    icon: BarChart3,
    usesServed: 1567,
    avgResponse: "1.5s",
  },
  {
    name: "ShopAssist",
    description: "24/7 e-commerce customer support with intelligent product recommendations",
    domain: "Customer Support",
    icon: ShoppingBag,
    usesServed: 3421,
    avgResponse: "0.6s",
  },
  {
    name: "StyleAdvisor",
    description: "Personalized product styling and recommendation engine",
    domain: "Customer Support",
    icon: Palette,
    usesServed: 987,
    avgResponse: "1.0s",
  },
  {
    name: "YieldMaximizer",
    description: "Automated DeFi yield optimization across multiple protocols",
    domain: "DeFi Services",
    icon: Banknote,
    usesServed: 1834,
    avgResponse: "1.8s",
  },
  {
    name: "TradeMind",
    description: "Autonomous trading strategies with risk management",
    domain: "DeFi Services",
    icon: TrendingUp,
    usesServed: 1256,
    avgResponse: "2.3s",
  },
];

const domains = ["All", "Workflow Automation", "Data & Compliance", "Customer Support", "DeFi Services"];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const { toast } = useToast();

  const handleDeploy = (agentName: string) => {
    toast({
      title: "Agent Deployment Initiated",
      description: `${agentName} is being deployed. Masumi DID verification and Hydra payment channel setup in progress.`,
    });
  };

  const filteredAgents = allAgents.filter((agent) => {
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
            className="cursor-pointer hover-elevate"
            onClick={() => setSelectedDomain(domain)}
            data-testid={`badge-filter-${domain.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {domain}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.name}
            {...agent}
            onDeploy={() => handleDeploy(agent.name)}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No agents found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
