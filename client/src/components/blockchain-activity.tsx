import { useState } from "react";
import { 
  Shield, 
  Zap, 
  Search, 
  UserPlus, 
  FileCheck, 
  Star, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Handshake,
  Bot
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface BlockchainActivity {
  type: string;
  icon: string;
  title: string;
  description: string;
  details: Record<string, string | number | boolean>;
  status: string;
  is_simulated: boolean;
  timestamp: string;
}

interface BlockchainActivityDisplayProps {
  activities: BlockchainActivity[];
  isSimulationMode: boolean;
  agentProfile?: {
    name: string;
    did: string;
    reputation_score: number;
    total_transactions: number;
    verified: boolean;
  };
}

const iconMap: Record<string, React.ElementType> = {
  Shield: Shield,
  Zap: Zap,
  Search: Search,
  UserPlus: UserPlus,
  FileCheck: FileCheck,
  Star: Star,
  Handshake: Handshake,
  Bot: Bot,
};

const statusColors: Record<string, string> = {
  confirmed: "text-emerald-400",
  completed: "text-emerald-400",
  pending: "text-amber-400",
  error: "text-red-400",
  simulated: "text-blue-400",
};

const statusIcons: Record<string, React.ElementType> = {
  confirmed: CheckCircle2,
  completed: CheckCircle2,
  pending: Clock,
  error: AlertCircle,
  simulated: CheckCircle2,
};

function ActivityItem({ activity }: { activity: BlockchainActivity }) {
  const [isOpen, setIsOpen] = useState(false);
  const IconComponent = iconMap[activity.icon] || Shield;
  const StatusIcon = statusIcons[activity.status] || CheckCircle2;
  
  const getActivityColor = () => {
    switch (activity.type) {
      case "masumi_verification":
      case "masumi_discovery":
        return "from-purple-500/20 to-purple-600/10 border-purple-500/30";
      case "hydra_payment":
        return "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30";
      case "agent_hiring":
        return "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30";
      case "sokosumi_hire":
        return "from-orange-500/20 to-orange-600/10 border-orange-500/30";
      case "cardano_audit":
        return "from-blue-500/20 to-blue-600/10 border-blue-500/30";
      case "reputation_update":
        return "from-amber-500/20 to-amber-600/10 border-amber-500/30";
      default:
        return "from-gray-500/20 to-gray-600/10 border-gray-500/30";
    }
  };

  const getIconColor = () => {
    switch (activity.type) {
      case "masumi_verification":
      case "masumi_discovery":
        return "text-purple-400";
      case "hydra_payment":
        return "text-cyan-400";
      case "agent_hiring":
        return "text-emerald-400";
      case "sokosumi_hire":
        return "text-orange-400";
      case "cardano_audit":
        return "text-blue-400";
      case "reputation_update":
        return "text-amber-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`rounded-lg border bg-gradient-to-r ${getActivityColor()} p-2 mb-1`}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full h-auto p-1 hover:bg-transparent justify-between"
            data-testid={`activity-${activity.type}`}
          >
            <div className="flex items-center gap-2">
              <IconComponent className={`h-3.5 w-3.5 ${getIconColor()}`} />
              <span className="text-xs font-medium text-foreground">{activity.title}</span>
              <StatusIcon className={`h-3 w-3 ${statusColors[activity.status]}`} />
            </div>
            <div className="flex items-center gap-1">
              {activity.is_simulated && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-500/50 text-blue-400">
                  SIM
                </Badge>
              )}
              {isOpen ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pt-2 pb-1 px-1 space-y-1 border-t border-border/50 mt-1">
            <p className="text-xs text-muted-foreground">{activity.description}</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
              {Object.entries(activity.details).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}:
                  </span>
                  <span className="text-[10px] font-mono text-foreground truncate">
                    {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function BlockchainActivityDisplay({ 
  activities, 
  isSimulationMode,
  agentProfile 
}: BlockchainActivityDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full h-auto p-3 hover:bg-muted/50 justify-between rounded-none"
            data-testid="blockchain-activity-toggle"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-purple-400" />
                <Zap className="h-4 w-4 text-cyan-400" />
                <FileCheck className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-sm font-medium">Blockchain Activity</span>
              <Badge variant="secondary" className="text-xs">
                {activities.length} events
              </Badge>
              {isSimulationMode && (
                <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                  Simulation Mode
                </Badge>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 pt-0 space-y-2">
            {agentProfile && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/30 mb-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{agentProfile.name}</span>
                    {agentProfile.verified && (
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {agentProfile.did}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium">{agentProfile.reputation_score}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Reputation</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium">{agentProfile.total_transactions}</span>
                    <span className="text-[10px] text-muted-foreground block">Txns</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              {activities.map((activity, index) => (
                <ActivityItem key={`${activity.type}-${index}`} activity={activity} />
              ))}
            </div>
            
            {isSimulationMode && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 mt-2">
                <AlertCircle className="h-4 w-4 text-blue-400 shrink-0" />
                <p className="text-[10px] text-blue-300">
                  Running in simulation mode. Add MASUMI_API_KEY, HYDRA_API_KEY, and BLOCKFROST_API_KEY to connect to live Cardano networks.
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function BlockchainNetworkBadges({ isSimulationMode }: { isSimulationMode: boolean }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="outline" className="text-xs gap-1 border-purple-500/50">
        <Shield className="h-3 w-3 text-purple-400" />
        Masumi {isSimulationMode ? "(Sim)" : ""}
      </Badge>
      <Badge variant="outline" className="text-xs gap-1 border-cyan-500/50">
        <Zap className="h-3 w-3 text-cyan-400" />
        Hydra L2 {isSimulationMode ? "(Sim)" : ""}
      </Badge>
      <Badge variant="outline" className="text-xs gap-1 border-blue-500/50">
        <FileCheck className="h-3 w-3 text-blue-400" />
        Cardano {isSimulationMode ? "(Sim)" : ""}
      </Badge>
    </div>
  );
}
