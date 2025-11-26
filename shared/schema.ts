import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  domain: text("domain").notNull(),
  icon: text("icon").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  usesServed: integer("uses_served").notNull().default(0),
  avgResponseMs: integer("avg_response_ms").notNull().default(1000),
  isVerified: boolean("is_verified").notNull().default(true),
  status: text("status").notNull().default("online"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  title: text("title").notNull().default("New Conversation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  sender: text("sender").notNull(),
  agentId: varchar("agent_id").references(() => agents.id),
  agentName: text("agent_name"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromAgentId: varchar("from_agent_id").references(() => agents.id),
  toAgentId: varchar("to_agent_id").references(() => agents.id),
  fromAgentName: text("from_agent_name").notNull(),
  toAgentName: text("to_agent_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 6 }).notNull().default("0.004"),
  txHash: text("tx_hash").notNull(),
  status: text("status").notNull().default("pending"),
  layer: text("layer").notNull().default("hydra"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export const decisionLogs = pgTable("decision_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => agents.id),
  agentName: text("agent_name").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  txHash: text("tx_hash").notNull(),
  status: text("status").notNull().default("pending"),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDecisionLogSchema = createInsertSchema(decisionLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertDecisionLog = z.infer<typeof insertDecisionLogSchema>;
export type DecisionLog = typeof decisionLogs.$inferSelect;
