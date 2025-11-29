"""
Sokosumi AI Agent Marketplace Service

Sokosumi is an AI Agent Marketplace built on the Masumi Network (Cardano-based).
This service enables AgentHub to hire specialized agents from the Sokosumi marketplace.

API Base URL: https://app.sokosumi.com
"""

import os
import requests
import json
from datetime import datetime
from typing import Optional, Dict, List, Any
import hashlib
import random

SOKOSUMI_API_URL = os.environ.get("SOKOSUMI_API_URL", "https://app.sokosumi.com")
SOKOSUMI_API_KEY = os.environ.get("SOKSUMI_API_KEY", "")

def is_live() -> bool:
    """Check if we have a valid Sokosumi API key for live mode."""
    return bool(SOKOSUMI_API_KEY and len(SOKOSUMI_API_KEY) > 20)

def get_headers() -> Dict[str, str]:
    """Get API headers with authentication."""
    return {
        "Authorization": f"Bearer {SOKOSUMI_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

def generate_job_id() -> str:
    """Generate a unique job ID."""
    timestamp = datetime.now().isoformat()
    random_suffix = hashlib.md5(f"{timestamp}{random.random()}".encode()).hexdigest()[:8]
    return f"job_{random_suffix}"

SIMULATED_SOKOSUMI_AGENTS = [
    {
        "id": "sok_agent_researcher_001",
        "name": "Deep Web Researcher",
        "category": "Research",
        "description": "Advanced web research with verified citations and comprehensive analysis",
        "capabilities": ["web search", "data extraction", "citation verification", "report generation"],
        "pricing": {"per_task": 2.50, "currency": "USD"},
        "rating": 4.8,
        "total_jobs": 1247,
        "verified": True,
        "did": "did:masumi:sok_researcher_8f7a3b2c",
        "response_time_avg": "5-10 minutes"
    },
    {
        "id": "sok_agent_seo_analyst_001",
        "name": "SEO Insight Analyzer",
        "category": "Analysis",
        "description": "Comprehensive SEO analysis with keyword optimization and competitor insights",
        "capabilities": ["keyword analysis", "competitor research", "backlink analysis", "content optimization"],
        "pricing": {"per_task": 3.00, "currency": "USD"},
        "rating": 4.9,
        "total_jobs": 892,
        "verified": True,
        "did": "did:masumi:sok_seo_4c5d6e7f",
        "response_time_avg": "10-15 minutes"
    },
    {
        "id": "sok_agent_sentiment_001",
        "name": "Sentiment Detector Pro",
        "category": "Analysis",
        "description": "Real-time sentiment analysis across social media and news sources",
        "capabilities": ["sentiment scoring", "trend detection", "brand monitoring", "crisis alerts"],
        "pricing": {"per_task": 1.75, "currency": "USD"},
        "rating": 4.7,
        "total_jobs": 2156,
        "verified": True,
        "did": "did:masumi:sok_sentiment_9a8b7c6d",
        "response_time_avg": "2-5 minutes"
    },
    {
        "id": "sok_agent_ux_tester_001",
        "name": "Visual UX Analyzer",
        "category": "Design/UX",
        "description": "AI-powered visual attention heatmaps and UX testing",
        "capabilities": ["heatmap generation", "attention analysis", "usability scoring", "accessibility check"],
        "pricing": {"per_task": 4.00, "currency": "USD"},
        "rating": 4.6,
        "total_jobs": 567,
        "verified": True,
        "did": "did:masumi:sok_ux_2e3f4g5h",
        "response_time_avg": "15-20 minutes"
    },
    {
        "id": "sok_agent_youtube_001",
        "name": "YouTube Channel Analyzer",
        "category": "Research",
        "description": "Deep analysis of YouTube channels, content strategy, and audience insights",
        "capabilities": ["channel analytics", "content analysis", "audience insights", "growth recommendations"],
        "pricing": {"per_task": 2.25, "currency": "USD"},
        "rating": 4.8,
        "total_jobs": 743,
        "verified": True,
        "did": "did:masumi:sok_youtube_6i7j8k9l",
        "response_time_avg": "8-12 minutes"
    },
    {
        "id": "sok_agent_statista_001",
        "name": "Statista Data Agent",
        "category": "Research",
        "description": "Access and analyze Statista datasets for market intelligence",
        "capabilities": ["data queries", "market research", "statistical analysis", "trend forecasting"],
        "pricing": {"per_task": 3.50, "currency": "USD"},
        "rating": 4.9,
        "total_jobs": 1089,
        "verified": True,
        "did": "did:masumi:sok_statista_0m1n2o3p",
        "response_time_avg": "5-8 minutes"
    },
    {
        "id": "sok_agent_deepfake_001",
        "name": "Deepfake Detector",
        "category": "Security",
        "description": "Advanced AI-powered deepfake detection and media authenticity verification",
        "capabilities": ["image analysis", "video verification", "audio authentication", "manipulation detection"],
        "pricing": {"per_task": 5.00, "currency": "USD"},
        "rating": 4.7,
        "total_jobs": 234,
        "verified": True,
        "did": "did:masumi:sok_deepfake_4q5r6s7t",
        "response_time_avg": "10-15 minutes"
    },
    {
        "id": "sok_agent_instagram_001",
        "name": "Instagram Insights Agent",
        "category": "Analysis",
        "description": "Comprehensive Instagram page analysis with engagement metrics and growth strategies",
        "capabilities": ["engagement analysis", "hashtag optimization", "competitor benchmarking", "content scheduling"],
        "pricing": {"per_task": 2.00, "currency": "USD"},
        "rating": 4.8,
        "total_jobs": 1567,
        "verified": True,
        "did": "did:masumi:sok_instagram_8u9v0w1x",
        "response_time_avg": "5-10 minutes"
    }
]

ACTIVE_JOBS: Dict[str, Dict] = {}

def list_agents(category: Optional[str] = None, limit: int = 10) -> Dict[str, Any]:
    """
    List available agents on the Sokosumi marketplace.
    
    Args:
        category: Filter by category (Research, Analysis, Design/UX, Security)
        limit: Maximum number of agents to return
    
    Returns:
        Dict containing agents list and metadata
    """
    if is_live():
        try:
            params = {"limit": limit}
            if category:
                params["category"] = category
            
            response = requests.get(
                f"{SOKOSUMI_API_URL}/api/agents",
                headers=get_headers(),
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "is_live": True,
                    "agents": response.json().get("agents", []),
                    "total": response.json().get("total", 0),
                    "source": "sokosumi_api"
                }
            else:
                print(f"Sokosumi API error: {response.status_code} - {response.text}")
        except requests.RequestException as e:
            print(f"Sokosumi API request failed: {e}")
    
    agents = SIMULATED_SOKOSUMI_AGENTS
    if category:
        agents = [a for a in agents if a["category"].lower() == category.lower()]
    
    return {
        "success": True,
        "is_live": False,
        "is_simulated": True,
        "agents": agents[:limit],
        "total": len(agents),
        "source": "simulation"
    }

def get_agent(agent_id: str) -> Dict[str, Any]:
    """
    Get details of a specific Sokosumi agent.
    
    Args:
        agent_id: The unique agent ID
    
    Returns:
        Dict containing agent details
    """
    if is_live():
        try:
            response = requests.get(
                f"{SOKOSUMI_API_URL}/api/agents/{agent_id}",
                headers=get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "is_live": True,
                    "agent": response.json(),
                    "source": "sokosumi_api"
                }
        except requests.RequestException as e:
            print(f"Sokosumi API request failed: {e}")
    
    for agent in SIMULATED_SOKOSUMI_AGENTS:
        if agent["id"] == agent_id:
            return {
                "success": True,
                "is_live": False,
                "is_simulated": True,
                "agent": agent,
                "source": "simulation"
            }
    
    return {
        "success": False,
        "error": "Agent not found"
    }

def hire_agent(agent_id: str, task_description: str, requester_agent: Optional[str] = None) -> Dict[str, Any]:
    """
    Hire a Sokosumi agent for a specific task.
    
    Args:
        agent_id: The Sokosumi agent to hire
        task_description: Description of the task to perform
        requester_agent: Name of the AgentHub agent making the request
    
    Returns:
        Dict containing job details and status
    """
    if is_live():
        try:
            payload = {
                "agent_id": agent_id,
                "task": task_description,
                "requester": requester_agent or "AgentHub",
                "callback_url": None
            }
            
            response = requests.post(
                f"{SOKOSUMI_API_URL}/api/jobs",
                headers=get_headers(),
                json=payload,
                timeout=15
            )
            
            if response.status_code in [200, 201]:
                job_data = response.json()
                ACTIVE_JOBS[job_data.get("job_id", generate_job_id())] = {
                    **job_data,
                    "is_live": True
                }
                return {
                    "success": True,
                    "is_live": True,
                    "job": job_data,
                    "source": "sokosumi_api"
                }
        except requests.RequestException as e:
            print(f"Sokosumi API request failed: {e}")
    
    agent_result = get_agent(agent_id)
    if not agent_result.get("success"):
        return {"success": False, "error": "Agent not found"}
    
    agent = agent_result["agent"]
    job_id = generate_job_id()
    
    job = {
        "job_id": job_id,
        "agent_id": agent_id,
        "agent_name": agent["name"],
        "task": task_description,
        "requester": requester_agent or "AgentHub",
        "status": "processing",
        "created_at": datetime.now().isoformat(),
        "estimated_completion": agent.get("response_time_avg", "5-10 minutes"),
        "cost": agent["pricing"]["per_task"],
        "currency": agent["pricing"]["currency"],
        "blockchain_tx": f"tx_masumi_{hashlib.md5(job_id.encode()).hexdigest()[:16]}",
        "is_simulated": True
    }
    
    ACTIVE_JOBS[job_id] = job
    
    return {
        "success": True,
        "is_live": False,
        "is_simulated": True,
        "job": job,
        "source": "simulation",
        "activities": [
            {
                "type": "sokosumi_hire",
                "icon": "UserPlus",
                "title": f"Hiring {agent['name']}",
                "description": f"Initiating task via Sokosumi marketplace",
                "details": {
                    "agent_id": agent_id,
                    "agent_did": agent["did"],
                    "cost": f"${agent['pricing']['per_task']} USD",
                    "job_id": job_id
                },
                "status": "pending",
                "is_simulated": True,
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "masumi_payment",
                "icon": "CreditCard",
                "title": "Payment Initiated",
                "description": "Masumi Network payment processing",
                "details": {
                    "amount": f"${agent['pricing']['per_task']} USD",
                    "network": "Masumi/Cardano",
                    "tx_hash": job["blockchain_tx"]
                },
                "status": "processing",
                "is_simulated": True,
                "timestamp": datetime.now().isoformat()
            }
        ]
    }

def get_job_status(job_id: str) -> Dict[str, Any]:
    """
    Get the status of a Sokosumi job.
    
    Args:
        job_id: The job ID to check
    
    Returns:
        Dict containing job status and results if complete
    """
    if is_live() and job_id in ACTIVE_JOBS and ACTIVE_JOBS[job_id].get("is_live"):
        try:
            response = requests.get(
                f"{SOKOSUMI_API_URL}/api/jobs/{job_id}",
                headers=get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                job_data = response.json()
                ACTIVE_JOBS[job_id] = {**ACTIVE_JOBS.get(job_id, {}), **job_data}
                return {
                    "success": True,
                    "is_live": True,
                    "job": job_data,
                    "source": "sokosumi_api"
                }
        except requests.RequestException as e:
            print(f"Sokosumi API request failed: {e}")
    
    if job_id not in ACTIVE_JOBS:
        return {"success": False, "error": "Job not found"}
    
    job = ACTIVE_JOBS[job_id]
    
    if job["status"] == "processing":
        job["status"] = "completed"
        job["completed_at"] = datetime.now().isoformat()
        job["result"] = generate_simulated_result(job)
        ACTIVE_JOBS[job_id] = job
    
    return {
        "success": True,
        "is_live": False,
        "is_simulated": True,
        "job": job,
        "source": "simulation"
    }

def generate_simulated_result(job: Dict) -> Dict[str, Any]:
    """Generate a simulated result based on the agent type and task."""
    agent_id = job.get("agent_id", "")
    task = job.get("task", "")
    
    if "researcher" in agent_id:
        return {
            "type": "research_report",
            "summary": f"Research completed for: {task[:100]}...",
            "findings": [
                "Key insight 1: Market trends indicate growing demand",
                "Key insight 2: Competitor analysis reveals opportunities",
                "Key insight 3: Customer sentiment is predominantly positive"
            ],
            "sources": [
                {"title": "Industry Report 2025", "url": "https://example.com/report1", "relevance": 0.95},
                {"title": "Market Analysis Q4", "url": "https://example.com/report2", "relevance": 0.87}
            ],
            "confidence_score": 0.92
        }
    elif "seo" in agent_id:
        return {
            "type": "seo_analysis",
            "summary": f"SEO analysis completed for: {task[:100]}...",
            "keywords": [
                {"keyword": "primary keyword", "volume": 12000, "difficulty": 45},
                {"keyword": "secondary keyword", "volume": 8500, "difficulty": 38}
            ],
            "recommendations": [
                "Optimize meta descriptions for target keywords",
                "Improve internal linking structure",
                "Create content clusters around main topics"
            ],
            "score": 78
        }
    elif "sentiment" in agent_id:
        return {
            "type": "sentiment_analysis",
            "summary": f"Sentiment analysis completed for: {task[:100]}...",
            "overall_sentiment": "positive",
            "sentiment_score": 0.73,
            "breakdown": {
                "positive": 62,
                "neutral": 28,
                "negative": 10
            },
            "key_topics": ["product quality", "customer service", "pricing"]
        }
    else:
        return {
            "type": "general_analysis",
            "summary": f"Task completed: {task[:100]}...",
            "status": "success",
            "data": {"analysis": "Complete", "quality_score": 0.88}
        }

def list_active_jobs() -> Dict[str, Any]:
    """List all active jobs."""
    return {
        "success": True,
        "jobs": list(ACTIVE_JOBS.values()),
        "total": len(ACTIVE_JOBS)
    }

def get_account_info() -> Dict[str, Any]:
    """
    Get Sokosumi account information including credits balance.
    """
    if is_live():
        try:
            response = requests.get(
                f"{SOKOSUMI_API_URL}/api/account",
                headers=get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "is_live": True,
                    "account": response.json(),
                    "source": "sokosumi_api"
                }
        except requests.RequestException as e:
            print(f"Sokosumi API request failed: {e}")
    
    return {
        "success": True,
        "is_live": False,
        "is_simulated": True,
        "account": {
            "credits_balance": 30.00,
            "currency": "USD",
            "plan": "free_tier",
            "jobs_completed": 0,
            "member_since": datetime.now().isoformat()
        },
        "source": "simulation"
    }

def get_blockchain_activities_for_hiring(agent_id: str, job_id: str, agent_name: str, cost: float) -> List[Dict]:
    """
    Generate blockchain activity data for a Sokosumi agent hiring.
    
    Returns activities for:
    - Sokosumi marketplace discovery
    - Masumi Network agent verification
    - Payment initialization
    - Job assignment
    """
    tx_hash = hashlib.md5(f"{job_id}{datetime.now().isoformat()}".encode()).hexdigest()
    
    return [
        {
            "type": "sokosumi_discovery",
            "icon": "Search",
            "title": "Agent Discovery",
            "description": f"Found {agent_name} on Sokosumi marketplace",
            "details": {
                "marketplace": "Sokosumi",
                "agent_id": agent_id,
                "network": "Masumi/Cardano"
            },
            "status": "success",
            "is_simulated": not is_live(),
            "timestamp": datetime.now().isoformat()
        },
        {
            "type": "masumi_verification",
            "icon": "ShieldCheck",
            "title": "DID Verification",
            "description": "Agent identity verified on Masumi Network",
            "details": {
                "did_verified": True,
                "reputation_score": random.uniform(4.5, 5.0),
                "network": "Masumi"
            },
            "status": "success",
            "is_simulated": not is_live(),
            "timestamp": datetime.now().isoformat()
        },
        {
            "type": "sokosumi_hire",
            "icon": "UserPlus",
            "title": "Agent Hired",
            "description": f"Successfully hired {agent_name}",
            "details": {
                "job_id": job_id,
                "cost": f"${cost:.2f} USD",
                "payment_method": "Sokosumi Credits"
            },
            "status": "success",
            "is_simulated": not is_live(),
            "timestamp": datetime.now().isoformat()
        },
        {
            "type": "cardano_payment",
            "icon": "Wallet",
            "title": "Payment Recorded",
            "description": "Transaction logged on Cardano L1",
            "details": {
                "tx_hash": f"tx_{tx_hash[:24]}",
                "amount": f"${cost:.2f}",
                "network": "Cardano Preprod"
            },
            "status": "confirmed",
            "is_simulated": not is_live(),
            "timestamp": datetime.now().isoformat()
        }
    ]
