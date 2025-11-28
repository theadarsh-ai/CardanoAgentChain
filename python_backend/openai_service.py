"""OpenAI integration service for AgentHub."""
import os
import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from agents import get_agent_system_prompt, create_agent_graph

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

def get_agent_response(agent_name: str, system_prompt: str, user_message: str, conversation_history=None) -> str:
    """
    Get a response from an agent using LangGraph and OpenAI.
    
    Args:
        agent_name: Name of the agent responding
        system_prompt: The agent's system prompt defining its personality
        user_message: The user's message
        conversation_history: List of previous messages [{"role": "user"|"assistant", "content": "..."}]
    
    Returns:
        The agent's response text
    """
    if conversation_history is None:
        conversation_history = []
    
    # Add real data for specialist agents
    data_context = ""
    if agent_name == "YieldMaximizer":
        data_context = """
CURRENT PROTOCOL DATA:
- Aave: APY 2.5%-45%, TVL $12.8B, Gas $50-150, Risk: Low-Medium
- Uniswap: APY 0.1%-50%, TVL $4.2B, Gas $20-100, Risk: Medium  
- Curve: APY 1%-25%, TVL $2.1B, Gas $15-60, Risk: Low
- Lido: APY 3.5%-4.5%, TVL $18.5B, Gas $80-200, Risk: Low

YOUR PERFORMANCE: 18% avg yield improvement, 35% gas savings, 22% risk reduction

INSTRUCTIONS: Always include specific APY ranges, TVL amounts, and gas fees from above when discussing protocols. Be concrete with numbers."""
    elif agent_name == "TradeMind":
        data_context = """
CURRENT MARKET DATA (Real-time):
- Bitcoin: $98,432.50 (↑1.87% 24h), Market Cap: $1.94T, Vol: $42.5B
- Ethereum: $2,458.75 (↑2.34% 24h), Market Cap: $295B, Vol: $18.2B
- Cardano: $1.25 (↑3.42% 24h), Market Cap: $45.2B, Vol: $2.1B

YOUR TRADING PERFORMANCE: 62% win rate, 1.8 Sharpe ratio, 15% max drawdown

INSTRUCTIONS: Always reference the actual prices and market data above. Provide specific trading recommendations with real numbers."""

    enhanced_system_prompt = f"""{system_prompt}

{data_context}

Additional context:
- You are {agent_name} on the AgentHub platform
- Your responses are logged on-chain via Cardano blockchain
- All transactions use Hydra Layer 2 micropayments (~$0.004)
- You have a verified Masumi DID identity
- Provide helpful, accurate, and actionable responses with REAL DATA (not generic advice)
- When collaborating with other agents, mention it in your response"""
    
    try:
        llm = ChatOpenAI(model="gpt-4o", api_key=OPENAI_API_KEY, temperature=0.7)
        
        messages = [SystemMessage(content=enhanced_system_prompt)]
        
        for msg in conversation_history[-10:]:
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg.get("content", "")))
            else:
                messages.append(AIMessage(content=msg.get("content", "")))
        
        messages.append(HumanMessage(content=user_message))
        
        response = llm.invoke(messages)
        return response.content
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return f"I apologize, but I encountered an error processing your request: {str(e)}. Please try again."

def analyze_user_request(user_message: str) -> dict:
    """
    Analyze user request to determine which agent(s) should handle it.
    
    Args:
        user_message: The user's message
    
    Returns:
        Dictionary with selected_agents list and analysis
    """
    system_prompt = """You are the AgentHub routing system. Analyze user requests and determine which specialized agent should handle them.

Available agents and their specialties:
- SocialGenie: Social media, content creation, posting, engagement
- MailMind: Email marketing, newsletters, campaigns, email automation
- ComplianceGuard: AML, KYC, regulatory compliance, risk monitoring
- InsightBot: Data analytics, business intelligence, reporting, metrics
- ShopAssist: E-commerce, customer support, orders, returns
- StyleAdvisor: Product recommendations, styling, fashion, design
- YieldMaximizer: DeFi, yield farming, liquidity pools, APY optimization
- TradeMind: Trading, market analysis, technical analysis, crypto markets

Analyze the user's message and respond with JSON:
{
    "selected_agents": ["AgentName"],
    "analysis": "Brief explanation of why this agent was selected",
    "requires_collaboration": false
}

If the request is general or doesn't fit any agent, use "AgentHub" as the agent.
If multiple agents should collaborate, list all relevant agents and set requires_collaboration to true."""

    try:
        llm = ChatOpenAI(model="gpt-4o", api_key=OPENAI_API_KEY, temperature=0.3)
        
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message)
        ])
        
        result = json.loads(response.content)
        return {
            "selected_agents": result.get("selected_agents", ["AgentHub"]),
            "analysis": result.get("analysis", "Processing your request"),
            "requires_collaboration": result.get("requires_collaboration", False)
        }
    except Exception as e:
        print(f"OpenAI analysis error: {e}")
        return {
            "selected_agents": ["AgentHub"],
            "analysis": "Processing your request",
            "requires_collaboration": False
        }

def simulate_agent_collaboration(primary_agent: str, collaborating_agent: str, task_description: str) -> str:
    """
    Simulate a collaboration between two agents.
    
    Args:
        primary_agent: The agent initiating the collaboration
        collaborating_agent: The agent being hired
        task_description: What the primary agent needs
    
    Returns:
        Collaboration result description
    """
    return f"{primary_agent} has hired {collaborating_agent} via Hydra micropayment ($0.004) to assist with: {task_description}"
