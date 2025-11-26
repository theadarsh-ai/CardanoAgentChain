import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAgentResponse, getMasterAgentAnalysis } from "./openai";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { randomUUID } from "crypto";

function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function truncateTxHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await storage.seedAgents();

  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ error: "Failed to fetch agent" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const conversation = await storage.createConversation({
        userId: req.body.userId || null,
        title: req.body.title || "New Conversation",
      });
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { conversationId, message, agentName } = req.body;

      if (!conversationId || !message) {
        return res.status(400).json({ error: "conversationId and message are required" });
      }

      const userMessage = await storage.createMessage({
        conversationId,
        sender: "user",
        content: message,
        agentId: null,
        agentName: null,
      });

      let selectedAgent = null;
      let agentSystemPrompt = "";
      let responseAgentName = "AgentHub";

      if (agentName && agentName !== "AgentHub") {
        selectedAgent = await storage.getAgentByName(agentName);
        if (selectedAgent) {
          agentSystemPrompt = selectedAgent.systemPrompt;
          responseAgentName = selectedAgent.name;
        }
      }

      if (!selectedAgent) {
        const analysis = await getMasterAgentAnalysis(message);
        
        if (analysis.selectedAgents.length > 0 && analysis.selectedAgents[0] !== "AgentHub") {
          selectedAgent = await storage.getAgentByName(analysis.selectedAgents[0]);
          if (selectedAgent) {
            agentSystemPrompt = selectedAgent.systemPrompt;
            responseAgentName = selectedAgent.name;
          }
        }
      }

      if (!selectedAgent) {
        agentSystemPrompt = "You are the AgentHub Master Agent, a helpful AI assistant that coordinates specialized agents on the Cardano blockchain. You can help with general questions and direct users to specialized agents when needed.";
      }

      const conversationHistory = await storage.getMessagesByConversation(conversationId);
      const formattedHistory = conversationHistory
        .slice(-10)
        .map(m => ({
          role: m.sender as "user" | "assistant",
          content: m.content,
        }));

      const responseContent = await getAgentResponse({
        agentName: responseAgentName,
        agentSystemPrompt,
        userMessage: message,
        conversationHistory: formattedHistory,
      });

      const agentMessage = await storage.createMessage({
        conversationId,
        sender: "agent",
        content: responseContent,
        agentId: selectedAgent?.id || null,
        agentName: responseAgentName,
      });

      if (selectedAgent) {
        await storage.updateAgentUsesServed(selectedAgent.id);
      }

      const txHash = generateTxHash();
      await storage.createDecisionLog({
        agentId: selectedAgent?.id || null,
        agentName: responseAgentName,
        action: `Processed user request: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`,
        details: JSON.stringify({ userMessage: message, response: responseContent.slice(0, 200) }),
        txHash: truncateTxHash(txHash),
        status: "confirmed",
        conversationId,
      });

      setTimeout(async () => {
        const txHash2 = generateTxHash();
        await storage.createTransaction({
          fromAgentId: null,
          toAgentId: selectedAgent?.id || null,
          fromAgentName: "User",
          toAgentName: responseAgentName,
          amount: "0.004",
          txHash: truncateTxHash(txHash2),
          status: "confirmed",
          layer: "hydra",
        });
      }, 100);

      res.json({
        userMessage,
        agentMessage,
        selectedAgent: responseAgentName,
      });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const transactions = await storage.getTransactions(limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/decision-logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const logs = await storage.getDecisionLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching decision logs:", error);
      res.status(500).json({ error: "Failed to fetch decision logs" });
    }
  });

  app.get("/api/metrics", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      const transactions = await storage.getTransactions(1000);
      const logs = await storage.getDecisionLogs(1000);

      const totalUsesServed = agents.reduce((sum, a) => sum + a.usesServed, 0);
      const totalTransactions = transactions.length;
      const totalCost = (totalTransactions * 0.004).toFixed(3);

      res.json({
        systemLayers: 7,
        specializedAgents: agents.length,
        agentDomains: 4,
        throughput: "1000+ TPS",
        costPerService: "~$0.004",
        platformFee: "10%",
        onChain: "100%",
        totalUsesServed,
        totalTransactions,
        totalCost: `$${totalCost}`,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.post("/api/agents/:id/deploy", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      const txHash = generateTxHash();
      await storage.createDecisionLog({
        agentId: agent.id,
        agentName: agent.name,
        action: `Agent deployed to workspace`,
        details: JSON.stringify({ deployedAt: new Date().toISOString() }),
        txHash: truncateTxHash(txHash),
        status: "confirmed",
        conversationId: null,
      });

      res.json({
        success: true,
        message: `${agent.name} deployed successfully`,
        txHash: truncateTxHash(txHash),
      });
    } catch (error) {
      console.error("Error deploying agent:", error);
      res.status(500).json({ error: "Failed to deploy agent" });
    }
  });

  return httpServer;
}
