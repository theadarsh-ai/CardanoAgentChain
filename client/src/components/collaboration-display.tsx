import { useState } from "react";
import { Handshake, Bot, DollarSign, ChevronDown, ChevronUp, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";

interface HiredAgent {
  name: string;
  task: string;
  status: string;
  job_id?: string;
  cost: number;
  is_simulated: boolean;
}

interface CollaborationSummary {
  collaborated: boolean;
  agents_hired?: number;
  successful_hires?: number;
  total_cost_usd?: number;
  agents?: HiredAgent[];
  payment_method?: string;
  is_simulated?: boolean;
}

interface CollaborationDisplayProps {
  collaboration: CollaborationSummary;
}

export function CollaborationDisplay({ collaboration }: CollaborationDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (!collaboration?.collaborated || !collaboration.agents?.length) {
    return null;
  }

  return (
    <Card className="mt-3 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-amber-500/5">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full h-auto p-3 hover:bg-transparent justify-between rounded-t-lg"
            data-testid="collaboration-toggle"
          >
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium">Sokosumi Agent Collaboration</span>
              <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-300">
                {collaboration.agents_hired} agent{collaboration.agents_hired !== 1 ? 's' : ''} hired
              </Badge>
              <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
                Live
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                ${collaboration.total_cost_usd?.toFixed(2)} via {collaboration.payment_method}
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
          <CardContent className="pt-0 pb-3 px-3 space-y-2">
            {collaboration.agents?.map((agent, index) => (
              <div
                key={agent.job_id || index}
                className="flex items-start gap-3 p-2 rounded-lg bg-background/50 border border-border/50"
                data-testid={`hired-agent-${index}`}
              >
                <div className="flex-shrink-0 p-1.5 rounded-md bg-orange-500/20">
                  <Bot className="h-4 w-4 text-orange-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {agent.name}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 h-4 ${
                        agent.status === 'completed' || agent.status === 'submitted'
                          ? 'border-emerald-500/50 text-emerald-400'
                          : agent.status === 'failed'
                          ? 'border-red-500/50 text-red-400'
                          : 'border-amber-500/50 text-amber-400'
                      }`}
                    >
                      {agent.status === 'submitted' ? (
                        <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
                      ) : agent.status === 'completed' ? (
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                      ) : null}
                      {agent.status}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {agent.task}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <DollarSign className="h-3 w-3" />
                      ${agent.cost.toFixed(2)}
                    </span>
                    {agent.job_id && (
                      <span className="text-muted-foreground font-mono">
                        Job: {agent.job_id}
                      </span>
                    )}
                    <span className="text-emerald-400">via Masumi</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <span>
                {collaboration.successful_hires} of {collaboration.agents_hired} successful
              </span>
              <a 
                href="/sokosumi" 
                className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
              >
                View Sokosumi Marketplace
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
