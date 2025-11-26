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


# Blockchain Integration Endpoints

@app.route('/api/blockchain/cardano/register-agent', methods=['POST'])
async def register_agent_on_cardano():
    """Register an agent on Cardano blockchain with DID"""
    try:
        data = request.get_json()
        agent_id = data.get("agentId")
        agent_name = data.get("agentName")
        metadata = data.get("metadata", {})

        result = await cardano_service.register_agent_did(agent_id, agent_name, metadata)
        return jsonify(result)
    except Exception as e:
        print(f"Error registering agent: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/masumi/discover', methods=['GET'])
async def discover_agents_masumi():
    """Discover agents on Masumi Network"""
    try:
        domain = request.args.get("domain")
        service = request.args.get("service")
        min_reputation = float(request.args.get("minReputation", 0.0))

        agents = await masumi_service.discover_agents(domain, service, min_reputation)
        return jsonify(agents)
    except Exception as e:
        print(f"Error discovering agents: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/blockchain/hydra/open-channel', methods=['POST'])
async def open_hydra_channel():
    """Open a Hydra payment channel between agents"""
    try:
        data = request.get_json()
        result = await hydra_service.open_channel(
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
async def send_hydra_payment():
    """Send instant micropayment through Hydra"""
    try:
        data = request.get_json()
        result = await hydra_service.send_payment(
            channel_id=data.get("channelId"),
            from_agent=data.get("from"),
            to_agent=data.get("to"),
            amount=float(data.get("amount", 0.004))
        )
        return jsonify(result)
    except Exception as e:
        print(f"Error sending payment: {e}")
        return jsonify({"error": str(e)}), 500

            "selectedAgent": response_agent_name
        })
    except Exception as e:
        print(f"Error in chat: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to process chat message: {str(e)}"}), 500

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)