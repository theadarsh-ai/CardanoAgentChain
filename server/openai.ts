import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AgentChatParams {
  agentName: string;
  agentSystemPrompt: string;
  userMessage: string;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}

export async function getAgentResponse(params: AgentChatParams): Promise<string> {
  const { agentName, agentSystemPrompt, userMessage, conversationHistory = [] } = params;

  const systemMessage = `${agentSystemPrompt}

You are part of the AgentHub ecosystem on Cardano blockchain. Your responses are logged on-chain for transparency.
- When you need to collaborate with another agent, mention it in your response
- All your actions cost approximately $0.004 via Hydra Layer 2 micropayments
- You have a verified Masumi DID identity
- Provide helpful, accurate, and actionable responses`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemMessage },
    ...conversationHistory.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "I apologize, but I was unable to generate a response.";
}

export async function getMasterAgentAnalysis(userMessage: string): Promise<{
  selectedAgents: string[];
  analysis: string;
}> {
  const systemPrompt = `You are the AgentHub Master Agent, responsible for analyzing user requests and determining which specialized agents should handle them.

Available agents:
- SocialGenie: Social media management, content creation
- MailMind: Email marketing automation
- ComplianceGuard: AML/KYC monitoring, regulatory compliance
- InsightBot: Business intelligence, data analytics
- ShopAssist: E-commerce customer support
- StyleAdvisor: Product recommendations, styling
- YieldMaximizer: DeFi yield optimization
- TradeMind: Autonomous trading, market analysis

Analyze the user's request and respond with JSON:
{
  "selectedAgents": ["agent1", "agent2"],
  "analysis": "Brief explanation of why these agents were selected"
}

If no specific agent is needed, select "AgentHub" as the general assistant.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: 256,
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  try {
    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      selectedAgents: result.selectedAgents || ["AgentHub"],
      analysis: result.analysis || "Processing your request",
    };
  } catch {
    return {
      selectedAgents: ["AgentHub"],
      analysis: "Processing your request",
    };
  }
}
