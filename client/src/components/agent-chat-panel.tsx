import { useState, useRef, useEffect } from "react";
import { useAgentChat } from "@/contexts/agent-chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Send, Loader2, Sparkles, Bot, Mail, ShieldCheck, BarChart3, ShoppingBag, Palette, Banknote, TrendingUp } from "lucide-react";
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
    <div
      className={cn(
        "fixed right-0 top-0 h-screen w-96 bg-card border-l shadow-xl z-50 flex flex-col transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      data-testid="panel-agent-chat"
    >
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-lg shadow-md">
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <IconComponent className="h-5 w-5 text-white" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold" data-testid="text-agent-name">{activeAgent.name}</h3>
            <p className="text-xs text-muted-foreground">{activeAgent.domain}</p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={closeAgentChat}
          data-testid="button-close-agent-chat"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.sender === "user" ? "flex-row-reverse" : ""
              )}
              data-testid={`message-${message.id}`}
            >
              {message.sender === "agent" && (
                <Avatar className="h-8 w-8 rounded-lg shrink-0 shadow-sm">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-xs">
                    <IconComponent className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn("flex flex-col max-w-[80%]", message.sender === "user" ? "items-end" : "")}>
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
                <span className="text-xs text-muted-foreground mt-1">{message.timestamp}</span>
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 rounded-lg shrink-0 shadow-sm">
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-xs">
                  <IconComponent className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${activeAgent.name}...`}
            disabled={chatMutation.isPending}
            data-testid="input-agent-message"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            data-testid="button-send-agent-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
