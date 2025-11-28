import { useState, useRef, useEffect } from "react";
import { useAgentChat } from "@/contexts/agent-chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, Send, Loader2, Sparkles, Bot, Mail, ShieldCheck, BarChart3, ShoppingBag, Palette, Banknote, TrendingUp, Zap, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

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

export default function AgentChatPanel() {
  const { activeAgent, isOpen, closeAgentChat } = useAgentChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const IconComponent = activeAgent?.icon ? iconMap[activeAgent.icon] || Bot : Bot;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (activeAgent) {
      setMessages([{
        id: "welcome",
        content: `Hello! I'm ${activeAgent.name}, your specialized ${activeAgent.domain} assistant. How can I help you today?`,
        sender: "agent",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
  }, [activeAgent?.id]);

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

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={closeAgentChat}
        data-testid="overlay-agent-chat"
      />
      <div
        className={cn(
          "fixed right-0 top-0 h-screen w-full md:w-[600px] lg:w-[700px] bg-background border-l shadow-2xl z-50 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        data-testid="panel-agent-chat"
      >
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
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

        <div className="p-6 border-t bg-muted/30">
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
    </>
  );
}
