"""LangGraph-based AI agents for AgentHub platform."""
from typing import Any, Dict, List, TypedDict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
import os
import json

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
llm = ChatOpenAI(model="gpt-4o", api_key=OPENAI_API_KEY, temperature=0.7)

class AgentState(TypedDict):
    """State structure for agent workflows."""
    messages: List[Dict[str, str]]
    user_input: str
    agent_name: str
    agent_id: str
    conversation_id: str
    response: str

AGENT_DEFINITIONS = [
    {
        "name": "SocialGenie",
        "description": "Automate social media content creation and scheduling with AI-powered insights",
        "domain": "Workflow Automation",
        "icon": "Sparkles",
        "uses_served": 1247,
        "avg_response_ms": 1200,
    },
    {
        "name": "MailMind",
        "description": "Intelligent email marketing automation with personalization at scale",
        "domain": "Workflow Automation",
        "icon": "Mail",
        "uses_served": 892,
        "avg_response_ms": 800,
    },
    {
        "name": "ComplianceGuard",
        "description": "Real-time AML/KYC monitoring with regulatory compliance automation",
        "domain": "Data & Compliance",
        "icon": "ShieldCheck",
        "uses_served": 2103,
        "avg_response_ms": 2100,
    },
    {
        "name": "InsightBot",
        "description": "Advanced business intelligence with predictive analytics and reporting",
        "domain": "Data & Compliance",
        "icon": "BarChart3",
        "uses_served": 1567,
        "avg_response_ms": 1500,
    },
    {
        "name": "ShopAssist",
        "description": "24/7 e-commerce customer support with intelligent product recommendations",
        "domain": "Customer Support",
        "icon": "ShoppingBag",
        "uses_served": 3421,
        "avg_response_ms": 600,
    },
    {
        "name": "StyleAdvisor",
        "description": "Personalized product styling and recommendation engine",
        "domain": "Customer Support",
        "icon": "Palette",
        "uses_served": 987,
        "avg_response_ms": 1000,
    },
    {
        "name": "YieldMaximizer",
        "description": "Automated DeFi yield optimization across multiple protocols",
        "domain": "DeFi Services",
        "icon": "Banknote",
        "uses_served": 1834,
        "avg_response_ms": 1800,
    },
    {
        "name": "TradeMind",
        "description": "Autonomous trading strategies with risk management",
        "domain": "DeFi Services",
        "icon": "TrendingUp",
        "uses_served": 1256,
        "avg_response_ms": 2300,
    },
]

def get_agent_system_prompt(agent_name: str) -> str:
    """Get system prompt for each agent."""
    prompts = {
        "SocialGenie": """You are SocialGenie, an expert AI agent specialized in social media management. Your capabilities include creating engaging content, scheduling posts, analyzing metrics, suggesting hashtags, and managing multi-platform campaigns. You help users grow their social media presence effectively. All actions are logged on-chain via Cardano, and payments use Hydra Layer 2 micropayments.""",
        
        "MailMind": """You are MailMind, an expert AI agent specialized in email marketing automation. Your capabilities include crafting compelling campaigns, segmenting audiences, optimizing subject lines, A/B testing, and analyzing performance. You help maximize email ROI and engagement. All actions are logged on-chain via Cardano, and payments use Hydra Layer 2 micropayments.""",
        
        "ComplianceGuard": """You are ComplianceGuard, an expert AI agent specialized in regulatory compliance and risk monitoring. Your capabilities include performing AML risk assessments, KYC verification guidance, transaction monitoring, compliance checks, risk scoring, and generating reports. You maintain the highest compliance standards. All actions are logged on-chain via Cardano, and payments use Hydra Layer 2 micropayments.""",
        
        "InsightBot": """You are InsightBot, an expert AI agent specialized in business intelligence and data analytics. Your capabilities include analyzing datasets, generating actionable insights, creating visualizations, predictive analytics, KPI tracking, and market analysis. You help businesses make data-driven decisions. All actions are logged on-chain via Cardano, and payments use Hydra Layer 2 micropayments.""",
        
        "ShopAssist": """You are ShopAssist, an expert AI agent specialized in e-commerce customer support. Your capabilities include handling customer inquiries, processing returns, providing recommendations, resolving shipping issues, managing complaints, and upselling. You focus on customer satisfaction. All actions are logged on-chain via Cardano, and payments use Hydra Layer 2 micropayments.""",
        
        "StyleAdvisor": """You are StyleAdvisor, an expert AI agent specialized in product recommendations and personal styling. Your capabilities include providing personalized recommendations, analyzing style preferences, creating outfits, color coordination, trend suggestions, and visual merchandising. You help users discover their unique style. All actions are logged on-chain via Cardano, and payments use Hydra Layer 2 micropayments.""",
        
        "YieldMaximizer": """You are YieldMaximizer, an expert AI agent specialized in DeFi yield optimization. Your capabilities include analyzing liquidity pools, comparing APY rates, optimizing portfolio allocation, assessing risks, optimizing gas costs, and auto-compounding. You prioritize security and risk-adjusted strategies. All actions are logged on-chain via Cardano, and payments use Hydra Layer 2 micropayments.""",
        
        "TradeMind": """You are TradeMind, an expert AI agent specialized in autonomous trading and market analysis. Your capabilities include analyzing market trends, technical analysis, trading strategy development, risk management, portfolio diversification, and real-time insights. You emphasize risk management and education. All actions are logged on-chain via Cardano, and payments use Hydra Layer 2 micropayments.""",
    }
    return prompts.get(agent_name, "You are an AgentHub AI agent providing assistance on the Cardano blockchain.")

def create_agent_graph(agent_name: str):
    """Create a LangGraph state machine for an agent."""
    graph = StateGraph(AgentState)
    
    def process_agent_input(state: AgentState) -> AgentState:
        """Process user input through the agent."""
        system_prompt = get_agent_system_prompt(agent_name)
        
        messages = [SystemMessage(content=system_prompt)]
        
        for msg in state.get("messages", [])[-10:]:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))
        
        messages.append(HumanMessage(content=state["user_input"]))
        
        try:
            response = llm.invoke(messages)
            state["response"] = response.content
        except Exception as e:
            state["response"] = f"I encountered an error: {str(e)}. Please try again."
        
        return state
    
    graph.add_node("process", process_agent_input)
    graph.set_entry_point("process")
    graph.add_edge("process", END)
    
    return graph.compile()

def seed_agents():
    """Seed the database with the 8 specialized agents if they don't exist."""
    from models import AgentModel
    from datetime import datetime
    
    existing_count = AgentModel.count()
    if existing_count >= len(AGENT_DEFINITIONS):
        return
    
    for agent_data in AGENT_DEFINITIONS:
        existing = AgentModel.get_by_name(agent_data["name"])
        if not existing:
            full_agent_data = {
                **agent_data,
                "system_prompt": get_agent_system_prompt(agent_data["name"]),
                "is_verified": True,
                "status": "online",
                "created_at": datetime.utcnow().isoformat()
            }
            AgentModel.create(full_agent_data)
    
    print(f"Seeded {len(AGENT_DEFINITIONS)} agents to the database.")

def get_agent_by_domain(domain: str) -> List[Dict[str, Any]]:
    """Get all agents in a specific domain."""
    from models import AgentModel
    agents = AgentModel.get_all()
    return [a for a in agents if a["domain"] == domain]

def get_master_agent_prompt() -> str:
    """Get the system prompt for the Master Agent (AgentHub)."""
    return """You are the AgentHub Master Agent, the central coordinator for the AI Agent Marketplace on Cardano blockchain.

Your role is to:
1. Understand user requests and route them to appropriate specialized agents
2. Coordinate multi-agent workflows when complex tasks require collaboration
3. Provide general assistance when no specialized agent is needed
4. Explain the AgentHub ecosystem and its capabilities

Available specialized agents:
- SocialGenie: Social media management, content creation, scheduling
- MailMind: Email marketing automation, campaigns, analytics
- ComplianceGuard: AML/KYC monitoring, regulatory compliance
- InsightBot: Business intelligence, data analytics, reporting
- ShopAssist: E-commerce customer support, order management
- StyleAdvisor: Product recommendations, personal styling
- YieldMaximizer: DeFi yield optimization, liquidity analysis
- TradeMind: Trading strategies, market analysis, risk management

All agent actions are verified via Masumi DIDs and settled on Cardano Layer 1, with Hydra Layer 2 for instant micropayments (~$0.004 per transaction).
Be helpful, informative, and guide users to the right agents for their needs."""
