import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import time
import threading

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
from blockchain_activity import (
    generate_blockchain_activities,
    generate_network_status,
    get_agent_masumi_profile,
    get_all_agent_profiles,
    is_simulation_mode
)
import sokosumi_service
from agent_collaboration import (
    execute_collaboration,
    get_collaboration_summary,
    analyze_collaboration_need,
    set_emit_callback
)

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

def emit_collaboration_update(event_type: str, data: dict):
    """Emit real-time collaboration updates via WebSocket"""
    socketio.emit('collaboration_update', {
        'type': event_type,
        'data': data,
        'timestamp': datetime.now().isoformat()
    })

set_emit_callback(emit_collaboration_update)

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
    """Process a chat message and get agent response with automatic Sokosumi collaboration."""
    try:
        data = request.get_json()
        conversation_id = data.get("conversationId")
        message = data.get("message")
        agent_name = data.get("agentName")
        enable_collaboration = data.get("enableCollaboration", True)

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

        collaboration_occurred = False
        hiring_results = []
        collaboration_context = ""
        collaboration_summary = {"collaborated": False}
        
        if enable_collaboration and response_agent_name != "AgentHub":
            try:
                collaboration_occurred, hiring_results, collaboration_context = execute_collaboration(
                    agent_name=response_agent_name,
                    user_message=message,
                    auto_hire=True
                )
                
                if collaboration_occurred and hiring_results:
                    collaboration_summary = get_collaboration_summary(hiring_results)
                    
                    for result in hiring_results:
                        DecisionLogModel.create(
                            agent_name=response_agent_name,
                            action=f"Hired Sokosumi agent: {result.get('agent_name')}",
                            details=json.dumps({
                                "hired_agent": result.get("agent_name"),
                                "task": result.get("task_description"),
                                "cost_usd": result.get("cost", 0),
                                "job_id": result.get("job_id"),
                                "is_simulated": False
                            }),
                            agent_id=selected_agent["id"] if selected_agent else None,
                            conversation_id=conversation_id,
                            status="confirmed"
                        )
                        
                        TransactionModel.create(
                            from_agent_name=response_agent_name,
                            to_agent_name=result.get("agent_name"),
                            from_agent_id=selected_agent["id"] if selected_agent else None,
                            to_agent_id=None,
                            status="confirmed"
                        )
            except Exception as collab_error:
                print(f"Collaboration error (non-fatal): {collab_error}")
                collaboration_context = ""

        conversation_history = MessageModel.get_by_conversation(conversation_id)
        formatted_history = [
            {"role": m["sender"] if m["sender"] == "user" else "assistant", "content": m["content"]}
            for m in conversation_history[-10:]
        ]

        response_content = get_agent_response(
            agent_name=response_agent_name,
            system_prompt=agent_system_prompt,
            user_message=message,
            conversation_history=formatted_history,
            collaboration_context=collaboration_context if collaboration_context else None
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
            action=f"Processed user request via LangGraph agent" + (" with Sokosumi collaboration" if collaboration_occurred else ""),
            details=json.dumps({
                "user_message": message[:100],
                "agent": response_agent_name,
                "response_preview": response_content[:200],
                "collaboration": collaboration_summary if collaboration_occurred else None
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

        blockchain_activities = generate_blockchain_activities(
            agent_name=response_agent_name,
            user_message=message,
            include_collaboration=collaboration_occurred
        )
        
        if collaboration_occurred and hiring_results:
            for result in hiring_results:
                blockchain_activities.append({
                    "type": "sokosumi_hire",
                    "title": f"Hired {result.get('agent_name')}",
                    "description": f"Task: {result.get('task_description', 'Specialized assistance')[:50]}...",
                    "status": "confirmed",
                    "timestamp": datetime.now().isoformat(),
                    "details": {
                        "agent_id": result.get("agent_id"),
                        "job_id": result.get("job_id"),
                        "cost_usd": result.get("cost", 0),
                        "payment_method": "Hydra L2",
                        "is_simulated": False
                    }
                })
        
        agent_masumi_profile = get_agent_masumi_profile(response_agent_name)

        return jsonify({
            "userMessage": serialize_record(user_message),
            "agentMessage": serialize_record(agent_message),
            "selectedAgent": response_agent_name,
            "blockchainActivities": blockchain_activities,
            "agentProfile": agent_masumi_profile,
            "isSimulationMode": False,
            "collaboration": collaboration_summary
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

@app.route('/api/blockchain/network-status', methods=['GET'])
def get_full_network_status():
    """Get comprehensive status of all blockchain networks"""
    try:
        return jsonify(generate_network_status())
    except Exception as e:
        print(f"Error getting network status: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/agent-profiles', methods=['GET'])
def get_agent_blockchain_profiles():
    """Get Masumi Network profiles for all agents"""
    try:
        profiles = get_all_agent_profiles()
        return jsonify({
            "agents": profiles,
            "total": len(profiles),
            "is_simulation_mode": is_simulation_mode()
        })
    except Exception as e:
        print(f"Error getting agent profiles: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/agent-profiles/<agent_name>', methods=['GET'])
def get_single_agent_profile(agent_name):
    """Get Masumi Network profile for a specific agent"""
    try:
        profile = get_agent_masumi_profile(agent_name)
        return jsonify(profile)
    except Exception as e:
        print(f"Error getting agent profile: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sokosumi/agents', methods=['GET'])
def get_sokosumi_agents():
    """Get available agents from Sokosumi marketplace"""
    try:
        category = request.args.get("category")
        limit = int(request.args.get("limit", 10))
        result = sokosumi_service.list_agents(category=category, limit=limit)
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching Sokosumi agents: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sokosumi/agents/<agent_id>', methods=['GET'])
def get_sokosumi_agent(agent_id):
    """Get details of a specific Sokosumi agent"""
    try:
        result = sokosumi_service.get_agent(agent_id)
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching Sokosumi agent: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sokosumi/hire', methods=['POST'])
def hire_sokosumi_agent():
    """Hire a Sokosumi agent for a task"""
    try:
        data = request.get_json()
        agent_id = data.get("agentId")
        task = data.get("task")
        requester = data.get("requesterAgent")
        
        if not agent_id or not task:
            return jsonify({"error": "agentId and task are required"}), 400
        
        result = sokosumi_service.hire_agent(agent_id, task, requester)
        return jsonify(result)
    except Exception as e:
        print(f"Error hiring Sokosumi agent: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sokosumi/jobs', methods=['GET'])
def get_sokosumi_jobs():
    """Get all active Sokosumi jobs"""
    try:
        result = sokosumi_service.list_active_jobs()
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching Sokosumi jobs: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sokosumi/jobs/<job_id>', methods=['GET'])
def get_sokosumi_job(job_id):
    """Get status of a specific Sokosumi job"""
    try:
        result = sokosumi_service.get_job_status(job_id)
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching Sokosumi job: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sokosumi/account', methods=['GET'])
def get_sokosumi_account():
    """Get Sokosumi account information"""
    try:
        result = sokosumi_service.get_account_info()
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching Sokosumi account: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sokosumi/status', methods=['GET'])
def get_sokosumi_status():
    """Get Sokosumi service status"""
    try:
        return jsonify({
            "is_live": sokosumi_service.is_live(),
            "api_url": sokosumi_service.SOKOSUMI_API_URL,
            "has_api_key": bool(sokosumi_service.SOKOSUMI_API_KEY)
        })
    except Exception as e:
        print(f"Error getting Sokosumi status: {e}")
        return jsonify({"error": str(e)}), 500

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection"""
    print("[WebSocket] Client connected")
    emit('connected', {'status': 'connected', 'message': 'Connected to AgentHub real-time updates'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    print("[WebSocket] Client disconnected")

@socketio.on('subscribe_collaboration')
def handle_subscribe(data):
    """Subscribe to collaboration updates for a conversation"""
    conversation_id = data.get('conversation_id')
    print(f"[WebSocket] Client subscribed to collaboration updates for {conversation_id}")
    emit('subscribed', {'conversation_id': conversation_id})

def emit_collaboration_event(event_type: str, data: dict):
    """Emit a collaboration event to all connected clients"""
    socketio.emit('collaboration_update', {
        'type': event_type,
        'data': data,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001, debug=False, allow_unsafe_werkzeug=True)
