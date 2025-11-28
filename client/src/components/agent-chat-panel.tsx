import { useState, useRef, useEffect } from "react";
import { useAgentChat } from "@/contexts/agent-chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, Send, Loader2, Sparkles, Bot, Mail, ShieldCheck, BarChart3, ShoppingBag, Palette, Banknote, TrendingUp, Zap, Shield, Rocket } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

import complianceMeme from "@assets/generated_images/compliance_robot_meme.png";
import dataMeme from "@assets/generated_images/data_analytics_robot_meme.png";
import emailMeme from "@assets/generated_images/email_marketing_robot_meme.png";
import shoppingMeme from "@assets/generated_images/shopping_assistant_robot_meme.png";
import socialMeme from "@assets/generated_images/social_media_robot_meme.png";
import styleMeme from "@assets/generated_images/style_advisor_robot_meme.png";
import tradingMeme from "@assets/generated_images/trading_robot_meme.png";
import yieldMeme from "@assets/generated_images/yield_farming_robot_meme.png";

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
  "Initializing neural networks...",
  "Connecting to Cardano blockchain...",
  "Establishing Hydra L2 channel...",
  "Loading agent capabilities...",
  "Verifying credentials on-chain...",
  "Almost ready to assist you...",
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
      }, 800);
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
        content: `Hello! I'm ${activeAgent.name}, your specialized ${activeAgent.domain} assistant. How can I help you today?`,
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
          className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          data-testid="overlay-deploying"
        />
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-testid="panel-deploying-container"
        >
          <div
            className={cn(
              "w-full max-w-lg bg-background border rounded-2xl shadow-2xl flex flex-col items-center p-8 transition-all duration-300",
              "scale-100 opacity-100"
            )}
            data-testid="panel-deploying"
          >
            <div className="relative mb-6">
              {memeImage ? (
                <img 
                  src={memeImage} 
                  alt={`${activeAgent.name} meme`}
                  className="w-64 h-64 object-contain rounded-xl"
                  data-testid="img-deploy-meme"
                />
              ) : (
                <div className="w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                  <IconComponent className="h-24 w-24 text-emerald-500" />
                </div>
              )}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm">
                  <Rocket className="h-4 w-4 mr-2 animate-bounce" />
                  Deploying
                </Badge>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2" data-testid="text-deploying-name">
              {activeAgent.name}
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              {activeAgent.domain}
            </p>

            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              <span className="text-base text-muted-foreground animate-pulse">
                {deployMessages[deployMessageIndex]}
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${((deployMessageIndex + 1) / deployMessages.length) * 100}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Establishing secure connection via Hydra Layer 2
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={closeAgentChat}
        data-testid="overlay-agent-chat"
      />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        data-testid="panel-agent-chat-container"
      >
        <div
          className={cn(
            "w-full max-w-3xl h-[85vh] max-h-[800px] bg-background border rounded-2xl shadow-2xl flex flex-col transition-all duration-300",
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
          data-testid="panel-agent-chat"
        >
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-2xl">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 rounded-xl shadow-lg">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                  <IconComponent className="h-7 w-7 text-white" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold" data-testid="text-agent-name">{activeAgent.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Deployed
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activeAgent.domain}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-emerald-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    Hydra L2
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={closeAgentChat}
              className="h-10 w-10"
              data-testid="button-close-agent-chat"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.sender === "user" ? "flex-row-reverse" : ""
                  )}
                  data-testid={`message-${message.id}`}
                >
                  {message.sender === "agent" && (
                    <Avatar className="h-10 w-10 rounded-lg shrink-0 shadow-md">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                        <IconComponent className="h-5 w-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("flex flex-col max-w-[75%]", message.sender === "user" ? "items-end" : "")}>
                    <div
                      className={cn(
                        "rounded-xl px-4 py-3 text-base leading-relaxed",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.content}
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{message.timestamp}</span>
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 rounded-lg shrink-0 shadow-md">
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                      <IconComponent className="h-5 w-5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                    <span className="text-base text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-muted/30 rounded-b-2xl">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${activeAgent.name} anything...`}
                disabled={chatMutation.isPending}
                className="h-12 text-base px-4"
                data-testid="input-agent-message"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                className="h-12 w-12"
                data-testid="button-send-agent-message"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Powered by Cardano blockchain with Hydra Layer 2 micropayments
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
