"""
Agent Data & Information APIs
Provides data, market info, and resources that agents need
"""
from datetime import datetime
from typing import Dict, List, Any

# Protocol and Market Data
PROTOCOLS = {
    "aave": {
        "name": "Aave",
        "tvl": "$12.8B",
        "chain": "Multi-chain",
        "apy_range": "2.5% - 45%",
        "risk_level": "Low-Medium",
        "description": "Lending protocol with governance token",
        "supported_assets": ["USDC", "DAI", "USDT", "ETH", "WBTC"],
        "avg_gas_fee": "$50-150"
    },
    "uniswap": {
        "name": "Uniswap",
        "tvl": "$4.2B",
        "chain": "Multi-chain",
        "apy_range": "0.1% - 50%",
        "risk_level": "Medium",
        "description": "Decentralized AMM for token swaps",
        "supported_assets": ["All ERC-20 tokens"],
        "avg_gas_fee": "$20-100"
    },
    "curve": {
        "name": "Curve Finance",
        "tvl": "$2.1B",
        "chain": "Multi-chain",
        "apy_range": "1% - 25%",
        "risk_level": "Low",
        "description": "Stablecoin-optimized AMM",
        "supported_assets": ["Stablecoins", "sETH", "cvxCRV"],
        "avg_gas_fee": "$15-60"
    },
    "lido": {
        "name": "Lido",
        "tvl": "$18.5B",
        "chain": "Ethereum, Polygon",
        "apy_range": "3.5% - 4.5%",
        "risk_level": "Low",
        "description": "Liquid staking protocol",
        "supported_assets": ["ETH", "MATIC"],
        "avg_gas_fee": "$80-200"
    }
}

# Agent Capabilities Data
AGENT_CAPABILITIES = {
    "MailMind": {
        "domain": "Workflow Automation",
        "capabilities": [
            "Email campaign creation",
            "Subject line optimization",
            "A/B testing setup",
            "Performance analytics",
            "Audience segmentation",
            "Template design",
            "Automated scheduling"
        ],
        "avg_performance": {
            "open_rate_improvement": "32%",
            "click_rate_improvement": "28%",
            "conversion_rate_improvement": "25%"
        },
        "pricing": {"per_request": 0.005, "monthly": 50},
        "availability": "24/7"
    },
    "YieldMaximizer": {
        "domain": "DeFi Services",
        "capabilities": [
            "Liquidity pool analysis",
            "APY comparison",
            "Impermanent loss calculation",
            "Portfolio optimization",
            "Gas cost optimization",
            "Risk assessment",
            "Auto-compounding strategies"
        ],
        "protocols_supported": list(PROTOCOLS.keys()),
        "avg_performance": {
            "yield_improvement": "18%",
            "gas_savings": "35%",
            "risk_reduction": "22%"
        },
        "pricing": {"per_request": 0.01, "monthly": 100},
        "availability": "24/7"
    },
    "ComplianceGuard": {
        "domain": "Data & Compliance",
        "capabilities": [
            "AML risk scoring",
            "KYC verification",
            "Transaction monitoring",
            "Compliance reporting",
            "Regulatory updates",
            "Risk alerts",
            "Audit trail generation"
        ],
        "compliance_standards": ["AML", "KYC", "GDPR", "SOC2"],
        "avg_performance": {
            "detection_accuracy": "99.2%",
            "false_positive_rate": "0.8%",
            "response_time_ms": 450
        },
        "pricing": {"per_request": 0.008, "monthly": 80},
        "availability": "24/7"
    },
    "ShopAssist": {
        "domain": "Customer Support",
        "capabilities": [
            "Customer inquiry resolution",
            "Product recommendations",
            "Return processing",
            "Complaint handling",
            "Shipping issue resolution",
            "Upselling strategies",
            "Sentiment analysis"
        ],
        "support_channels": ["Email", "Chat", "Phone"],
        "avg_performance": {
            "resolution_rate": "94%",
            "satisfaction_score": "4.7/5",
            "response_time_seconds": 120
        },
        "pricing": {"per_request": 0.003, "monthly": 30},
        "availability": "24/7"
    },
    "TradeMind": {
        "domain": "DeFi Services",
        "capabilities": [
            "Market trend analysis",
            "Technical analysis",
            "Trading strategy development",
            "Risk management",
            "Portfolio rebalancing",
            "Real-time alerts",
            "Backtesting"
        ],
        "trading_markets": ["Spot", "Futures", "Options"],
        "avg_performance": {
            "win_rate": "62%",
            "sharpe_ratio": "1.8",
            "max_drawdown": "15%"
        },
        "pricing": {"per_request": 0.015, "monthly": 150},
        "availability": "24/7"
    },
    "InsightBot": {
        "domain": "Data & Compliance",
        "capabilities": [
            "Data analysis",
            "Business intelligence",
            "Predictive analytics",
            "Report generation",
            "KPI tracking",
            "Market analysis",
            "Trend forecasting"
        ],
        "data_sources": ["Real-time feeds", "Historical data", "Third-party APIs"],
        "avg_performance": {
            "prediction_accuracy": "87%",
            "report_generation_time": "5 minutes",
            "data_freshness": "Real-time"
        },
        "pricing": {"per_request": 0.012, "monthly": 120},
        "availability": "24/7"
    }
}

# Market Data
MARKET_DATA = {
    "eth": {
        "symbol": "ETH",
        "name": "Ethereum",
        "price_usd": 2458.75,
        "24h_change": 2.34,
        "market_cap": "$295B",
        "volume_24h": "$18.2B",
        "dominance": "17.3%"
    },
    "btc": {
        "symbol": "BTC",
        "name": "Bitcoin",
        "price_usd": 98432.50,
        "24h_change": 1.87,
        "market_cap": "$1.94T",
        "volume_24h": "$42.5B",
        "dominance": "59.2%"
    },
    "cardano": {
        "symbol": "ADA",
        "name": "Cardano",
        "price_usd": 1.25,
        "24h_change": 3.42,
        "market_cap": "$45.2B",
        "volume_24h": "$2.1B",
        "dominance": "3.1%"
    }
}

# Knowledge Base
KNOWLEDGE_BASE = {
    "impermanent_loss": {
        "definition": "The loss that liquidity providers incur when the price of tokens in a pool diverges significantly",
        "formula": "IL = 2 * sqrt(price_ratio) / (1 + price_ratio) - 1",
        "mitigation": [
            "Choose stable token pairs to minimize price divergence",
            "Use concentrated liquidity with tight ranges",
            "Monitor positions regularly",
            "Use stablecoin pairs to reduce IL"
        ]
    },
    "yield_farming": {
        "definition": "Process of earning returns on crypto holdings by providing liquidity or staking",
        "strategies": [
            "Single-sided liquidity provision",
            "Multi-protocol diversification",
            "Leverage farming with caution",
            "Automated yield optimization"
        ],
        "risks": [
            "Smart contract vulnerabilities",
            "Impermanent loss",
            "Slippage",
            "Market volatility"
        ]
    },
    "gas_optimization": {
        "definition": "Techniques to reduce transaction costs on blockchain networks",
        "tips": [
            "Batch transactions when possible",
            "Use Layer 2 solutions",
            "Optimize transaction timing based on network congestion",
            "Use MEV-resistant protocols"
        ]
    },
    "defi_risks": {
        "smart_contract_risk": "Code vulnerabilities or exploits in smart contracts",
        "oracle_risk": "Manipulation or failure of price oracles",
        "liquidity_risk": "Inability to exit positions at desired prices",
        "regulatory_risk": "Changing regulations affecting DeFi operations",
        "counterparty_risk": "Default of protocol or platform"
    }
}

# Service Requests Trending
TRENDING_REQUESTS = [
    {"service": "YieldMaximizer", "category": "Liquidity pool optimization", "volume": 2341, "avg_roi": "18.5%"},
    {"service": "TradeMind", "category": "Market analysis", "volume": 1876, "avg_roi": "12.3%"},
    {"service": "ComplianceGuard", "category": "KYC verification", "volume": 3421, "avg_roi": "N/A"},
    {"service": "MailMind", "category": "Email campaigns", "volume": 5234, "avg_roi": "32%"},
    {"service": "ShopAssist", "category": "Customer support", "volume": 8234, "avg_roi": "N/A"}
]

# SLA & Performance Metrics
PERFORMANCE_METRICS = {
    "uptime": "99.98%",
    "avg_response_time_ms": 350,
    "total_requests_processed": 2_456_789,
    "total_volume_usd": 425_680_432,
    "agents_online": 8,
    "current_load": "45%"
}

# Pricing Models
PRICING_MODELS = {
    "per_request": {
        "tier1": {"requests_per_month": "unlimited", "price_per_request": 0.003, "monthly": 50},
        "tier2": {"requests_per_month": "unlimited", "price_per_request": 0.002, "monthly": 100},
        "tier3": {"requests_per_month": "unlimited", "price_per_request": 0.001, "monthly": 500}
    },
    "subscription": {
        "starter": {"price_usd": 29, "features": ["Basic agent access", "100 requests/month"]},
        "pro": {"price_usd": 99, "features": ["All agents", "5000 requests/month", "Priority support"]},
        "enterprise": {"price_usd": "Custom", "features": ["Unlimited access", "Dedicated support"]}
    }
}


def get_agent_capabilities(agent_name: str = None) -> Dict[str, Any]:
    """Get capabilities of one or all agents"""
    if agent_name:
        agent = AGENT_CAPABILITIES.get(agent_name)
        if agent:
            return {"agent": agent_name, **agent}
        return {"error": f"Agent {agent_name} not found"}
    
    return {
        "total_agents": len(AGENT_CAPABILITIES),
        "agents": list(AGENT_CAPABILITIES.keys()),
        "data": AGENT_CAPABILITIES
    }


def get_protocol_info(protocol_name: str = None) -> Dict[str, Any]:
    """Get protocol information"""
    if protocol_name:
        protocol = PROTOCOLS.get(protocol_name.lower())
        if protocol:
            return {"protocol": protocol_name, **protocol}
        return {"error": f"Protocol {protocol_name} not found"}
    
    return {
        "total_protocols": len(PROTOCOLS),
        "protocols": list(PROTOCOLS.keys()),
        "data": PROTOCOLS
    }


def get_market_data(asset: str = None) -> Dict[str, Any]:
    """Get current market data"""
    if asset:
        data = MARKET_DATA.get(asset.lower())
        if data:
            return {"asset": asset, **data}
        return {"error": f"Asset {asset} not found"}
    
    return {
        "timestamp": datetime.now().isoformat(),
        "total_assets": len(MARKET_DATA),
        "assets": list(MARKET_DATA.keys()),
        "data": MARKET_DATA
    }


def get_knowledge(topic: str = None) -> Dict[str, Any]:
    """Get knowledge base information"""
    if topic:
        kb = KNOWLEDGE_BASE.get(topic.lower())
        if kb:
            return {"topic": topic, **kb}
        return {"error": f"Topic {topic} not found"}
    
    return {
        "total_topics": len(KNOWLEDGE_BASE),
        "topics": list(KNOWLEDGE_BASE.keys()),
        "data": KNOWLEDGE_BASE
    }


def get_trending_services() -> Dict[str, Any]:
    """Get trending service requests"""
    return {
        "timestamp": datetime.now().isoformat(),
        "trending": TRENDING_REQUESTS,
        "total_requests": sum(r["volume"] for r in TRENDING_REQUESTS)
    }


def get_performance_metrics() -> Dict[str, Any]:
    """Get platform performance metrics"""
    return {
        "timestamp": datetime.now().isoformat(),
        **PERFORMANCE_METRICS
    }


def get_pricing() -> Dict[str, Any]:
    """Get pricing information"""
    return {
        "currency": "USD",
        "billing_cycle": "Monthly",
        "payment_methods": ["Credit Card", "Crypto", "Bank Transfer"],
        "models": PRICING_MODELS
    }
