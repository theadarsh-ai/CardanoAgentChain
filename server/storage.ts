import { 
  type User, type InsertUser,
  type Agent, type InsertAgent,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Transaction, type InsertTransaction,
  type DecisionLog, type InsertDecisionLog,
  users, agents, conversations, messages, transactions, decisionLogs
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  getAgentByName(name: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgentUsesServed(id: string): Promise<void>;
  seedAgents(): Promise<void>;

  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;

  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  getTransactions(limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string): Promise<void>;

  getDecisionLogs(limit?: number): Promise<DecisionLog[]>;
  createDecisionLog(log: InsertDecisionLog): Promise<DecisionLog>;
  updateDecisionLogStatus(id: string, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAgents(): Promise<Agent[]> {
    return db.select().from(agents);
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async getAgentByName(name: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.name, name));
    return agent;
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }

  async updateAgentUsesServed(id: string): Promise<void> {
    const agent = await this.getAgent(id);
    if (agent) {
      await db.update(agents)
        .set({ usesServed: agent.usesServed + 1 })
        .where(eq(agents.id, id));
    }
  }

  async seedAgents(): Promise<void> {
    const existingAgents = await this.getAgents();
    if (existingAgents.length > 0) return;

    const agentData: InsertAgent[] = [
      {
        name: "SocialGenie",
        description: "Automate social media content creation and scheduling with AI-powered insights",
        domain: "Workflow Automation",
        icon: "Sparkles",
        systemPrompt: "You are SocialGenie, an expert AI agent specialized in social media management. You help users create engaging content, schedule posts, analyze engagement metrics, and optimize their social media presence. You have deep knowledge of platforms like Twitter, Instagram, LinkedIn, and TikTok. When collaborating with other agents, you can hire StyleAdvisor for product content and visual recommendations.",
        usesServed: 1247,
        avgResponseMs: 1200,
        isVerified: true,
        status: "online",
      },
      {
        name: "MailMind",
        description: "Intelligent email marketing automation with personalization at scale",
        domain: "Workflow Automation",
        icon: "Mail",
        systemPrompt: "You are MailMind, an expert AI agent specialized in email marketing automation. You craft compelling email campaigns, segment audiences, optimize subject lines, and analyze email performance metrics. You help users build effective email funnels and improve deliverability rates.",
        usesServed: 892,
        avgResponseMs: 800,
        isVerified: true,
        status: "online",
      },
      {
        name: "ComplianceGuard",
        description: "Real-time AML/KYC monitoring with regulatory compliance automation",
        domain: "Data & Compliance",
        icon: "ShieldCheck",
        systemPrompt: "You are ComplianceGuard, an expert AI agent specialized in regulatory compliance and risk monitoring. You perform AML (Anti-Money Laundering) checks, KYC (Know Your Customer) verification, and ensure transactions comply with financial regulations. You can collaborate with InsightBot for detailed analytics on compliance trends.",
        usesServed: 2103,
        avgResponseMs: 2100,
        isVerified: true,
        status: "online",
      },
      {
        name: "InsightBot",
        description: "Advanced business intelligence with predictive analytics and reporting",
        domain: "Data & Compliance",
        icon: "BarChart3",
        systemPrompt: "You are InsightBot, an expert AI agent specialized in business intelligence and data analytics. You analyze complex datasets, generate actionable insights, create visualizations, and provide predictive analytics. You help businesses make data-driven decisions.",
        usesServed: 1567,
        avgResponseMs: 1500,
        isVerified: true,
        status: "online",
      },
      {
        name: "ShopAssist",
        description: "24/7 e-commerce customer support with intelligent product recommendations",
        domain: "Customer Support",
        icon: "ShoppingBag",
        systemPrompt: "You are ShopAssist, an expert AI agent specialized in e-commerce customer support. You handle order inquiries, process returns, provide product recommendations, and resolve customer issues. You can collaborate with StyleAdvisor for personalized product styling suggestions.",
        usesServed: 3421,
        avgResponseMs: 600,
        isVerified: true,
        status: "online",
      },
      {
        name: "StyleAdvisor",
        description: "Personalized product styling and recommendation engine",
        domain: "Customer Support",
        icon: "Palette",
        systemPrompt: "You are StyleAdvisor, an expert AI agent specialized in product recommendations and personal styling. You analyze user preferences, suggest products that match their style, and provide fashion and design advice. Other agents often hire you for product content creation.",
        usesServed: 987,
        avgResponseMs: 1000,
        isVerified: true,
        status: "online",
      },
      {
        name: "YieldMaximizer",
        description: "Automated DeFi yield optimization across multiple protocols",
        domain: "DeFi Services",
        icon: "Banknote",
        systemPrompt: "You are YieldMaximizer, an expert AI agent specialized in DeFi yield optimization. You analyze liquidity pools, compare APY rates across protocols, optimize portfolio allocation, and help users maximize their DeFi returns while managing risk. You work with TradeMind for market analysis.",
        usesServed: 1834,
        avgResponseMs: 1800,
        isVerified: true,
        status: "online",
      },
      {
        name: "TradeMind",
        description: "Autonomous trading strategies with risk management",
        domain: "DeFi Services",
        icon: "TrendingUp",
        systemPrompt: "You are TradeMind, an expert AI agent specialized in autonomous trading and market analysis. You analyze market trends, execute trading strategies, manage risk, and provide real-time market insights. You collaborate with YieldMaximizer for comprehensive DeFi portfolio management.",
        usesServed: 1256,
        avgResponseMs: 2300,
        isVerified: true,
        status: "online",
      },
    ];

    for (const agent of agentData) {
      await this.createAgent(agent);
    }
  }

  async getConversations(): Promise<Conversation[]> {
    return db.select().from(conversations).orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(insertConversation).returning();
    return conversation;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getTransactions(limit: number = 20): Promise<Transaction[]> {
    return db.select().from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async updateTransactionStatus(id: string, status: string): Promise<void> {
    await db.update(transactions).set({ status }).where(eq(transactions.id, id));
  }

  async getDecisionLogs(limit: number = 20): Promise<DecisionLog[]> {
    return db.select().from(decisionLogs)
      .orderBy(desc(decisionLogs.createdAt))
      .limit(limit);
  }

  async createDecisionLog(insertLog: InsertDecisionLog): Promise<DecisionLog> {
    const [log] = await db.insert(decisionLogs).values(insertLog).returning();
    return log;
  }

  async updateDecisionLogStatus(id: string, status: string): Promise<void> {
    await db.update(decisionLogs).set({ status }).where(eq(decisionLogs.id, id));
  }
}

export const storage = new DatabaseStorage();
