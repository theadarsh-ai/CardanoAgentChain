"""
Masumi Network Service
Handles agent discovery, service registry, and reputation management
"""
import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from dataclasses import dataclass


@dataclass
class MasumiAgent:
    """Represents an agent registered on Masumi Network"""
    did: str
    name: str
    domain: str
    services: List[str]
    reputation_score: float
    total_transactions: int
    average_response_time: int
    registered_at: str
    is_verified: bool


class MasumiService:
    """Service for interacting with Masumi Network"""

    def __init__(self):
        self.network_url = os.environ.get("MASUMI_NETWORK_URL",
                                          "https://masumi-testnet.io")
        self.api_key = os.environ.get("MASUMI_API_KEY", "")
        # Local cache of registered agents
        self._agent_registry: Dict[str, MasumiAgent] = {}

    async def register_agent(self, agent_id: str, name: str, domain: str,
                             services: List[str],
                             metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register an agent on Masumi Network for discoverability
        This makes the agent searchable in the marketplace
        """
        # In production:
        # 1. Submit agent profile to Masumi registry
        # 2. Create verifiable credentials
        # 3. Link to Cardano DID
        # 4. Return registration confirmation

        did = f"did:masumi:{agent_id}"

        agent = MasumiAgent(did=did,
                            name=name,
                            domain=domain,
                            services=services,
                            reputation_score=100.0,
                            total_transactions=0,
                            average_response_time=1000,
                            registered_at=datetime.now().isoformat(),
                            is_verified=True)

        self._agent_registry[agent_id] = agent

        return {
            "did": did,
            "name": name,
            "domain": domain,
            "services": services,
            "registered_at": agent.registered_at,
            "registry_url": f"{self.network_url}/agents/{agent_id}",
            "status": "active"
        }

    async def discover_agents(
            self,
            domain: Optional[str] = None,
            service: Optional[str] = None,
            min_reputation: float = 0.0) -> List[Dict[str, Any]]:
        """
        Discover available agents on Masumi Network
        Search by domain, service type, or reputation
        """
        # In production: Query Masumi registry API with filters

        agents = []
        for agent in self._agent_registry.values():
            # Apply filters
            if domain and agent.domain != domain:
                continue
            if service and service not in agent.services:
                continue
            if agent.reputation_score < min_reputation:
                continue

            agents.append({
                "did": agent.did,
                "name": agent.name,
                "domain": agent.domain,
                "services": agent.services,
                "reputation_score": agent.reputation_score,
                "total_transactions": agent.total_transactions,
                "average_response_time": agent.average_response_time,
                "is_verified": agent.is_verified
            })

        return agents

    async def get_agent_profile(self, did: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed profile for a specific agent from Masumi Network
        """
        # In production: GET from Masumi API /agents/{did}

        agent_id = did.split(":")[-1]
        agent = self._agent_registry.get(agent_id)

        if not agent:
            return None

        return {
            "did":
            agent.did,
            "name":
            agent.name,
            "domain":
            agent.domain,
            "services":
            agent.services,
            "reputation_score":
            agent.reputation_score,
            "total_transactions":
            agent.total_transactions,
            "average_response_time":
            agent.average_response_time,
            "registered_at":
            agent.registered_at,
            "is_verified":
            agent.is_verified,
            "verifiable_credentials": [{
                "type": "ServiceProvider",
                "issuer": "did:masumi:registry",
                "issued_at": agent.registered_at
            }]
        }

    async def update_reputation(self, agent_did: str,
                                transaction_success: bool,
                                response_time: int) -> Dict[str, Any]:
        """
        Update agent reputation based on transaction outcome
        Called after each agent interaction
        """
        agent_id = agent_did.split(":")[-1]
        agent = self._agent_registry.get(agent_id)

        if not agent:
            return {"error": "Agent not found"}

        # Update reputation algorithm
        if transaction_success:
            # Increase reputation (max 100)
            agent.reputation_score = min(100.0, agent.reputation_score + 0.1)
        else:
            # Decrease reputation
            agent.reputation_score = max(0.0, agent.reputation_score - 1.0)

        # Update average response time (exponential moving average)
        alpha = 0.1
        agent.average_response_time = int(alpha * response_time + (1 - alpha) *
                                          agent.average_response_time)

        agent.total_transactions += 1

        return {
            "did": agent_did,
            "reputation_score": agent.reputation_score,
            "total_transactions": agent.total_transactions,
            "average_response_time": agent.average_response_time,
            "updated_at": datetime.now().isoformat()
        }

    async def create_service_agreement(
            self, provider_did: str, consumer_did: str, service_type: str,
            terms: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a verifiable service agreement between agents
        Stored on Masumi Network and referenced on Cardano
        """
        agreement_id = f"agreement_{datetime.now().timestamp()}"

        agreement = {
            "agreement_id": agreement_id,
            "provider_did": provider_did,
            "consumer_did": consumer_did,
            "service_type": service_type,
            "terms": terms,
            "created_at": datetime.now().isoformat(),
            "status": "active",
            "masumi_url": f"{self.network_url}/agreements/{agreement_id}"
        }

        return agreement

    async def resolve_did(self, did: str) -> Optional[Dict[str, Any]]:
        """
        Resolve a DID to its DID Document
        Returns public keys, service endpoints, etc.
        """
        # In production: Follow DID resolution spec
        # Query Masumi registry or Cardano for DID Document

        return {
            "@context":
            "https://www.w3.org/ns/did/v1",
            "id":
            did,
            "verificationMethod": [{
                "id": f"{did}#key-1",
                "type": "Ed25519VerificationKey2020",
                "controller": did,
                "publicKeyMultibase": "z6Mk..."
            }],
            "service": [{
                "id":
                f"{did}#agent-service",
                "type":
                "AgentService",
                "serviceEndpoint":
                f"{self.network_url}/agents/{did.split(':')[-1]}"
            }]
        }

    async def verify_service_credential(self, credential: Dict[str,
                                                               Any]) -> bool:
        """
        Verify a service credential issued by Masumi Network
        """
        # In production:
        # 1. Check credential signature
        # 2. Verify issuer DID
        # 3. Check revocation status
        # 4. Validate expiration

        required_fields = ["type", "issuer", "issued_at"]
        return all(field in credential for field in required_fields)

    async def search_services(
            self,
            query: str,
            filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Search for agents by service capabilities
        Natural language search across Masumi Network
        """
        # In production: Full-text search on Masumi registry

        results = []
        for agent in self._agent_registry.values():
            # Simple keyword matching (replace with proper search)
            if query.lower() in agent.name.lower() or \
               query.lower() in agent.domain.lower() or \
               any(query.lower() in service.lower() for service in agent.services):
                results.append({
                    "did": agent.did,
                    "name": agent.name,
                    "domain": agent.domain,
                    "services": agent.services,
                    "reputation_score": agent.reputation_score
                })

        return results


# Singleton instance
masumi_service = MasumiService()
