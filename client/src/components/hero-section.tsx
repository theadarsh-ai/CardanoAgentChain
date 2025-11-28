import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Cpu, Zap } from "lucide-react";
import heroImage from "@assets/generated_images/ai_blockchain_network_hero.png";

export default function HeroSection() {
  return (
    <div className="relative h-96 rounded-xl overflow-hidden" data-testid="section-hero">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      
      <div className="relative h-full flex flex-col justify-center px-12 text-white z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AgentHub</h1>
        </div>
        <p className="text-xl md:text-2xl mb-2 max-w-2xl text-white/90 font-medium">
          AI Agent Marketplace on <span className="text-emerald-400">Cardano</span>
        </p>
        <p className="text-base mb-8 max-w-xl text-white/70">
          Eight specialized AI agents with Masumi DIDs, Hydra micropayments, and on-chain decision logging for transparent collaboration.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Button 
            size="lg" 
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg border-0"
            data-testid="button-deploy-first-agent"
          >
            <Cpu className="mr-2 h-5 w-5" />
            Deploy Your First Agent
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            data-testid="button-explore-marketplace"
          >
            <Zap className="mr-2 h-5 w-5" />
            Explore Marketplace
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
    </div>
  );
}
