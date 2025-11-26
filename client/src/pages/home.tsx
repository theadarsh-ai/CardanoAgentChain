import HeroSection from "@/components/hero-section";
import MetricsGrid from "@/components/metrics-grid";
import AgentCard from "@/components/agent-card";
import { Sparkles, Mail, ShieldCheck, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const featuredAgents = [
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
];

export default function Home() {
  const { toast } = useToast();

  const handleDeploy = (agentName: string) => {
    toast({
      title: "Agent Deployment Initiated",
      description: `${agentName} is being deployed to your workspace. This will be connected to real blockchain in production.`,
    });
  };

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
            View all agents →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredAgents.map((agent) => (
            <AgentCard
              key={agent.name}
              {...agent}
              onDeploy={() => handleDeploy(agent.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
