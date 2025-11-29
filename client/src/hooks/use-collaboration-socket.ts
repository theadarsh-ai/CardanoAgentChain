import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface CollaborationEvent {
  type: "agent_hiring" | "agent_working" | "agent_completed" | "collaboration_start" | "collaboration_complete";
  data: {
    agent_name?: string;
    agent_id?: string;
    job_id?: string;
    task?: string;
    status?: string;
    cost?: number;
    hiring_agent?: string;
    result_preview?: string;
    index?: number;
  };
  timestamp: string;
}

export interface LiveAgent {
  name: string;
  status: "hiring" | "in_progress" | "completed";
  task?: string;
  cost?: number;
  job_id?: string;
}

export function useCollaborationSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [liveAgents, setLiveAgents] = useState<LiveAgent[]>([]);
  const [events, setEvents] = useState<CollaborationEvent[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const backendUrl = window.location.origin.replace(':5000', ':5001');
    
    const socket = io(backendUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[WebSocket] Connected to collaboration updates");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setIsConnected(false);
    });

    socket.on("connected", (data) => {
      console.log("[WebSocket] Server acknowledged:", data);
    });

    socket.on("collaboration_update", (event: CollaborationEvent) => {
      console.log("[WebSocket] Collaboration update:", event);
      setEvents((prev) => [...prev, event]);

      const { type, data } = event;

      if (type === "agent_hiring" && data.agent_name) {
        setLiveAgents((prev) => {
          const existing = prev.find((a) => a.name === data.agent_name);
          if (existing) {
            return prev.map((a) =>
              a.name === data.agent_name
                ? { ...a, status: "hiring" as const, task: data.task, cost: data.cost }
                : a
            );
          }
          return [
            ...prev,
            {
              name: data.agent_name,
              status: "hiring" as const,
              task: data.task,
              cost: data.cost,
            },
          ];
        });
      }

      if (type === "agent_working" && data.agent_name) {
        setLiveAgents((prev) =>
          prev.map((a) =>
            a.name === data.agent_name
              ? { ...a, status: "in_progress" as const, job_id: data.job_id }
              : a
          )
        );
      }

      if (type === "agent_completed" && data.agent_name) {
        setLiveAgents((prev) =>
          prev.map((a) =>
            a.name === data.agent_name
              ? { ...a, status: "completed" as const, cost: data.cost }
              : a
          )
        );
      }
    });

    socket.on("connect_error", (error) => {
      console.log("[WebSocket] Connection error:", error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const clearLiveAgents = useCallback(() => {
    setLiveAgents([]);
    setEvents([]);
  }, []);

  const subscribeToConversation = useCallback((conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("subscribe_collaboration", { conversation_id: conversationId });
    }
  }, []);

  return {
    isConnected,
    liveAgents,
    events,
    clearLiveAgents,
    subscribeToConversation,
  };
}
