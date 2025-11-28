import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const flowSteps = [
  { id: 1, label: "User spawns goal", color: "from-[#10FF00] to-[#0de000]" },
  { id: 2, label: "Master agent analyzes", color: "from-[#0de000] to-[#00FF88]" },
  { id: 3, label: "Searches registry", color: "from-[#00FF88] to-[#00dd77]" },
  { id: 4, label: "Agents collaborate", color: "from-[#00dd77] to-[#10FF00]" },
  { id: 5, label: "Hydra processes", color: "from-[#10FF00] to-[#00cc66]" },
  { id: 6, label: "Cardano settles", color: "from-[#00cc66] to-[#00aa55]" },
  { id: 7, label: "User receives result", color: "from-[#00aa55] to-[#10FF00]" },
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
                className={`px-4 py-3 rounded-lg bg-gradient-to-r ${step.color} text-black text-sm font-medium text-center min-w-[140px] shadow-lg shadow-[#10FF00]/20`}
                data-testid={`flow-step-${step.id}`}
              >
                <div className="text-xs opacity-70 mb-1">{step.id}</div>
                {step.label}
              </div>
              {index < flowSteps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-[#10FF00] shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
