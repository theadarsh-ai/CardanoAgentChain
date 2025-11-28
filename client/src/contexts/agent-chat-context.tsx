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
  isDeploying: boolean;
  openAgentChat: (agent: Agent) => void;
  closeAgentChat: () => void;
  toggleAgentChat: () => void;
  startDeploying: (agent: Agent) => void;
  finishDeploying: () => void;
}

const AgentChatContext = createContext<AgentChatContextType | null>(null);

export function AgentChatProvider({ children }: { children: React.ReactNode }) {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const openAgentChat = useCallback((agent: Agent) => {
    setActiveAgent(agent);
    setIsDeploying(false);
    setIsOpen(true);
  }, []);

  const startDeploying = useCallback((agent: Agent) => {
    setActiveAgent(agent);
    setIsDeploying(true);
    setIsOpen(true);
  }, []);

  const finishDeploying = useCallback(() => {
    setIsDeploying(false);
  }, []);

  const closeAgentChat = useCallback(() => {
    setIsOpen(false);
    setIsDeploying(false);
  }, []);

  const toggleAgentChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <AgentChatContext.Provider
      value={{
        activeAgent,
        isOpen,
        isDeploying,
        openAgentChat,
        closeAgentChat,
        toggleAgentChat,
        startDeploying,
        finishDeploying,
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
