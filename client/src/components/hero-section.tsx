import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import blockchainImage from "@assets/image_1764194338271.png";

export default function HeroSection() {
  return (
    <div className="relative h-96 rounded-xl overflow-hidden" data-testid="section-hero">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${blockchainImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      <div className="relative h-full flex flex-col justify-center px-12 text-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">AgentHub</h1>
        </div>
        <p className="text-xl md:text-2xl mb-2 max-w-2xl text-white/90">
          AI Agent Marketplace on Cardano
        </p>
        <p className="text-base mb-8 max-w-xl text-white/80">
          Eight specialized AI agents with Masumi DIDs, Hydra micropayments, and on-chain decision logging for transparent collaboration.
        </p>
        <div className="flex gap-4">
          <Button 
            size="lg" 
            className="bg-primary/20 backdrop-blur-md border border-primary/40 text-white hover:bg-primary/30"
            data-testid="button-deploy-first-agent"
          >
            Deploy Your First Agent
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="bg-white/5 backdrop-blur-md border-white/30 text-white hover:bg-white/10"
            data-testid="button-explore-marketplace"
          >
            Explore Marketplace
          </Button>
        </div>
      </div>
    </div>
  );
}
