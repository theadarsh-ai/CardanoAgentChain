"""
Blockchain Simulation Data
Provides realistic simulated data for all blockchain services
This data is used when no API keys are provided
When API keys are provided, the system switches to live blockchain
"""
import random
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any


def generate_cardano_address() -> str:
    """Generate a realistic Cardano address"""
    prefix = random.choice(["addr1q", "addr_test1q"])
    suffix = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()[:54]
    return f"{prefix}{suffix}"


def generate_tx_hash() -> str:
    """Generate a realistic transaction hash"""
    return hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()


def generate_block_hash() -> str:
    """Generate a realistic block hash"""
    return hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()


AGENT_NAMES = [
    "DataForge AI", "ComplianceGuard", "DocuMaster", "WorkflowPilot",
    "SupportBot Pro", "DeFi Oracle", "YieldOptimizer", "RiskAnalyzer",
    "ContractScanner", "MarketSentinel", "AuditTrail AI", "ProcessFlow"
]

DOMAINS = ["Workflow Automation", "Data & Compliance", "Customer Support", "DeFi Services"]

SERVICES = {
    "Workflow Automation": ["task_automation", "process_optimization", "scheduling", "resource_allocation"],
    "Data & Compliance": ["data_analysis", "compliance_check", "audit_logging", "gdpr_verification"],
    "Customer Support": ["ticket_routing", "response_generation", "sentiment_analysis", "escalation"],
    "DeFi Services": ["yield_farming", "liquidity_provision", "risk_assessment", "portfolio_optimization"]
}


class SimulatedBlockchain:
    """Manages all simulated blockchain data"""
    
    def __init__(self):
        self.current_block_height = random.randint(10000000, 15000000)
        self.current_slot = random.randint(80000000, 100000000)
        self.current_epoch = random.randint(450, 520)
        
        self.wallets: Dict[str, Dict[str, Any]] = {}
        self.transactions: List[Dict[str, Any]] = []
        self.blocks: List[Dict[str, Any]] = []
        self.agents: Dict[str, Dict[str, Any]] = {}
        self.hydra_channels: Dict[str, Dict[str, Any]] = {}
        self.hydra_transactions: List[Dict[str, Any]] = []
        self.service_agreements: List[Dict[str, Any]] = []
        
        self._initialize_data()
    
    def _initialize_data(self):
        """Initialize all simulated blockchain data"""
        self._create_blocks(50)
        self._create_wallets(20)
        self._create_transactions(100)
        self._create_agents(12)
        self._create_hydra_channels(5)
        self._create_hydra_transactions(50)
        self._create_service_agreements(15)
    
    def _create_blocks(self, count: int):
        """Create simulated Cardano blocks"""
        for i in range(count):
            block_time = datetime.now() - timedelta(seconds=20 * (count - i))
            self.blocks.append({
                "hash": generate_block_hash(),
                "height": self.current_block_height - (count - i - 1),
                "slot": self.current_slot - 20 * (count - i - 1),
                "epoch": self.current_epoch,
                "time": block_time.isoformat(),
                "tx_count": random.randint(50, 300),
                "size": random.randint(40000, 90000),
                "fees": round(random.uniform(50, 200), 2)
            })
    
    def _create_wallets(self, count: int):
        """Create simulated wallets with balances"""
        for i in range(count):
            address = generate_cardano_address()
            self.wallets[address] = {
                "address": address,
                "ada_balance": round(random.uniform(100, 50000), 6),
                "lovelace": random.randint(100000000, 50000000000),
                "tokens": [],
                "stake_address": f"stake_test1{hashlib.sha256(address.encode()).hexdigest()[:50]}",
                "tx_count": random.randint(10, 500)
            }
    
    def _create_transactions(self, count: int):
        """Create simulated Cardano L1 transactions"""
        wallet_addresses = list(self.wallets.keys())
        
        for i in range(count):
            tx_time = datetime.now() - timedelta(hours=random.randint(1, 720))
            from_addr = random.choice(wallet_addresses)
            to_addr = random.choice([a for a in wallet_addresses if a != from_addr])
            
            self.transactions.append({
                "tx_hash": generate_tx_hash(),
                "block_hash": random.choice(self.blocks)["hash"],
                "block_height": random.choice(self.blocks)["height"],
                "slot": random.randint(self.current_slot - 1000000, self.current_slot),
                "from_address": from_addr,
                "to_address": to_addr,
                "amount": round(random.uniform(1, 1000), 6),
                "fees": round(random.uniform(0.15, 0.25), 6),
                "timestamp": tx_time.isoformat(),
                "status": "confirmed",
                "confirmations": random.randint(100, 10000)
            })
    
    def _create_agents(self, count: int):
        """Create simulated Masumi Network agents"""
        for i in range(min(count, len(AGENT_NAMES))):
            agent_id = f"agent-{uuid.uuid4().hex[:8]}"
            domain = random.choice(DOMAINS)
            services = random.sample(SERVICES[domain], k=random.randint(2, 4))
            
            reg_time = datetime.now() - timedelta(days=random.randint(30, 365))
            
            self.agents[agent_id] = {
                "did": f"did:masumi:{agent_id}",
                "cardano_did": f"did:cardano:preprod:{agent_id}",
                "name": AGENT_NAMES[i],
                "domain": domain,
                "services": services,
                "reputation_score": round(random.uniform(85, 99.9), 1),
                "total_transactions": random.randint(500, 50000),
                "successful_transactions": random.randint(480, 49500),
                "average_response_time": random.randint(200, 2000),
                "registered_at": reg_time.isoformat(),
                "last_active": (datetime.now() - timedelta(minutes=random.randint(1, 60))).isoformat(),
                "is_verified": True,
                "wallet_address": generate_cardano_address(),
                "total_earnings": round(random.uniform(1000, 100000), 2),
                "pricing": {
                    "per_request": round(random.uniform(0.001, 0.01), 4),
                    "per_hour": round(random.uniform(0.1, 1.0), 2)
                }
            }
    
    def _create_hydra_channels(self, count: int):
        """Create simulated Hydra payment channels"""
        agent_ids = list(self.agents.keys())
        
        for i in range(count):
            channel_id = str(uuid.uuid4())
            participant_a = random.choice(agent_ids)
            participant_b = random.choice([a for a in agent_ids if a != participant_a])
            
            initial_balance_a = round(random.uniform(50, 500), 2)
            initial_balance_b = round(random.uniform(50, 500), 2)
            
            used_a = round(random.uniform(0, initial_balance_a * 0.8), 2)
            used_b = round(random.uniform(0, initial_balance_b * 0.8), 2)
            
            opened_at = datetime.now() - timedelta(days=random.randint(1, 30))
            
            self.hydra_channels[channel_id] = {
                "channel_id": channel_id,
                "participants": [participant_a, participant_b],
                "participant_names": [self.agents[participant_a]["name"], self.agents[participant_b]["name"]],
                "capacity": initial_balance_a + initial_balance_b,
                "initial_balances": {
                    participant_a: initial_balance_a,
                    participant_b: initial_balance_b
                },
                "current_balances": {
                    participant_a: round(initial_balance_a - used_a + used_b, 2),
                    participant_b: round(initial_balance_b - used_b + used_a, 2)
                },
                "transaction_count": random.randint(100, 5000),
                "opened_at": opened_at.isoformat(),
                "last_activity": (datetime.now() - timedelta(minutes=random.randint(1, 60))).isoformat(),
                "status": "open",
                "l1_open_tx": generate_tx_hash(),
                "throughput": "1000+ TPS",
                "finality": "<1 second"
            }
    
    def _create_hydra_transactions(self, count: int):
        """Create simulated Hydra L2 transactions"""
        channel_ids = list(self.hydra_channels.keys())
        
        for i in range(count):
            channel_id = random.choice(channel_ids)
            channel = self.hydra_channels[channel_id]
            
            from_agent = random.choice(channel["participants"])
            to_agent = [p for p in channel["participants"] if p != from_agent][0]
            
            tx_time = datetime.now() - timedelta(hours=random.randint(1, 168))
            
            self.hydra_transactions.append({
                "tx_hash": generate_tx_hash(),
                "channel_id": channel_id,
                "from_agent": from_agent,
                "from_name": self.agents[from_agent]["name"],
                "to_agent": to_agent,
                "to_name": self.agents[to_agent]["name"],
                "amount": round(random.uniform(0.001, 0.1), 4),
                "timestamp": tx_time.isoformat(),
                "finality_time": f"{random.randint(50, 200)}ms",
                "cost": "$0.0040",
                "layer": "hydra",
                "status": "confirmed"
            })
    
    def _create_service_agreements(self, count: int):
        """Create simulated service agreements"""
        agent_ids = list(self.agents.keys())
        
        for i in range(count):
            provider = random.choice(agent_ids)
            consumer = random.choice([a for a in agent_ids if a != provider])
            
            created_at = datetime.now() - timedelta(days=random.randint(1, 60))
            expires_at = created_at + timedelta(days=random.randint(30, 365))
            
            self.service_agreements.append({
                "agreement_id": f"agreement-{uuid.uuid4().hex[:8]}",
                "provider_did": self.agents[provider]["did"],
                "provider_name": self.agents[provider]["name"],
                "consumer_did": self.agents[consumer]["did"],
                "consumer_name": self.agents[consumer]["name"],
                "service_type": random.choice(self.agents[provider]["services"]),
                "terms": {
                    "max_requests_per_day": random.randint(100, 10000),
                    "max_response_time_ms": random.randint(500, 5000),
                    "price_per_request": round(random.uniform(0.001, 0.01), 4),
                    "sla_uptime": f"{random.randint(95, 99)}.{random.randint(0, 99):02d}%"
                },
                "created_at": created_at.isoformat(),
                "expires_at": expires_at.isoformat(),
                "status": random.choice(["active", "active", "active", "completed"]),
                "total_requests": random.randint(1000, 100000),
                "total_paid": round(random.uniform(10, 1000), 2)
            })
    
    def get_latest_block(self) -> Dict[str, Any]:
        """Get the latest simulated block"""
        if self.blocks:
            return self.blocks[-1]
        return {}
    
    def get_block_by_height(self, height: int) -> Dict[str, Any]:
        """Get block by height"""
        for block in self.blocks:
            if block["height"] == height:
                return block
        return {}
    
    def get_wallet(self, address: str) -> Dict[str, Any]:
        """Get wallet by address"""
        if address in self.wallets:
            return self.wallets[address]
        return {
            "address": address,
            "ada_balance": round(random.uniform(100, 5000), 6),
            "lovelace": random.randint(100000000, 5000000000),
            "tokens": [],
            "tx_count": random.randint(1, 100)
        }
    
    def get_transaction(self, tx_hash: str) -> Dict[str, Any]:
        """Get transaction by hash"""
        for tx in self.transactions:
            if tx["tx_hash"] == tx_hash:
                return tx
        return {
            "tx_hash": tx_hash,
            "block_hash": generate_block_hash(),
            "block_height": self.current_block_height - random.randint(1, 1000),
            "slot": self.current_slot - random.randint(1, 20000),
            "amount": round(random.uniform(1, 100), 6),
            "fees": 0.17,
            "timestamp": datetime.now().isoformat(),
            "status": "confirmed",
            "confirmations": random.randint(100, 1000)
        }
    
    def get_recent_transactions(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent L1 transactions"""
        sorted_txs = sorted(self.transactions, key=lambda x: x["timestamp"], reverse=True)
        return sorted_txs[:limit]
    
    def get_all_agents(self) -> List[Dict[str, Any]]:
        """Get all registered agents"""
        return list(self.agents.values())
    
    def get_agent(self, agent_id: str) -> Dict[str, Any]:
        """Get agent by ID"""
        return self.agents.get(agent_id, {})
    
    def get_agents_by_domain(self, domain: str) -> List[Dict[str, Any]]:
        """Get agents filtered by domain"""
        return [a for a in self.agents.values() if a["domain"] == domain]
    
    def get_agents_by_service(self, service: str) -> List[Dict[str, Any]]:
        """Get agents that offer a specific service"""
        return [a for a in self.agents.values() if service in a["services"]]
    
    def get_hydra_channel(self, channel_id: str) -> Dict[str, Any]:
        """Get Hydra channel by ID"""
        return self.hydra_channels.get(channel_id, {})
    
    def get_all_hydra_channels(self) -> List[Dict[str, Any]]:
        """Get all Hydra channels"""
        return list(self.hydra_channels.values())
    
    def get_hydra_transactions(self, channel_id: str = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Get Hydra transactions, optionally filtered by channel"""
        txs = self.hydra_transactions
        if channel_id:
            txs = [t for t in txs if t["channel_id"] == channel_id]
        
        sorted_txs = sorted(txs, key=lambda x: x["timestamp"], reverse=True)
        return sorted_txs[:limit]
    
    def get_service_agreements(self, agent_did: str = None) -> List[Dict[str, Any]]:
        """Get service agreements, optionally filtered by agent"""
        if agent_did:
            return [a for a in self.service_agreements 
                    if a["provider_did"] == agent_did or a["consumer_did"] == agent_did]
        return self.service_agreements
    
    def get_network_stats(self) -> Dict[str, Any]:
        """Get overall network statistics"""
        total_hydra_volume = sum(t["amount"] for t in self.hydra_transactions)
        total_l1_volume = sum(t["amount"] for t in self.transactions)
        
        return {
            "cardano": {
                "current_block_height": self.current_block_height,
                "current_slot": self.current_slot,
                "current_epoch": self.current_epoch,
                "total_wallets": len(self.wallets),
                "total_transactions": len(self.transactions),
                "total_volume_ada": round(total_l1_volume, 2)
            },
            "masumi": {
                "total_agents": len(self.agents),
                "verified_agents": len([a for a in self.agents.values() if a["is_verified"]]),
                "total_agreements": len(self.service_agreements),
                "active_agreements": len([a for a in self.service_agreements if a["status"] == "active"]),
                "domains": DOMAINS
            },
            "hydra": {
                "active_channels": len([c for c in self.hydra_channels.values() if c["status"] == "open"]),
                "total_channels": len(self.hydra_channels),
                "total_l2_transactions": len(self.hydra_transactions),
                "total_volume_ada": round(total_hydra_volume, 4),
                "average_tx_cost": "$0.0040",
                "throughput": "1000+ TPS",
                "finality": "<1 second"
            }
        }


simulated_blockchain = SimulatedBlockchain()
