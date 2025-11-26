import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import uuid

DATABASE_URL = os.environ.get("DATABASE_URL")

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL,
            domain TEXT NOT NULL,
            icon TEXT NOT NULL,
            system_prompt TEXT NOT NULL,
            uses_served INTEGER NOT NULL DEFAULT 0,
            avg_response_ms INTEGER NOT NULL DEFAULT 1000,
            is_verified BOOLEAN NOT NULL DEFAULT true,
            status TEXT NOT NULL DEFAULT 'online',
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
            user_id VARCHAR,
            title TEXT NOT NULL DEFAULT 'New Conversation',
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
            conversation_id VARCHAR NOT NULL REFERENCES conversations(id),
            sender TEXT NOT NULL,
            agent_id VARCHAR REFERENCES agents(id),
            agent_name TEXT,
            content TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
            from_agent_id VARCHAR REFERENCES agents(id),
            to_agent_id VARCHAR REFERENCES agents(id),
            from_agent_name TEXT NOT NULL,
            to_agent_name TEXT NOT NULL,
            amount DECIMAL(10, 6) NOT NULL DEFAULT 0.004,
            tx_hash TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            layer TEXT NOT NULL DEFAULT 'hydra',
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS decision_logs (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
            agent_id VARCHAR REFERENCES agents(id),
            agent_name TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT,
            tx_hash TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            conversation_id VARCHAR REFERENCES conversations(id),
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """)
    
    conn.commit()
    cur.close()
    conn.close()

def generate_tx_hash():
    chars = "0123456789abcdef"
    hash_val = "0x"
    for _ in range(64):
        hash_val += chars[int(uuid.uuid4().hex[0], 16) % 16]
    return hash_val

def truncate_tx_hash(hash_val):
    return f"{hash_val[:10]}...{hash_val[-6:]}"


class AgentModel:
    @staticmethod
    def get_all():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM agents ORDER BY name")
        agents = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(a) for a in agents]
    
    @staticmethod
    def get_by_id(agent_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM agents WHERE id = %s", (agent_id,))
        agent = cur.fetchone()
        cur.close()
        conn.close()
        return dict(agent) if agent else None
    
    @staticmethod
    def get_by_name(name):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM agents WHERE name = %s", (name,))
        agent = cur.fetchone()
        cur.close()
        conn.close()
        return dict(agent) if agent else None
    
    @staticmethod
    def create(agent_data):
        conn = get_db_connection()
        cur = conn.cursor()
        agent_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO agents (id, name, description, domain, icon, system_prompt, uses_served, avg_response_ms, is_verified, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            agent_id,
            agent_data['name'],
            agent_data['description'],
            agent_data['domain'],
            agent_data['icon'],
            agent_data['system_prompt'],
            agent_data.get('uses_served', 0),
            agent_data.get('avg_response_ms', 1000),
            agent_data.get('is_verified', True),
            agent_data.get('status', 'online')
        ))
        agent = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return dict(agent)
    
    @staticmethod
    def increment_uses(agent_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE agents SET uses_served = uses_served + 1 WHERE id = %s", (agent_id,))
        conn.commit()
        cur.close()
        conn.close()
    
    @staticmethod
    def count():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) as count FROM agents")
        result = cur.fetchone()
        cur.close()
        conn.close()
        return result['count']


class ConversationModel:
    @staticmethod
    def get_all():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM conversations ORDER BY updated_at DESC")
        conversations = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(c) for c in conversations]
    
    @staticmethod
    def get_by_id(conversation_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM conversations WHERE id = %s", (conversation_id,))
        conversation = cur.fetchone()
        cur.close()
        conn.close()
        return dict(conversation) if conversation else None
    
    @staticmethod
    def create(title="New Conversation", user_id=None):
        conn = get_db_connection()
        cur = conn.cursor()
        conversation_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO conversations (id, title, user_id)
            VALUES (%s, %s, %s)
            RETURNING *
        """, (conversation_id, title, user_id))
        conversation = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return dict(conversation)


class MessageModel:
    @staticmethod
    def get_by_conversation(conversation_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT * FROM messages 
            WHERE conversation_id = %s 
            ORDER BY created_at ASC
        """, (conversation_id,))
        messages = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(m) for m in messages]
    
    @staticmethod
    def create(conversation_id, sender, content, agent_id=None, agent_name=None):
        conn = get_db_connection()
        cur = conn.cursor()
        message_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO messages (id, conversation_id, sender, content, agent_id, agent_name)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (message_id, conversation_id, sender, content, agent_id, agent_name))
        message = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return dict(message)


class TransactionModel:
    @staticmethod
    def get_all(limit=20):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT * FROM transactions 
            ORDER BY created_at DESC 
            LIMIT %s
        """, (limit,))
        transactions = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(t) for t in transactions]
    
    @staticmethod
    def create(from_agent_name, to_agent_name, amount="0.004", from_agent_id=None, to_agent_id=None, status="pending"):
        conn = get_db_connection()
        cur = conn.cursor()
        tx_id = str(uuid.uuid4())
        tx_hash = truncate_tx_hash(generate_tx_hash())
        cur.execute("""
            INSERT INTO transactions (id, from_agent_id, to_agent_id, from_agent_name, to_agent_name, amount, tx_hash, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (tx_id, from_agent_id, to_agent_id, from_agent_name, to_agent_name, amount, tx_hash, status))
        transaction = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return dict(transaction)
    
    @staticmethod
    def update_status(tx_id, status):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE transactions SET status = %s WHERE id = %s", (status, tx_id))
        conn.commit()
        cur.close()
        conn.close()


class DecisionLogModel:
    @staticmethod
    def get_all(limit=20):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT * FROM decision_logs 
            ORDER BY created_at DESC 
            LIMIT %s
        """, (limit,))
        logs = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(l) for l in logs]
    
    @staticmethod
    def create(agent_name, action, details=None, agent_id=None, conversation_id=None, status="pending"):
        conn = get_db_connection()
        cur = conn.cursor()
        log_id = str(uuid.uuid4())
        tx_hash = truncate_tx_hash(generate_tx_hash())
        cur.execute("""
            INSERT INTO decision_logs (id, agent_id, agent_name, action, details, tx_hash, status, conversation_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (log_id, agent_id, agent_name, action, details, tx_hash, status, conversation_id))
        log = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return dict(log)
    
    @staticmethod
    def update_status(log_id, status):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE decision_logs SET status = %s WHERE id = %s", (status, log_id))
        conn.commit()
        cur.close()
        conn.close()
