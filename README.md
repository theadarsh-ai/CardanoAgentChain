# AgentHub - AI Agent Marketplace on Cardano

## Overview

AgentHub is an AI-powered agent marketplace built on the Cardano blockchain, featuring eight specialized AI agents across four domains (Workflow Automation, Data & Compliance, Customer Support, and DeFi Services). The platform leverages Cardano Layer 1 for final settlement and reputation management, while utilizing Hydra Layer 2 state channels for instant micropayments between agents. Agents collaborate autonomously using natural language interfaces, with all decisions and transactions logged on-chain for transparency.

The application provides a master chat interface where users can interact with multiple AI agents simultaneously using @ mentions. The system automatically routes requests to appropriate specialized agents, who can then collaborate with each other while processing transactions through Hydra's high-throughput layer.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Hybrid Frontend/Backend Architecture

**Frontend Stack**: React + TypeScript with Vite as the build tool. Uses Wouter for client-side routing instead of React Router. UI components built with Radix UI primitives and styled using Tailwind CSS with shadcn/ui component library following the "new-york" style preset.

**Backend Architecture**: Dual-stack approach with Node.js/Express (TypeScript) handling API routing and static file serving, while a Python Flask backend manages AI agent logic, database operations, and OpenAI integrations. The Node.js server acts as a reverse proxy, forwarding `/api/*` requests to the Python backend running on port 5001.

**Rationale**: This separation allows leveraging Python's superior AI/ML ecosystem (OpenAI SDK, agent frameworks) while maintaining a modern TypeScript development experience for the web application layer. The proxy pattern enables independent scaling and development of each backend component.

### Database Layer

**PostgreSQL with Drizzle ORM**: Uses Neon serverless PostgreSQL via `@neondatabase/serverless` driver with WebSocket support for connection pooling. Schema defined in TypeScript using Drizzle ORM's declarative API.

**Schema Design**: Six core tables:
- `users`: Basic authentication (username/password)
- `agents`: AI agent definitions with system prompts, performance metrics, verification status
- `conversations`: Chat sessions
- `messages`: Individual messages within conversations (links to agents when applicable)
- `transactions`: Hydra L2 micropayment records between agents
- `decision_logs`: On-chain audit trail of agent decisions and collaborations

**Dual Implementation**: Both Python (using psycopg2 with RealDictCursor) and Node.js (using Drizzle) can access the database, though the Python backend primarily handles data operations in the current architecture.

### AI Integration

**OpenAI GPT-4o**: All agent intelligence powered by OpenAI's chat completion API. Each agent has a unique system prompt defining its specialty, personality, and capabilities.

**Master Agent Pattern**: A coordinator agent analyzes user requests to determine which specialized agents should handle them. Supports multi-agent collaboration where agents can "hire" each other (e.g., SocialGenie hiring StyleAdvisor for visual recommendations).
- **Masumi Network**: Agent discovery and reputation system
