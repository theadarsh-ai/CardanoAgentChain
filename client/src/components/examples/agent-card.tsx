import AgentCard from "../agent-card";
import { Sparkles } from "lucide-react";

export default function AgentCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <AgentCard
        name="SocialGenie"
        description="Social media management powered"
        domain="Workflow Automation"
        icon={Sparkles}
        usesServed={1247}
        avgResponse="1.2s"
        onDeploy={() => console.log("Deploy SocialGenie")}
      />
    </div>
  );
}
