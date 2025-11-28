import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const flowSteps = [
  { id: 1, label: "User spawns goal", color: "from-emerald-500 to-emerald-600" },
  { id: 2, label: "Master agent analyzes", color: "from-emerald-600 to-teal-500" },
  { id: 3, label: "Searches registry", color: "from-teal-500 to-teal-600" },
  { id: 4, label: "Agents collaborate", color: "from-teal-600 to-emerald-500" },
  { id: 5, label: "Hydra processes", color: "from-emerald-500 to-cyan-500" },
  { id: 6, label: "Cardano settles", color: "from-cyan-500 to-cyan-600" },
  { id: 7, label: "User receives result", color: "from-cyan-600 to-emerald-500" },
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
                className={`px-4 py-3 rounded-lg bg-gradient-to-r ${step.color} text-white text-sm font-medium text-center min-w-[140px] shadow-md`}
                data-testid={`flow-step-${step.id}`}
              >
                <div className="text-xs opacity-80 mb-1">{step.id}</div>
                {step.label}
              </div>
              {index < flowSteps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-emerald-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
