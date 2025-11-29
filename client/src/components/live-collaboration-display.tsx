import { useState } from "react";
import { Handshake, Bot, DollarSign, ChevronDown, ChevronUp, CheckCircle2, Loader2, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LiveAgent } from "@/hooks/use-collaboration-socket";

interface LiveCollaborationDisplayProps {
  liveAgents: LiveAgent[];
  isConnected: boolean;
}

export function LiveCollaborationDisplay({ liveAgents, isConnected }: LiveCollaborationDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (liveAgents.length === 0) {
    return null;
  }

  const completedCount = liveAgents.filter(a => a.status === "completed").length;
  const totalCost = liveAgents.reduce((sum, a) => sum + (a.cost || 0), 0);
  const progressPercent = (completedCount / liveAgents.length) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "hiring":
        return <Clock className="h-3 w-3 animate-pulse" />;
      case "in_progress":
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hiring":
        return "border-blue-500/50 text-blue-400 bg-blue-500/10";
      case "in_progress":
        return "border-amber-500/50 text-amber-400 bg-amber-500/10";
      case "completed":
        return "border-emerald-500/50 text-emerald-400 bg-emerald-500/10";
      default:
        return "border-gray-500/50 text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "hiring":
        return "Hiring...";
      case "in_progress":
        return "Working...";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <Card className="mt-3 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-amber-500/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full h-auto p-3 hover:bg-transparent justify-between rounded-t-lg"
            data-testid="live-collaboration-toggle"
          >
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium">Live Agent Collaboration</span>
              <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-300">
                {completedCount}/{liveAgents.length} agents
              </Badge>
              <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400 gap-1">
                <Zap className="h-2.5 w-2.5" />
                Live
              </Badge>
              {isConnected && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                ${totalCost.toFixed(2)} via Hydra L2
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 px-3 space-y-3">
            <Progress value={progressPercent} className="h-1.5" />
            
            {liveAgents.map((agent, index) => (
              <div
                key={agent.name + index}
                className={`flex items-start gap-3 p-2 rounded-lg bg-background/50 border border-border/50 transition-all duration-300 ${
                  agent.status === "in_progress" ? "ring-1 ring-amber-500/30" : ""
                }`}
                data-testid={`live-agent-${index}`}
              >
                <div className={`flex-shrink-0 p-1.5 rounded-md ${
                  agent.status === "completed" ? "bg-emerald-500/20" : 
                  agent.status === "in_progress" ? "bg-amber-500/20" : "bg-blue-500/20"
                }`}>
                  <Bot className={`h-4 w-4 ${
                    agent.status === "completed" ? "text-emerald-400" : 
                    agent.status === "in_progress" ? "text-amber-400" : "text-blue-400"
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {agent.name}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 h-4 gap-1 ${getStatusColor(agent.status)}`}
                    >
                      {getStatusIcon(agent.status)}
                      {getStatusText(agent.status)}
                    </Badge>
                  </div>
                  
                  {agent.task && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {agent.task}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    {agent.cost && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-2.5 w-2.5" />
                        ${agent.cost.toFixed(2)}
                      </span>
                    )}
                    {agent.job_id && (
                      <span className="font-mono">
                        {agent.job_id.slice(0, 12)}...
                      </span>
                    )}
                    <span className="text-emerald-400">via Masumi</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
