import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Mail, ShieldCheck, BarChart3, ShoppingBag, Palette, Banknote, TrendingUp, MessageSquare, ArrowLeft, CheckCircle, Clock, Users, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function AgentPage() {
  const [, params] = useRoute("/agents/:agentName");
  const agentName = params?.agentName || "";

  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const agent = agents?.find(
    (a) => a.name.toLowerCase() === agentName.toLowerCase()
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="space-y-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2" data-testid="button-back-home">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Agent not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const IconComponent = iconMap[agent.icon] || Sparkles;

  return (
    <div className="space-y-6">
      <Link href="/marketplace">
        <Button variant="ghost" className="gap-2" data-testid="button-back-marketplace">
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#10FF00] blur-md opacity-30 rounded-lg" />
              <div className="relative p-4 rounded-lg bg-gradient-to-br from-[#10FF00]/20 to-[#00FF88]/20">
                <IconComponent className="h-8 w-8 text-[#10FF00]" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{agent.name}</CardTitle>
                {agent.isVerified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">{agent.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{agent.domain}</Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {agent.usesServed.toLocaleString()} uses
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              ~{(agent.avgResponseMs / 1000).toFixed(1)}s response
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Capabilities</h3>
            <p className="text-muted-foreground text-sm">
              {agent.systemPrompt.split('. ').slice(1, 4).join('. ')}.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href={`/chat?agent=${agent.name}`}>
              <Button className="gap-2" data-testid={`button-chat-${agent.name.toLowerCase()}`}>
                <MessageSquare className="h-4 w-4" />
                Start Chat with {agent.name}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
