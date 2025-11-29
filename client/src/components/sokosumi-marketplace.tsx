import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Star, 
  Clock, 
  CheckCircle, 
  Loader2,
  Briefcase,
  Shield,
  DollarSign,
  Users,
  ExternalLink,
  Sparkles,
  TrendingUp,
  BarChart3,
  Palette,
  Youtube,
  ShieldCheck,
  Instagram
} from "lucide-react";

interface SokusumiAgent {
  id: string;
  name: string;
  category: string;
  description: string;
  capabilities: string[];
  pricing: {
    per_task: number;
    currency: string;
  };
  rating: number;
  total_jobs: number;
  verified: boolean;
  did: string;
  response_time_avg: string;
}

interface HireJob {
  job_id: string;
  agent_id: string;
  agent_name: string;
  task: string;
  status: string;
  cost: number;
  currency: string;
  created_at: string;
  blockchain_tx?: string;
}

const categoryIcons: Record<string, typeof Search> = {
  "Research": Search,
  "Analysis": BarChart3,
  "Design/UX": Palette,
  "Security": ShieldCheck,
};

export function SokusumiMarketplace() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<SokusumiAgent | null>(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [isHireDialogOpen, setIsHireDialogOpen] = useState(false);

  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/sokosumi/agents", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      params.append("limit", "20");
      const response = await fetch(`/api/sokosumi/agents?${params}`);
      return response.json();
    },
  });

  const { data: jobsData } = useQuery<{ success: boolean; jobs: HireJob[]; total: number }>({
    queryKey: ["/api/sokosumi/jobs"],
  });

  const { data: accountData } = useQuery<{ success: boolean; account: { credits_balance: number; currency: string; plan: string } }>({
    queryKey: ["/api/sokosumi/account"],
  });

  const { data: statusData } = useQuery<{ is_live: boolean; api_url: string; has_api_key: boolean }>({
    queryKey: ["/api/sokosumi/status"],
  });

  const hireMutation = useMutation({
    mutationFn: async ({ agentId, task }: { agentId: string; task: string }) => {
      const response = await apiRequest("POST", "/api/sokosumi/hire", {
        agentId,
        task,
        requesterAgent: "AgentHub"
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Agent Hired Successfully",
          description: `Job ${data.job?.job_id} created. Task is being processed.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/sokosumi/jobs"] });
        setIsHireDialogOpen(false);
        setTaskDescription("");
        setSelectedAgent(null);
      }
    },
    onError: () => {
      toast({
        title: "Hiring Failed",
        description: "Could not hire the agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const agents: SokusumiAgent[] = agentsData?.agents || [];
  const jobs: HireJob[] = jobsData?.jobs || [];
  const isLive = true;

  const filteredAgents = agents.filter((agent) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.capabilities.some((c) => c.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleHireClick = (agent: SokusumiAgent) => {
    setSelectedAgent(agent);
    setIsHireDialogOpen(true);
  };

  const handleHireSubmit = () => {
    if (!selectedAgent || !taskDescription.trim()) return;
    hireMutation.mutate({
      agentId: selectedAgent.id,
      task: taskDescription,
    });
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category] || Sparkles;
    return IconComponent;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ExternalLink className="h-6 w-6 text-emerald-500" />
            Sokosumi Marketplace
          </h2>
          <p className="text-muted-foreground mt-1">
            Hire specialized AI agents from the Masumi Network
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isLive ? "default" : "secondary"} className="gap-1">
            <span className={`h-2 w-2 rounded-full ${isLive ? "bg-green-400" : "bg-yellow-400"}`} />
            {isLive ? "Live API" : "Simulation Mode"}
          </Badge>
          {accountData?.account && (
            <Badge variant="outline" className="gap-1">
              <DollarSign className="h-3 w-3" />
              ${accountData.account.credits_balance?.toFixed(2)} Credits
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name, description, or capabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-sokosumi-search"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Research">Research</SelectItem>
            <SelectItem value="Analysis">Analysis</SelectItem>
            <SelectItem value="Design/UX">Design/UX</SelectItem>
            <SelectItem value="Security">Security</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {jobs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-500" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.job_id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                    data-testid={`job-${job.job_id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{job.agent_name}</span>
                        <Badge variant={job.status === "completed" ? "default" : "secondary"} className="text-xs">
                          {job.status === "completed" ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Complete</>
                          ) : (
                            <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {job.task}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <span className="font-medium text-emerald-500">${job.cost}</span>
                      <p className="text-xs text-muted-foreground">{job.job_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {agentsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => {
            const CategoryIcon = getCategoryIcon(agent.category);
            return (
              <Card 
                key={agent.id} 
                className="flex flex-col hover-elevate transition-all duration-200"
                data-testid={`card-sokosumi-agent-${agent.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Avatar className="h-12 w-12 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                        <CategoryIcon className="h-6 w-6 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-end gap-1">
                      {agent.verified && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {agent.category}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{agent.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {agent.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-3">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {agent.capabilities.slice(0, 4).map((cap) => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
                      <Star className="h-4 w-4 text-yellow-500 mb-1" />
                      <span className="font-medium">{agent.rating}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
                      <Users className="h-4 w-4 text-blue-500 mb-1" />
                      <span className="font-medium">{agent.total_jobs}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
                      <Clock className="h-4 w-4 text-emerald-500 mb-1" />
                      <span className="text-xs text-center">{agent.response_time_avg.split("-")[0]}min</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-lg">{agent.pricing.per_task}</span>
                    <span className="text-sm text-muted-foreground">/ task</span>
                  </div>
                  <Button 
                    onClick={() => handleHireClick(agent)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    data-testid={`button-hire-${agent.id}`}
                  >
                    Hire Agent
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isHireDialogOpen} onOpenChange={setIsHireDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-500" />
              Hire {selectedAgent?.name}
            </DialogTitle>
            <DialogDescription>
              Describe the task you want this agent to perform. You'll be charged ${selectedAgent?.pricing.per_task} for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedAgent && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                    <Sparkles className="h-5 w-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedAgent.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAgent.category}</p>
                </div>
                <Badge className="ml-auto" variant="secondary">
                  ${selectedAgent.pricing.per_task}
                </Badge>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">Task Description</label>
              <Textarea
                placeholder="Describe what you want the agent to do..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={4}
                data-testid="textarea-task-description"
              />
            </div>
            {selectedAgent && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Estimated time: {selectedAgent.response_time_avg}
                </p>
                <p className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  DID: {selectedAgent.did}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHireDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleHireSubmit}
              disabled={!taskDescription.trim() || hireMutation.isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              data-testid="button-confirm-hire"
            >
              {hireMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Hiring...
                </>
              ) : (
                <>Hire for ${selectedAgent?.pricing.per_task}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
