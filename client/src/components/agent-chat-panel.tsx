import { useState, useRef, useEffect } from "react";
import { useAgentChat } from "@/contexts/agent-chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, Send, Loader2, Sparkles, Bot, Mail, ShieldCheck, BarChart3, ShoppingBag, Palette, Banknote, TrendingUp, Zap, Shield, Rocket, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

import complianceMeme from "@assets/generated_images/cardano_compliance_robot_meme.png";
import dataMeme from "@assets/generated_images/cardano_data_analytics_meme.png";
import emailMeme from "@assets/generated_images/cardano_email_marketing_meme.png";
import shoppingMeme from "@assets/generated_images/cardano_shopping_assistant_meme.png";
import socialMeme from "@assets/generated_images/cardano_social_media_meme.png";
import styleMeme from "@assets/generated_images/cardano_style_advisor_meme.png";
import tradingMeme from "@assets/generated_images/cardano_trading_robot_meme.png";
import yieldMeme from "@assets/generated_images/cardano_yield_farming_meme.png";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: string;
}

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Mail,
  ShieldCheck,
  BarChart3,
  ShoppingBag,
  Palette,
  Banknote,
  TrendingUp,
};

const memeMap: Record<string, string> = {
  "ComplianceGuard": complianceMeme,
  "InsightBot": dataMeme,
  "MailMind": emailMeme,
  "ShopAssist": shoppingMeme,
  "SocialGenie": socialMeme,
  "StyleAdvisor": styleMeme,
  "TradeMind": tradingMeme,
  "YieldMaximizer": yieldMeme,
};

const deployMessages = [
  "Waking up the Ouroboros...",
  "Connecting to Cardano mainnet...",
  "Opening Hydra head channel...",
  "Staking agent credentials...",
  "Peer-reviewing your request...",
  "Validating smart contracts...",
  "Syncing with blockchain...",
  "WAGMI! Almost ready...",
];

export default function AgentChatPanel() {
  const { activeAgent, isOpen, isDeploying, closeAgentChat } = useAgentChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [deployMessageIndex, setDeployMessageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const IconComponent = activeAgent?.icon ? iconMap[activeAgent.icon] || Bot : Bot;
  const memeImage = activeAgent?.name ? memeMap[activeAgent.name] : null;

  useEffect(() => {
    if (isDeploying) {
      setDeployMessageIndex(0);
      const interval = setInterval(() => {
        setDeployMessageIndex((prev) => (prev + 1) % deployMessages.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isDeploying]);

  useEffect(() => {
    if (isOpen && !isDeploying && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isDeploying]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (activeAgent && !isDeploying) {
      setMessages([{
        id: "welcome",
        content: `Hello! I'm ${activeAgent.name}, your specialized ${activeAgent.domain} assistant powered by Cardano. How can I help you today?`,
        sender: "agent",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
  }, [activeAgent?.id, isDeploying]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        agentId: activeAgent?.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const agentMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        sender: "agent",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, agentMessage]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen || !activeAgent) return null;

  if (isDeploying) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/80 z-40 backdrop-blur-md"
          data-testid="overlay-deploying"
        />
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-testid="panel-deploying-container"
        >
          <div
            className={cn(
              "w-full max-w-xl bg-background border border-emerald-500/20 rounded-3xl shadow-2xl flex flex-col items-center p-10 transition-all duration-300",
              "scale-100 opacity-100"
            )}
            data-testid="panel-deploying"
          >
            <div className="relative mb-8">
              {memeImage ? (
                <img 
                  src={memeImage} 
                  alt={`${activeAgent.name} Cardano meme`}
                  className="w-80 h-80 object-contain rounded-2xl shadow-xl border border-emerald-500/10"
                  data-testid="img-deploy-meme"
                />
              ) : (
                <div className="w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center">
                  <IconComponent className="h-32 w-32 text-emerald-500" />
                </div>
              )}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 text-base shadow-lg border-0">
                  <Rocket className="h-5 w-5 mr-2 animate-bounce" />
                  Deploying on Cardano
                </Badge>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center mb-2" data-testid="text-deploying-name">
              {activeAgent.name}
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-8">
              {activeAgent.domain}
            </p>

            <div className="flex items-center gap-4 mb-6 min-h-[32px]">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              <span className="text-lg text-muted-foreground">
                {deployMessages[deployMessageIndex]}
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-3 overflow-hidden mb-6">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${((deployMessageIndex + 1) / deployMessages.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>Establishing secure Hydra L2 payment channel</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-md"
        onClick={closeAgentChat}
        data-testid="overlay-agent-chat"
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        data-testid="panel-agent-chat-container"
      >
        <div
          className={cn(
            "w-full max-w-4xl h-[90vh] max-h-[900px] bg-background border border-emerald-500/20 rounded-3xl shadow-2xl flex flex-col transition-all duration-300",
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
          data-testid="panel-agent-chat"
        >
          <div className="flex items-center justify-between p-8 border-b border-emerald-500/10 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-t-3xl">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16 rounded-2xl shadow-xl ring-2 ring-emerald-500/20">
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl">
                  <IconComponent className="h-8 w-8 text-white" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold" data-testid="text-agent-name">{activeAgent.name}</h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-sm px-3">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Deployed
                  </Badge>
                </div>
                <p className="text-base text-muted-foreground mb-2">{activeAgent.domain}</p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Hydra L2 Active
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    Instant Payments
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={closeAgentChat}
              className="h-12 w-12 rounded-xl hover:bg-destructive/10"
              data-testid="button-close-agent-chat"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-8" ref={scrollRef}>
            <div className="space-y-8 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-5",
                    message.sender === "user" ? "flex-row-reverse" : ""
                  )}
                  data-testid={`message-${message.id}`}
                >
                  {message.sender === "agent" && (
                    <Avatar className="h-12 w-12 rounded-xl shrink-0 shadow-lg ring-2 ring-emerald-500/20">
                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                        <IconComponent className="h-6 w-6 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("flex flex-col max-w-[80%]", message.sender === "user" ? "items-end" : "")}>
                    <div
                      className={cn(
                        "rounded-2xl px-6 py-4 text-base leading-relaxed shadow-sm",
                        message.sender === "user"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                          : "bg-muted/80 border border-border/50"
                      )}
                    >
                      {message.content}
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 px-2">{message.timestamp}</span>
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-5">
                  <Avatar className="h-12 w-12 rounded-xl shrink-0 shadow-lg ring-2 ring-emerald-500/20">
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                      <IconComponent className="h-6 w-6 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-4 bg-muted/80 border border-border/50 rounded-2xl px-6 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                    <span className="text-base text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-8 border-t border-emerald-500/10 bg-gradient-to-r from-muted/50 via-transparent to-muted/50 rounded-b-3xl">
            <div className="flex gap-4 max-w-3xl mx-auto">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${activeAgent.name} anything...`}
                disabled={chatMutation.isPending}
                className="h-14 text-lg px-6 rounded-xl border-emerald-500/20 focus:border-emerald-500/40 focus:ring-emerald-500/20"
                data-testid="input-agent-message"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                className="h-14 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                data-testid="button-send-agent-message"
              >
                <Send className="h-5 w-5 mr-2" />
                Send
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-500" />
                Secured by Cardano
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-teal-500" />
                Hydra L2 Micropayments
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
