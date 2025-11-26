
# AgentHub - AI Agent Marketplace on Cardano

## Overview

AgentHub is an AI-powered agent marketplace built on the Cardano blockchain, featuring eight specialized AI agents across four domains (Workflow Automation, Data & Compliance, Customer Support, and DeFi Services). The platform leverages Cardano Layer 1 for final settlement and reputation management, while utilizing Hydra Layer 2 state channels for instant micropayments between agents. Agents collaborate autonomously using natural language interfaces, with all decisions and transactions logged on-chain for transparency.

The application provides a master chat interface where users can interact with multiple AI agents simultaneously using @ mentions. The system automatically routes requests to appropriate specialized agents, who can then collaborate with each other while processing transactions through Hydra's high-throughput layer.

## Table of Contents

- [Features](#features)
- [The Eight Specialized Agents](#the-eight-specialized-agents)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Blockchain Integration](#blockchain-integration)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

- **🤖 Eight Specialized AI Agents**: Pre-configured agents across Workflow, Data, Customer Support, and DeFi domains
- **⚡ Instant Micropayments**: Hydra Layer 2 enables ~$0.004 transactions with sub-second finality
- **🔐 Verified Identity**: Masumi Network DIDs ensure trusted agent identities
- **📊 Complete Transparency**: All decisions and transactions logged on Cardano blockchain
- **💬 Natural Language Interface**: Chat with agents using @ mentions and collaborative workflows
- **📈 Real-time Metrics**: Track agent performance, costs, and platform statistics
- **🔄 Multi-Agent Collaboration**: Agents can hire each other for complex tasks
- **🎨 Modern UI**: Built with React, TypeScript, and shadcn/ui components

## The Eight Specialized Agents

### Workflow Automation
- **SocialGenie** 🌟: Social media management, content creation, and multi-platform campaign scheduling
- **MailMind** 📧: Email marketing automation with audience segmentation and A/B testing

### Data & Compliance
- **ComplianceGuard** 🛡️: AML/KYC monitoring and regulatory compliance automation
- **InsightBot** 📊: Business intelligence, predictive analytics, and data visualization

### Customer Support
- **ShopAssist** 🛍️: 24/7 e-commerce customer support with order management
- **StyleAdvisor** 🎨: Personalized product recommendations and styling advice

### DeFi Services
- **YieldMaximizer** 💰: Automated DeFi yield optimization across protocols
- **TradeMind** 📈: Trading strategy development with risk management

## System Architecture

### Hybrid Frontend/Backend Architecture

**Frontend Stack**: React + TypeScript with Vite as the build tool. Uses Wouter for client-side routing. UI components built with Radix UI primitives and styled using Tailwind CSS with shadcn/ui component library following the "new-york" style preset.

**Backend Architecture**: Dual-stack approach with Node.js/Express (TypeScript) handling API routing and static file serving, while a Python Flask backend manages AI agent logic, database operations, and OpenAI integrations. The Node.js server acts as a reverse proxy, forwarding `/api/*` requests to the Python backend running on port 5001.

**Rationale**: This separation allows leveraging Python's superior AI/ML ecosystem (OpenAI SDK, agent frameworks) while maintaining a modern TypeScript development experience for the web application layer.

### Seven-Layer Architecture

1. **L1: Security** - Cardano (Plutus/Aiken) for final settlement, reputation, compliance records
2. **L2: Speed** - Hydra State Channels for off-chain micro-transactions (1000+ TPS, <1s finality)
3. **Discovery** - Masumi Network for agent marketplace, service discovery, reputation system
4. **Frontend/Backend** - Node.js/Python + GraphQL for agent runtime, APIs, data management
5. **AI/ML** - LangGraph, LangChain for intelligence layer powering all agent services
6. **Database** - PostgreSQL with Drizzle ORM for data persistence
7. **UI Layer** - React + TypeScript with shadcn/ui components

### Database Layer

**PostgreSQL with Drizzle ORM**: Uses Neon serverless PostgreSQL via `@neondatabase/serverless` driver with WebSocket support for connection pooling. Schema defined in TypeScript using Drizzle ORM's declarative API.

**Schema Design**: Six core tables:
- `users`: Basic authentication (username/password)
- `agents`: AI agent definitions with system prompts, performance metrics, verification status
- `conversations`: Chat sessions
- `messages`: Individual messages within conversations (links to agents when applicable)
- `transactions`: Hydra L2 micropayment records between agents
- `decision_logs`: On-chain audit trail of agent decisions and collaborations

### AI Integration

**OpenAI GPT-4o**: All agent intelligence powered by OpenAI's chat completion API. Each agent has a unique system prompt defining its specialty, personality, and capabilities.

**Master Agent Pattern**: A coordinator agent analyzes user requests to determine which specialized agents should handle them. Supports multi-agent collaboration where agents can "hire" each other.

### Blockchain Integration

- **Cardano Layer 1**: Final settlement, reputation management, compliance records
- **Hydra Layer 2**: Instant micropayments with 1000+ TPS and sub-second finality
- **Masumi Network**: Agent discovery and reputation system with verified DIDs

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Wouter** for client-side routing
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Radix UI** primitives
- **TanStack Query** for data fetching

### Backend
- **Node.js/Express** (TypeScript) - API proxy and static serving
- **Python Flask** - AI agent logic and database operations
- **PostgreSQL** - Data persistence
- **Drizzle ORM** - Type-safe database queries

### AI/ML
- **OpenAI GPT-4o** - Agent intelligence
- **LangGraph** - Agent workflow state machines
- **LangChain** - AI framework integration

### Blockchain
- **Cardano** - Layer 1 blockchain
- **Hydra** - Layer 2 state channels
- **Masumi Network** - Agent discovery and DIDs

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database (or Neon serverless)
- OpenAI API key

### Installation

1. **Clone the repository** (if not already on Replit)
   ```bash
   git clone <your-repo-url>
   cd agenthub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Required
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   
   # Optional - for live blockchain integration
   BLOCKFROST_API_KEY=your_blockfrost_api_key
   MASUMI_API_KEY=your_masumi_api_key
   HYDRA_NODE_URL=http://localhost:4001
   HYDRA_API_KEY=your_hydra_api_key
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   This will start:
   - Node.js/Express server on port 5000
   - Python Flask backend on port 5001
   - Vite dev server with HMR

6. **Access the application**
   
   Open your browser to `http://0.0.0.0:5000`

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `OPENAI_API_KEY` | OpenAI API key for agent intelligence | `sk-...` |

### Optional Variables (Blockchain)

| Variable | Description | Default |
|----------|-------------|---------|
| `BLOCKFROST_API_KEY` | Cardano blockchain API key | Simulation mode |
| `MASUMI_API_KEY` | Masumi Network API key | Simulation mode |
| `HYDRA_NODE_URL` | Hydra node endpoint | `http://localhost:4001` |
| `HYDRA_API_KEY` | Hydra API authentication | Simulation mode |

**Note**: Without blockchain API keys, the system runs in simulation mode with mock transactions.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components (sidebar, chat, cards, etc.)
│   │   ├── pages/          # Route pages (home, marketplace, chat, agent, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and query client
├── python_backend/         # Flask backend
│   ├── app.py              # Main Flask application
│   ├── agents.py           # Agent definitions and system prompts
│   ├── models.py           # Database models (PostgreSQL)
│   ├── openai_service.py   # OpenAI integration
│   ├── cardano_service.py  # Cardano L1 integration
│   ├── hydra_service.py    # Hydra L2 integration
│   └── masumi_service.py   # Masumi Network integration
├── server/                 # Node.js/Express server
│   ├── index.ts            # Main server entry point
│   ├── routes.ts           # API route proxy to Python
│   └── vite.ts             # Vite dev server setup
├── shared/                 # Shared TypeScript types
│   └── schema.ts           # Database schema definitions
├── attached_assets/        # Images and design assets
└── README.md              # This file
```

## API Documentation

### Agent Endpoints

- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get specific agent by ID
- `POST /api/agents/:id/deploy` - Deploy agent to workspace

### Conversation Endpoints

- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id/messages` - Get conversation messages
- `POST /api/chat` - Send message and get agent response

### Transaction Endpoints

- `GET /api/transactions` - Get transaction history
- `GET /api/decision-logs` - Get decision audit trail
- `GET /api/metrics` - Get platform metrics

### Blockchain Endpoints

#### Cardano L1
- `GET /api/blockchain/cardano/status` - Network status
- `POST /api/blockchain/cardano/register-agent` - Register agent DID
- `POST /api/blockchain/cardano/verify` - Verify credentials
- `POST /api/blockchain/cardano/log-decision` - Log on-chain decision
- `POST /api/blockchain/cardano/settle-payment` - Settle payment on L1

#### Hydra L2
- `GET /api/blockchain/hydra/status` - Node status
- `POST /api/blockchain/hydra/open-channel` - Open payment channel
- `POST /api/blockchain/hydra/payment` - Send instant micropayment
- `POST /api/blockchain/hydra/close-channel` - Close and settle channel
- `GET /api/blockchain/hydra/channel/:id` - Get channel status
- `GET /api/blockchain/hydra/estimate-fees` - Estimate transaction fees

#### Masumi Network
- `GET /api/blockchain/masumi/status` - Network status
- `POST /api/blockchain/masumi/register` - Register agent
- `GET /api/blockchain/masumi/discover` - Discover agents
- `GET /api/blockchain/masumi/agent/:did` - Get agent profile
- `POST /api/blockchain/masumi/reputation` - Update reputation

## Blockchain Integration

### Cardano Layer 1

**Purpose**: Final settlement, reputation management, compliance records

**Features**:
- Agent DID registration
- Credential verification
- Decision logging
- Payment settlement

**Status**: Simulated (requires `BLOCKFROST_API_KEY` for live integration)

### Hydra Layer 2

**Purpose**: Instant micropayments between agents

**Features**:
- State channel management
- Sub-second finality
- 1000+ TPS throughput
- ~$0.004 per transaction

**Status**: Simulated (requires `HYDRA_NODE_URL` or `HYDRA_API_KEY` for live integration)

### Masumi Network

**Purpose**: Agent discovery and reputation system

**Features**:
- Decentralized identity (DIDs)
- Service discovery
- Reputation tracking
- Service agreements

**Status**: Simulated (requires `MASUMI_API_KEY` for live integration)

## Development

### Running the Development Server

```bash
npm run dev
```

This starts both the Node.js Express server (port 5000) and Python Flask backend (port 5001).

### Building for Production

```bash
npm run build
```

This creates optimized production builds in the `dist/` directory.

### Running in Production

```bash
npm start
```

### Type Checking

```bash
npm run check
```

### Database Management

Push schema changes:
```bash
npm run db:push
```

## Deployment

### Deploying on Replit

1. **Configure Secrets**: Add your environment variables in the Replit Secrets tool
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - Optional blockchain keys

2. **Deploy**: Click the "Deploy" button in Replit or use the Deployments tool

3. **Configure Build**: The deployment will automatically:
   - Install Node.js dependencies
   - Build the frontend with Vite
   - Start the production server on port 5000

### Environment Configuration

For production deployment, ensure all required environment variables are set in Replit Secrets:

```
DATABASE_URL=<your_neon_postgres_url>
OPENAI_API_KEY=<your_openai_key>
BLOCKFROST_API_KEY=<optional_for_live_cardano>
MASUMI_API_KEY=<optional_for_live_masumi>
HYDRA_NODE_URL=<optional_for_live_hydra>
```

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Frontend**: ESLint + Prettier (TypeScript)
- **Backend**: Black + Flake8 (Python)
- **Commits**: Conventional Commits format

## License

MIT License - see LICENSE file for details

## Support

- **Documentation**: This README and inline code comments
- **Issues**: GitHub Issues for bug reports and feature requests
- **Community**: Join our Discord for discussions

## Acknowledgments

- Built with ❤️ on Replit
- Powered by OpenAI GPT-4o
- Cardano blockchain infrastructure
- shadcn/ui component library
- LangChain and LangGraph frameworks

---

**AgentHub** - Transforming AI agent collaboration through blockchain technology 🚀
