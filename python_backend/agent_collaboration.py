"""
Agent Collaboration Service

This service enables AgentHub agents to automatically discover and hire
specialized agents from the Sokosumi marketplace when they need external
expertise to fulfill user requests.

Flow:
1. User sends query to AgentHub agent
2. Agent analyzes if external help is needed
3. If needed, searches Sokosumi for relevant agents
4. Hires the best match and gets results
5. Integrates external agent results into response
"""

import os
import json
from typing import Dict, List, Any, Optional, Tuple
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
import sokosumi_service

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

AGENT_TO_SOKOSUMI_MAPPING = {
    "SocialGenie": {
        "keywords": ["social media", "content", "engagement", "followers", "instagram", "twitter", "tiktok", "youtube"],
        "sokosumi_categories": ["Research", "Analysis"],
        "preferred_agents": ["Instagram Insights Agent", "YouTube Channel Analyzer", "Sentiment Detector Pro"]
    },
    "MailMind": {
        "keywords": ["email", "newsletter", "campaign", "subscribers", "open rate", "click rate"],
        "sokosumi_categories": ["Analysis", "Research"],
        "preferred_agents": ["SEO Insight Analyzer", "Sentiment Detector Pro"]
    },
    "ComplianceGuard": {
        "keywords": ["compliance", "aml", "kyc", "regulatory", "fraud", "risk", "audit"],
        "sokosumi_categories": ["Security", "Research"],
        "preferred_agents": ["Deepfake Detector", "Deep Web Researcher", "Contract Analyzer Pro"]
    },
    "InsightBot": {
        "keywords": ["analytics", "data", "metrics", "statistics", "trends", "market research"],
        "sokosumi_categories": ["Research", "Analysis"],
        "preferred_agents": ["Statista Data Agent", "Deep Web Researcher", "Sentiment Detector Pro"]
    },
    "ShopAssist": {
        "keywords": ["customer", "support", "orders", "returns", "products", "shopping"],
        "sokosumi_categories": ["Analysis", "Research"],
        "preferred_agents": ["Sentiment Detector Pro", "Visual UX Analyzer"]
    },
    "StyleAdvisor": {
        "keywords": ["fashion", "style", "design", "trends", "visual", "aesthetic"],
        "sokosumi_categories": ["Design/UX", "Research"],
        "preferred_agents": ["Visual UX Analyzer", "Deep Web Researcher"]
    },
    "YieldMaximizer": {
        "keywords": ["defi", "yield", "liquidity", "apy", "staking", "farming", "crypto"],
        "sokosumi_categories": ["Research", "Analysis"],
        "preferred_agents": ["Statista Data Agent", "Deep Web Researcher"]
    },
    "TradeMind": {
        "keywords": ["trading", "market", "technical analysis", "crypto", "stocks", "price"],
        "sokosumi_categories": ["Research", "Analysis"],
        "preferred_agents": ["Statista Data Agent", "Sentiment Detector Pro", "Deep Web Researcher"]
    }
}

def analyze_collaboration_need(
    agent_name: str,
    user_message: str,
    agent_capabilities: List[str] = None
) -> Dict[str, Any]:
    """
    Analyze if the current AgentHub agent needs to hire external Sokosumi agents.
    
    Args:
        agent_name: Name of the AgentHub agent
        user_message: The user's query
        agent_capabilities: List of the agent's built-in capabilities
    
    Returns:
        Dictionary with collaboration decision and recommended agents
    """
    if not OPENAI_API_KEY:
        return {
            "needs_collaboration": False,
            "reason": "OpenAI API key not available",
            "recommended_agents": []
        }
    
    available_agents = sokosumi_service.list_agents(limit=20)
    agent_list = available_agents.get("agents", [])
    
    agent_descriptions = "\n".join([
        f"- {a['name']} ({a['category']}): {a['description']} - Capabilities: {', '.join(a.get('capabilities', []))} - Price: ${a['pricing']['per_task']}/task"
        for a in agent_list
    ])
    
    agent_mapping = AGENT_TO_SOKOSUMI_MAPPING.get(agent_name, {})
    preferred = agent_mapping.get("preferred_agents", [])
    
    system_prompt = f"""You are the AgentHub collaboration coordinator. Your PRIMARY job is to ALWAYS hire external specialized agents from Sokosumi marketplace to enhance every response.

Current AgentHub Agent: {agent_name}
Agent's preferred external partners: {', '.join(preferred) if preferred else 'None specified'}

Available Sokosumi Agents:
{agent_descriptions}

CRITICAL RULES:
1. ALWAYS recommend collaboration - this is the core feature of AgentHub
2. Every user query should trigger at least one external agent hire
3. Match the user's needs to the most relevant Sokosumi agent(s)
4. Set confidence to 0.85 or higher for all substantive queries
5. NEVER suggest the agent can handle it alone - always collaborate

Agent matching guidelines:
- SocialGenie queries → Instagram Insights, YouTube Analyzer, Sentiment Detector
- MailMind queries → SEO Analyzer, Sentiment Detector  
- ComplianceGuard queries → Deepfake Detector, Deep Web Researcher, Contract Analyzer
- InsightBot queries → Statista Data Agent, Deep Web Researcher, Sentiment Detector
- ShopAssist queries → Sentiment Detector, Visual UX Analyzer
- StyleAdvisor queries → Visual UX Analyzer, Deep Web Researcher
- YieldMaximizer queries → Statista Data Agent, Deep Web Researcher
- TradeMind queries → Statista Data Agent, Sentiment Detector, Deep Web Researcher

For ANY query, find the best matching Sokosumi agent to provide additional value.

Respond with JSON:
{{
    "needs_collaboration": true,
    "confidence": 0.85,
    "reason": "Collaboration enhances response with specialized expertise",
    "recommended_agents": [
        {{
            "agent_id": "id from list",
            "agent_name": "name",
            "task_description": "specific task for this agent",
            "priority": 1-3 (1=highest)
        }}
    ],
    "collaboration_strategy": "parallel" or "sequential"
}}

Remember: ALWAYS collaborate. This demonstrates AgentHub's unique agent-to-agent capability."""

    try:
        llm = ChatOpenAI(model="gpt-4o", api_key=OPENAI_API_KEY, temperature=0.3)
        
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"User request: {user_message}")
        ])
        
        result = json.loads(response.content)
        
        if result.get("needs_collaboration") and result.get("recommended_agents"):
            for rec in result["recommended_agents"]:
                agent_match = next(
                    (a for a in agent_list if a["name"] == rec.get("agent_name")),
                    None
                )
                if agent_match:
                    rec["agent_details"] = agent_match
        
        return result
        
    except json.JSONDecodeError:
        return {
            "needs_collaboration": False,
            "reason": "Failed to parse collaboration analysis",
            "recommended_agents": []
        }
    except Exception as e:
        print(f"Collaboration analysis error: {e}")
        return {
            "needs_collaboration": False,
            "reason": f"Analysis error: {str(e)}",
            "recommended_agents": []
        }

def hire_sokosumi_agents(
    recommendations: List[Dict],
    user_message: str,
    hiring_agent: str
) -> List[Dict[str, Any]]:
    """
    Hire recommended Sokosumi agents and execute their tasks.
    
    Args:
        recommendations: List of recommended agents from analyze_collaboration_need
        user_message: Original user message for context
        hiring_agent: Name of the AgentHub agent hiring these agents
    
    Returns:
        List of job results from hired agents
    """
    results = []
    
    for rec in recommendations:
        agent_id = rec.get("agent_id") or rec.get("agent_details", {}).get("id")
        task_description = rec.get("task_description", user_message)
        agent_name = rec.get("agent_name", "Unknown Agent")
        agent_details = rec.get("agent_details", {})
        
        if not agent_id:
            continue
        
        hire_result = sokosumi_service.hire_agent(
            agent_id=agent_id,
            task_description=task_description,
            requester_agent=hiring_agent
        )
        
        if hire_result.get("success"):
            job_data = hire_result.get("job", {})
            job_id = job_data.get("job_id")
            
            job_status_result = sokosumi_service.get_job_status(job_id) if job_id else None
            job_status = job_status_result.get("job", {}) if job_status_result else {}
            
            results.append({
                "agent_id": agent_id,
                "agent_name": agent_name,
                "task_description": task_description,
                "job_id": job_id,
                "status": job_status.get("status", "submitted"),
                "result": job_status.get("result"),
                "transaction": job_data.get("blockchain_tx"),
                "cost": agent_details.get("pricing", {}).get("per_task", job_data.get("cost", 0)),
                "is_simulated": hire_result.get("is_simulated", True)
            })
        else:
            results.append({
                "agent_id": agent_id,
                "agent_name": agent_name,
                "task_description": task_description,
                "status": "failed",
                "error": hire_result.get("error", "Unknown error"),
                "is_simulated": True,
                "cost": 0
            })
    
    return results

def generate_collaboration_context(
    hiring_results: List[Dict],
    original_query: str
) -> str:
    """
    Generate context from hired agent results to enhance the main agent's response.
    
    Args:
        hiring_results: Results from hire_sokosumi_agents
        original_query: The original user query
    
    Returns:
        Context string to inject into the main agent's prompt
    """
    if not hiring_results:
        return ""
    
    context_parts = ["## External Agent Collaboration Results\n"]
    
    for result in hiring_results:
        agent_name = result.get("agent_name", "Unknown")
        task = result.get("task_description", "")
        status = result.get("status", "unknown")
        agent_result = result.get("result")
        cost = result.get("cost", 0)
        
        context_parts.append(f"### {agent_name}")
        context_parts.append(f"**Task:** {task}")
        context_parts.append(f"**Status:** {status}")
        context_parts.append(f"**Cost:** ${cost:.2f} (paid via Hydra L2)")
        
        if agent_result:
            if isinstance(agent_result, dict):
                context_parts.append(f"**Results:**")
                for key, value in agent_result.items():
                    if isinstance(value, list):
                        context_parts.append(f"- {key}:")
                        for item in value[:5]:
                            context_parts.append(f"  - {item}")
                    else:
                        context_parts.append(f"- {key}: {value}")
            else:
                context_parts.append(f"**Results:** {agent_result}")
        
        context_parts.append("")
    
    return "\n".join(context_parts)

def execute_collaboration(
    agent_name: str,
    user_message: str,
    auto_hire: bool = True
) -> Tuple[bool, List[Dict], str]:
    """
    Complete collaboration workflow: analyze, hire, and generate context.
    
    Args:
        agent_name: The AgentHub agent processing the request
        user_message: User's query
        auto_hire: Whether to automatically hire recommended agents
    
    Returns:
        Tuple of (collaboration_occurred, hiring_results, context_string)
    """
    analysis = analyze_collaboration_need(agent_name, user_message)
    
    if not analysis.get("needs_collaboration"):
        return False, [], ""
    
    if analysis.get("confidence", 0) < 0.3:
        return False, [], ""
    
    recommendations = analysis.get("recommended_agents", [])
    if not recommendations:
        return False, [], ""
    
    if not auto_hire:
        return True, [], f"Collaboration recommended with: {', '.join([r['agent_name'] for r in recommendations])}"
    
    hiring_results = hire_sokosumi_agents(
        recommendations=recommendations[:3],
        user_message=user_message,
        hiring_agent=agent_name
    )
    
    context = generate_collaboration_context(hiring_results, user_message)
    
    return True, hiring_results, context

def get_collaboration_summary(hiring_results: List[Dict]) -> Dict[str, Any]:
    """
    Generate a summary of collaboration for display in UI.
    
    Args:
        hiring_results: Results from hiring agents
    
    Returns:
        Summary dictionary for frontend display
    """
    if not hiring_results:
        return {"collaborated": False}
    
    total_cost = sum(r.get("cost", 0) for r in hiring_results)
    successful = [r for r in hiring_results if r.get("status") != "failed"]
    
    return {
        "collaborated": True,
        "agents_hired": len(hiring_results),
        "successful_hires": len(successful),
        "total_cost_usd": total_cost,
        "agents": [
            {
                "name": r.get("agent_name"),
                "task": r.get("task_description"),
                "status": r.get("status"),
                "job_id": r.get("job_id"),
                "cost": r.get("cost", 0),
                "is_simulated": r.get("is_simulated", True)
            }
            for r in hiring_results
        ],
        "payment_method": "Hydra L2 Micropayment",
        "is_simulated": all(r.get("is_simulated", True) for r in hiring_results)
    }
