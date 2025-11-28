"""
Masumi Network Service
Handles agent discovery, service registry, and reputation management
"""
import os
import json
import requests
from datetime import datetime
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict

from blockchain_simulation import simulated_blockchain


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
        self.network_url = os.environ.get("MASUMI_NETWORK_URL", "https://api.masumi.network")
        self.api_key = os.environ.get("MASUMI_API_KEY", "")
        self._is_live = bool(self.api_key)
        self._agent_registry: Dict[str, MasumiAgent] = {}

    def _get_headers(self) -> Dict[str, str]:
        """Get API headers with authentication"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def _api_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Optional[Dict]:
        """Make authenticated request to Masumi API"""
        if not self._is_live:
            return None
        
        url = f"{self.network_url}{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url, headers=self._get_headers(), timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=self._get_headers(), json=data, timeout=30)
            elif method == "PUT":
                response = requests.put(url, headers=self._get_headers(), json=data, timeout=30)
            else:
                return None
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                print(f"Masumi API error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Masumi API request failed: {e}")
            return None

    def is_live(self) -> bool:
        """Check if service is connected to real Masumi Network"""
        return self._is_live

    def register_agent(self, agent_id: str, name: str, domain: str,
                       services: List[str], metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register an agent on Masumi Network for discoverability
        """
        did = f"did:masumi:{agent_id}"
        
        agent = MasumiAgent(
            did=did,
            name=name,
            domain=domain,
            services=services,
            reputation_score=100.0,
            total_transactions=0,
            average_response_time=1000,
            registered_at=datetime.now().isoformat(),
            is_verified=True
        )

        result = {
            "did": did,
            "name": name,
            "domain": domain,
            "services": services,
            "registered_at": agent.registered_at,
            "is_simulated": not self._is_live
        }

        if self._is_live:
            api_result = self._api_request("POST", "/agents/register", {
                "agent_id": agent_id,
                "name": name,
                "domain": domain,
                "services": services,
                "metadata": metadata
            })
            if api_result:
                result["registry_url"] = api_result.get("registry_url", f"{self.network_url}/agents/{agent_id}")
                result["status"] = "registered"
                result["message"] = "Agent registered on Masumi Network"
            else:
                self._agent_registry[agent_id] = agent
                result["status"] = "pending"
                result["message"] = "Registration submitted, awaiting confirmation"
        else:
            self._agent_registry[agent_id] = agent
            result["registry_url"] = f"{self.network_url}/agents/{agent_id}"
            result["status"] = "simulated"
            result["message"] = "Simulated - provide MASUMI_API_KEY for live network"

        return result

    def discover_agents(self, domain: Optional[str] = None,
                        service: Optional[str] = None,
                        min_reputation: float = 0.0) -> Dict[str, Any]:
        """
        Discover available agents on Masumi Network
        """
        result = {
            "query": {
                "domain": domain,
                "service": service,
                "min_reputation": min_reputation
            },
            "is_simulated": not self._is_live
        }

        if self._is_live:
            params = {}
            if domain:
                params["domain"] = domain
            if service:
                params["service"] = service
            if min_reputation > 0:
                params["min_reputation"] = min_reputation
            
            api_result = self._api_request("GET", f"/agents/discover?{'&'.join(f'{k}={v}' for k, v in params.items())}")
            if api_result:
                result["agents"] = api_result.get("agents", [])
                result["total"] = api_result.get("total", 0)
                result["status"] = "success"
            else:
                result["agents"] = []
                result["total"] = 0
                result["status"] = "error"
        else:
            agents = []
            if domain:
                agents_list = simulated_blockchain.get_agents_by_domain(domain)
            elif service:
                agents_list = simulated_blockchain.get_agents_by_service(service)
            else:
                agents_list = simulated_blockchain.get_all_agents()
            
            for agent in agents_list:
                if agent["reputation_score"] >= min_reputation:
                    agents.append(agent)

            result["agents"] = agents
            result["total"] = len(agents)
            result["status"] = "simulated"

        return result

    def get_agent_profile(self, did: str) -> Dict[str, Any]:
        """
        Get detailed profile for a specific agent
        """
        result = {
            "did": did,
            "is_simulated": not self._is_live
        }

        if self._is_live:
            agent_id = did.split(":")[-1]
            api_result = self._api_request("GET", f"/agents/{agent_id}")
            if api_result:
                result.update(api_result)
                result["status"] = "success"
            else:
                result["status"] = "not_found"
        else:
            agent_id = did.split(":")[-1]
            agent = simulated_blockchain.get_agent(agent_id)

            if agent:
                result.update(agent)
                result["status"] = "simulated"
            else:
                result["status"] = "not_found"

        return result

    def update_reputation(self, agent_did: str, transaction_success: bool,
                          response_time: int) -> Dict[str, Any]:
        """
        Update agent reputation based on transaction outcome
        """
        result = {
            "did": agent_did,
            "updated_at": datetime.now().isoformat(),
            "is_simulated": not self._is_live
        }

        if self._is_live:
            api_result = self._api_request("PUT", f"/agents/{agent_did.split(':')[-1]}/reputation", {
                "transaction_success": transaction_success,
                "response_time": response_time
            })
            if api_result:
                result["reputation_score"] = api_result.get("reputation_score", 0)
                result["total_transactions"] = api_result.get("total_transactions", 0)
                result["status"] = "updated"
            else:
                result["status"] = "error"
        else:
            agent_id = agent_did.split(":")[-1]
            agent = self._agent_registry.get(agent_id)

            if agent:
                if transaction_success:
                    agent.reputation_score = min(100.0, agent.reputation_score + 0.1)
                else:
                    agent.reputation_score = max(0.0, agent.reputation_score - 1.0)

                alpha = 0.1
                agent.average_response_time = int(alpha * response_time + (1 - alpha) * agent.average_response_time)
                agent.total_transactions += 1

                result["reputation_score"] = agent.reputation_score
                result["total_transactions"] = agent.total_transactions
                result["average_response_time"] = agent.average_response_time
                result["status"] = "simulated"
            else:
                result["status"] = "not_found"

        return result

    def create_service_agreement(self, provider_did: str, consumer_did: str,
                                 service_type: str, terms: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a verifiable service agreement between agents
        """
        agreement_id = f"agreement_{datetime.now().timestamp()}"

        result = {
            "agreement_id": agreement_id,
            "provider_did": provider_did,
            "consumer_did": consumer_did,
            "service_type": service_type,
            "terms": terms,
            "created_at": datetime.now().isoformat(),
            "is_simulated": not self._is_live
        }

        if self._is_live:
            api_result = self._api_request("POST", "/agreements", {
                "provider_did": provider_did,
                "consumer_did": consumer_did,
                "service_type": service_type,
                "terms": terms
            })
            if api_result:
                result["agreement_id"] = api_result.get("agreement_id", agreement_id)
                result["masumi_url"] = api_result.get("url", f"{self.network_url}/agreements/{agreement_id}")
                result["status"] = "active"
            else:
                result["status"] = "error"
        else:
            result["masumi_url"] = f"{self.network_url}/agreements/{agreement_id}"
            result["status"] = "simulated"

        return result

    def resolve_did(self, did: str) -> Dict[str, Any]:
        """
        Resolve a DID to its DID Document
        """
        result = {
            "did": did,
            "is_simulated": not self._is_live
        }

        if self._is_live:
            api_result = self._api_request("GET", f"/did/{did}")
            if api_result:
                result.update(api_result)
                result["status"] = "resolved"
            else:
                result["status"] = "not_found"
        else:
            result["@context"] = "https://www.w3.org/ns/did/v1"
            result["verificationMethod"] = [{
                "id": f"{did}#key-1",
                "type": "Ed25519VerificationKey2020",
                "controller": did,
                "publicKeyMultibase": "z6Mk..."
            }]
            result["service"] = [{
                "id": f"{did}#agent-service",
                "type": "AgentService",
                "serviceEndpoint": f"{self.network_url}/agents/{did.split(':')[-1]}"
            }]
            result["status"] = "simulated"

        return result

    def get_network_status(self) -> Dict[str, Any]:
        """
        Get Masumi Network status
        """
        result = {
            "network_url": self.network_url,
            "is_simulated": not self._is_live
        }

        if self._is_live:
            api_result = self._api_request("GET", "/status")
            if api_result:
                result["version"] = api_result.get("version", "")
                result["total_agents"] = api_result.get("total_agents", 0)
                result["total_transactions"] = api_result.get("total_transactions", 0)
                result["status"] = "connected"
            else:
                result["status"] = "connection_error"
        else:
            stats = simulated_blockchain.get_network_stats()
            result["version"] = "1.0.0-simulated"
            result["total_agents"] = stats["masumi"]["total_agents"]
            result["verified_agents"] = stats["masumi"]["verified_agents"]
            result["total_transactions"] = sum(a["total_transactions"] for a in simulated_blockchain.get_all_agents())
            result["active_agreements"] = stats["masumi"]["active_agreements"]
            result["status"] = "simulated"
            result["message"] = "Provide MASUMI_API_KEY to connect to live network"

        return result


masumi_service = MasumiService()
