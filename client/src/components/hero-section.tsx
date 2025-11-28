import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Cpu, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative h-96 rounded-xl overflow-hidden" data-testid="section-hero">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0d1a0d] to-[#0a1f0a]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10FF00]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#10FF00]/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-[#00FF88]/8 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMEZGMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="relative h-full flex flex-col justify-center px-12 text-white z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[#10FF00] blur-lg opacity-50 rounded-xl" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#10FF00] to-[#00FF88] flex items-center justify-center shadow-lg shadow-[#10FF00]/30">
              <Sparkles className="h-7 w-7 text-black" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AgentHub</h1>
        </div>
        <p className="text-xl md:text-2xl mb-2 max-w-2xl text-white/90 font-medium">
          AI Agent Marketplace on <span className="text-[#10FF00]">Cardano</span>
        </p>
        <p className="text-base mb-8 max-w-xl text-white/70">
          Eight specialized AI agents with Masumi DIDs, Hydra micropayments, and on-chain decision logging for transparent collaboration.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Button 
            size="lg" 
            className="bg-[#10FF00] text-black font-semibold hover:bg-[#0de000] shadow-lg shadow-[#10FF00]/25 border-0"
            data-testid="button-deploy-first-agent"
          >
            <Cpu className="mr-2 h-5 w-5" />
            Deploy Your First Agent
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="bg-white/5 backdrop-blur-md border-[#10FF00]/30 text-white hover:bg-[#10FF00]/10 hover:border-[#10FF00]/50"
            data-testid="button-explore-marketplace"
          >
            <Zap className="mr-2 h-5 w-5" />
            Explore Marketplace
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#10FF00]/50 to-transparent" />
    </div>
  );
}
