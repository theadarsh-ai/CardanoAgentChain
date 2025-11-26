import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AgentCardProps {
  name: string;
  description: string;
  domain: string;
  icon: LucideIcon;
  usesServed: number;
  avgResponse: string;
  isVerified?: boolean;
  onDeploy?: () => void;
}

export default function AgentCard({
  name,
  description,
  domain,
  icon: Icon,
  usesServed,
  avgResponse,
  isVerified = true,
  onDeploy,
}: AgentCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-agent-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="gap-1">
        <div className="flex items-start justify-between gap-2">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-pink-500">
              <Icon className="h-6 w-6 text-primary-foreground" />
            </AvatarFallback>
          </Avatar>
          <Badge variant="secondary" className="text-xs" data-testid={`badge-domain-${domain.toLowerCase().replace(/\s+/g, '-')}`}>
            {domain}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{name}</CardTitle>
          {isVerified && (
            <CheckCircle2 className="h-5 w-5 text-primary" data-testid="icon-verified" />
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Uses Served</p>
            <p className="font-mono font-semibold" data-testid="text-uses-served">{usesServed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg Response</p>
            <p className="font-mono font-semibold" data-testid="text-avg-response">{avgResponse}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onDeploy}
          data-testid={`button-deploy-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          Deploy Agent
        </Button>
      </CardFooter>
    </Card>
  );
}
