import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const flowSteps = [
  { id: 1, label: "User spawns goal", color: "from-purple-500 to-purple-600" },
  { id: 2, label: "Master agent analyzes", color: "from-purple-600 to-pink-500" },
  { id: 3, label: "Searches registry", color: "from-pink-500 to-pink-600" },
  { id: 4, label: "Agents collaborate", color: "from-pink-600 to-purple-500" },
  { id: 5, label: "Hydra processes", color: "from-purple-500 to-blue-500" },
  { id: 6, label: "Cardano settles", color: "from-blue-500 to-blue-600" },
  { id: 7, label: "User receives result", color: "from-blue-600 to-green-500" },
];

export default function SystemFlow() {
  return (
    <Card data-testid="card-system-flow">
      <CardHeader>
        <CardTitle>System Flow</CardTitle>
        <CardDescription>
          End-to-end workflow from user request to blockchain settlement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {flowSteps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <div
                className={`px-4 py-3 rounded-lg bg-gradient-to-r ${step.color} text-white text-sm font-medium text-center min-w-[140px]`}
                data-testid={`flow-step-${step.id}`}
              >
                <div className="text-xs opacity-80 mb-1">{step.id}</div>
                {step.label}
              </div>
              {index < flowSteps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
