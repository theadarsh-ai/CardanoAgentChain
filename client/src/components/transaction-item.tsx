import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap } from "lucide-react";

interface TransactionItemProps {
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  status: "confirmed" | "pending";
  txId: string;
}

export default function TransactionItem({
  from,
  to,
  amount,
  timestamp,
  status,
  txId,
}: TransactionItemProps) {
  return (
    <Card className="p-4" data-testid={`transaction-${txId}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-[#10FF00] blur-md opacity-40 rounded-full" />
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#10FF00] to-[#00FF88]">
              <Zap className="h-5 w-5 text-black" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium truncate">{from}</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="font-medium truncate">{to}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span className="font-mono">{timestamp}</span>
              <span>•</span>
              <span className="font-mono truncate">{txId}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="font-mono font-semibold" data-testid={`amount-${txId}`}>{amount}</p>
            <p className="text-xs text-muted-foreground">Hydra L2</p>
          </div>
          <Badge
            variant={status === "confirmed" ? "default" : "secondary"}
            data-testid={`status-${txId}`}
          >
            {status}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
