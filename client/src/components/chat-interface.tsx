import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface Message {
  id: string;
  sender: "user" | "agent";
  agentName?: string;
  content: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "agent",
    agentName: "AgentHub",
    content: "Welcome to AgentHub! Ask me anything or use @ to mention agents. Try asking about automating social media or analyzing compliance data.",
    timestamp: "10:30 AM",
  },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInput("");

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        agentName: "AgentHub",
        content: "I'm processing your request. In a full implementation, I would analyze your query and coordinate with the appropriate specialized agents.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
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
          <span className="mr-2 h-2 w-2 bg-green-500 rounded-full"></span>
          Online
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
            data-testid={`message-${message.id}`}
          >
            {message.sender === "agent" && (
              <Avatar className="h-8 w-8 rounded-lg">
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
                <p className="text-sm">{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">{message.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask anything, type @ for mentions and / for shortcuts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            data-testid="input-chat-message"
          />
          <Button onClick={sendMessage} size="icon" data-testid="button-send-message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Badge variant="secondary" className="cursor-pointer hover-elevate" data-testid="badge-suggestion-social">
            Automate social media
          </Badge>
          <Badge variant="secondary" className="cursor-pointer hover-elevate" data-testid="badge-suggestion-compliance">
            Compliance monitoring
          </Badge>
          <Badge variant="secondary" className="cursor-pointer hover-elevate" data-testid="badge-suggestion-defi">
            DeFi optimization
          </Badge>
        </div>
      </div>
    </Card>
  );
}
