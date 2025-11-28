import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from models import (
    init_db, 
    AgentModel, 
    ConversationModel, 
    MessageModel, 
    TransactionModel, 
    DecisionLogModel,
    generate_tx_hash,
    truncate_tx_hash
)
from agents import seed_agents, get_master_agent_prompt, AGENT_DEFINITIONS
from openai_service import get_agent_response, analyze_user_request
from cardano_service import cardano_service
from masumi_service import masumi_service
from hydra_service import hydra_service
from agent_data import (
    get_agent_capabilities, get_protocol_info, get_market_data, 
    get_knowledge, get_trending_services, get_performance_metrics, get_pricing
)

app = Flask(__name__)
CORS(app)

init_db()
seed_agents()

def serialize_datetime(obj):
    """JSON serializer for datetime objects."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def serialize_record(record):
    """Serialize a database record for JSON response."""
    if record is None:
        return None
    result = {}
    for key, value in record.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result

@app.route('/api/agents', methods=['GET'])
def get_agents():
    """Get all agents."""
    try:
        agents = AgentModel.get_all()
        return jsonify([serialize_record(a) for a in agents])
    except Exception as e:
        print(f"Error fetching agents: {e}")
        return jsonify({"error": "Failed to fetch agents"}), 500

@app.route('/api/agents/<agent_id>', methods=['GET'])
def get_agent(agent_id):
    """Get a specific agent by ID."""
    try:
        agent = AgentModel.get_by_id(agent_id)
        if not agent:
            return jsonify({"error": "Agent not found"}), 404
        return jsonify(serialize_record(agent))
    except Exception as e:
        print(f"Error fetching agent: {e}")
        return jsonify({"error": "Failed to fetch agent"}), 500

@app.route('/api/agents/<agent_id>/deploy', methods=['POST'])
def deploy_agent(agent_id):
    """Deploy an agent to the workspace."""
    try:
        agent = AgentModel.get_by_id(agent_id)
        if not agent:
            return jsonify({"error": "Agent not found"}), 404

        tx_hash = truncate_tx_hash(generate_tx_hash())
        DecisionLogModel.create(
            agent_name=agent["name"],
            action="Agent deployed to workspace",
            details=json.dumps({"deployed_at": datetime.now().isoformat()}),
            agent_id=agent["id"],
            status="confirmed"
        )

        return jsonify({
            "success": True,
            "message": f"{agent['name']} deployed successfully",
            "txHash": tx_hash
        })
    except Exception as e:
        print(f"Error deploying agent: {e}")
        return jsonify({"error": "Failed to deploy agent"}), 500

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    """Get all conversations."""
    try:
        conversations = ConversationModel.get_all()
        return jsonify([serialize_record(c) for c in conversations])
    except Exception as e:
        print(f"Error fetching conversations: {e}")
        return jsonify({"error": "Failed to fetch conversations"}), 500

@app.route('/api/conversations', methods=['POST'])
def create_conversation():
    """Create a new conversation."""
    try:
        data = request.get_json() or {}
        title = data.get("title", "New Conversation")
        user_id = data.get("userId")

        conversation = ConversationModel.create(title=title, user_id=user_id)
        return jsonify(serialize_record(conversation))
    except Exception as e:
        print(f"Error creating conversation: {e}")
        return jsonify({"error": "Failed to create conversation"}), 500

@app.route('/api/conversations/<conversation_id>/messages', methods=['GET'])
def get_messages(conversation_id):
    """Get all messages for a conversation."""
    try:
        messages = MessageModel.get_by_conversation(conversation_id)
        return jsonify([serialize_record(m) for m in messages])
    except Exception as e:
        print(f"Error fetching messages: {e}")
        return jsonify({"error": "Failed to fetch messages"}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Process a chat message and get agent response."""
    try:
        data = request.get_json()
        conversation_id = data.get("conversationId")
        message = data.get("message")
        agent_name = data.get("agentName")

        if not conversation_id or not message:
            return jsonify({"error": "conversationId and message are required"}), 400

        user_message = MessageModel.create(
            conversation_id=conversation_id,
            sender="user",
            content=message
        )

        selected_agent = None
        agent_system_prompt = ""
        response_agent_name = "AgentHub"

        if agent_name and agent_name != "AgentHub":
            selected_agent = AgentModel.get_by_name(agent_name)
            if selected_agent:
                agent_system_prompt = selected_agent["system_prompt"]
                response_agent_name = selected_agent["name"]

        if not selected_agent:
            analysis = analyze_user_request(message)

            if analysis["selected_agents"] and analysis["selected_agents"][0] != "AgentHub":
                selected_agent = AgentModel.get_by_name(analysis["selected_agents"][0])
                if selected_agent:
                    agent_system_prompt = selected_agent["system_prompt"]
                    response_agent_name = selected_agent["name"]

        if not selected_agent:
            agent_system_prompt = get_master_agent_prompt()

        conversation_history = MessageModel.get_by_conversation(conversation_id)
        formatted_history = [
            {"role": m["sender"] if m["sender"] == "user" else "assistant", "content": m["content"]}
            for m in conversation_history[-10:]
        ]

        response_content = get_agent_response(
            agent_name=response_agent_name,
            system_prompt=agent_system_prompt,
            user_message=message,
            conversation_history=formatted_history
        )

        agent_message = MessageModel.create(
            conversation_id=conversation_id,
            sender="agent",
            content=response_content,
            agent_id=selected_agent["id"] if selected_agent else None,
            agent_name=response_agent_name
        )

        if selected_agent:
            AgentModel.increment_uses(selected_agent["id"])

        DecisionLogModel.create(
            agent_name=response_agent_name,
            action=f"Processed user request via LangGraph agent",
            details=json.dumps({
                "user_message": message[:100],
                "agent": response_agent_name,
                "response_preview": response_content[:200]
            }),
            agent_id=selected_agent["id"] if selected_agent else None,
            conversation_id=conversation_id,
            status="confirmed"
        )

        TransactionModel.create(
            from_agent_name="User",
            to_agent_name=response_agent_name,
            from_agent_id=None,
            to_agent_id=selected_agent["id"] if selected_agent else None,
            status="confirmed"
        )

        return jsonify({
            "userMessage": serialize_record(user_message),
            "agentMessage": serialize_record(agent_message),
            "selectedAgent": response_agent_name
        })
    except Exception as e:
        print(f"Error in chat: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to process chat message: {str(e)}"}), 500

# Blockchain Integration Endpoints

@app.route('/api/blockchain/status', methods=['GET'])
def get_blockchain_status():
    """Get status of all blockchain integrations"""
    try:
        return jsonify({
            "cardano": {
                "is_live": cardano_service.is_live(),
                "network": cardano_service.network,
                "requires": "BLOCKFROST_API_KEY"
            },
            "masumi": {
                "is_live": masumi_service.is_live(),
                "network_url": masumi_service.network_url,
                "requires": "MASUMI_API_KEY"
            },
            "hydra": {
                "is_live": hydra_service.is_live(),
                "node_url": hydra_service.hydra_node_url,
                "requires": "HYDRA_NODE_URL or HYDRA_API_KEY"
            }
        })
    except Exception as e:
        print(f"Error getting blockchain status: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/cardano/status', methods=['GET'])
def get_cardano_status():
    """Get Cardano network status"""
    try:
        network_info = cardano_service.get_network_info()
        latest_block = cardano_service.get_latest_block()
        return jsonify({
            "network": network_info,
            "latest_block": latest_block
        })
    except Exception as e:
        print(f"Error getting Cardano status: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/cardano/register-agent', methods=['POST'])
def register_agent_on_cardano():
    """Register an agent on Cardano blockchain with DID"""
    try:
        data = request.get_json()
        agent_id = data.get("agentId")
        agent_name = data.get("agentName")
        metadata = data.get("metadata", {})

        result = cardano_service.register_agent_did(agent_id, agent_name, metadata)
        return jsonify(result)
    except Exception as e:
        print(f"Error registering agent: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/cardano/verify', methods=['POST'])
def verify_agent_on_cardano():
    """Verify an agent's credentials on Cardano"""
    try:
        data = request.get_json()
        did = data.get("did")
        
        result = cardano_service.verify_agent_credentials(did)
        return jsonify(result)
    except Exception as e:
        print(f"Error verifying agent: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/cardano/log-decision', methods=['POST'])
def log_decision_on_cardano():
    """Log a decision on Cardano blockchain"""
    try:
        data = request.get_json()
        agent_id = data.get("agentId")
        decision = data.get("decision")
        details = data.get("details", {})
        
        result = cardano_service.log_decision_on_chain(agent_id, decision, details)
        return jsonify(result)
    except Exception as e:
        print(f"Error logging decision: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/cardano/settle-payment', methods=['POST'])
def settle_payment_on_cardano():
    """Settle a payment on Cardano L1"""
    try:
        data = request.get_json()
        from_agent = data.get("fromAgent")
        to_agent = data.get("toAgent")
        amount = float(data.get("amount", 0))
        
        result = cardano_service.settle_payment(from_agent, to_agent, amount)
        return jsonify(result)
    except Exception as e:
        print(f"Error settling payment: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/cardano/wallet/<address>', methods=['GET'])
def get_cardano_wallet(address):
    """Get wallet balance on Cardano"""
    try:
        result = cardano_service.get_wallet_balance(address)
        return jsonify(result)
    except Exception as e:
        print(f"Error getting wallet: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/cardano/transaction/<tx_hash>', methods=['GET'])
def get_cardano_transaction(tx_hash):
    """Get transaction details from Cardano"""
    try:
        result = cardano_service.get_transaction(tx_hash)
        return jsonify(result)
    except Exception as e:
        print(f"Error getting transaction: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/masumi/status', methods=['GET'])
def get_masumi_status():
    """Get Masumi Network status"""
    try:
        result = masumi_service.get_network_status()
        return jsonify(result)
    except Exception as e:
        print(f"Error getting Masumi status: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/masumi/register', methods=['POST'])
def register_agent_on_masumi():
    """Register an agent on Masumi Network"""
    try:
        data = request.get_json()
        agent_id = data.get("agentId")
        name = data.get("name")
        domain = data.get("domain")
        services = data.get("services", [])
        metadata = data.get("metadata", {})
        
        result = masumi_service.register_agent(agent_id, name, domain, services, metadata)
        return jsonify(result)
    except Exception as e:
        print(f"Error registering on Masumi: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/masumi/discover', methods=['GET'])
def discover_agents_masumi():
    """Discover agents on Masumi Network"""
    try:
        domain = request.args.get("domain")
        service = request.args.get("service")
        min_reputation = float(request.args.get("minReputation", 0.0))

        result = masumi_service.discover_agents(domain, service, min_reputation)
        return jsonify(result)
    except Exception as e:
        print(f"Error discovering agents: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/masumi/agent/<did>', methods=['GET'])
def get_masumi_agent(did):
    """Get agent profile from Masumi Network"""
    try:
        result = masumi_service.get_agent_profile(did)
        return jsonify(result)
    except Exception as e:
        print(f"Error getting agent: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/masumi/reputation', methods=['POST'])
def update_masumi_reputation():
    """Update agent reputation on Masumi"""
    try:
        data = request.get_json()
        agent_did = data.get("agentDid")
        transaction_success = data.get("transactionSuccess", True)
        response_time = int(data.get("responseTime", 1000))
        
        result = masumi_service.update_reputation(agent_did, transaction_success, response_time)
        return jsonify(result)
    except Exception as e:
        print(f"Error updating reputation: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/masumi/agreement', methods=['POST'])
def create_masumi_agreement():
    """Create service agreement on Masumi"""
    try:
        data = request.get_json()
        provider_did = data.get("providerDid")
        consumer_did = data.get("consumerDid")
        service_type = data.get("serviceType")
        terms = data.get("terms", {})
        
        result = masumi_service.create_service_agreement(provider_did, consumer_did, service_type, terms)
        return jsonify(result)
    except Exception as e:
        print(f"Error creating agreement: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/hydra/status', methods=['GET'])
def get_hydra_status():
    """Get Hydra node status"""
    try:
        result = hydra_service.get_node_status()
        return jsonify(result)
    except Exception as e:
        print(f"Error getting Hydra status: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/hydra/open-channel', methods=['POST'])
def open_hydra_channel():
    """Open a Hydra payment channel between agents"""
    try:
        data = request.get_json()
        result = hydra_service.open_channel(
            participant_a=data.get("participantA"),
            participant_b=data.get("participantB"),
            initial_balance_a=float(data.get("balanceA", 100.0)),
            initial_balance_b=float(data.get("balanceB", 100.0))
        )
        return jsonify(result)
    except Exception as e:
        print(f"Error opening channel: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/hydra/payment', methods=['POST'])
def send_hydra_payment():
    """Send instant micropayment through Hydra"""
    try:
        data = request.get_json()
        result = hydra_service.send_payment(
            channel_id=data.get("channelId"),
            from_agent=data.get("from"),
            to_agent=data.get("to"),
            amount=float(data.get("amount", 0.004))
        )
        return jsonify(result)
    except Exception as e:
        print(f"Error sending payment: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/hydra/close-channel', methods=['POST'])
def close_hydra_channel():
    """Close a Hydra channel and settle on L1"""
    try:
        data = request.get_json()
        channel_id = data.get("channelId")
        
        result = hydra_service.close_channel(channel_id)
        return jsonify(result)
    except Exception as e:
        print(f"Error closing channel: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/hydra/channel/<channel_id>', methods=['GET'])
def get_hydra_channel(channel_id):
    """Get Hydra channel status"""
    try:
        result = hydra_service.get_channel_status(channel_id)
        return jsonify(result)
    except Exception as e:
        print(f"Error getting channel: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/hydra/transactions', methods=['GET'])
def get_hydra_transactions():
    """Get Hydra transaction history"""
    try:
        channel_id = request.args.get("channelId")
        limit = int(request.args.get("limit", 20))
        
        result = hydra_service.get_transaction_history(channel_id, limit)
        return jsonify(result)
    except Exception as e:
        print(f"Error getting transactions: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/hydra/estimate-fees', methods=['GET'])
def estimate_hydra_fees():
    """Estimate Hydra transaction fees"""
    try:
        num_transactions = int(request.args.get("numTransactions", 100))
        
        result = hydra_service.estimate_fees(num_transactions)
        return jsonify(result)
    except Exception as e:
        print(f"Error estimating fees: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/cardano/recent-transactions', methods=['GET'])
def get_recent_l1_transactions():
    """Get recent Cardano L1 transactions"""
    try:
        limit = int(request.args.get("limit", 20))
        
        result = cardano_service.get_recent_transactions(limit)
        return jsonify(result)
    except Exception as e:
        print(f"Error getting transactions: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/network-stats', methods=['GET'])
def get_network_stats():
    """Get combined network statistics across all blockchains"""
    try:
        from blockchain_simulation import simulated_blockchain
        
        stats = simulated_blockchain.get_network_stats()
        return jsonify({
            "timestamp": datetime.now().isoformat(),
            "cardano": stats["cardano"],
            "masumi": stats["masumi"],
            "hydra": stats["hydra"],
            "is_simulated": True
        })
    except Exception as e:
        print(f"Error getting network stats: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Get recent transactions."""
    try:
        limit = request.args.get("limit", 20, type=int)
        transactions = TransactionModel.get_all(limit=limit)
        return jsonify([serialize_record(t) for t in transactions])
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        return jsonify({"error": "Failed to fetch transactions"}), 500

@app.route('/api/decision-logs', methods=['GET'])
def get_decision_logs():
    """Get recent decision logs."""
    try:
        limit = request.args.get("limit", 20, type=int)
        logs = DecisionLogModel.get_all(limit=limit)
        return jsonify([serialize_record(l) for l in logs])
    except Exception as e:
        print(f"Error fetching decision logs: {e}")
        return jsonify({"error": "Failed to fetch decision logs"}), 500

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Get platform metrics."""
    try:
        agents = AgentModel.get_all()
        transactions = TransactionModel.get_all(limit=1000)

        total_uses_served = sum(a["uses_served"] for a in agents)
        total_transactions = len(transactions)
        total_cost = total_transactions * 0.004

        return jsonify({
            "systemLayers": 7,
            "specializedAgents": len(agents),
            "agentDomains": 4,
            "throughput": "1000+ TPS",
            "costPerService": "~$0.004",
            "platformFee": "10%",
            "onChain": "100%",
            "totalUsesServed": total_uses_served,
            "totalTransactions": total_transactions,
            "totalCost": f"${total_cost:.3f}"
        })
    except Exception as e:
        print(f"Error fetching metrics: {e}")
        return jsonify({"error": "Failed to fetch metrics"}), 500

# Agent Data & Information APIs

@app.route('/api/data/agent-capabilities', methods=['GET'])
def agent_capabilities_endpoint():
    """Get agent capabilities"""
    try:
        agent_name = request.args.get("agent")
        return jsonify(get_agent_capabilities(agent_name))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data/protocols', methods=['GET'])
def protocols_endpoint():
    """Get protocol information"""
    try:
        protocol_name = request.args.get("protocol")
        return jsonify(get_protocol_info(protocol_name))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data/market', methods=['GET'])
def market_data_endpoint():
    """Get market data"""
    try:
        asset = request.args.get("asset")
        return jsonify(get_market_data(asset))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data/knowledge', methods=['GET'])
def knowledge_endpoint():
    """Get knowledge base"""
    try:
        topic = request.args.get("topic")
        return jsonify(get_knowledge(topic))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data/trending', methods=['GET'])
def trending_endpoint():
    """Get trending services"""
    try:
        return jsonify(get_trending_services())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data/performance', methods=['GET'])
def performance_endpoint():
    """Get performance metrics"""
    try:
        return jsonify(get_performance_metrics())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data/pricing', methods=['GET'])
def pricing_endpoint():
    """Get pricing information"""
    try:
        return jsonify(get_pricing())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)