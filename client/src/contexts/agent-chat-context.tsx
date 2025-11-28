import { createContext, useContext, useState, useCallback } from "react";

interface Agent {
  id: string;
  name: string;
  icon: string;
  domain: string;
  systemPrompt?: string;
}

interface AgentChatContextType {
  activeAgent: Agent | null;
  isOpen: boolean;
  openAgentChat: (agent: Agent) => void;
  closeAgentChat: () => void;
  toggleAgentChat: () => void;
}

const AgentChatContext = createContext<AgentChatContextType | null>(null);

export function AgentChatProvider({ children }: { children: React.ReactNode }) {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openAgentChat = useCallback((agent: Agent) => {
    setActiveAgent(agent);
    setIsOpen(true);
  }, []);

  const closeAgentChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleAgentChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <AgentChatContext.Provider
      value={{
        activeAgent,
        isOpen,
        openAgentChat,
        closeAgentChat,
        toggleAgentChat,
      }}
    >
      {children}
    </AgentChatContext.Provider>
  );
}

export function useAgentChat() {
  const context = useContext(AgentChatContext);
  if (!context) {
    throw new Error("useAgentChat must be used within an AgentChatProvider");
  }
  return context;
}
