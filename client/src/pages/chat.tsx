import ChatInterface from "@/components/chat-interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Shield, Globe } from "lucide-react";

export default function Chat() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">AgentHub Assistant</h1>
            <p className="text-muted-foreground">
              Your master AI assistant powered by Cardano blockchain
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm">Multi-Agent Access</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Access all 8 specialized agents through one conversation
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border-teal-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-teal-500" />
              <CardTitle className="text-sm">Hydra Payments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Instant micropayments via Layer 2 technology
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 border-cyan-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-500" />
              <CardTitle className="text-sm">On-Chain Logging</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              All decisions recorded on Cardano blockchain
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          Use @ to mention specific agents
        </Badge>
        <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
          Powered by GPT-4o
        </Badge>
        <Badge variant="outline" className="text-xs border-teal-500/30 text-teal-600 dark:text-teal-400">
          Masumi DIDs
        </Badge>
      </div>

      <ChatInterface />
    </div>
  );
}
