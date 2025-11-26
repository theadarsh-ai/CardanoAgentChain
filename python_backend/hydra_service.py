
"""
Hydra Layer 2 Service
Handles state channel operations for instant micropayments between agents
"""
import os
import hashlib
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from dataclasses import dataclass

@dataclass
class HydraChannel:
    """Represents a Hydra payment channel between agents"""
    channel_id: str
    participants: List[str]
    capacity: float
    current_balance: Dict[str, float]
    transaction_count: int
    opened_at: str
    status: str


class HydraService:
    """Service for Hydra Layer 2 payment channels"""
    
    def __init__(self):
        self.hydra_node_url = os.environ.get("HYDRA_NODE_URL", "http://localhost:4001")
        # Active payment channels
        self._channels: Dict[str, HydraChannel] = {}
        # Transaction history
        self._tx_history: List[Dict[str, Any]] = []
    
    async def open_channel(
        self,
        participant_a: str,
        participant_b: str,
        initial_balance_a: float,
        initial_balance_b: float
    ) -> Dict[str, Any]:
        """
        Open a new Hydra payment channel between two agents
        This creates a state channel on top of Cardano
        """
        # In production:
        # 1. Commit UTxOs from both participants on Cardano L1
        # 2. Initialize Hydra head with both parties
        # 3. Wait for L1 confirmation
        # 4. Channel is now open for instant transactions
        
        channel_id = str(uuid.uuid4())
        
        channel = HydraChannel(
            channel_id=channel_id,
            participants=[participant_a, participant_b],
            capacity=initial_balance_a + initial_balance_b,
            current_balance={
                participant_a: initial_balance_a,
                participant_b: initial_balance_b
            },
            transaction_count=0,
            opened_at=datetime.now().isoformat(),
            status="open"
        )
        
        self._channels[channel_id] = channel
        
        return {
            "channel_id": channel_id,
            "participants": channel.participants,
            "capacity": channel.capacity,
            "balances": channel.current_balance,
            "opened_at": channel.opened_at,
            "status": "open",
            "l1_tx_hash": self._generate_tx_hash()
        }
    
    async def send_payment(
        self,
        channel_id: str,
        from_agent: str,
        to_agent: str,
        amount: float
    ) -> Dict[str, Any]:
        """
        Send instant micropayment through Hydra channel
        No L1 confirmation needed - instant finality
        """
        channel = self._channels.get(channel_id)
        
        if not channel:
            return {"error": "Channel not found"}
        
        if channel.status != "open":
            return {"error": "Channel not open"}
        
        # Verify sender has sufficient balance
        if channel.current_balance.get(from_agent, 0) < amount:
            return {"error": "Insufficient balance"}
        
        # Update channel state (instant, no blockchain confirmation needed)
        channel.current_balance[from_agent] -= amount
        channel.current_balance[to_agent] = channel.current_balance.get(to_agent, 0) + amount
        channel.transaction_count += 1
        
        tx_hash = self._generate_tx_hash()
        
        # Record transaction
        tx_record = {
            "tx_hash": tx_hash,
            "channel_id": channel_id,
            "from": from_agent,
            "to": to_agent,
            "amount": amount,
            "timestamp": datetime.now().isoformat(),
            "finality": "instant",
            "layer": "hydra"
        }
        
        self._tx_history.append(tx_record)
        
        return {
            "tx_hash": tx_hash,
            "channel_id": channel_id,
            "from": from_agent,
            "to": to_agent,
            "amount": amount,
            "new_balance_from": channel.current_balance[from_agent],
            "new_balance_to": channel.current_balance[to_agent],
            "finality_time": "<1s",
            "cost": 0.004,  # ~$0.004 per transaction
            "status": "confirmed"
        }
    
    async def close_channel(self, channel_id: str) -> Dict[str, Any]:
        """
        Close Hydra channel and settle final balances on Cardano L1
        """
        channel = self._channels.get(channel_id)
        
        if not channel:
            return {"error": "Channel not found"}
        
        # In production:
        # 1. Both participants sign closing state
        # 2. Submit final state to Cardano L1
        # 3. Distribute funds according to final balances
        # 4. Channel closed
        
        channel.status = "closed"
        
        return {
            "channel_id": channel_id,
            "final_balances": channel.current_balance,
            "total_transactions": channel.transaction_count,
            "closed_at": datetime.now().isoformat(),
            "settlement_tx": self._generate_tx_hash(),
            "status": "closed"
        }
    
    async def get_channel_status(self, channel_id: str) -> Optional[Dict[str, Any]]:
        """
        Get current status and balances of a Hydra channel
        """
        channel = self._channels.get(channel_id)
        
        if not channel:
            return None
        
        return {
            "channel_id": channel.channel_id,
            "participants": channel.participants,
            "capacity": channel.capacity,
            "current_balances": channel.current_balance,
            "transaction_count": channel.transaction_count,
            "opened_at": channel.opened_at,
            "status": channel.status,
            "throughput": "1000+ TPS",
            "finality": "<1 second"
        }
    
    async def get_transaction_history(
        self,
        channel_id: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get transaction history for a channel or all channels
        """
        if channel_id:
            txs = [tx for tx in self._tx_history if tx["channel_id"] == channel_id]
        else:
            txs = self._tx_history
        
        return txs[-limit:]
    
    def _generate_tx_hash(self) -> str:
        """Generate a Hydra transaction hash"""
        return hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()
    
    async def estimate_fees(self, num_transactions: int) -> Dict[str, Any]:
        """
        Estimate Hydra transaction fees
        Hydra is extremely cheap compared to L1
        """
        cost_per_tx = 0.004  # ~$0.004 per transaction
        total_cost = cost_per_tx * num_transactions
        
        # L1 comparison
        l1_cost_per_tx = 0.17  # Cardano L1 ~$0.17 per tx
        l1_total = l1_cost_per_tx * num_transactions
        savings = l1_total - total_cost
        
        return {
            "num_transactions": num_transactions,
            "hydra_total_cost": f"${total_cost:.3f}",
            "l1_total_cost": f"${l1_total:.2f}",
            "savings": f"${savings:.2f}",
            "savings_percentage": f"{(savings/l1_total)*100:.1f}%",
            "throughput": "1000+ TPS",
            "finality": "<1 second"
        }


# Singleton instance
hydra_service = HydraService()
