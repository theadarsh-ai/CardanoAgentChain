import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message, Conversation } from "@shared/schema";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  agentName?: string | null;
  content: string;
  timestamp: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "agent",
      agentName: "AgentHub",
      content: "Welcome to AgentHub! Ask me anything or use @ to mention specific agents. I'll route your request to the right specialized AI agent. Try asking about automating social media, analyzing compliance data, or optimizing DeFi yields.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        title: "New Chat",
      });
      return response.json() as Promise<Conversation>;
    },
    onSuccess: (data) => {
      setConversationId(data.id);
    },
  });

  const chatMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      const response = await apiRequest("POST", "/api/chat", {
        conversationId,
        message,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const agentMessage: ChatMessage = {
        id: data.agentMessage.id,
        sender: "agent",
        agentName: data.selectedAgent,
        content: data.agentMessage.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMessage]);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/decision-logs"] });
    },
    onError: () => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "agent",
        agentName: "AgentHub",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMessage]);
    const messageContent = input;
    setInput("");

    let convId = conversationId;
    if (!convId) {
      const conversation = await createConversationMutation.mutateAsync();
      convId = conversation.id;
    }

    chatMutation.mutate({ conversationId: convId, message: messageContent });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <Card className="flex flex-col h-[600px]" data-testid="card-chat-interface">
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar className="h-10 w-10 rounded-lg">
          <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-pink-500">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">AgentHub Assistant</h3>
          <p className="text-sm text-muted-foreground">Powered by Cardano & Hydra Layer 2</p>
        </div>
        <Badge className="ml-auto" variant="outline" data-testid="badge-chat-status">
          <span className="mr-2 h-2 w-2 inline-block bg-green-500 rounded-full"></span>
          Online
        </Badge>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
              data-testid={`message-${message.id}`}
            >
              {message.sender === "agent" && (
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-pink-500 text-xs">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col ${message.sender === "user" ? "items-end" : ""} max-w-[70%]`}>
                {message.sender === "agent" && message.agentName && (
                  <span className="text-xs text-muted-foreground mb-1">{message.agentName}</span>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{message.timestamp}</span>
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 rounded-lg shrink-0">
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-pink-500 text-xs">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask anything, type @ for mentions and / for shortcuts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={chatMutation.isPending}
            data-testid="input-chat-message"
          />
          <Button 
            onClick={sendMessage} 
            size="icon" 
            disabled={chatMutation.isPending || !input.trim()}
            data-testid="button-send-message"
          >
            {chatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover-elevate" 
            onClick={() => handleSuggestionClick("Help me automate my social media posts for better engagement")}
            data-testid="badge-suggestion-social"
          >
            Automate social media
          </Badge>
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover-elevate" 
            onClick={() => handleSuggestionClick("Check my transactions for AML/KYC compliance")}
            data-testid="badge-suggestion-compliance"
          >
            Compliance monitoring
          </Badge>
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover-elevate" 
            onClick={() => handleSuggestionClick("Optimize my DeFi yield across protocols")}
            data-testid="badge-suggestion-defi"
          >
            DeFi optimization
          </Badge>
        </div>
      </div>
    </Card>
  );
}
